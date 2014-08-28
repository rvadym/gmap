/**
 * Created with JetBrains PhpStorm.
 * User: vadym
 * Date: 1/21/13
 * Time: 7:25 PM
 * To change this template use File | Settings | File Templates.
 */

(function($){

$.rvadymGMap=function(){
	return $.rvadymGMap;
}

$.fn.extend({rvadymGMap:function(){
	var u=new $.rvadymGMap;
	u.jquery=this;
	return u;
}});


$.rvadymGMap._import=function(name,fn){
	$.rvadymGMap[name]=function(){
		var ret=fn.apply($.rvadymGMap,arguments);
		return ret?ret:$.rvadymGMap;
	}
}

$.each({

    start: function(lat,lng,zoom,options,map_type_id){
        $.rvadymGMap.polygonsCoords(null);
        $.rvadymGMap.polygonsArray(null);
        if (typeof map_type_id == 'undefined') map_type_id = 'google.maps.MapTypeId.ROADMAP';
    	def={
    		zoom: zoom,
    		center: new google.maps.LatLng(lat,lng),
    		mapTypeId: eval(map_type_id)
    	};
        $.rvadymGMap.map = new google.maps.Map(this.jquery[0],$.extend(def,options));
    },
    drawOptions: function(options){
        if (typeof options != 'undefined') { draw_options = options; }
        return draw_options;
    },
    addDrawingManager: function(options){
        this.drawingManager = new google.maps.drawing.DrawingManager(options);
        this.drawingManager.setMap($.rvadymGMap.map);
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
        var polygonsArray = $.rvadymGMap.polygonsArray();

        google.maps.event.addListener(this.drawingManager, 'polygoncomplete', function(polygon) {
            if (polygons_options.single==true) {
                if (typeof polygonsArray[0] != 'undefined') polygonsArray[0].setMap(null);
                polygonsArray[0] = polygon;
            } else {
                polygonsArray[polygonsArray.length] = polygon;
            }
            $.rvadymGMap.setFieldData(polygon);

            for (var i= 0; i<polygonsArray.length; i++) {
                var f = polygonsArray[i].getPath();
                f.forEach(function(element,index){
                    //console.log(element);
                });
                $.rvadymGMap.addPolygonListeners(polygonsArray[i]);
            }
        });
    },
    addPolygonListeners: function(polygon){
        google.maps.event.addListener(polygon.getPath(), 'set_at', function() {
            $.rvadymGMap.setFieldData();
        });
        google.maps.event.addListener(polygon.getPath(), 'insert_at', function() {
            $.rvadymGMap.setFieldData();
        });
        google.maps.event.addListener(polygon.getPath(), 'remove_at', function() {
            $.rvadymGMap.setFieldData();
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
            $.rvadymGMap.fitZoom($.rvadymGMap.getFitBounds($.rvadymGMap.polygonsCoords()));
        }

        function getPolygon(arr) {
            if (typeof arr[0] == 'object' && typeof arr[0][0] == 'object' && typeof arr[0][0][0] == 'object') {
                for (var i=0; i<arr.length; i++) { getPolygon(arr[i]); } return;
            }
            if (typeof arr[0] == 'object' && typeof arr[0][0] == 'object') {
                getPolygon(arr[0]); return;
            }
            var poly = new google.maps.Polygon;
            poly.setPath( $.rvadymGMap.getPointsPath(arr) );
            poly.setOptions(draw_options.polygonOptions);
            if (draw_options.polygonOptions.editable) { ; }
            poly.setMap($.rvadymGMap.map);
            $.rvadymGMap.polygonsArray(poly);
            $.rvadymGMap.addPolygonListeners(poly);
        }
    },
    getPointsPath: function(arr) {
        var path = new google.maps.MVCArray;
        for (var i=0; i<arr.length; i++) {
            var a = arr[i];
            path.push($.rvadymGMap.latlng(a[1],a[0]));
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
          $.rvadymGMap.map.fitBounds(bounds);
      } else {
          console.log('points is null');
      }
    },
    marker: function(args){

        var marker = new google.maps.Marker({
            position: new google.maps.LatLng(args['lat'],args['lng']),
            animation: google.maps.Animation.DROP,
            map: $.rvadymGMap.map,
            title:args['name'],
            clickable:true,
            draggable:true
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
                if( typeof $.rvadymGMap.marker.infowindow != 'undefined' ) {
                    $.rvadymGMap.marker.infowindow.close();
                }
                $.rvadymGMap.marker.infowindow = new google.maps.InfoWindow({
                   content: args['name']
                });
                $.rvadymGMap.marker.infowindow.open($.rvadymGMap,marker);
            });
        }

          return marker;
      },
      // If you find that your google map appears with the gray background
      // in a tab or form, you should do this:
      //
      // $tabs->js('tabsactivate',$tt->js()->rvadymGMap()->resize());
      // or use identical event for Dialog
      //
      resize: function(){
          return new google.maps.event.trigger($.rvadymGMap,'resize');
      },
      markerCounter: function(marker){
          if( typeof $.rvadymGMap.markerCounter.markers == 'undefined' ) { $.rvadymGMap.markerCounter.markers = []; }
    //      console.log($.rvadymGMap.markerCounter.markers.length);
          $.each($.rvadymGMap.markerCounter.markers, function(index, value) {
              if (value.title == marker.title) {
                  console.log('===> ' +value.title + ': ' + marker.title);
              }
          });

          $.rvadymGMap.markerCounter.markers[$.rvadymGMap.markerCounter.markers.length] = marker;
      },
    renderMapWithTimeout: function(map,time){
        $.rvadymGMap.getCoordinatesByAddr.lastRequest = '';
        $.rvadymGMap.markerNew.marker = undefined;
        //console.log('marker must be undefined - '+$.rvadymGMap.markerNew.marker );
        if ( typeof time == 'undefined' ) time = 5000;
        setTimeout(
            function () {
                $(map).trigger('render_map');

                setTimeout(
                    function () {
                        //console.log('$.rvadymGMap.f_location value = ' + $('#'+$.rvadymGMap.f_location).val());
                        //console.log('$.rvadymGMap.f_lat value = ' + $('#'+$.rvadymGMap.f_lat).val());
                        //console.log('$.rvadymGMap.f_lng value = ' + $('#'+$.rvadymGMap.f_lng).val());
                        if (
                          //$('#'+$.rvadymGMap.f_location).val() != null && $('#'+$.rvadymGMap.f_location).val() != '' &&
                          $('#'+$.rvadymGMap.f_lat).val() != null && $('#'+$.rvadymGMap.f_lat).val() != '' &&
                          $('#'+$.rvadymGMap.f_lng).val() != null &&$('#'+$.rvadymGMap.f_lng).val() != ''
                        ) {
                            $.rvadymGMap.markerNew($('#'+$.rvadymGMap.f_lat).val(),$('#'+$.rvadymGMap.f_lng).val(),$('#'+$.rvadymGMap.f_location).val());
                        }
                    },500)
                }
                ,time
        );
    }
},$.rvadymGMap._import);

})(jQuery);
