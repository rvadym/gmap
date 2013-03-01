<?php
/**
 * Created by JetBrains PhpStorm.
 * User: vadym
 * Date: 1/21/13
 * Time: 10:49 PM
 * To change this template use File | Settings | File Templates.
 */
namespace x_gm;
class Form_WithMap extends \Form {
    public $map;
    public $map_config  = array();
    public $form_config  = array();

    private $draw_field             = 'draw';
    private $address_field          = 'address';
    private $addr_field_placeholder = 'Type here to search place by address';
    private $location_field         = 'location';
    private $lat_field              = 'lat';
    private $lng_field              = 'lng';

    function init() {
        parent::init();
        if (isset($_GET['x_gm_action']) && $_GET['x_gm_action'] == 'getAddress') {
            echo json_encode( $this->getCoordByAddr($_GET['addr']));
            exit();
        }

        if (isset($this->form_config['map_fields'])) $this->prepareFieldsNames();
        if ($this->form_config['location']==true) $this->addLocation();
        if ($this->form_config['draw']==true) $this->addDraw();
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
    private function renderJs(){
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
            $this->addr_f = $this->addField('line',$this->address_field);
        }
        $this->addr_f->setAttr('placeholder',$this->addr_field_placeholder);
        // location
        if ($this->hasElement($this->location_field)) {
            $this->loc_f = $this->getElement($this->location_field);
        } else {
            $this->loc_f = $this->addField('hidden',$this->location_field);
        }
        // latitude
        if ($this->hasElement($this->lat_field)) {
            $this->lat_f = $this->getElement($this->lat_field);
        } else {
            $this->lat_f = $this->addField('hidden',$this->lat_field);
        }
        // longitude
        if ($this->hasElement($this->lng_field)) {
            $this->lng_f = $this->getElement($this->lng_field);
        } else {
            $this->lng_f = $this->addField('hidden',$this->lng_field);
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
            $this->js()->_selectorThis()->x_gm_form()->getCoordByAddr($this->api->url(null,array('x_gm_action'=>'getAddress'))
        ));
    }
    private function configureDrawField(){
        if ($this->hasElement($this->draw_field)) {
            $this->draw_f = $this->getElement($this->draw_field);
        } else {
            $this->draw_f = $this->addField('hidden',$this->draw_field);
        }
        //$this->hideDrawFields();
    }
    private function hideLocationFields() {
        $this->getElement($this->location_field)->js(true)->closest('.atk-form-row')->hide();
        $this->getElement($this->lat_field)->js(true)->closest('.atk-form-row')->hide();
        $this->getElement($this->lng_field)->js(true)->closest('.atk-form-row')->hide();
    }
    private function hideDrawFields() {
        $this->draw_f->js(true)->closest('.atk-form-row')->hide();
    }
    function addMap() {var_dump($this->owner->template->hasTag('map'));
        $spot = ($this->owner->template->hasTag('map'))? 'map':null;
        $this->map = $this->owner->add('x_gm\View_Map',$this->map_config,$spot);
        $this->map->addJs();
        $this->map->showMap();
        if ($this->form_config['location']==true) $this->setLocationVars();
        if ($this->form_config['draw']==true) $this->setDrawVars();
    }
    private function setLocationVars(){
        $this->js(true)->x_gm_form()->setLocationVars(
            $this->getElement($this->location_field)->name,
            $this->getElement($this->lat_field)->name,
            $this->getElement($this->lng_field)->name,
            $this->getElement($this->address_field)->name
        );
        if ($this->model->hasElement($this->lat_field) && $this->model->hasElement($this->lng_field))
        if ($this->model->get($this->lat_field)!='' && $this->model->get($this->lng_field)!='') {
            $this->map->js(true)->x_gm_form()->markerNew(
                $this->model->get($this->lat_field),
                $this->model->get($this->lng_field),
                $this->model->get($this->location_field)
            );
        }
    }
    private function setDrawVars(){
        $this->js(true)->x_gm_form()->setDrawVars(
            $this->draw_f->name
        );
        if ($this->model->hasElement($this->draw_field))
        if ($this->model->get($this->draw_field)!='') {
            $this->map->js(true)->x_gm()->drawPolygons(
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
        //var_dump($arr);
        //echo json_last_error();
        $lng = $arr['results'][0]['geometry']['location']['lng'];
        $lat = $arr['results'][0]['geometry']['location']['lat'];
        $location = $arr["results"][0]["formatted_address"];
        $ret_arr = array('lng'=>$lng,'lat'=>$lat,'name'=>$location);
        return $ret_arr;
    }
    function render() {
        $this->js(true)
                ->_load('x_gm')
      			->_load('x_gm_form')
      			//->_css('x_gm')
        ;
        parent::render();
    }
    function defaultTemplate() {
		// add add-on locations to pathfinder
		$l = $this->api->locate('addons',__NAMESPACE__,'location');
		$addon_location = $this->api->locate('addons',__NAMESPACE__);
		$this->api->pathfinder->addLocation($addon_location,array(
			'js'=>'templates/js',
			'css'=>'templates/css',
            'template'=>'templates',
		))->setParent($l);

        return parent::defaultTemplate();
    }
}