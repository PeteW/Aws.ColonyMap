/**
 * Created by pw on 1/24/2015.
 */
var indexUtils = {
    //build pushpins given the http context, the map and the worksheet array list
    buildPushpins: function(worksheetArray, $http, map){
        var latLngBounds = L.latLngBounds(L.latLng(0,0));
        for(var i = 1; i < worksheetArray.length; i++){
            //load worksheet array
            //TODO: replace this with JSON object
            var x = {
                message: worksheetArray[i][0],
                street: worksheetArray[i][1],
                city: worksheetArray[i][2],
                state: worksheetArray[i][3],
                zip: worksheetArray[i][4],
                lat: worksheetArray[i][5]||0,
                lng: worksheetArray[i][6]||0,
                type: worksheetArray[i][7]
            };
            //determine icon
            if(x.type=='A')
                x.icon = indexUtils.typeAIcon;
            else
                x.icon = indexUtils.typeBIcon;
            //if the lat/lng is pre-resolved
            if(x.lat != 0 && x.lng != 0){
                indexUtils.addMarkerToMap(x,map,latLngBounds);
                continue;
            }
            //if the lat/lng is not pre-resolved query nominatim
            $http.get("http://nominatim.openstreetmap.org/search?format=json&limit=1&q=" + x.street + " " + x.city + ", " + x.state + " " + x.zip)
            .success(function(data, status) {
                if(data.length==0){
                    alert("Unable to geocode: "+ x.street+", "+ x.city+", "+ x.state + " " + x.zip);
                }else{
                    x.lat = parseFloat(data[0].lat);
                    x.lng = parseFloat(data[0].lon);
                    indexUtils.addMarkerToMap(x, map, latLngBounds);
                }
            }).error(function(data, status) {
                alert("Unable to geocode: "+ x.street+", "+ x.city+", "+ x.state + " " + x.zip+": "+ status + " - "+ data);
            });
        }
    },
    //add a marker to the map
    addMarkerToMap: function(markerObj, map, latLngBounds){
        //build the marker add it to the map
        var marker = L.marker([markerObj.lat, markerObj.lng], {icon: markerObj.icon});
        marker.addTo(map).bindPopup(markerObj.message);
        //extend the map zoom bounding box
        latLngBounds.extend(marker.getLatLng());
        return map.fitBounds(latLngBounds,{padding: [20, 20]});
    },
    typeAIcon: L.icon({
        iconUrl: '/images/redPushpin.png',
        iconAnchor: [12,25]
    }),
    typeBIcon: L.icon({
        iconUrl: '/images/bluePushpin.png',
        iconAnchor: [12,25]
    })
};


var app = angular.module('app1', ['leaflet-directive']);
app.controller('Controller', [ '$scope', '$http', 'leafletData', function($scope, $http, leafletData) {
    $scope.markers = new Array();
    angular.extend($scope, {
        defaults: {
            tileLayer: 'http://{s}.tile.opencyclemap.org/cycle/{z}/{x}/{y}.png',
            zoomControlPosition: 'topright',
            tileLayerOptions: {
                opacity: 0.9,
                detectRetina: true,
                reuseTiles: true
            }
        }
    });
    $http.get('/file').success(function(data, status) {
        leafletData.getMap().then(function(map){
            indexUtils.buildPushpins(data.data, $http, map);
        });
    }).error(function(data, status) {
        alert("Unable to read file data: "+ status);
    });
}]);