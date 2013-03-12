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
        $.x_gm.polygonsCoords(null);
        $.x_gm.polygonsArray(null);
        if (typeof map_type_id == 'undefined') map_type_id = 'google.maps.MapTypeId.ROADMAP';
    	def={
    		zoom: zoom,
    		center: new google.maps.LatLng(lat,lng),
    		mapTypeId: eval(map_type_id)
    	};
        $.x_gm.map = new google.maps.Map(this.jquery[0],$.extend(def,options));
        this.addCoordListener();
    },
    makeGridSelectable: function($class){
        $('.'+$class).each(function(){
            $(this).click(function(event){
                //console.log($( this).text());
                $('.'+$class).each(function(){
                    $( this).removeClass('selected');
                })
                $('.continue').remove();
                $.x_gm.selectOneInGrid(this.id);
            });
        })
    },
    selectOneInGrid: function(elemet_id){ //console.log(elemet_id);
        $('#'+elemet_id).addClass('selected');
        $('#'+elemet_id).append('<span class="continue">continue<span>');
        $('span.continue').click(function(){
            $('.big_fat_form').find('input[name=ajax_submit]').val('form_submit');
            $('.big_fat_form').submit();
        });
    },
    makeGridItemsAddeble: function(id,field_id){
        $('.'+id).each(function(){
            $(this).click(function(event){
                //console.log($( this).text());
                $('.select').remove();
                $.x_gm.addAreaToField(this.id,field_id);
            });
        })
    },
    addAreaToField: function(elemet_id,field_id){ //console.log(field_id);
        var obj = $.parseJSON($('#'+field_id).val());
        if (obj === null) obj = new Object();

        $('#'+elemet_id).append('<span class="select">or select<span>');
        $('span.select').click(function(){
            var data_id = $('#'+elemet_id).closest('tr').attr('data-id');
            var name_html = $('#'+elemet_id).clone();
            name_html.find('span').remove();
            var type_html = $('#currently_open').clone();
            type_html.find('span').remove();
            var var_name = type_html.text().replace( /[^a-zA-Z0-9]/g , '') + '_' + data_id;
            obj[var_name] = {
                'id': data_id,
                'name': name_html.text(),
                'type': $.trim(type_html.text())
            };
            $('#'+field_id).val($.univ.toJSON(obj));
            $('#'+field_id).trigger('change');
            $('#'+elemet_id).univ().closeDialog();
        });
    },
    addCoordListener: function(){
        google.maps.event.addListener( $.x_gm.map, "click", function (e) {
            alert( e.latLng.lat() + ',' + e.latLng.lng() );
            var url = 'http://maps.googleapis.com/maps/api/geocode/json?latlng='+e.latLng.lat() + ',' + e.latLng.lng()+'&sensor=false';
            $.getJSON(url,
                function (data) {
                    //console.log(data);
                }
            );
        });
    },
    drawOptions: function(options){
        if (typeof options != 'undefined') { draw_options = options; }
        return draw_options;
    },
    addDrawingManager: function(options){
        this.drawingManager = new google.maps.drawing.DrawingManager(options);
        this.drawingManager.setMap($.x_gm.map);
        this.drawOptions(options);
    },
    polygonsArray: function(val){ //console.log('polygonsArray = null');
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
        if (typeof obj != 'undefined') { //console.log('polygonsCoords = null');
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
        var polygonsArray = $.x_gm.polygonsArray();

        google.maps.event.addListener(this.drawingManager, 'polygoncomplete', function(polygon) {
            if (polygons_options.single==true) {
                if (typeof polygonsArray[0] != 'undefined') polygonsArray[0].setMap(null);
                polygonsArray[0] = polygon;
            } else {
                polygonsArray[polygonsArray.length] = polygon;
            }
            $.x_gm.setFieldData(polygon);

            for (var i= 0; i<polygonsArray.length; i++) {
                var f = polygonsArray[i].getPath();
                f.forEach(function(element,index){
                    //console.log(element);
                });
                $.x_gm.addPolygonListeners(polygonsArray[i]);
            }
        });
    },
    addPolygonListeners: function(polygon){
        google.maps.event.addListener(polygon.getPath(), 'set_at', function() {
            $.x_gm.setFieldData();
        });
        google.maps.event.addListener(polygon.getPath(), 'insert_at', function() {
            $.x_gm.setFieldData();
        });
        google.maps.event.addListener(polygon.getPath(), 'remove_at', function() {
            $.x_gm.setFieldData();
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
    setFieldData: function(){console.log(polygons_options['draw_field_id']);
        var data_string = '[';
        for (var i= 0; i<polygonsArray.length; i++) {
            data_string = data_string + '[[';
            var data = polygonsArray[i];
            var path = data.getPath();
            path.forEach(function(element,index){
                if (index > 0) data_string = data_string + ',';
                data_string = data_string + '[';
                data_string = data_string + element.lng()+','+element.lat();
                data_string = data_string + ']';
            });
            data_string = data_string + ']]';
            if (polygonsArray.length != i+1)data_string = data_string + ',';
        }
        data_string = data_string + ']';
        $('#'+polygons_options['draw_field_id']).val(data_string);
    },
    drawPolygons: function(json_string) {//console.log(json_string);
        json_string = json_string.replace(/\[\[\]\]\,/g, "");
        json_string = json_string.replace(/\,\[\[\]\]/g, "");
        json_string = json_string.replace(/\[\[\]\]/g, "");
        json_string = json_string.replace(/\,\,/gi, ",");

        if (json_string=='[]') return;
        var arr = $.parseJSON(json_string);
        if (arr != null) {
            getPolygon(arr);
            $.x_gm.fitZoom($.x_gm.getFitBounds($.x_gm.polygonsCoords()));
        }

        function getPolygon(arr) {
            if (typeof arr[0] == 'object' && typeof arr[0][0] == 'object' && typeof arr[0][0][0] == 'object') {
                for (var i=0; i<arr.length; i++) { getPolygon(arr[i]); } return;
            }
            if (typeof arr[0] == 'object' && typeof arr[0][0] == 'object') {
                getPolygon(arr[0]); return;
            }
            var poly = new google.maps.Polygon;
            poly.setPath( $.x_gm.getPointsPath(arr) );
            poly.setOptions(draw_options.polygonOptions);
            if (draw_options.polygonOptions.editable) { ; }
            poly.setMap($.x_gm.map);
            $.x_gm.polygonsArray(poly);
            $.x_gm.addPolygonListeners(poly);
        }
    },
    getPointsPath: function(arr) {
        var path = new google.maps.MVCArray;
        for (var i=0; i<arr.length; i++) {
            var a = arr[i];
            path.push($.x_gm.latlng(a[1],a[0]));
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
          $.x_gm.map.fitBounds(bounds);
      } else {
          console.log('points is null -');
          //var NorthEast = new google.maps.LatLng(81.72318761821157,-167.34375);
          var NorthEast = new google.maps.LatLng(77.69287033641928,-142.734375);
          //var SouthWest = new google.maps.LatLng(-83.02621885344844,156.09375);
          var SouthWest = new google.maps.LatLng(-62.91523303947613,158.90625);
          console.log(NorthEast);
          console.log(SouthWest);
          var bounds = new google.maps.LatLngBounds(NorthEast,SouthWest);
          console.log(bounds);
          $.x_gm.map.fitBounds(bounds);
      }
    },
    marker: function(lat,lng,args){

        var marker = new google.maps.Marker({
            position: new google.maps.LatLng(lat,lng),
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
