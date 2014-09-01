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

    setLocationViewElements : function (f_location, f_lat, f_lng, f_address, map_view_id){
    	this.f_location  = f_location;
    	this.f_lat       = f_lat;
    	this.f_lng       = f_lng;
    	this.f_address   = f_address;
    	this.map_view_id = map_view_id;
    },
    setDrawVars : function (f_draw){
    	this.f_draw  = f_draw;
    },
    getCoordByAddr: function(url){

        that = this;

        addr = $('#'+this.f_address).val();
        map_id = this.map_view_id;
        if (this.getCoordByAddr.lastRequest == addr) { return; }
        if (addr.length >= 3 && this.getCoordByAddr.lastRequest != addr) {
            this.getCoordByAddr.counter = ( typeof this.getCoordByAddr.counter == 'undefined' )? 0: this.getCoordByAddr.counter+1;
            setTimeout(
                function () {
                    that.getCoordByAddr.counter--;
                    if ( that.getCoordByAddr.counter >= 0) { return; }
                    console.log("BINGO " +that.getCoordByAddr.counter);
                    $.getJSON(url+'&addr='+addr
                        ,function(data) {
                            console.log(data);
                            //that.setLocationView(data);

                            $('#'+that.f_location).val( data.name );
                            $('#'+that.f_lat).val( data.lat );
                            $('#'+that.f_lng).val( data.lng );
                            $('#'+that.f_address).change();

                            //$('#'+this.map_view_id).rvadymGMap_form().markerNew(data.lat,data.lng,data.name,data);
                        }
                    );
                    that.getCoordByAddr.lastRequest = addr;
                    console.log('last request   = '+that.getCoordByAddr.lastRequest);
                }
                ,1000
            );
        }
    },
    bindLocationFieldsWithLocationView: function(view_id) {
        that = this;

        under_operation = false;

        // address
        $('#'+this.f_address).on('change',function(e){
            that.refreshMapView(view_id);
        });

        // location
        $('#'+this.f_location).on('change',function(e){
            that.setLocationView(view_id);
        });
        $('#'+this.f_location).on('keyup',function(e){
            $('#'+that.f_location).change();
        });

        // lng
        $('#'+this.f_lng).on('change',function(e){
            that.setLocationView(view_id);
        });
        $('#'+this.f_lng).on('keyup',function(e){
            $('#'+that.f_lng).change();
        });

        // lat
        $('#'+this.f_lat).on('change',function(e){
            that.setLocationView(view_id);
        });
        $('#'+this.f_lat).on('keyup',function(e){
            $('#'+that.f_lat).change();
        });
    },
    refreshMapView: function (view_id) {

        that = this;

        var title = $('#'+ this.f_location).val();
        var lng   = $('#'+ this.f_lng).val();
        var lat   = $('#'+ this.f_lat).val();

        this.setLocationView(view_id);

        var counter = 0;
        function setMarker() {
            if (counter > 10) {
                console.log('Cannot perform delayed operation');
            }
            counter = counter+1;
            if (typeof $.rvadymGMap.map != 'undefined') {
                that.markerNew(lat,lng,title);
                return;
            } else {
                timer = setTimeout(function() {
                    setMarker();
                },1000)
            }
        }
        setMarker();
    },
    setLocationView: function(view_id) {

        var title = $('#'+ this.f_location).val();
        var lng   = $('#'+ this.f_lng).val();
        var lat   = $('#'+ this.f_lat).val();

        $('#'+view_id).html('<b>'+title+'.</b> <i>lng '+lng+' lat '+lat+'</i>');
    },
    markerNew: function(lat,lng,title,args) {

        that = this;

        if( typeof this.markerNew.marker != 'undefined' ) {
            //if ( this.markerNew.lat != lat && this.markerNew.lng != lng && lat != null && lng != null ) {
                if ( typeof this.markerNew.lat != 'undefined' && typeof this.markerNew.lng != 'undefined' ) {
                        this.markerNew.marker.setMap(null);
                }
            //}
        }
        if (lat != null && lng != null) {
            this.markerNew.lat = lat;
            this.markerNew.lng = lng;
            var ar = {'lat':lat,'lng':lng,'name':title};
            this.markerNew.marker = $.rvadymGMap.marker(ar);
            var LatLng = new google.maps.LatLng(lat,lng);
            $.rvadymGMap.map.panTo(LatLng);



            google.maps.event.addListener(that.markerNew.marker, 'dragend', function() {
                that.geocodePosition(that.markerNew.marker.getPosition());
            });
        }
    },
    geocodePosition: function(pos) {

        that = this;

        geocoder = new google.maps.Geocoder();
        geocoder.geocode({
                latLng: pos
            },
            function(results, status) {
                if (status == google.maps.GeocoderStatus.OK) {
                    $('#'+that.f_location).val( results[0].formatted_address );
                    $('#'+that.f_lat).val( pos.lat() );
                    $('#'+that.f_lng).val( pos.lng() );
                    $('#'+that.f_location).change();

                } else {
                    alert('Cannot determine address at this location.'+status);
                }
            }
        );
    }

},$.rvadymGMap_form._import);

})(jQuery);
