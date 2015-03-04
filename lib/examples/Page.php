<?php
/**
 * Created by JetBrains PhpStorm.
 * User: vadym
 * Date: 1/22/13
 * Time: 1:14 PM
 * To change this template use File | Settings | File Templates.
 */
namespace rvadym\gmap;
class examples_Page extends \Page {
    function init() {
        parent::init();
    }
    function page_index() {

        // we will load all maps by AJAX, so we need to add these lines to add static js to page
        $map=$this->add('rvadym\gmap\View_Map',array(
            'libraries'=>array('drawing'),
        ));
        $map->addJsAndDestroy();

        $this->tt = $this->add('Tabs');
        $this->tt->addTabUrl('./map','Just Map');
        $this->tt->addTabUrl('./mapform','Form with map');
        $this->tt->addTabUrl('./mapdraw','Map with drawing');
    }
    function page_map(){
        $map=$this->add('rvadym\gmap\View_Map',array(
            'sensor'=>'true',
            'lat'=>'51.5081289',
            'lng'=>'-0.128005',
        ));
        $map->showMap();
    }
    function page_mapdraw(){
        $m = $this->add('Model_CountryD')->loadAny();
        $f = $this->add('rvadym\gmap\Form_WithMap',array(
            'form_config'=>array(
                'draw'=>true,
                'map_fields'=>array(
                    'draw_field'=>'draw',
                )
            ),
            'map_config'=>array(
                'libraries'=>array('drawing'),
                'sensor'=>true,
                /*
                 * mor info about polygon_options you can find here
                 * https://developers.google.com/maps/documentation/javascript/reference#Polygon
                 */
                'polygon_options'=>array('single'=>false),
                /*
                 * more info about draw_options you can find here
                 * https://developers.google.com/maps/documentation/javascript/reference
                 */
                'draw_options'=>"{
                    drawingControlOptions: {
                        position: google.maps.ControlPosition.TOP_LEFT,
                        drawingModes: [
                            google.maps.drawing.OverlayType.POLYGON
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
            ),
        ));
        $f->setModel($m,array('draw'));
        $f->addSubmit();
    }
    /*
     * This code will not work on your computer because you have no Model_Venue
     * But you still can see how to add form with map on your page and try to do same with some
     * of your models
     */
    function page_mapform(){
        $form = $this->add('rvadym\gmap\Form_WithMap',array(
                    'form_config'=>array(
                        'location'=>true,
                        'map_fields'=>array(
                            'address_field'=>'address',
                            'location_field'=>'f_location',
                            'lat_field'=>'f_lat',
                            'lng_field'=>'f_lon',
                        )
                    ),
                    'map_config' => array(
                        'sensor'=>'true',
                        'lat'=>'51.5081289',
                        'lng'=>'-0.128005',
                    ),
        ));
        $form->setModel('Venue',null,array('lng_field'=>'f_lon'));
    }
}