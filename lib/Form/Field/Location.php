<?php
namespace x_gm;
/**
 * This class adds a new field. This field is for typing address. It will be
 * equipped with a "show map" button to bring up a pop-up with a map. You can
 * find location no the map and pin it if you prefer. The location will be
 * placed back into the original field
 */
class Form_Field_Location extends \Form_Field_Line {
    function init(){
        parent::init();

        // Calculate URL for the map lookup callback
        $this->addr_url=$this->add('VirtualPage','getaddr')
            ->set(function($p){
                echo json_encode( 
                    $p->add('x_gm/Form_WithMap')->getCoordByAddr($_GET['addr'])
                );
                exit;
            })->getURL();



        $this->button = $this->afterField()->add('Button')->setLabel('Map');

        $this->flyout = $this->owner->add('View_Flyout','mapframe');
        $this->page_Map($this->flyout);

        $this->button->js('click',array(
            $this->flyout->showJS(
                $this->button,
                array(
                    'width'=>500,
                    'my'=>'right top',
                )
            ),
            $this->map->js()->trigger('redraw'),
            $this->flyout->js()->gm_field('lookup'),
        ));


    }
    function page_Map($p){
        $this->map=$map=$p->add('x_gm\View_Map',array(
            'sensor'=>'true',
            'lat'=>'51.5081289',
            'lng'=>'-0.128005',
        ));

        $p->js(true)->_load('x_gm_form')->_load('x_gm_field')->gm_field(array(
            'addr_line'=>$this,
            'address_lookup'=>$this->addr_url,
            'map_id'=>$this->map,
            'lon'=>$this->owner->getElement('lon'), // TODO: dirty!
            'lat'=>$this->owner->getElement('lat'),
        ));

        $map->showMap('redraw');
    }
}
