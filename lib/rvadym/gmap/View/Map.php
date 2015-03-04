<?php
/**
 * Created by JetBrains PhpStorm.
 * User: vadym
 * Date: 1/21/13
 * Time: 7:23 PM
 * To change this template use File | Settings | File Templates.
 */

/*
   atk4 plugin for google map api v3

1. a)  add these lines to page if you will load map View with ajax
      this code will add static js include to page with map because we can't load js from other domain by ajax

        $map=$this->add('rvadym\gmap\View_Map',array(
            'sensor'=>'true',
        ));
        $map->addJsAndDestroy();

   b) or this code if you will load map View with no ajax

        $map=$this->add('rvadym\gmap\View_Map',array(
            'sensor'=>'true',
        ));
        $map->addJs();

2. a) Add to View which will be loaded by ajax. Same like before.

        $map=$this->add('rvadym\gmap\View_Map',array(
            'sensor'=>'true',
        ));
   b) Don't do anything special if you load View with no ajax


3. You can set center of the map if you need. Otherwise it will be calculated automatically.
        $map->setCenter('51.5081289','-0.128005');

4. Now we can add map initialisation
      $map->showMap();



 */
namespace rvadym\gmap;
class View_Map extends \View {
	public $height=400;
	public $width=400;
    public $center = array('lat'=>-34.397, 'lon'=>150.644);
    public $zoom=10;
    public $api_js_url = null;
    public $libraries = array();
    public $sensor = 'false';
    public $lat=-34.397;
    public $lng=150.644;
    public $draw_options = array();
    public $options = array();
	function init(){
		parent::init();


        $this->namespace = __NAMESPACE__;
        $public_location = $this->app->pathfinder->addLocation(array(
            'js'=>array( 'packages/' . str_replace(['\\','/'],'_',$this->namespace) . '/js' ),
            'css'=>array( 'packages/' . str_replace(['\\','/'],'_',$this->namespace) . '/css' ),
        ))
            ->setBasePath(getcwd().'/public')
            ->setBaseURL($this->app->url('/'))
        ;



        $this->api_js_url =  'http://maps.googleapis.com/maps/api/js?sensor='.$this->sensor;
		$this->set('Loading Google Map...');
	}
    private $show_map_trigger = true;
    function showMap($trigger=true){
        $this->show_map_trigger = $trigger;
        $this->js($trigger)->rvadym_gmap()->start($this->lat,$this->lng,$this->zoom);
        $this->addDrawing();
        return $this;
   	}
    private function addDrawing(){
        if (in_array('drawing',$this->libraries)) {
            $this->js($this->show_map_trigger)->rvadym_gmap()->addDrawingManager($this->js(null,$this->draw_options));
            $this->polygons();
            $this->circles();
        }
    }
    public $polygon_options = array();
    private function polygons() {
        if (is_a($this->owner,'rvadym\gmap\Form_WithMap')) {
            $this->polygon_options['form_id'] = $this->owner->name;
            $this->polygon_options['draw_field_id'] = $this->owner->draw_f->name;
        }
        $this->js($this->show_map_trigger)->rvadym_gmap()->polygons($this->polygon_options);
    }
    private function circles() {
        // CREATE
    }
    function setCenter($lat,$lng){
        $this->lat = $lat;
        $this->lng = $lng;
        return $this;
    }
    function setMarker($args=null,$trigger=true){
        $this->js($trigger)->rvadym_gmap()->marker($args);
        return $this;
    }
    function setZoom($zoom){
        $this->zoom = $zoom;
        return $this;
    }
    private function prepareJs(){
        $count = 0;
        foreach ($this->libraries as $l) {
            if ($count==0) {
                $this->api_js_url .= '&libraries=';
            } else {
                $this->api_js_url .= ',';
            }
            $this->api_js_url .= $l;
        }
    }
    function addJs(){
        $this->prepareJs();
        $this->api->jui->addStaticInclude($this->api_js_url);
    }
    /**
     * use this method to add js to the page
     */
    function addJsAndDestroy(){
        $this->addJs();
        $this->destroy();
    }
    private function addDrawingManager(){
        $this->js()->rvadym_gmap()->addDrawingManager();
        return $this;
    }
    private function setWidthHeight(){
   		$this->addStyle([
            'height'=>$this->height.'px',
            'width'=>$this->width.'px',
        ]);
        return $this;
   	}
    function findBounds($points){
        $count = 0;
        foreach($points as $point) {
            $lat[] = $point['lat'];
            $lon[] = $point['lon'];
            $count++;
        }
        if ($count >= 2) {
            return array(
                'NorthEastLat' => min($lat),
                'NorthEastLng' => min($lon),
                'SouthWestLat' => max($lat),
                'SouthWestLng' => max($lon),
            );
        }
        return false;
    }
    function render() {
        $this->addClass('atk-form-row atk-cell ');
        $this->setWidthHeight();
        $this->js(true)
      			->_load('rvadym_gmap')
      	//		->_css('rvadym_gmap')
        ;
        parent::render();
    }
//    function defaultTemplate() {
//		// add add-on locations to pathfinder
//		$l = $this->api->locate('addons',__NAMESPACE__,'location');
//		$addon_location = $this->api->locate('addons',__NAMESPACE__);
//		$this->api->pathfinder->addLocation($addon_location,array(
//			'js'=>'templates/js',
//			'css'=>'templates/css',
//            'template'=>'templates',
//		))->setParent($l);
//
//        return parent::defaultTemplate();
//    }
}