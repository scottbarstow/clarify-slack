$(function(){
  $('#rename').click(function(){
    $('#view').hide();
    $('#edit').show();
  });

  $('#edit form').submit(function() {
    var name = $(this).find('input[type="text"]').val();
    var recordId = $('#record').val();

    $.ajax({
      url: '/' + recordId ,
      method: 'PUT',
      data: {
        name: name
      }
    }).done(function(){
      $('#view').show();
      $('#edit').hide();
    });
  });
});