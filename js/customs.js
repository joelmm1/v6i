jQuery(function($) {

	"use strict";
	

	/**
	 * Sticky Header
	 */
	$(".container-wrapper").waypoint(function() {
		$(".navbar").toggleClass("navbar-sticky-function");
		$(".navbar").toggleClass("navbar-sticky");
		return false;
	}, { offset: "-20px" });
	
	
	
	/**
	 * Main Menu Slide Down Effect
	 */
	 
	// Mouse-enter dropdown
	$('#navbar li').on("mouseenter", function() {
			$(this).find('ul').first().stop(true, true).delay(350).slideDown(500, 'easeInOutQuad');
	});

	// Mouse-leave dropdown
	$('#navbar li').on("mouseleave", function() {
			$(this).find('ul').first().stop(true, true).delay(100).slideUp(150, 'easeInOutQuad');
	});
	
	
	
	/**
	 * Effect to Bootstrap Dropdown
	 */
	$('.bt-dropdown-click').on('show.bs.dropdown', function(e) {   
		$(this).find('.dropdown-menu').first().stop(true, true).slideDown(500, 'easeInOutQuad'); 
	}); 
	$('.bt-dropdown-click').on('hide.bs.dropdown', function(e) { 
		$(this).find('.dropdown-menu').first().stop(true, true).slideUp(250, 'easeInOutQuad'); 
	});
	
	
	
	/**
	 * Icon Change on Collapse
	 */
	$('.collapse.in').prev('.panel-heading').addClass('active');
	$('.bootstarp-accordion, .bootstarp-toggle').on('show.bs.collapse', function(a) {
		$(a.target).prev('.panel-heading').addClass('active');
	})
	.on('hide.bs.collapse', function(a) {
		$(a.target).prev('.panel-heading').removeClass('active');
	});
	
	
	
	
	/**
	 * Smooth scroll to anchor
	 */
	$(function() {
		$('a.anchor[href*=#]:not([href=#])').on("click",function() {
			if (location.pathname.replace(/^\//,'') == this.pathname.replace(/^\//,'') && location.hostname == this.hostname) {
				var target = $(this.hash);
				target = target.length ? target : $('[name=' + this.hash.slice(1) +']');
				if (target.length) {
					$('html,body').animate({
						scrollTop: (target.offset().top - 140) 
					}, 1000);
					return false;
				}
			}
		});
	});
	
	
	
	/**
	 * Slicknav - a Mobile Menu
	 */
	var $slicknav_label;
	$('#responsive-menu').slicknav({
		duration: 500,
		easingOpen: 'easeInExpo',
		easingClose: 'easeOutExpo',
		closedSymbol: '<i class="fa fa-plus"></i>',
		openedSymbol: '<i class="fa fa-minus"></i>',
		prependTo: '#slicknav-mobile',
		allowParentLinks: true,
		label:"" 
	});

	
	
	/**
	 * Sign-in and Sign-up modal
	 */
	 
	$.fn.modal.defaults.spinner = $.fn.modalmanager.defaults.spinner = '<div class="loading-spinner" style="width: 120px; margin-left: -60px; margin-top: -30px;>' +
		'<div class="modal-ajax-loading">' +
			'<img src="images/ajax-loading.gif" alt="image" />' +
		'</div>' +
	'</div>';

	var $modal = $('#ajaxLoginModal');

	$(document).on('click', '.btn-ajax-login,.login-box-box-action a' ,function(){
		// create the backdrop and wait for next modal to be triggered
		
		$modalForgotPassword.modal('hide');
		$modalRegister.modal('hide');

		$('body').modalmanager('loading');

		setTimeout(function(){
			 $modal.load('ajax-login-modal-login.html', '', function(){
				$modal.modal();
			});
		}, 1000);
	});

	/** for Register Ajax Modal */

	var $modalRegister = $('#ajaxRegisterModal');

	$(document).on('click', '.btn-ajax-register,.register-box-box-action a' ,function(){

		$modal.modal('hide');
		$modalForgotPassword.modal('hide');

		$('body').modalmanager('loading');

		setTimeout(function(){
			 $modalRegister.load('ajax-login-modal-register.html', '', function(){
				$modalRegister.modal();
			});
		}, 1000);
	});

	/** for Forgot Password Ajax Modal */

	var $modalForgotPassword = $('#ajaxForgotPasswordModal');

	$(document).on('click', '.btn-ajax-forgot-password,.login-box-link-action a' ,function(){

		$modal.modal('hide');
		$modalRegister.modal('hide');

		$('body').modalmanager('loading');

		setTimeout(function(){

			 $modalForgotPassword.load('ajax-login-modal-forgot-password.html', '', function(){
				$modalForgotPassword.modal();
			});

		}, 1000);

	});
	

	/**
	 * Show more-less button
	 */
	
	$('.btn-more-photo').on("click",function(){
		$(this).text(function(i,old){
			return old=='More photos' ?  'Hide' : 'More photos';
		});
	});

	
	
	/**
	 * Another Bootstrap Toggle
	 */
	$('.another-toggle').each(function(){
		if( $('h4',this).hasClass('active') ){
			$(this).find('.another-toggle-content').show();
		}
	});
	$('.another-toggle h4').on("click",function() {
		if( $(this).hasClass('active') ){
			$(this).removeClass('active');
			$(this).next('.another-toggle-content').slideUp();
		} else {
			$(this).addClass('active');
			$(this).next('.another-toggle-content').slideDown();
		}
	});
	
	
	
	/**
	 * Back To Top
	 */
	$(window).scroll(function(){
		if($(window).scrollTop() > 500){
			$("#back-to-top").fadeIn(200);
		} else{
			$("#back-to-top").fadeOut(200);
		}
	});
	$('#back-to-top').on("click",function() {
			$('html, body').animate({ scrollTop:0 }, '800');
			return false;
	});
	
	
	/**
	 * Bootstrap Tooltip
	 */
	$(function () {
		$('[data-toggle="tooltip"]').tooltip()
	})
	
	
	/**
	 *  Arrow for Menu has sub-menu
	 */
	 
	/* if ($(window).width() > 992) {
		$(".navbar-arrow > ul > li").has("ul").children("a").append("<i class='arrow-indicator fa fa-angle-down'></i>");
	} */
	
	if ($(window).width() > 992) {
		$(".navbar-arrow ul ul > li").has("ul").children("a").append("<i class='arrow-indicator fa fa-angle-right'></i>");
	}
	
	
	
	// PLACEHOLDER //
	$("input, textarea").placeholder();
	
	
	/**
	 * Fancy - Custom Select
	 */
	$('.custom-select').fancySelect(); // Custom select
	
	
	
	/**
	 * Show-hide search form
	 */
	$(".search-button").on("click", function(e) { 

		e.preventDefault();
		
		if(!$(".search-button").hasClass("open")) {
		
			$("#search-container").fadeIn(100);
			$(".search-button").css("visibility", "hidden");
			
		} else {
			
			$("#search-container").fadeOut(100);	
			$(".search-button").css("visibility", "visible");
		
		}
		
	});
	
	$("#search-form").append('<a class="search-form-close" href="#"><i class="fa fa-times"></i></a>');
	
	$("#search-form a.search-form-close").on("click", function(event){
		
		event.preventDefault();
		$("#search-container").fadeOut(100);
		$(".search-button").css("visibility", "visible");
		
	});

	
	/**
	 * Slick
	 */
	
	$('.slick-hero-slider').slick({
		dots: true,
		infinite: true,
		speed: 500,
		slidesToShow: 1,
		slidesToScroll: 1,
		centerMode: true,
		infinite: true,
		centerPadding: '0',
		focusOnSelect: true,
		adaptiveHeight: true,
		autoplay: true,
		autoplaySpeed: 4500,
		pauseOnHover: true,
	});
	
	/**
	 * Gallery Slideshow - slick
	 */
	$('.gallery-slideshow-review').slick({
		slidesToShow: 1,
		slidesToScroll: 1,
		speed: 500,
		arrows: true,
		fade: true,
		asNavFor: '.gallery-nav-review'
	});
	$('.gallery-nav-review').slick({
		slidesToShow: 8,
		slidesToScroll: 1,
		speed: 500,
		asNavFor: '.gallery-slideshow-review',
		dots: false,
		centerMode: true,
		focusOnSelect: true,
		infinite: true,
		responsive: [
			{
			breakpoint: 1199,
			settings: {
				slidesToShow: 7,
				}
			}, 
			{
			breakpoint: 991,
			settings: {
				slidesToShow: 6,
				}
			}, 
			{
			breakpoint: 767,
			settings: {
				slidesToShow: 5,
				}
			}, 
			{
			breakpoint: 480,
			settings: {
				slidesToShow: 3,
				}
			}
		]
	});

	$('.gallery-slideshow-review-2').slick({
		slidesToShow: 1,
		slidesToScroll: 1,
		speed: 500,
		arrows: true,
		fade: true,
		asNavFor: '.gallery-nav-review-2'
	});
	$('.gallery-nav-review-2').slick({
		slidesToShow: 8,
		slidesToScroll: 1,
		speed: 500,
		asNavFor: '.gallery-slideshow-review-2',
		dots: false,
		centerMode: true,
		focusOnSelect: true,
		infinite: true,
		responsive: [
			{
			breakpoint: 1199,
			settings: {
				slidesToShow: 7,
				}
			}, 
			{
			breakpoint: 991,
			settings: {
				slidesToShow: 6,
				}
			}, 
			{
			breakpoint: 767,
			settings: {
				slidesToShow: 5,
				}
			}, 
			{
			breakpoint: 480,
			settings: {
				slidesToShow: 3,
				}
			}
		]
	});
	
	$('.slick-testimonial').slick({
		slidesToShow: 1,
		slidesToScroll: 1,
		speed: 500,
		arrows: false,
		fade: false,
		asNavFor: '.slick-testimonial-nav',
		adaptiveHeight: true,
	});
	$('.slick-testimonial-nav').slick({
		slidesToShow: 3,
		slidesToScroll: 1,
		speed: 500,
		centerPadding: '0',
		asNavFor: '.slick-testimonial',
		dots: false,
		centerMode: true,
		focusOnSelect: true,
		infinite: true,
		responsive: [
			{
			breakpoint: 1199,
			settings: {
				slidesToShow: 3,
				}
			}, 
			{
			breakpoint: 991,
			settings: {
				slidesToShow: 3,
				}
			}, 
			{
			breakpoint: 767,
			settings: {
				slidesToShow: 3,
				}
			}, 
			{
			breakpoint: 480,
			settings: {
				slidesToShow: 3,
				}
			}
		]
	});

	$('.gallery-slideshow-not-tab').slick({
		slidesToShow: 1,
		slidesToScroll: 1,
		speed: 500,
		arrows: true,
		fade: true,
		asNavFor: '.gallery-nav-not-tab'
	});
	$('.gallery-nav-not-tab').slick({
		slidesToShow: 5,
		slidesToScroll: 1,
		speed: 500,
		asNavFor: '.gallery-slideshow-not-tab',
		dots: false,
		centerMode: true,
		focusOnSelect: true,
		infinite: true,
		responsive: [
			{
			breakpoint: 1199,
			settings: {
				slidesToShow: 5,
				}
			}, 
			{
			breakpoint: 991,
			settings: {
				slidesToShow: 4,
				}
			}, 
			{
			breakpoint: 767,
			settings: {
				slidesToShow: 3,
				}
			}, 
			{
			breakpoint: 480,
			settings: {
				slidesToShow: 2,
				}
			}
		]
	});

	$('#detailTab').on('shown.bs.tab', function (e) {

		$('.gallery-slideshow-tab-01').slick({
			slidesToShow: 1,
			slidesToScroll: 1,
			speed: 500,
			arrows: true,
			fade: true,
			asNavFor: '.gallery-nav-tab-01'
		});
		$('.gallery-nav-tab-01').slick({
			slidesToShow: 5,
			slidesToScroll: 1,
			speed: 500,
			asNavFor: '.gallery-slideshow-tab-01',
			dots: false,
			centerMode: true,
			focusOnSelect: true,
			infinite: true,
			responsive: [
				{
				breakpoint: 1199,
				settings: {
					slidesToShow: 5,
					}
				}, 
				{
				breakpoint: 991,
				settings: {
					slidesToShow: 4,
					}
				}, 
				{
				breakpoint: 767,
				settings: {
					slidesToShow: 3,
					}
				}, 
				{
				breakpoint: 480,
				settings: {
					slidesToShow: 2,
					}
				}
			]
		});

	});
	
});

