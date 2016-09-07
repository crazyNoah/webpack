import $ from 'jquery';
var activeClass = $('#headerContainer').attr('active-menu');
$(`#headerContainer .${activeClass}`).addClass('on');
