$(document).ready(function(){

 	"use strict";	

 	$(window).load(function() {

 		// Preloader
		$('#status').fadeOut();
		$('#preloader').delay(350).fadeOut('slow');

		
		// filter items on button click
		$('.portfolio-filter').on( 'click', 'a', function(e) {
			e.preventDefault();
			var filterValue = $(this).attr('data-filter');
			$container.isotope({ filter: filterValue });

			$('.portfolio-filter a').removeClass('active');
			$(this).closest('a').addClass('active');

		});

		// Masonry
		var $container = $('.masonry');
        $container.imagesLoaded( function() {
        	$container.isotope({
        		itemSelector: '.masonry-item',
				layoutMode: 'masonry',
				resizesContainer:false,
				percentPosition: true,
				masonry: { columnWidth: '.work-img', gutter: 6 }
			});
		});

		// Trigger Resize
		$(window).trigger("resize");

	});