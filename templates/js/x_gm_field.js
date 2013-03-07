/**
 * User: romans
 *
 * implements necessary js for a field with a popup. Apply this widget on
 * top of the Popover
 */

(function($){

$.widget('ui.gm_field', {

	// Few different ways to display a message
	options: {
		address_lookup: null, // url for address lookup
        map_id: null,  // selector for google map
        lon: null,
        lat: null
	},

    _create: function() {
        // Creates the widget


    },
    lookup: function(){
        var addr=$(this.options.addr_line).val().trim();
        if(!addr)return;
        var self=this;

        $.getJSON(
            this.options.address_lookup+'&addr='+addr,
            function(data) {
                $(self.options.map_id).x_gm_form().markerNew(data.lat,data.lng,data.name,data);

                console.log(self.options.lon);
                $(self.options.lon).val(data.lng);
                $(self.options.lat).val(data.lat);
            }
        );
    },

    _destroy: function(){ 
        console.log('destroyed');
    }

});

})(jQuery);

/*


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
*/
