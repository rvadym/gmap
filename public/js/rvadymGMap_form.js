/**
 * Created with JetBrains PhpStorm.
 * User: vadym
 * Date: 1/21/13
 * Time: 7:25 PM
 * To change this template use File | Settings | File Templates.
 */

(function($){

$.rvadymGMap_form=function(){
	return $.rvadymGMap_form;
}

$.fn.extend({rvadymGMap_form:function(){
	var u=new $.rvadymGMap_form;
	u.jquery=this;
	return u;
}});


$.rvadymGMap_form._import=function(name,fn){
	$.rvadymGMap_form[name]=function(){
		var ret=fn.apply($.rvadymGMap_form,arguments);
		return ret?ret:$.rvadymGMap_form;
	}
}

$.each({

    setLocationVars : function (f_location, f_lat, f_lng, f_address, map_view_id){
    	this.f_location  = f_location;
    	this.f_lat        = f_lat;
    	this.f_lng        = f_lng;
    	this.f_address   = f_address;
    	this.map_view_id = map_view_id;
    },
    setDrawVars : function (f_draw){
    	this.f_draw  = f_draw;
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
                          $('#'+map_id).rvadymGMap_form().markerNew(data.lat,data.lng,data.name,data);
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
            this.markerNew.marker = $.rvadymGMap.marker(ar);
            $.rvadymGMap.map.panTo(new google.maps.LatLng(lat,lng));

            $('#'+this.f_location).val( title );
            $('#'+this.f_lat).val( lat );
            $('#'+this.f_lng).val( lng );
        }
    }

},$.rvadymGMap_form._import);

})(jQuery);
