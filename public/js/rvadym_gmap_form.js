/**
 * Created with JetBrains PhpStorm.
 * User: vadym
 * Date: 1/21/13
 * Time: 7:25 PM
 * To change this template use File | Settings | File Templates.
 */

(function($){

$.rvadym_gmap_form=function(){
	return $.rvadym_gmap_form;
}

$.fn.extend({rvadym_gmap_form:function(){
	var u=new $.rvadym_gmap_form;
	u.jquery=this;
	return u;
}});


$.rvadym_gmap_form._import=function(name,fn){
	$.rvadym_gmap_form[name]=function(){
		var ret=fn.apply($.rvadym_gmap_form,arguments);
		return ret?ret:$.rvadym_gmap_form;
	}
}

$.rvadym_gmap_form.storrage = {
	marker: null
};

$.each({

    setLocationVars : function (f_location, f_lat, f_lng, f_address, f_zoom, map_view_id){
    	this.f_location  = f_location;
    	this.f_lat       = f_lat;
    	this.f_lng       = f_lng;
    	this.f_address   = f_address;
    	this.f_zoom      = f_zoom;
    	this.map_view_id = map_view_id;
    },
    setDrawVars : function (f_draw){
    	this.f_draw  = f_draw;
    },
    updateZoomField: function(val) {
        $('#' + this.f_zoom).val(val);
    },
    getCoordByAddr: function(url){
        var form_this = this;
        var addr = $('#'+this.f_address).val();
        if (this.getCoordByAddr.lastRequest == addr) { return; }
        if (addr.length >= 3 && this.getCoordByAddr.lastRequest != addr) {
            this.getCoordByAddr.counter = ( typeof this.getCoordByAddr.counter == 'undefined' )? 0: this.getCoordByAddr.counter+1;
            setTimeout(
                function () {
                    form_this.getCoordByAddr.counter--;
                    if ( form_this.getCoordByAddr.counter >= 0) { return; }
                    console.log("BINGO " +form_this.getCoordByAddr.counter);
                    $.getJSON(url+'&addr='+addr,
                        function(data) {
							$.rvadym_gmap_form.updateAddressBar( data.name, data.lng, data.lat );
                    });
                    form_this.getCoordByAddr.lastRequest = addr;
                    console.log('last request   = '+form_this.getCoordByAddr.lastRequest);
                }
                ,1000
            );
        }
    },

	// name suggestion -> updateOrCreateMarker
    markerNew: function(lat,lng,title,args){

		if (typeof lat === 'undefined' || lat === null) {
			console.error('not correct lat'); return;
		}
		if (typeof lng === 'undefined' || lng === null) {
			console.error('not correct lng'); return;
		}

		var latlng = new google.maps.LatLng(lat, lng);

		// if marker already exist on the map
		if ( this.storrage.marker !== null ) {
			this.storrage.marker.setPosition( latlng );
		}

		// if there is no marker yet
		else {
			var ar = {'lat':lat,'lng':lng,'name':title};
			this.storrage.marker = $.rvadym_gmap.marker(ar);
		}

		$.rvadym_gmap.map.panTo( latlng );

		$('#'+this.f_location).val( title );
		$('#'+this.f_lat).val( lat );
		$('#'+this.f_lng).val( lng );
    },
	updateAddressBar: function(name,lng,lat,args) {
		$('.res').html('<b>'+ name +'.</b> <i>lng '+ lng +' lat '+ lat +'</i>');

		var map_id = this.map_view_id;
		$('#'+map_id).rvadym_gmap_form().markerNew(lat,lng,name,args);
		console.log(map_id);
	}

},$.rvadym_gmap_form._import);

})(jQuery);
