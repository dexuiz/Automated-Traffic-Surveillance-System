$('.icon.sidebar').click(()=>{
  $('.ui.sidebar').sidebar('toggle');
});

$('#date_only').calendar({
});

var map = L.map('mapid').setView([19.0356,73.0228],13)

L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox.streets',
    accessToken:'pk.eyJ1IjoiZGV4dWl6IiwiYSI6ImNqOGh0dDFrMzBzbDgycXBiN2czdXI3MXAifQ.BtaT7PDh-ZgDGv_Dp8TivA'
}).addTo(map);

var mapform = document.getElementById("mapform");

var oldmarker= new L.marker([0,0])
oldmarker.addTo(map);

function onMapClick(e) {
  marker = new L.marker(e.latlng, {draggable:'true'});
  map.removeLayer(oldmarker)
  oldmarker = marker
  mapform.value=JSON.stringify(e.latlng)
  console.log(e.latlng.lng)
  marker.on('dragend', function(event){
    var marker = event.target;
    var position = marker.getLatLng();
    marker.setLatLng(new L.LatLng(position.lat, position.lng),{draggable:'true'});
    map.panTo(new L.LatLng(position.lat, position.lng))
  });
  map.addLayer(marker);
};

map.on('click', onMapClick);
