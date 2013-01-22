/**
 * Created with JetBrains PhpStorm.
 * User: vadym
 * Date: 1/21/13
 * Time: 7:25 PM
 * To change this template use File | Settings | File Templates.
 */

(function($){

$.x_gm_form=function(){
	return $.x_gm_form;
}

$.fn.extend({x_gm_form:function(){
	var u=new $.x_gm_form;
	u.jquery=this;
	return u;
}});


$.x_gm_form._import=function(name,fn){
	$.x_gm_form[name]=function(){
		var ret=fn.apply($.x_gm_form,arguments);
		return ret?ret:$.x_gm_form;
	}
}

$.each({

    setFormMapVars : function (f_location, f_lat, f_lng, f_address, map_view_id){
    	this.f_location  = f_location;
    	this.f_lat        = f_lat;
    	this.f_lng        = f_lng;
    	this.f_address   = f_address;
    	this.map_view_id = map_view_id;
    },
    getCoordByAddr: function(url){
        form_this = this;
        addr = $('#'+this.f_address).val();
        map_id = this.map_view_id;
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
                          $('.res').html('<b>'+data.name+'.</b> <i>lng '+data.lng+' lat '+data.lat+'</i>');
                          $('#'+map_id).x_gm_form().markerNew(data.lat,data.lng,data.name,data);
                            console.log(map_id);
                    });
                    form_this.getCoordByAddr.lastRequest = addr;
                    console.log('last request   = '+form_this.getCoordByAddr.lastRequest);
                }
                ,1000
            );
        }
    },
    markerNew: function(lat,lng,title,args){
        if( typeof this.markerNew.marker != 'undefined' ) {
            if ( this.markerNew.lat != lat && this.markerNew.lng != lng && lat != null && lng != null ) {
                if ( typeof this.markerNew.lat != 'undefined' && typeof this.markerNew.lng != 'undefined' ) {
                        this.markerNew.marker.setMap(null);
                }
            }
        }
        if (lat != null && lng != null) {
            this.markerNew.lat = lat;
            this.markerNew.lng = lng;
            var ar = {'lat':lat,'lng':lng,'name':title};
            this.markerNew.marker = $.x_gm.marker(ar);
            $.x_gm.map.panTo(new google.maps.LatLng(lat,lng));

            $('#'+this.f_location).val( title );
            $('#'+this.f_lat).val( lat );
            $('#'+this.f_lng).val( lng );
        }
    }

},$.x_gm_form._import);

})(jQuery);
