<?php
/**
 * Created by JetBrains PhpStorm.
 * User: vadym
 * Date: 1/21/13
 * Time: 10:49 PM
 * To change this template use File | Settings | File Templates.
 */
namespace rvadym\gmap;
abstract class Form_WithMap extends \Form {

    public $map;
    public $map_config   = array();

    // FIELDS
    protected $draw_field;
    protected $address_field;
    protected $location_field;
    protected $lat_field;
    protected $lng_field;

    //
    protected $addr_field_placeholder = 'Type here to search for location, next drag pin on the map to find exact location';

    function init() {
        parent::init();
        if (isset($_GET['rvadym_gmap_action']) && $_GET['rvadym_gmap_action'] == 'getAddress') {
            echo json_encode( $this->getCoordByAddr($_GET['addr']));
            exit();
        }

        //if ($this->location_enabled) $this->addLocation();
        //if ($this->draw_enabled) $this->addDraw();
    }


    //--------------------------------------------------------------------------------
    //
    //                                LOCATION
    //
    //--------------------------------------------------------------------------------

    protected function addAddressField($addr='address',$loc='location',$lat='lat',$lng='lng') {

        // address
        if (!$this->address_field) {
            $this->address_field= $this->addField('Line',$addr);
        }
        $this->address_field->setAttr('placeholder',$this->addr_field_placeholder);

        // location
        if (!$this->location_field) {
            $this->location_field= $this->addField('Line',$loc);
        }

        // latitude
        if (!$this->lat_field) {
            $this->lat_field= $this->addField('Line',$lat);
        }

        // longitude
        if (!$this->lng_field) {
            $this->lng_field= $this->addField('Line',$lng);
        }

        $this->hideLocationFields();
        $this->addMap();
        $this->setLocationViewElements();
        //$this->trySetMarker();
        $this->addAddressFieldJsAction();
        $this->addAddressView();
        $this->address_field->js(true)->trigger('change');
    }
    protected function hideLocationFields() {
        if ($this->location_field) $this->location_field->js(true)->closest('.atk-form-row')->hide();
        if ($this->lat_field)      $this->lat_field->js(true)->closest('.atk-form-row')->hide();
        if ($this->lng_field)      $this->lng_field->js(true)->closest('.atk-form-row')->hide();
    }
    protected function addAddressView() {
        $this->address_view = $this->add('\View')->addClass('res');
        $this->js(true)->rvadymGMap_form()->bindLocationFieldsWithLocationView($this->address_view->name);

        if ($this->model)
        if ($this->location_field && $this->lat_field && $this->lng_field) {
            $this->js(true)->rvadymGMap_form()->setLocationView(array(
                'name' => $this->model->get($this->location_field),
                'lng'  => $this->model->get($this->lng_field),
                'lat'  => $this->model->get($this->lat_field),
            ));
        }
    }
    // can be redefined to use with dropdown or radio button
    function addAddressFieldJsAction() {
        $this->address_field->js('keyup',
            $this->js()->_selectorThis()->rvadymGMap_form()->getCoordByAddr($this->app->url(null,array('rvadym_gmap_action'=>'getAddress'))
        ));
    }
    protected function setLocationViewElements() {
        $this->js(true)->rvadymGMap_form()->setLocationViewElements(
            $this->location_field->name,
            $this->lat_field->name,
            $this->lng_field->name,
            $this->address_field->name
        );
    }

    // LOCATION -----------------------------------------------------------------------








    function addMap() {
        $this->map = $this->add('rvadym\gmap\View_Map',$this->map_config);
        $this->map->addJs();
        $this->map->showMap();
        //if ($this->draw_enabled) $this->setDrawVars();
    }
    protected function checkLocationFields() {

        $js = array();

        if (
            $this->get($this->address_field->short_name) == '' ||
            $this->get($this->location_field->short_name) == '' ||
            $this->get($this->lat_field->short_name) == '' ||
            $this->get($this->lng_field->short_name) == ''
        ) {
            // TODO notify developerst about bad working form
            //$this->js()->univ()->errorMessage('Something went wrong!')->execute();
        }

        /*if (
            ( is_object($this->address_field) && $this->model->hasField($this->addr_f->short_name) && $this->get($this->addr_f->short_name) == $this->model->get($this->addr_f->short_name)) ||
            ( is_object($this->location_field) &&  $this->model->hasField($this->location_field->short_name) && $this->get($this->location_field->short_name) == $this->model->get($this->location_field->short_name)) ||
            ( is_object($this->lat_field) &&  $this->model->hasField($this->lat_field->short_name) && $this->get($this->lat_field->short_name) == $this->model->get($this->lat_field->short_name)) ||
            ( is_object($this->lng_field) &&  $this->model->hasField($this->lng_field->short_name) && $this->get($this->lng_field->short_name) == $this->model->get($this->lng_field->short_name))
        ) {
            $js = $this->js()->univ()->errorMessage('You didn\'t change location')->execute();
        } else {
            // TODO do more operations
        }*/

        return $js;
    }
    function render() {
        $this->js(true)
                ->_load('rvadymGMap')
      			->_load('rvadymGMap_form')
      			//->_css('rvadymGMap')
        ;
        parent::render();
    }


    //--------------------------------------------------------------------------------
    //
    //                                UTIL
    //
    //--------------------------------------------------------------------------------

    // change to geocoder
    // http://www.wikihow.com/Geocode-an-Address-in-Google-Maps-Javascript
    // https://developers.google.com/maps/documentation/geocoding/
    // http://stackoverflow.com/questions/5688745/google-maps-v3-draggable-marker

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

    // UTIL ---------------------------------------------------------------------------





    /*----------------------------
     *
     *
     *    TO BE IMPLEMENTED
     *
     *
     */
//    protected function addLocation(){
//        //echo 'addLocation()';
//    }
//    protected function addDraw(){
//        //echo 'addDraw()';
//    }
    // redefine to change form design
    function setOrder() {
        return $this;
    }





    //--------------------------------------------------------------------------------
    //
    //                                DRAWING
    //
    //--------------------------------------------------------------------------------

//    protected function configureDrawField() {
//        if ($this->hasElement($this->draw_field)) {
//            $this->draw_f = $this->getElement($this->draw_field);
//        } else {
//            $this->draw_f = $this->addField('hidden',$this->draw_field);
//        }
//        $this->hideDrawFields();
//    }
//    protected function hideDrawFields() {
//        $this->draw_f->js(true)->closest('.atk-form-row')->hide();
//    }
//    protected function setDrawVars() {
//        $this->js(true)->rvadymGMap_form()->setDrawVars(
//            $this->draw_f->name
//        );
//        if ($this->model->hasElement($this->draw_field))
//            if ($this->model->get($this->draw_field)!='') {
//                $this->map->js(true)->rvadymGMap()->drawPolygons(
//                    $this->model->get($this->draw_field)
//                );
//            }
//    }

    // DRAWING -----------------------------------------------------------------------



//    function setModel($model,$actual_fields=undefined,$ignore_model=false) {
//        if (!$ignore_model) parent::setModel($model,$actual_fields);
//        //$this->model->addHook('afterLoad',array($this,'afterLoad'));
//        $this->renderJs();
//        $this->onSubmit(array($this,'checkForm'));
//        return $this->model;
//    }





    /*----------------------------
     *
     *
     *    TO BE REMOVED
     *
     *
     */

    //public $form_config  = array();

    // GMAP FEATURES TO BE ENABLED
    //protected $location_enabled       = true;
    //protected $draw_enabled           = false;


//    function defaultTemplate() {
        // add add-on locations to pathfinder
//		$l = $this->api->locate('addons',__NAMESPACE__,'location');
//		$addon_location = $this->api->locate('addons',__NAMESPACE__);
//		$this->api->pathfinder->addLocation($addon_location,array(
//			'js'=>'public/js',
//			'css'=>'public/css',
//            'template'=>'templates',
//		))->setParent($l);

//        return parent::defaultTemplate();
//    }


    // perform this after model has been loaded (afterLoad)
//    function afterLoad(){exit('sdf');
//        $this->set($this->addr_f->short_name,$this->model->get($this->location_field));
//        $this->address_view->set($this->model->get($this->location_field));
//    }




//    protected function renderJs(){
//        //if ($this->draw_enabled) $this->configureDrawField();
//        $this->addMap();
//        //$this->setOrder();
//    }


//    protected function trySetMarker() {
//        if ($this->model)
//            if ($this->model->hasElement($this->lat_field->short_name) && $this->model->hasElement($this->lng_field->short_name))
//                if ($this->model->get($this->lat_field->short_name)!='' && $this->model->get($this->lng_field->short_name)!='') {
//                    $this->map->js(true)->rvadymGMap_form()->markerNew(
//                        $this->model->get($this->lat_field->short_name),
//                        $this->model->get($this->lng_field->short_name),
//                        $this->model->get($this->location_field->short_name)
//                    );
//                }
//    }
}