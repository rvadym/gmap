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
    public $grid_spot = 'grid';
    public $map_options = array(
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
                        editable: false
                    }
              }"
            );
    function init(){
        parent::init();
        $this->map = $this->add('x_gm\View_Map',$this->map_options,$this->map_spot);

        $this->l = $this->add('x_gm\Grid_Draw',array(
            'map'=>$this->map,
        ),$this->grid_spot);
    }
    function setModel($model, $actual_fields = undefined) {
        parent::setModel($model, $actual_fields);
        $this->l->setModel($model,array('name','draw'));
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

class Grid_Draw extends \Grid {
    public $show_header = false;
    public $map;
    function init() {
        parent::init();
//        $this->addPaginator(8);
//        $this->add('QuickSearch',null,'quick_search')
//            ->removeClass('float-right')
//            ->useWith($this)
//            ->useFields(array('name'));
    }
    function setModel($model, $actual_fields = undefined){
        parent::setModel($model, $actual_fields);
        $this->removeColumn('draw');
    }
    function formatRow(){
        parent::formatRow();
        $v = $this->add('View','v'.$this->current_row['id'],'content')
                ->set($this->current_row['name']);
        $v->js('click',array(
                $this->map->js()->x_gm()->polygonsArray(null),
                $this->map->js()->x_gm()->polygonsCoords(null),
                $this->map->js()->x_gm()->drawPolygons($this->current_row['draw']),
                $this->owner->owner->choice->js()->val($this->current_row['id']),
                $this->js()->_selector('#you_have_selected')->html($this->current_row['name'])
            )
        );
        $this->current_row_html['name'] = $v->getHTML();
    }
}