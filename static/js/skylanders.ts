/// <reference path="../../lib/skylanders.d.ts" />
// import $ = require('jquery');

$(function () {
  $.tablesorter.addParser({
    id: 'element',
    is: function (s) {
      return false;
    },
    format: function (str, table, cell) {
      return $('img', cell).attr('src');
    },
    type: 'text'
  });
  $.tablesorter.addParser({
    id: 'compatibility',
    is: function (s) {
      return false;
    },
    format: function (str, table, cell) {
      return $('img', cell).length;
    },
    type: 'text'
  });

  $('.toggle-own').click(toggleOwn);
  $('.skylanders-filter').keyup(function () {
    filterTable($('table.skylanders tbody'), this.value);
  });
  $("table.tablesorter").tablesorter({
    headers: {
      0: {
        sorter: 'element'
      },
      3: {
        sorter: 'compatibility'
      }
    }
  });
});

function filterTable(table, value) {
  var rows = table.find("tr");
  value = value.trim().toLowerCase();
  if (value == "") {
    rows.show();
    return;
  }
  var data = value.split(" ");
  rows.hide();

  rows.filter(function (i, v) {
    for (var d = 0; d < data.length; ++d) {
      if ($(this).text().toLowerCase().indexOf(data[d]) >= 0) {
        return true;
      }
    }
    return false;
  }).show();
}

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
