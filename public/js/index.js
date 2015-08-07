$(function(){
  $('a.delete').click(function(e){
    e.preventDefault();
    var id = $(this).data('id');
    if (window.confirm("Are you sure you want to delete this record?")) {
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

  socket.on('record.indexed', function(record){
    var dataSelector = '[data-id="' + record._id + '"]';
    $('.cost' + dataSelector).append(record.processing_cost);
    var openBtnSelector = 'a.open' + dataSelector;
    $(openBtnSelector).show();
  });

  socket.on('record.added', function(record){
    var recordTemplate = $("#recordTemplate").html();
    var $tr  = $(_.template(recordTemplate, record));
    $('#records tbody').append($tr);
  });
});
