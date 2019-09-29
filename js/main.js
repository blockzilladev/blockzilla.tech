/*------------------------------------------------------------------
Template Name : Promo
Version : 1.0
Author : Beeskip
URL    : http://themeforest.net/user/Beeskip
-------------------------------------------------------------------*/

$(document).ready(function() {
  "use-strict";

  /*------------------------
    Copy to clipboard
  ----------------------------------*/

  // Initialize the tooltip.
  // $('#copy-button').tooltip();

  // When the copy button is clicked, select the value of the text box, attempt
  // to execute the copy command, and trigger event to update tooltip message
  // to indicate whether the text was successfully copied.
  $('#copy-button').bind('click', function() {
    var input = document.querySelector('#copy-input');
    // input.setSelectionRange(0, input.value.length + 1);
    input.select();
    input.setSelectionRange(0, 99999)
    try {

     //  var copyText = document.getElementById("myInput");
     // copyText.select();
     // copyText.setSelectionRange(0, 99999)
     // document.execCommand("copy");


      var success = document.execCommand('copy');
      if (success) {
        $('#copy-button').trigger('copied', ['Copied!']);
      } else {
        $('#copy-button').trigger('copied', ['Copy with Ctrl-c']);
      }
    } catch (err) {
      $('#copy-button').trigger('copied', ['Copy with Ctrl-c']);
    }
  });

  // Handler for updating the tooltip message.
  $('#copy-button').bind('copied', function(event, message) {
    $(this).attr('title', message)
        .tooltip('fixTitle')
        .tooltip('show')
        .attr('title', "Copy to Clipboard")
        .tooltip('fixTitle');
  });


  /*----------------------------
	Full Screen Background
--------------------------------------*/
  // define height for image bg home

  $(".slide-fullHeight").height($(window).height());
  $(window).resize(function() {
    $(".slide-fullHeight").height($(window).height());
  });

  /*------------------------
		Scroll to Top
	----------------------------------*/

  (function() {
    "use strict";

    var docElem = document.documentElement,
      didScroll = false,
      changeHeaderOn = 550;
    document.querySelector("#back-to-top");
    function init() {
      window.addEventListener(
        "scroll",
        function() {
          if (!didScroll) {
            didScroll = true;
            setTimeout(scrollPage, 50);
          }
        },
        false
      );
    }
  })();

  $(window).scroll(function(event) {
    var scroll = $(window).scrollTop();
    if (scroll >= 50) {
      $("#back-to-top").addClass("show");
    } else {
      $("#back-to-top").removeClass("show");
    }
  });

  $('a[href="#top"]').on("click", function() {
    $("html, body").animate({ scrollTop: 0 }, "slow");
    return false;
  });

  /*---------------------------------------
     Stiky Menu
    -------------------------------------------*/
  $(window).bind("scroll", function() {
    var navHeight = $(window).height() - 100;
    if ($(window).scrollTop() > navHeight) {
      $(".navbar-default").addClass("on");
    } else {
      $(".navbar-default").removeClass("on");
    }
  });

  $("body").scrollspy({
    target: ".navbar-default",
    offset: 80
  });

  /* -------------------------------------------
  	Scroll To Section Animate
 ----------------------------------------- */

  $("a.page-scroll").on("click", function() {
    if (
      location.pathname.replace(/^\//, "") ==
        this.pathname.replace(/^\//, "") &&
      location.hostname == this.hostname
    ) {
      var target = $(this.hash);
      target = target.length ? target : $("[name=" + this.hash.slice(1) + "]");
      if (target.length) {
        $("html,body").animate(
          {
            scrollTop: target.offset().top - 40
          },
          900
        );
        return false;
      }
    }
  });

  /*--------------------------------------------------
	portfolio filter items on button click
	---------------------------------------------*/

  $(".portfolio-filter").on("click", "a", function(e) {
    e.preventDefault();
    var filterValue = $(this).attr("data-filter");
    $container.isotope({ filter: filterValue });

    $(".portfolio-filter a").removeClass("active");
    $(this)
      .closest("a")
      .addClass("active");
  });

  /*----------------------------------------
	Portfolio Masonry
	-------------------------------------------*/

  var $container = $(".masonry");
  $container.imagesLoaded(function() {
    $container.isotope({
      itemSelector: ".masonry-item",
      layoutMode: "masonry",
      resizesContainer: false,
      percentPosition: true,
      masonry: { columnWidth: ".work-img", gutter: 0 } // you can change gutter to get needed space bettwen item
    });
  });

  // Trigger Resize
  $(window).trigger("resize");

  /*-------------------------------
			Counters Status
	--------------------------------------*/

  // $(".statistic").appear(function() {
  //   $(".timer").countTo({
  //     speed: 4000, // feel free to chage value of speed counting
  //     refreshInterval: 60,
  //     formatter: function(value, options) {
  //       return value.toFixed(options.decimals);
  //     }
  //   });
  // });

  /*-------------------------------
	 Parallax Header
	---------------------------------------------------*/

  /* on mobile */

  var onMobile = false;
  if (/Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent)) {
    onMobile = true;
  }

  if (onMobile === true) {
    /* if is mobile Remove Parallax */
    jQuery(".parallax-image .big_image").css({
      backgroundAttachment: "scroll"
    });
  } else {
    /*Parallax*/
    jQuery(".parallax-image .parallax-bg").parallax("50%", 0.1);
  }

  /*---------------------------------------
    Team slider
    -------------------------------------------*/

  $(document).ready(function() {
    $(".team-carousel").owlCarousel({
      navigation: false, // Show next and prev buttons
      loop: true,
      margin: 30,
      slideSpeed: 300,
      paginationSpeed: 400,
      autoHeight: true,
      itemsCustom: [
        [0, 1],
        [450, 1],
        [600, 2],
        [700, 2],
        [800, 2],
        [1000, 4],
        [1200, 4],
        [1400, 4],
        [1600, 4]
      ]
    });

    /*---------------------------------------
   Testimonials slider
    -------------------------------------------*/

    $("#testimonial").owlCarousel({
      navigation: false, // Show next and prev buttons
      slideSpeed: 300,
      paginationSpeed: 400,
      singleItem: true
    });
  });

  /*---------------------------------------
    WOW JS
   --------------------------------------*/

  new WOW().init();
}); // End document

/*------------------------------
    Preloader
    --------------------------------------*/

$(window).on("load", function() {
  // will first fade out the loading animation
  $("#status").fadeOut("slow");

  // will fade out the whole DIV that covers the website.
  $("#preloader")
    .delay(500)
    .fadeOut("slow")
    .remove();
});
