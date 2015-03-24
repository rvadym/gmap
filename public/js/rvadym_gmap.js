/**
 * Created with JetBrains PhpStorm.
 * User: vadym
 * Date: 1/21/13
 * Time: 7:25 PM
 * To change this template use File | Settings | File Templates.
 */

(function($){

$.rvadym_gmap=function(){
	return $.rvadym_gmap;
}

$.fn.extend({rvadym_gmap:function(){
	var u=new $.rvadym_gmap;
	u.jquery=this;
	return u;
}});


$.rvadym_gmap._import=function(name,fn){
	$.rvadym_gmap[name]=function(){
		var ret=fn.apply($.rvadym_gmap,arguments);
		return ret?ret:$.rvadym_gmap;
	}
}

$.each({

    start: function(lat,lng,zoom,options,map_type_id){
        $.rvadym_gmap.polygonsCoords(null);
        $.rvadym_gmap.polygonsArray(null);
        if (typeof map_type_id == 'undefined') map_type_id = 'google.maps.MapTypeId.ROADMAP';
    	def={
    		zoom: zoom,
    		center: new google.maps.LatLng(lat,lng),
    		mapTypeId: eval(map_type_id)
    	};
        $.rvadym_gmap.map = new google.maps.Map(this.jquery[0],$.extend(def,options));
        $.rvadym_gmap.addZoomListener();
    },
    addZoomListener: function() {
        google.maps.event.addListener($.rvadym_gmap.map, 'zoom_changed', function() {
            var zoomLevel = $.rvadym_gmap.map.getZoom();
            $.rvadym_gmap_form.updateZoomField(zoomLevel);
        });
    },
    drawOptions: function(options){
        if (typeof options != 'undefined') { draw_options = options; }
        return draw_options;
    },
    addDrawingManager: function(options){
        this.drawingManager = new google.maps.drawing.DrawingManager(options);
        this.drawingManager.setMap($.rvadym_gmap.map);
        this.drawOptions(options);
    },
    polygonsArray: function(val){ console.log('polygonsArray = null');
        if (typeof polygonsArray == 'undefined' || polygonsArray == null) polygonsArray = new Array;
        if (typeof val != 'undefined') {
            if (val == null) {
                for (var i= 0; i<polygonsArray.length; i++) {
                    polygonsArray[i].setMap(null);
                }
                polygonsArray = null;
            } else {
                polygonsArray[polygonsArray.length] = val;
            }
        }
        return polygonsArray;
    },
    polygonsCoords: function(obj){
        if (typeof points == 'undefined' || points==null) {
            points = new Array();
            points['lat'] = new Array();
            points['lng'] = new Array();
        }
        if (typeof obj != 'undefined') { console.log('polygonsCoords = null');
            if (obj == null) {
                points = null;
            } else {
                points['lat'][points['lat'].length]=obj.lat;
                points['lng'][points['lng'].length]=obj.lng;
            }
        }
        return points;
    },
    polygonsOptions: function(options){
        if (typeof options != 'undefined') { polygons_options = options; }
        return polygons_options;
    },
    polygons: function(options){
        this.polygonsOptions(options);
        var polygonsArray = $.rvadym_gmap.polygonsArray();

        google.maps.event.addListener(this.drawingManager, 'polygoncomplete', function(polygon) {
            if (polygons_options.single==true) {
                if (typeof polygonsArray[0] != 'undefined') polygonsArray[0].setMap(null);
                polygonsArray[0] = polygon;
            } else {
                polygonsArray[polygonsArray.length] = polygon;
            }
            $.rvadym_gmap.setFieldData(polygon);

            for (var i= 0; i<polygonsArray.length; i++) {
                var f = polygonsArray[i].getPath();
                f.forEach(function(element,index){
                    //console.log(element);
                });
                $.rvadym_gmap.addPolygonListeners(polygonsArray[i]);
            }
        });
    },
    addPolygonListeners: function(polygon){
        google.maps.event.addListener(polygon.getPath(), 'set_at', function() {
            $.rvadym_gmap.setFieldData();
        });
        google.maps.event.addListener(polygon.getPath(), 'insert_at', function() {
            $.rvadym_gmap.setFieldData();
        });
        google.maps.event.addListener(polygon.getPath(), 'remove_at', function() {
            $.rvadym_gmap.setFieldData();
        });

        // delete polygon point by click on it
        google.maps.event.addListener(polygon, 'click', function(event) {
                var path = this.getPath();
                for(i=0;i<path.length;i++){
                    if( event.latLng == path.getAt(i)){
                         path.removeAt(i);
                    }
                }
         });
    },
    setFieldData: function(){
        var data_string = '[';
        for (var i= 0; i<polygonsArray.length; i++) {
            data_string = data_string + '[[';
            var data = polygonsArray[i];
            var path = data.getPath();
            path.forEach(function(element,index){
                if (index > 0) data_string = data_string + ',';
                data_string = data_string + '[';
                //console.log (element);
                //console.log (element.Ya);
                //console.log (element.Za);
                data_string = data_string + element.lng()+','+element.lat();
                data_string = data_string + ']';
            });
            data_string = data_string + ']]';
            if (polygonsArray.length != i+1)data_string = data_string + ',';
        }
        data_string = data_string + ']';
        $('#'+polygons_options['draw_field_id']).val(data_string);
    },
    drawPolygons: function(json_string) {
        json_string = json_string.replace(/\[\[\]\]\,/g, "");
        json_string = json_string.replace(/\,\[\[\]\]/g, "");
        json_string = json_string.replace(/\[\[\]\]/g, "");
        json_string = json_string.replace(/\,\,/gi, ",");

        if (json_string=='[]') return;
        var arr = $.parseJSON(json_string);
        if (arr != null) {
            getPolygon(arr);
            $.rvadym_gmap.fitZoom($.rvadym_gmap.getFitBounds($.rvadym_gmap.polygonsCoords()));
        }

        function getPolygon(arr) {
            if (typeof arr[0] == 'object' && typeof arr[0][0] == 'object' && typeof arr[0][0][0] == 'object') {
                for (var i=0; i<arr.length; i++) { getPolygon(arr[i]); } return;
            }
            if (typeof arr[0] == 'object' && typeof arr[0][0] == 'object') {
                getPolygon(arr[0]); return;
            }
            var poly = new google.maps.Polygon;
            poly.setPath( $.rvadym_gmap.getPointsPath(arr) );
            poly.setOptions(draw_options.polygonOptions);
            if (draw_options.polygonOptions.editable) { ; }
            poly.setMap($.rvadym_gmap.map);
            $.rvadym_gmap.polygonsArray(poly);
            $.rvadym_gmap.addPolygonListeners(poly);
        }
    },
    getPointsPath: function(arr) {
        var path = new google.maps.MVCArray;
        for (var i=0; i<arr.length; i++) {
            var a = arr[i];
            path.push($.rvadym_gmap.latlng(a[1],a[0]));
            // global points
            var b = new Object();
            b.lat = a[1];
            b.lng = a[0];
            this.polygonsCoords(b);
        }
        return path;
    },
    getFitBounds: function(points){
        // Function to get the Maximum value in Array
        Array.max = function( array ){
            return Math.max.apply( Math, array );
        };
        // Function to get the Minimum value in Array
        Array.min = function( array ){
            return Math.min.apply( Math, array );
        };
        return {
            'NorthEastLat': Array.min(points['lat']),
            'NorthEastLng': Array.min(points['lng']),
            'SouthWestLat': Array.max(points['lat']),
            'SouthWestLng': Array.max(points['lng'])
        };
    },
    latlng: function(lat, lng){
  	    return new google.maps.LatLng(lat,lng);
    },
    fitZoom: function(points){
      if (points) {
          var NorthEast = new google.maps.LatLng(points['NorthEastLat'],points['NorthEastLng']);
          var SouthWest = new google.maps.LatLng(points['SouthWestLat'],points['SouthWestLng']);
          //console.log(NorthEast);
          //console.log(SouthWest);
          var bounds = new google.maps.LatLngBounds(NorthEast,SouthWest);
          //console.log(bounds);
          $.rvadym_gmap.map.fitBounds(bounds);
      } else {
          console.log('points is null');
      }
    },
    marker: function(args){

        var marker = new google.maps.Marker({
            position: new google.maps.LatLng(args['lat'],args['lng']),
            animation: google.maps.Animation.DROP,
            map: $.rvadym_gmap.map,
            title: args['name'],
            clickable: true,
			draggable: true
        });

        if(args['thumb']) {
            //console.log(args['thumb']);
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
                if( typeof $.rvadym_gmap.marker.infowindow != 'undefined' ) {
                    $.rvadym_gmap.marker.infowindow.close();
                }
                $.rvadym_gmap.marker.infowindow = new google.maps.InfoWindow({
                   content: args['name']
                });
                $.rvadym_gmap.marker.infowindow.open($.rvadym_gmap,marker);
            });
        }

		// http://gmaps-samples-v3.googlecode.com/svn/trunk/draggable-markers/draggable-markers.html
		// Add dragging event listeners.
		/*google.maps.event.addListener(marker, 'dragstart', function() {
			updateMarkerAddress('Dragging...');
		});*/

	   /*google.maps.event.addListener(marker, 'drag', function() {
			updateMarkerStatus('Dragging...');
			updateMarkerPosition(marker.getPosition());
		});*/

		google.maps.event.addListener(marker, 'dragend', function() {
			//updateMarkerStatus('Drag ended');
			$.rvadym_gmap.geocodePosition(marker.getPosition());
		});

        return marker;

    },
	geocodePosition: function (pos, args) {
		var geocoder = new google.maps.Geocoder();
		geocoder.geocode({
			latLng: pos
		}, function(responses) {
			if (responses && responses.length > 0) {
				$.rvadym_gmap_form.updateAddressBar(
					responses[0].formatted_address,
					responses[0].geometry.location.D,
					responses[0].geometry.location.k
				);
			} else {
				alert('Cannot determine address at this location.');
				//updateMarkerAddress('Cannot determine address at this location.');
			}
		});
	},
  // If you find that your google map appears with the gray background
  // in a tab or form, you should do this:
  //
  // $tabs->js('tabsactivate',$tt->js()->rvadym_gmap()->resize());
  // or use identical event for Dialog
  //
  resize: function(){
      return new google.maps.event.trigger($.rvadym_gmap,'resize');
  },
  markerCounter: function(marker){
      if( typeof $.rvadym_gmap.markerCounter.markers == 'undefined' ) { $.rvadym_gmap.markerCounter.markers = []; }
//      console.log($.rvadym_gmap.markerCounter.markers.length);
      $.each($.rvadym_gmap.markerCounter.markers, function(index, value) {
          if (value.title == marker.title) {
              console.log('===> ' +value.title + ': ' + marker.title);
          }
      });

      $.rvadym_gmap.markerCounter.markers[$.rvadym_gmap.markerCounter.markers.length] = marker;
  },
    renderMapWithTimeout: function(map,time){
        $.rvadym_gmap.getCoordinatesByAddr.lastRequest = '';
        $.rvadym_gmap.markerNew.marker = undefined;
        //console.log('marker must be undefined - '+$.rvadym_gmap.markerNew.marker );
        if ( typeof time == 'undefined' ) time = 5000;
        setTimeout(
            function () {
                $(map).trigger('render_map');

                setTimeout(
                    function () {
                        //console.log('$.rvadym_gmap.f_location value = ' + $('#'+$.rvadym_gmap.f_location).val());
                        //console.log('$.rvadym_gmap.f_lat value = ' + $('#'+$.rvadym_gmap.f_lat).val());
                        //console.log('$.rvadym_gmap.f_lng value = ' + $('#'+$.rvadym_gmap.f_lng).val());
                        if (
                          //$('#'+$.rvadym_gmap.f_location).val() != null && $('#'+$.rvadym_gmap.f_location).val() != '' &&
                          $('#'+$.rvadym_gmap.f_lat).val() != null && $('#'+$.rvadym_gmap.f_lat).val() != '' &&
                          $('#'+$.rvadym_gmap.f_lng).val() != null &&$('#'+$.rvadym_gmap.f_lng).val() != ''
                        ) {
                            $.rvadym_gmap.markerNew($('#'+$.rvadym_gmap.f_lat).val(),$('#'+$.rvadym_gmap.f_lng).val(),$('#'+$.rvadym_gmap.f_location).val());
                        }
                    },500)
                }
                ,time
        );
    }
},$.rvadym_gmap._import);

})(jQuery);
