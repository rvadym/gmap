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

        $map=$this->add('x_gm\View_Map',array(
            'sensor'=>'true',
        ));
        $map->addJsAndDestroy();

   b) or this code if you will load map View with no ajax

        $map=$this->add('x_gm\View_Map',array(
            'sensor'=>'true',
        ));
        $map->addJs();

2. a) Add to View which will be loaded by ajax. Same like before.

        $map=$this->add('x_gm\View_Map',array(
            'sensor'=>'true',
        ));
   b) Don't do anything special if you load View with no ajax


3. You can set center of the map if you need. Otherwise it will be calculated automatically.
        $map->setCenter('51.5081289','-0.128005');

4. Now we can add map initialisation
      $map->showMap();



 */
namespace x_gm;
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
	function init(){
		parent::init();
        $this->api_js_url =  'http://maps.googleapis.com/maps/api/js?sensor='.$this->sensor;
		$this->set('Loading Google Map...');
	}
    private $show_map_trigger = true;
    function showMap($trigger=true){
        $this->show_map_trigger = $trigger;
        $this->js($trigger)->x_gm()->start($this->lat,$this->lng,$this->zoom);
        $this->addDrawing();
        return $this;
   	}
    private function addDrawing(){
        if (in_array('drawing',$this->libraries)) {
            $this->js($this->show_map_trigger)->x_gm()->addDrawingManager($this->js(null,$this->draw_options));
            $this->polygons();
            $this->circles();
        }
    }
    public $polygon_options = array();
    private function polygons() {
        $this->js($this->show_map_trigger)->x_gm()->polygons($this->polygon_options);
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
        $this->js($trigger)->x_gm()->marker($args);
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
        $this->js()->x_gm()->addDrawingManager();
        return $this;
    }
    private function setWidthHeight(){
   		$this->addStyle(array('height'=>$this->height.'px'));
   	}
    function render() {
        $this->setWidthHeight();
        $this->js(true)
      			->_load('x_gm')
      	//		->_css('x_tags')
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