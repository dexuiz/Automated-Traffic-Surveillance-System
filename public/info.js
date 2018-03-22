$('.icon.sidebar').click(() => {
  $('.ui.sidebar').sidebar('toggle');
});

if ($('.carousel-cell').length > 1) {
  console.log($('.carousel-cell').length);
  $('.main-carousel').flickity({wrapAround: false, prevNextButtons: true, pageDots: true})
}

$('#bt_modal').click(() => {
  $('.ui.modal.pmod').modal('show');
})

$(".button.smod").click((event)=>{
  id = $(this).attr('id');
  console.log(id);
  $("#"+id+".modal").show();
})


function modfn(item){
  console.log(item);
  id = $(item).attr('id')
  console.log(id);
  $("#"+id+".modal").modal('show')
}


var map = L.map('mapid').setView([
  51.505, -0.09
], 13)

L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
  attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
  maxZoom: 18,
  id: 'mapbox.streets',
  accessToken: 'pk.eyJ1IjoiZGV4dWl6IiwiYSI6ImNqOGh0dDFrMzBzbDgycXBiN2czdXI3MXAifQ.BtaT7PDh-ZgDGv_Dp8TivA'
}).addTo(map);

var lat = document.getElementById("lat").innerHTML
var lng = document.getElementById("lng").innerHTML

if ($('.mapz').length) {
  $(".mapz").each(function(index) {
    var lat = document.getElementById(`lat${index}`).innerHTML
    var lng = document.getElementById(`lng${index}`).innerHTML
    console.log(lat, lng);

    var map = L.map($(this).attr('id')).setView([
      51.505, -0.09
    ], 13)
    L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
      attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
      maxZoom: 18,
      id: 'mapbox.streets',
      accessToken: 'pk.eyJ1IjoiZGV4dWl6IiwiYSI6ImNqOGh0dDFrMzBzbDgycXBiN2czdXI3MXAifQ.BtaT7PDh-ZgDGv_Dp8TivA'
    }).addTo(map);
    marker = L.marker([lat, lng]).addTo(map)
    marker.bindPopup("<b>location of the offender</b>").openPopup();
  })
}

marker = L.marker([lat, lng]).addTo(map)
marker.bindPopup("<b>location of the offender</b>").openPopup();
