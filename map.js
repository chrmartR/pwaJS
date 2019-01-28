var mymap = L.map('mapid').setView([37.561959,-122.325554], 13);
L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(mymap);
var latlngs = [[1,1],[2,2],[3,3]];
var markers = [];
var polyline = L.polyline(latlngs, {color: '#5100B5', opacity: 0.5}).addTo(mymap);
function onMapClick(e) {
    var marker = L.marker(e.latlng).addTo(mymap);
    latlngs.push(e.latlng);
    markers.push(marker);
    polyline.setLatLngs(latlngs);
}
function onKeyPress(e) {
    if(e.originalEvent.key==="q"){  //remove last marker from the map
      if(markers.length>0){
        markers.pop().remove();
        latlngs.pop();
        polyline.setLatLngs(latlngs);
      }
    }
    if(e.originalEvent.key==="w"){
      while(markers.length>0){
        markers.pop().remove();
      }
      latlngs = [];
      polyline.setLatLngs(latlngs);
    }
}
mymap.on('click', onMapClick);
mymap.on('keypress', onKeyPress);
