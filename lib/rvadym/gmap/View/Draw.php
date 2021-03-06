<?php
/**
 * Created by JetBrains PhpStorm.
 * User: vadym
 * Date: 1/31/13
 * Time: 3:19 PM
 * To change this template use File | Settings | File Templates.
 */
namespace rvadym\gmap;
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


        $this->namespace = __NAMESPACE__;
        $public_location = $this->app->pathfinder->addLocation(array(
            'js'=>array( 'packages/' . str_replace(['\\','/'],'_',$this->namespace) . '/js' ),
            'css'=>array( 'packages/' . str_replace(['\\','/'],'_',$this->namespace) . '/css' ),
        ))
            ->setBasePath(getcwd().'/public')
            ->setBaseURL($this->app->url('/'))
        ;



        $this->map = $this->add('rvadym\gmap\View_Map',$this->map_options,$this->map_spot);

        $this->l = $this->add('rvadym\gmap\Grid_Draw',array(
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
                //->_load('rvadym_gmap')
      			//->_load('rvadym_gmap_form')
      			//->_css('rvadym_gmap')
        ;
        parent::render();
    }
    function defaultTemplate() {
		// add add-on locations to pathfinder
//		$l = $this->api->locate('addons',__NAMESPACE__,'location');
//		$addon_location = $this->api->locate('addons',__NAMESPACE__);
//		$this->api->pathfinder->addLocation($addon_location,array(
//			'js'=>'templates/js',
//			'css'=>'templates/css',
//            'template'=>'templates',
//		))->setParent($l);

        return array('view/draw');
    }
}

class Grid_Draw extends \Grid {
    public $map;
    function init() {
        parent::init();
        $this->addPaginator(8);
        $this->add('QuickSearch',null,'quick_search')
            ->removeClass('float-right')
            ->useWith($this)
            ->useFields(array('name'));
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
                $this->map->js()->rvadym_gmap()->polygonsArray(null),
                $this->map->js()->rvadym_gmap()->polygonsCoords(null),
                $this->map->js()->rvadym_gmap()->drawPolygons($this->current_row['draw']),
            )
        );
        $this->current_row_html['name'] = $v->getHTML();
    }
}