/*
* Template Name: MyPortfolio
* Template URL: https://bootstrapmade.com/myportfolio-bootstrap-portfolio-website-template/
* License: https://bootstrapmade.com/license/
*/

(function ($) {
  "use strict";

  var burgerMenu = function() {
	  $('.burger').click(function(e) {
	  	$(window).scrollTop(0);
	    if(!$('.burger').hasClass('active'))
	      $('.burger').addClass('active');
	    else
	      $('.burger').removeClass('active');
	  });
  }
  burgerMenu();

  var siteIstotope = function() {
	  var $container = $('#portfolio-grid').isotope({
	    itemSelector : '.item',
	    isFitWidth: true
	  });

	  $(window).resize(function(){
	    $container.isotope({
	      columnWidth: '.col-sm-3'
	    });
	  });
	  
	  $container.isotope({ filter: '*' });

	  $('#filters').on( 'click', 'a', function(e) {
	  	e.preventDefault();
	    var filterValue = $(this).attr('data-filter');
	    $container.isotope({ filter: filterValue });
	    $('#filters a').removeClass('active');
	    $(this).addClass('active');
	  });
  }
  $(window).on('load', function () {
    siteIstotope();
  });



  var customCursor = function() {
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

    var cursor = document.createElement('div');
    cursor.className = 'custom-cursor';
    cursor.setAttribute('aria-hidden', 'true');
    document.body.appendChild(cursor);

    document.addEventListener('mousemove', function(e) {
      cursor.style.left = e.clientX + 'px';
      cursor.style.top = e.clientY + 'px';
      cursor.classList.add('is-visible');
    });

    document.addEventListener('mouseleave', function() {
      cursor.classList.remove('is-visible');
    });

    document.addEventListener('mouseover', function(e) {
      cursor.classList.toggle('is-disabled', !!e.target.closest('.item-wrap--disabled'));
      cursor.classList.toggle('is-project', !!e.target.closest('.item-wrap:not(.item-wrap--disabled)'));
      cursor.classList.toggle('is-menu', !!e.target.closest('.burger'));
      cursor.classList.toggle(
        'is-link',
        !!e.target.closest('a, button, input, textarea, select') &&
        !e.target.closest('.item-wrap, .burger')
      );
    });
  };
  customCursor();

})(jQuery);

AOS.init({
	easing: 'ease',
	duration: 1000,
	once: true
});
