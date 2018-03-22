$('.special.cards .image').dimmer({
  on: 'hover'
});

$('.modal').modal({
  duration:200
})

$('.coupled.modal').modal({
  allowMultiple: false
})

$('.second.modal').modal('attach events','.first.modal .button')

$('.second.modal').modal({
  onVisible:function(){
    // $('.second.modal').modal('hideDimmer')
    alert("hola")
  }
})

$('.bt_modal').on("click",function(){
  id = $(this).attr('id');
  $(`#${id}.modal`).modal('show')
})

$("#bt_submit").on("click",function(){
  $("#liform").submit();
  console.log("form submission complete");

})

$(".button.submit").on("click",function(){
  var id = $(this).attr('id');
  $(".form#"+id).submit();
  console.log("submission complete ");
  // window.stop();
  $(".column."+id).remove();
})

$(".button.deny").on("click",function(){
  var id = $(this).attr('id');
  var item = document.getElementById("liplate")
  item.value ="0"
  $(".form#"+id).submit();
  console.log("deletion complete");
  $(".column."+id).remove();

})
