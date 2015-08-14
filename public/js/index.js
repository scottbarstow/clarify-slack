$(function(){
  $('a.delete').click(function(e){
    e.preventDefault();
    var id = $(this).data('id');
    if (window.confirm("Are you sure you want to delete this call?")) {
      $.ajax({
        method: 'DELETE',
        url: '/' + id
      }).done(function () {
        window.location.href = '/';
      });
    }
  });

  var socket = io();
  socket.on('user.authorize', function () {
    var userId = $('#userId').val();
    socket.emit('user.authorize.response', { _id: userId });
  });

  socket.on('call.indexed', function(call){
    var dataSelector = '[data-id="' + call._id + '"]';
    $('.cost' + dataSelector).append(call.processing_cost);
    var openBtnSelector = 'a.open' + dataSelector;
    $(openBtnSelector).show();
  });

  socket.on('call.added', function(call){
    var callTemplate = $("#callTemplate").html();
    var $tr  = $(_.template(callTemplate, call));
    $('#calls tbody').append($tr);
  });
});
