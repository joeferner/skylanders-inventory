/// <reference path="../../definitions/jquery/jquery.d.ts" />
// import $ = require('jquery');

$(function () {
  $('.toggle-own').click(toggleOwn);
});

function toggleOwn() {
  var row = $(this).closest('tr');
  var id = row.data('id');
  var own = row.data('own');
  var newValue = !own;
  console.log('setting ' + id + ' to own ' + newValue);
  $.post('/character/' + id + '/own', {value: newValue}, function (data) {
    console.log(data);
    row.data('own', data.own);
    row.attr('data-own', data.own);
    $('.toggle-own', row).text(data.own ? 'Disown' : 'Own');
  });
}
