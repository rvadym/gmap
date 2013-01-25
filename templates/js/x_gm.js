/**
 * Created with JetBrains PhpStorm.
 * User: vadym
 * Date: 1/21/13
 * Time: 7:25 PM
 * To change this template use File | Settings | File Templates.
 */

(function($){

$.x_gm=function(){
	return $.x_gm;
}

$.fn.extend({x_gm:function(){
	var u=new $.x_gm;
	u.jquery=this;
	return u;
}});


$.x_gm._import=function(name,fn){
	$.x_gm[name]=function(){
		var ret=fn.apply($.x_gm,arguments);
		return ret?ret:$.x_gm;
	}
}

$.each({

    start: function(lat,lng,zoom,options,map_type_id){
        if (typeof map_type_id == 'undefined') map_type_id = 'google.maps.MapTypeId.ROADMAP';
    	def={
    		zoom: zoom,
    		center: new google.maps.LatLng(lat,lng),
    		mapTypeId: eval(map_type_id)
    	};
        $.x_gm.map = new google.maps.Map(this.jquery[0],$.extend(def,options));
    },
    addDrawingManager: function(options){
        this.drawingManager = new google.maps.drawing.DrawingManager(options);
        this.drawingManager.setMap($.x_gm.map);
    },
    polygonsArray: function(){
        if (typeof polygonsArray != 'undefined') var polygonsArray = new Array;
        return polygonsArray;
    },
    polygons: function(options){
        if (options.single==true) {
            $.x_gm.addPolygonFromField(options['draw_field_id']);
        }
        var polygonsArray = $.x_gm.polygonsArray();

        google.maps.event.addListener(this.drawingManager, 'polygoncomplete', function(polygon) {
            if (options.single==true) {
                if (typeof polygonsArray[0] != 'undefined') polygonsArray[0].setMap(null);
                polygonsArray[0] = polygon;
            } else {
                polygonsArray[polygonsArray.length] = polygon;
            }
            $.x_gm.setFieldData(options['draw_field_id'],polygon);

            for (var i= 0; i<=polygonsArray.length; i++) {
                var f = polygonsArray[i].getPath();
                f.forEach(function(element,index){
                    //console.log(element);
                });
                $.x_gm.addPolygonListeners(polygonsArray[i],options['draw_field_id']);
            }
        });
    },
    addPolygonListeners: function(polygon,field){
        google.maps.event.addListener(polygon.getPath(), 'set_at', function() {
            $.x_gm.setFieldData(field,polygon);
        });
        google.maps.event.addListener(polygon.getPath(), 'insert_at', function() {
            $.x_gm.setFieldData(field,polygon);
        });
        google.maps.event.addListener(polygon.getPath(), 'remove_at', function() {
            $.x_gm.setFieldData(field,polygon);
        });

        // delete polygon point by click on it
        google.maps.event.addListener(polygon, 'click', function(event) {
                path = this.getPath();
                for(i=0;i<path.length;i++){
                    if( event.latLng == path.getAt(i)){
                         path.removeAt(i);
                    }
                }
         });
    },
    setFieldData: function(field,data){
        var data_string = '';
        var f = data.getPath();
        f.forEach(function(element,index){
            if (index != 0) data_string = data_string + '|';
            data_string = data_string + element;
        });
        $('#'+field).val(data_string);
    },
    addPolygonFromField: function(field_id){
        var data_string = $('#'+field_id).val();
        var p = new google.maps.Polygon;
        var data_string = data_string.replace(/\)/gi,'');
        var data_string = data_string.replace(/\(/gi,'');
        var data_arr = data_string.split('|');
        var path = new google.maps.MVCArray;
        for (var i=0; i<data_arr.length; i++) {
            var a = data_arr[i].split(',');
            path.push($.x_gm.latlng(a[0],a[1]));
        }
        p.setPath(path);
        p.setEditable(true);
        p.setMap(this.map);
        $.x_gm.addPolygonListeners(p,field_id);
        $.x_gm.polygonsArray()[0] = p;
    },
    latlng: function(lat, lng){
  	    return new google.maps.LatLng(lat,lng);
    },
    fitZoom: function(points){
      if (points) {
          var NorthEast = new google.maps.LatLng(points['NorthEastLat'],points['NorthEastLng']);
          var SouthWest = new google.maps.LatLng(points['SouthWestLat'],points['SouthWestLng']);
          console.log(NorthEast);
          console.log(SouthWest);
          var bounds = new google.maps.LatLngBounds(NorthEast,SouthWest);
          console.log(bounds);
          $.x_gm.map.fitBounds(bounds);
      } else {
          console.log('points is null');
      }
    },
    marker: function(args){

        var marker = new google.maps.Marker({
            position: new google.maps.LatLng(args['lat'],args['lng']),
            animation: google.maps.Animation.DROP,
            map: $.x_gm.map,
            title:args['name'],
            clickable:true
        });

        if(args['thumb']) {
            console.log(args['thumb']);
            $.ajax({
                url:args['thumb'],
                type:'HEAD',
                error: function() {
                    //file not exists
                },
                success: function() {
                    //file exists
                    marker.setIcon(args['thumb']);
                }
            });
        }

        if(args['name']) {
            google.maps.event.addListener(marker, 'click', function() {
                //$.univ().frameURL('title',args['frame_url']);
                if( typeof $.x_gm.marker.infowindow != 'undefined' ) {
                    $.x_gm.marker.infowindow.close();
                }
                $.x_gm.marker.infowindow = new google.maps.InfoWindow({
                   content: args['name']
                });
                $.x_gm.marker.infowindow.open($.x_gm,marker);
            });
        }

          return marker;
      },
  // If you find that your google map appears with the gray background
  // in a tab or form, you should do this:
  //
  // $tabs->js('tabsactivate',$tt->js()->x_gm()->resize());
  // or use identical event for Dialog
  //
  resize: function(){
      return new google.maps.event.trigger($.x_gm,'resize');
  },
  markerCounter: function(marker){
      if( typeof $.x_gm.markerCounter.markers == 'undefined' ) { $.x_gm.markerCounter.markers = []; }
//      console.log($.x_gm.markerCounter.markers.length);
      $.each($.x_gm.markerCounter.markers, function(index, value) {
          if (value.title == marker.title) {
              console.log('===> ' +value.title + ': ' + marker.title);
          }
      });

      $.x_gm.markerCounter.markers[$.x_gm.markerCounter.markers.length] = marker;
  },
    renderMapWithTimeout: function(map,time){
        $.x_gm.getCoordinatesByAddr.lastRequest = '';
        $.x_gm.markerNew.marker = undefined;
        //console.log('marker must be undefined - '+$.x_gm.markerNew.marker );
        if ( typeof time == 'undefined' ) time = 5000;
        setTimeout(
            function () {
                $(map).trigger('render_map');

                setTimeout(
                    function () {
                        //console.log('$.x_gm.f_location value = ' + $('#'+$.x_gm.f_location).val());
                        //console.log('$.x_gm.f_lat value = ' + $('#'+$.x_gm.f_lat).val());
                        //console.log('$.x_gm.f_lng value = ' + $('#'+$.x_gm.f_lng).val());
                        if (
                          //$('#'+$.x_gm.f_location).val() != null && $('#'+$.x_gm.f_location).val() != '' &&
                          $('#'+$.x_gm.f_lat).val() != null && $('#'+$.x_gm.f_lat).val() != '' &&
                          $('#'+$.x_gm.f_lng).val() != null &&$('#'+$.x_gm.f_lng).val() != ''
                        ) {
                            $.x_gm.markerNew($('#'+$.x_gm.f_lat).val(),$('#'+$.x_gm.f_lng).val(),$('#'+$.x_gm.f_location).val());
                        }
                    },500)
                }
                ,time
        );
    }
},$.x_gm._import);

})(jQuery);
