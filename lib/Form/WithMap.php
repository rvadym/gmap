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
    function init() {
        parent::init();
        if (isset($_GET['x_gm_action']) && $_GET['x_gm_action'] == 'getAddress') {
            echo json_encode( $this->getCoordByAddr($_GET['addr']));
            exit();
        }
    }
    function setModel($model,$actual_fields=undefined,$map_conf=null){
        parent::setModel($model,$actual_fields);
        //$this->model->addHook('afterLoad',array($this,'afterLoad'));
        $this->prepareMapConf($map_conf);
        $this->configureAddressField();
        $this->hideLocationFields();
        $this->setOrder();
        $this->addMap();
        $this->addAddressView();
        $this->addAddressFieldJsAction();
        $this->onSubmit(array($this,'checkForm'));

        return $this->model;
    }
    private $address_field          = false;
    private $addr_field_placeholder = 'Type here to search place by address';
    private $location_field         = 'f_location';
    private $lat_field              = 'f_lat';
    private $lng_field              = 'f_lng';
    private function prepareMapConf($conf){
        if (is_array($conf)) {
            if (array_key_exists('address_field',$conf)) $this->address_field = $conf['address_field'];
            if (array_key_exists('addr_field_placeholder',$conf)) $this->addr_field_placeholder = $conf['addr_field_placeholder'];
            if (array_key_exists('location_field',$conf)) $this->location_field = $conf['location_field'];
            if (array_key_exists('lat_field',$conf)) $this->lat_field = $conf['lat_field'];
            if (array_key_exists('lng_field',$conf)) $this->lng_field = $conf['lng_field'];
        }
    }
    private function configureAddressField(){
        if ($this->address_field) {
            $this->addr_f = $this->getElement($this->address_field);
        } else {
            $this->addr_f = $this->addField('line','address');
        }
        $this->addr_f->setAttr('placeholder',$this->addr_field_placeholder);
    }
    private function addAddressView(){
        $this->address_view = $this->add('\View')->addClass('res');
        $this->address_view->setHTML(
            '<b>'.$this->model->get($this->location_field).'</b>.'
            .' lat:'.$this->model->get($this->lat_field)
            .' lng:'.$this->model->get($this->lng_field)
        );
    }
    // can be redefined to use with dropdown or radio button
    function addAddressFieldJsAction(){
        $this->addr_f->js('keyup',
            $this->js()->_selectorThis()->x_gm_form()->getCoordByAddr($this->api->url(null,array('x_gm_action'=>'getAddress'))
        ));
    }
    private function hideLocationFields() {
        $this->getElement($this->location_field)->js(true)->closest('.atk-form-row')->hide();
        $this->getElement($this->lat_field)->js(true)->closest('.atk-form-row')->hide();
        $this->getElement($this->lng_field)->js(true)->closest('.atk-form-row')->hide();
    }
    function addMap() {
        $this->map = $this->add('x_gm\View_Map',$this->map_config);
        $this->map->addJs();
        $this->map->showMap();

        $this->js(true)->x_gm_form()->setFormMapVars(
            $this->getElement($this->location_field)->name,
            $this->getElement($this->lat_field)->name,
            $this->getElement($this->lng_field)->name,
            $this->getElement($this->address_field)->name
        );
        if ($this->model->get($this->lat_field)!='' && $this->model->get($this->lng_field)!='') {
            $this->map->js(true)->x_gm_form()->markerNew(
                $this->model->get($this->lat_field),
                $this->model->get($this->lng_field),
                $this->model->get($this->location_field)
            );
        }
    }
    // redefine to change form design
    function setOrder() {
        return $this;
    }
    public function checkForm() {
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
            $this->get($this->addr_f->short_name) == $this->model->get($this->addr_f->short_name) ||
            $this->get($this->location_field) == $this->model->get($this->location_field) ||
            $this->get($this->lat_field) == $this->model->get($this->lat_field) ||
            $this->get($this->lng_field) == $this->model->get($this->lng_field)
        ) {
            $this->js()->univ()->errorMessage('You didn\'t change location')->execute();
        } else {
            $this->model->set($this->get())->save();
        }

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
                ->_load('x_gm')
      			->_load('x_gm_form')
      			//->_css('x_tags')
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