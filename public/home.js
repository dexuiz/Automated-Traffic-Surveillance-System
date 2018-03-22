
$('.icon.sidebar').click(()=>{
  $('.ui.sidebar').sidebar('toggle');
});

$("#sinput").on("keyup",function(e){
  if (e.keyCode == 13) {
    $("form").submit();
  }
})


var map = L.map('mapid').setView([19.0356,73.0228],13)

L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox.streets',
    accessToken:'pk.eyJ1IjoiZGV4dWl6IiwiYSI6ImNqOGh0dDFrMzBzbDgycXBiN2czdXI3MXAifQ.BtaT7PDh-ZgDGv_Dp8TivA'
}).addTo(map);

connects={};




fetch('/home/json').then((response)=>{
  if (response.status!==200) {
    console.log(reponse.statusText);
    console.log("there was an error");
  }else {
    response.json().then(function(data){
      console.log("database length",data.length);
      data.forEach((item)=>{
        if(item)
          setMarker(item)
          connects[data.id] = data

      })
    })
  }
})


var socket = io();
socket.emit("works","hopeThisWorksMan")


socket.on("success",function(data){
  console.log(data)
})

socket.on("point",function(data){
  console.log("new data from python ",data);
  var marker = L.marker([data.coords.lat,data.coords.lng]).addTo(map);
  marker.bindPopup("<b>licenseplate:</b>"+data.liplate+"<br>"+"<b>Offense type:</b>"+data.offense_type+'<a href="/inf/'+ data._id +'">go to page</a>')
  markers.addLayer(marker)
  // connects[data.id]=data;
})

var markers = L.markerClusterGroup();

function setMarker(data){
    if(data.coords){
      console.log("setmarker invoked");
      var marker = L.marker([data.coords.lat,data.coords.lng]).addTo(map);
      marker.bindPopup("<b>licenseplate:</b>"+data.liplate+"<br>"+"<b>Offense type:</b>"+data.offense_type+'<a href="/inf/'+ data._id +'">go to page</a>')
      markers.addLayer(marker)
    }
      // map.addLayer(markers)

}


map.addLayer(markers)
