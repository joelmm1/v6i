(function ($) {
	var methods = {
		/* === Default Settings === */
		init: function (options) {
			var p = {
				currentClass:'cur',				//Class for the selected menu item
				markerClass:'harMark',			//Class for the marker elements
				onlyOne:true,					//true - open can be only one item, false - the number of open items is not limited to
				speed:300,						//Animation speed
				clicablelink:false,				//It enables or disables the clickable links that have attachments
				event:'click',					//The event that accordion headers will react to in order to activate the associated panel. 
				
				colortheme:"Pink",				//Specifies a preset color theme. "BlueGrey", "Red", "Pink", "Purple", "DeepPurple", "Indigo", "Blue", "LightBlue", "Cyan", "Teal", "Green", "LightGreen", "Lime", "Yellow", "Amber", "Orange", "DeepOrange", "Brown", "Grey", "LightGray", "UltraGray", "Black"	
				layout:"menu",					//Sets the basic design of the blocks. "menu", "content", "filter"
				markershape:"square",			//Specifies the shape of the parent marker. "square", "round", "none"
				markersign:"pm",				//Specifies the shape of the sign marker. "pm", "arrow", "triangle"
				markerpos:"right",				//Specifies position of the marker. "right", "left"
				colortype:"bg",					//Specifies that will be painted, background or text. "bg", "text"
																				
				create: function(){},			//Triggered when the liAccordion is created.
				beforeOpen: function(ul){},		//Triggered before open liAccordion Panel.
				afterOpen: function(ul){},		//Triggered after open liAccordion Panel.
				beforeClose: function(ul){},	//Triggered before close liAccordion Panel.
				afterClose: function(ul){}		//Triggered after close liAccordion Panel.	
			};
			if (options) {
				$.extend(p, options);
			}
			return this.each(function () {

				var el = $(this).addClass('liAccordion');
				el.data().enable = true;
				$.extend(p,el.data());
				$.extend(el.data(), p);
				el.attr({"data-colortheme":el.data().colortheme});
				el.attr({"data-layout":el.data().layout});
				el.attr({"data-markershape":el.data().markershape});
				el.attr({"data-markersign":el.data().markersign});
				el.attr({"data-markerpos":el.data().markerpos});
				el.attr({"data-colortype":el.data().colortype});
				var listWrap = $('ul',el).each(function(){
					$(this).data().inlineStyle = $(this).attr('style') ? $(this).attr('style') : '';		
				});
				listWrap.prev('a').addClass('harFull');
				
				
				var removeExtraStyle = function(el){
					var elCssDisplay = el.css('display');
					if(el.data()){
						
						el.attr({style:el.data().inlineStyle}).css('display',elCssDisplay);
						
						console.log(el.data().inlineStyle)	
						
					}
				};

				/*== Creating Marker Element ==*/
				$('<span>').addClass(el.data().markerClass).prependTo($('a',el));
	
				/*== Opening Current Categories ==*/
				var curLink = el.find('.'+el.data().currentClass);
				curLink.parents('ul').show().prev('a').addClass(el.data().currentClass);
				curLink.parents('li').addClass('harOpen');
				curLink.next('ul').show();
				
				/*== Set Clicable Elements ==*/
				var clicableEl = el.data().clicablelink ? '.'+el.data().markerClass : '.harFull';
				
				
				
				el.data().clicableEl = clicableEl;

				if (el.data().create !== undefined) {el.data().create();}

				if(el.data().clicablelink){
					el.addClass('clicablelink');	
				}
				
				

				/*== This function slide down and slide up Lists ==*/
				el.on(el.data().event,el.data().clicableEl,function(e){
					
					var clickedEl = $(this);
					if(el.data().enable){
						var harList = clickedEl.closest('li');
						if(harList.is('.harOpen')){
							harList.add('li.harOpen',harList).removeClass('harOpen').children('ul').each(function(){
								if (el.data().beforeClose !== undefined) {el.data().beforeClose($(this));}	
								$(this).stop(true).slideUp(el.data().speed,function(){
									removeExtraStyle($(this));
									if (el.data().afterClose !== undefined) {el.data().afterClose($(this));}	
								});					
							})
						}else{
							var harUl = harList.addClass('harOpen').children('ul');
							if (el.data().beforeOpen !== undefined) {el.data().beforeOpen(harUl);}
							harUl.stop(true).slideDown(el.data().speed,function(){
								removeExtraStyle($(this));  
								if (el.data().afterOpen !== undefined) {el.data().afterOpen($(this));}
								setTimeout(function(){
									if(harList.offset().top < $(window).scrollTop()) {
										$('html,body').animate({scrollTop:harList.offset().top})	
									}
								},100)
							});
							if(el.data().onlyOne){
								var siblingsEl = harList.siblings();
	
								siblingsEl.add('li',siblingsEl).filter('.harOpen').removeClass('harOpen').children('ul').each(function(){
									if (el.data().beforeClose !== undefined) {el.data().beforeClose($(this));}	
									$(this).stop(true).slideUp(el.data().speed,function(){
										removeExtraStyle($(this));  
										if (el.data().afterClose !== undefined) {el.data().afterClose($(this));}	
									});					
								})
							}
						}
					}
					return false;
				})
				el.on('click','.btn-next',function(){
					var nextList = $(this).closest('li').next('li');
					nextList.find(el.data().clicableEl).trigger('click');
					return false;
				})
				el.on('click','.btn-prev',function(){
					var nextList = $(this).closest('li').prev('li');
					nextList.find(el.data().clicableEl).trigger('click');
					return false;
				})
			})
		},
		destroy: function () {
			$(document).off(el.data().event,$(this).data().clicableEl);	
			$('ul',$(this)).prev('a').removeClass('harFull');	
			$('.'+el.data().markerClass,$(this)).remove();
		},
		disable: function () {
			$(this).data().enable = false;
			$(this).addClass('harDisable');
		},
		enable: function () {
			$(this).data().enable = true;
			$(this).removeClass('harDisable');
		},
		collapseall: function () {
			var el = $(this);
			$('li.harOpen',el).removeClass('harOpen').children('ul').each(function(){
				if (el.data().beforeClose !== undefined) {el.data().beforeClose($(this));}	
				$(this).stop(true).slideUp(el.data().speed,function(){
					removeExtraStyle($(this));  
					if (el.data().afterClose !== undefined) {el.data().afterClose($(this));}	
				});					
			})
		},
		expandall: function () {
			var el = $(this);
			el.data().onlyOne = false;
			$('.harFull',el).parent('li').not('.harOpen').addClass('harOpen').children('ul').each(function(){
				if (el.data().beforeOpen !== undefined) {el.data().beforeOpen($(this));}
				$(this).stop(true).slideDown(el.data().speed,function(){
					removeExtraStyle($(this));  
					if (el.data().afterOpen !== undefined) {el.data().afterOpen($(this));}
				});					
			})
		}
	};
	$.fn.liAccordion = function (method) {
		if (methods[method]) {
			return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
		} else if (typeof method === 'object' || !method) {
			return methods.init.apply(this, arguments);
		} else {
			$.error("Method " + method + " in jQuery.liAccordion doesn't exist");
		}
	};
})(jQuery);
