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
    public $center = array('lat'=>-34.397, 'lng'=>150.644);
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
        $this->api_js_url =  'http://maps.googleapis.com/maps/api/js?sensor='.$this->sensor;
		$this->set('Loading Google Map...');
	}
    private $show_map_trigger = true;
    function showMap($trigger=true){
        $this->show_map_trigger = $trigger;
        $this->js($trigger)->x_gm()->start($this->lat,$this->lng,$this->zoom);
        $this->addDrawing();

        // markers
        if ($this->model) {
            $points = $this->calculatePoints();
            $center = $this->findCenter($points);
            $bound_coord = $this->findBounds($points);
            if (count($center))$this->setCenter($center['lat'],$center['lng']);
            $this->setMarkers($points);
            $this->js(true)->x_gm()->fitZoom($bound_coord);
        }
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
    public $form_with_draw_field = false;
    private function polygons() {
        if (!$this->form_with_draw_field) $this->form_with_draw_field = $this->owner;
        if (is_subclass_of($this->form_with_draw_field,'x_gm\Form_WithMap')) {
            $this->polygon_options['form_id'] = $this->form_with_draw_field->name;
            $this->polygon_options['draw_field_id'] = $this->form_with_draw_field->draw_f->name;
        }
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
    function setMarker($point){
        $this->js($this->show_map_trigger)->x_gm()->marker($point['lat'],$point['lng'],$point['args']);
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
        return $this;
   	}

    //
    function setMarkers($points){
        foreach($points as $point) {//var_dump($point);echo '<hr>';
            $this->setMarker($point);
            //$this->js($this->show_map_trigger)->x_gm()->marker($point['lat'],$point['lng'],$point['args']);
        }
    }
    function calculatePoints(){
        $points = array();
        if ($this->model) {
            foreach($this->model as $point) {
                $points[] = array(
                    'lat'  =>$point['f_lat'],
                    'lng'  =>$point['f_lng'],
                    'name' =>$point['name'],
                    'args' =>$point
                );
            }
    }
        return $points;
    }
    function findCenter($points){
        $count = 0;
        foreach($points as $point) {
            $lat[] = $point['lat'];
            $lng[] = $point['lng'];
            $count++;
        }
        if ($count) {
            return array(
                'lat' => array_sum($lat) / $count,
                'lng' => array_sum($lng) / $count,
            );
        }
        return false;
    }
    function findBounds($points){
        $count = 0;
        foreach($points as $point) {
            $lat[] = $point['lat'];
            $lng[] = $point['lng'];
            $count++;
        }
        if ($count >= 2) {
            return array(
                'NorthEastLat' => min($lat),
                'NorthEastLng' => min($lng),
                'SouthWestLat' => max($lat),
                'SouthWestLng' => max($lng),
            );
        }
        return false;
    }
    function render() {
        $this->setWidthHeight();
        $this->js(true)
      			->_load('x_gm')
      	//		->_css('x_gm')
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