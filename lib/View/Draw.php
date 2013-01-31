<?php
/**
 * Created by JetBrains PhpStorm.
 * User: vadym
 * Date: 1/31/13
 * Time: 3:19 PM
 * To change this template use File | Settings | File Templates.
 */
namespace x_gm;
class View_Draw extends \View {
    public $map;
    public $map_spot = 'map';
    public $lister_spot = 'lister';
    function init(){
        parent::init();

        $this->l = $this->add('x_gm\Lister_Draw',null,$this->lister_spot);

        $this->map = $this->add('x_gm\View_Map',array(
            'libraries'=>array('drawing'),
            'sensor'=>true,
            'zoom'=>1,
            'lat'=>33.5333333,
            'lng'=>-7.5833333,
            'polygon_options'=>array('single'=>false),
            'draw_options'=>"{
                drawingControlOptions: {
                    position: google.maps.ControlPosition.TOP_LEFT,
                    drawingModes: [
                        //google.maps.drawing.OverlayType.POLYGON
                    ]
                },
                polygonOptions: {
                    //fillColor: '#ffff00',
                    //fillOpacity: 1,
                    strokeWeight: 1,
                    clickable: false,
                    //zIndex: 1,
                    editable: true
                }
          }"
        ),$this->map_spot);
    }
    function setModel($model, $actual_fields = undefined) {
        parent::setModel($model, $actual_fields);
        $this->l->setModel($model);
        $this->map->showMap();
    }

    /* addon settings */
    function render() {
        $this->js(true)
                //->_load('x_gm')
      			//->_load('x_gm_form')
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

        return array('view/draw');
    }
}

class Lister_Draw extends \CompleteLister {
    function formatRow(){
        parent::formatRow();
//        $this->current_row['name'] = 'qwe';
    }
}