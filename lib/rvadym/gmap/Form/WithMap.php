<?php
/**
 * Created by JetBrains PhpStorm.
 * User: vadym
 * Date: 1/21/13
 * Time: 10:49 PM
 * To change this template use File | Settings | File Templates.
 */
namespace rvadym\gmap;
class Form_WithMap extends \Form {
    public $map;
    public $map_config  = array();
    public $form_config  = array();

    protected $draw_field             = 'draw';
    protected $address_field          = 'address';
    protected $addr_field_placeholder = 'Type here to search place by address';
    protected $location_field         = 'location';
    protected $lat_field              = 'lat';
    protected $lng_field              = 'lng';
    protected $zoom_field             = 'zoom';

    function init() {
        parent::init();
        if (isset($_GET['rvadym_gmap_action']) && $_GET['rvadym_gmap_action'] == 'getAddress') {
            echo json_encode( $this->getCoordByAddr($_GET['addr']));
            exit();
        }

        if (isset($this->form_config['map_fields'])) $this->prepareFieldsNames();
        if ($this->form_config['location']==true) $this->addLocation();
        if ($this->form_config['draw']==true) $this->addDraw();




        $this->namespace = __NAMESPACE__;
        $public_location = $this->app->pathfinder->addLocation(array(
            'js'=>array( 'packages/' . str_replace(['\\','/'],'_',$this->namespace) . '/js' ),
            'css'=>array( 'packages/' . str_replace(['\\','/'],'_',$this->namespace) . '/css' ),
        ))
            ->setBasePath(getcwd().'/public')
            ->setBaseURL($this->app->url('/'))
        ;

    }
    private function addLocation(){
        //echo 'addLocation()';
    }
    private function addDraw(){
        //echo 'addDraw()';
    }
    private function prepareFieldsNames(){
        if (is_array($this->form_config['map_fields'])) {
            if (array_key_exists('address_field',$this->form_config['map_fields']))
                $this->address_field = $this->form_config['map_fields']['address_field'];
            if (array_key_exists('addr_field_placeholder',$this->form_config['map_fields']))
                $this->addr_field_placeholder = $this->form_config['map_fields']['addr_field_placeholder'];
            if (array_key_exists('location_field',$this->form_config['map_fields']))
                $this->location_field = $this->form_config['map_fields']['location_field'];
            if (array_key_exists('lat_field',$this->form_config['map_fields']))
                $this->lat_field = $this->form_config['map_fields']['lat_field'];
            if (array_key_exists('lng_field',$this->form_config['map_fields']))
                $this->lng_field = $this->form_config['map_fields']['lng_field'];
        }
    }
    function setModel($model,$actual_fields=undefined){
        parent::setModel($model,$actual_fields);
        //$this->model->addHook('afterLoad',array($this,'afterLoad'));
        $this->renderJs();
        $this->onSubmit(array($this,'checkForm'));
        return $this->model;
    }
    public function renderJs(){
        if ($this->form_config['location']==true) $this->configureAddressField();
        if ($this->form_config['draw']==true) $this->configureDrawField();
        $this->addMap();
        if ($this->form_config['location']==true) $this->addAddressView();
        if ($this->form_config['location']==true) $this->addAddressFieldJsAction();
        $this->setOrder();
    }
    private function configureAddressField(){

        // address
        if ($this->hasElement($this->address_field)) {
            $this->addr_f = $this->getElement($this->address_field);
        } else {
            $this->addr_f = $this->addField('Line',$this->address_field);
        }
        $this->addr_f->setAttr('placeholder',$this->addr_field_placeholder);

        // location
        if ($this->hasElement($this->location_field)) {
            $this->loc_f = $this->getElement($this->location_field);
        } else {
            $this->loc_f = $this->addField('Hidden',$this->location_field);
        }

        // latitude
        if ($this->hasElement($this->lat_field)) {
            $this->lat_f = $this->getElement($this->lat_field);
        } else {
            $this->lat_f = $this->addField('Hidden',$this->lat_field);
        }

        // longitude
        if ($this->hasElement($this->lng_field)) {
            $this->lng_f = $this->getElement($this->lng_field);
        } else {
            $this->lng_f = $this->addField('Hidden',$this->lng_field);
        }

        // zoom
        if ($this->hasElement($this->zoom_field)) {
            $this->zoom_f = $this->getElement($this->zoom_field);
        } else {
            $this->zoom_f = $this->addField('Hidden',$this->zoom_field);
        }

        $this->hideLocationFields();

    }
    private function addAddressView(){

        $this->address_view = $this->add('\View')->addClass('res');

        if (
            $this->model->hasElement($this->location_field) &&
            $this->model->hasElement($this->lat_field) &&
            $this->model->hasElement($this->lng_field)
        ) {
            $this->address_view->setHTML(
                '<b>'.$this->model->get($this->location_field).'</b>.'
                .' lat:'.$this->model->get($this->lat_field)
                .' lng:'.$this->model->get($this->lng_field)
            );
        }

    }
    // can be redefined to use with dropdown or radio button
    function addAddressFieldJsAction(){
        $this->addr_f->js('keyup',
            $this->js()->_selectorThis()->rvadym_gmap_form()->getCoordByAddr($this->api->url(null,array('rvadym_gmap_action'=>'getAddress'))
        ));
    }
    private function configureDrawField(){
        if ($this->hasElement($this->draw_field)) {
            $this->draw_f = $this->getElement($this->draw_field);
        } else {
            $this->draw_f = $this->addField('hidden',$this->draw_field);
        }
        $this->hideDrawFields();
    }
    private function hideLocationFields() {
        $this->getElement($this->zoom_field)->js(true)->closest('.atk-form-row')->hide();
        $this->getElement($this->location_field)->js(true)->closest('.atk-form-row')->hide();
        $this->getElement($this->lat_field)->js(true)->closest('.atk-form-row')->hide();
        $this->getElement($this->lng_field)->js(true)->closest('.atk-form-row')->hide();
    }
    private function hideDrawFields() {
        $this->draw_f->js(true)->closest('.atk-form-row')->hide();
    }
    function addMap() {
        $this->map = $this->add('rvadym\gmap\View_Map',$this->map_config);
        $this->map->addJs();

        if ($this->model->hasElement($this->zoom_field) && $this->model->get($this->zoom_field)) {
            $this->map->setZoom( (int) $this->model->get($this->zoom_field) );
        }

        $this->map->showMap();
        if ($this->form_config['location']==true) $this->setLocationVars();
        if ($this->form_config['draw']==true) $this->setDrawVars();
    }
    private function setLocationVars(){
        $this->js(true)->rvadym_gmap_form()->setLocationVars(
            $this->getElement($this->location_field)->name,
            $this->getElement($this->lat_field)->name,
            $this->getElement($this->lng_field)->name,
            $this->getElement($this->address_field)->name,
            $this->getElement($this->zoom_field)->name
        );

        if ($this->model->hasElement($this->lat_field) && $this->model->hasElement($this->lng_field))
        if ($this->model->get($this->lat_field)!='' && $this->model->get($this->lng_field)!='') {
            $this->map->js(true)->rvadym_gmap_form()->markerNew(
                $this->model->get($this->lat_field),
                $this->model->get($this->lng_field),
                $this->model->get($this->location_field)
            );
        }
    }
    private function setDrawVars(){
        $this->js(true)->rvadym_gmap_form()->setDrawVars(
            $this->draw_f->name
        );
        if ($this->model->hasElement($this->draw_field))
        if ($this->model->get($this->draw_field)!='') {
            $this->map->js(true)->rvadym_gmap()->drawPolygons(
                $this->model->get($this->draw_field)
            );
        }
    }
    // redefine to change form design
    function setOrder() {
        return $this;
    }
    public function checkForm() {
        if ($this->form_config['location']==true) {
            if (
                $this->get($this->addr_f->short_name) == '' ||
                $this->get($this->location_field) == '' ||
                $this->get($this->lat_field) == '' ||
                $this->get($this->lng_field) == ''
            ) {
                // TODO notify developerst about bad working form
                $this->js()->univ()->errorMessage('Something went wrong!')->execute();
            }
            if (
                ( is_object($this->addr_f) && $this->model->hasField($this->addr_f->short_name) && $this->get($this->addr_f->short_name) == $this->model->get($this->addr_f->short_name)) ||
                ( is_object($this->location_field) &&  $this->model->hasField($this->location_field->short_name) && $this->get($this->location_field->short_name) == $this->model->get($this->location_field->short_name)) ||
                ( is_object($this->lat_field) &&  $this->model->hasField($this->lat_field->short_name) && $this->get($this->lat_field->short_name) == $this->model->get($this->lat_field->short_name)) ||
                ( is_object($this->lng_field) &&  $this->model->hasField($this->lng_field->short_name) && $this->get($this->lng_field->short_name) == $this->model->get($this->lng_field->short_name))
            ) {
                $this->js()->univ()->errorMessage('You didn\'t change location')->execute();
            } else {
            }
        }
        if ($this->form_config['draw']==true) {
            // check form draw field //
        }

        $this->model->set($this->get())->save();
        $this->js()->univ()->successMessage('Updated')->execute();
    }
    // perform this after model has been loaded (afterLoad)
//    function afterLoad(){exit('sdf');
//        $this->set($this->addr_f->short_name,$this->model->get($this->location_field));
//        $this->address_view->set($this->model->get($this->location_field));
//    }
    function getCoordByAddr($addr) {
        $url = "http://maps.google.com/maps/api/geocode/json?sensor=false&address=".urlencode($addr);
        $ch = curl_init($url);
        //curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        $json_str = curl_exec($ch);
        curl_close($ch);
        $arr = json_decode( $json_str, true ); //var_dump($arr["results"][0]["formatted_address"]);
        //var_dump($arr["results"][0]);
        //echo json_last_error();
        $lng = $arr['results'][0]['geometry']['location']['lng'];
        $lat = $arr['results'][0]['geometry']['location']['lat'];
        $location = $arr["results"][0]["formatted_address"];
        $ret_arr = array('lng'=>$lng,'lat'=>$lat,'name'=>$location);
        return $ret_arr;
    }
    function render() {
        $this->js(true)
                ->_load('rvadym_gmap')
      			->_load('rvadym_gmap_form')
      			//->_css('rvadym_gmap')
        ;
        parent::render();
    }
    function defaultTemplate() {
//		// add add-on locations to pathfinder
//		$l = $this->api->locate('addons',__NAMESPACE__,'location');
//		$addon_location = $this->api->locate('addons',__NAMESPACE__);
//		$this->api->pathfinder->addLocation($addon_location,array(
//			'js'=>'templates/js',
//			'css'=>'templates/css',
//            'template'=>'templates',
//		))->setParent($l);

        return parent::defaultTemplate();
    }
}