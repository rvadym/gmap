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
    addDrawingManager: function() {
        var drawingManager = new google.maps.drawing.DrawingManager();
        drawingManager.setMap($.x_gm.map);
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
