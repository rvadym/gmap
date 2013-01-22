<?php
/**
 * Created by JetBrains PhpStorm.
 * User: vadym
 * Date: 1/22/13
 * Time: 1:14 PM
 * To change this template use File | Settings | File Templates.
 */
namespace x_gm;
class examples_Page extends \Page {
    function init() {
        parent::init();
    }
    function page_index() {

        // we will load all maps by AJAX, so we need to add these lines to add static js to page
        $map=$this->add('x_gm\View_Map',array(
            'sensor'=>'true',
            'libraries'=>array('drawing'),
        ));
        $map->addJsAndDestroy();

        $this->tt = $this->add('Tabs');
        $this->tt->addTabUrl('./mapform','Form with map');
        $this->tt->addTabUrl('./map','Just Map');
        $this->tt->addTabUrl('./mapdraw','Map with drawing');
    }
    function page_map(){
        $map=$this->add('x_gm\View_Map',array(
            'sensor'=>'true',
        ));
        //$map->addJs();
        $map->showMap();
    }
    function page_mapdraw(){
        $map=$this->add('x_gm\View_Map',array(
            'sensor'=>'true',
            'libraries'=>array('drawing'),
        ));
        //$map->addJs();
        $map->showMap();
    }
    /*
     * This code will not work on your computer because you have no Model_Venue
     * But you still can see how to add form with map on your page and try to do same with some
     * of your models
     */
    function page_mapform(){
        $form = $this->add('x_gm\Form_WithMap',array(
                    'map_config' => array(
                        'sensor'=>'true',
                        'libraries'=>array('drawing'),
                        'lat'=>'51.5081289',
                        'lng'=>'-0.128005',
                    ),
        ));
        $form->setModel('Venue',null,array('lng_field'=>'f_lon'));
    }
}