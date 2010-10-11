/**
 * @author Deg Valentine
 * 
 * Paginates list into theme-rollable pages. 
 * 
 * TODO add buttons for each page
 * TODO add public method for specific pages
 * TODO add item access functions 
 * TODO add drag-and-snap interaction - move margin with mouse on mousedown, snap to nearest page on mouseup
 * TODO button location on top/bottom/both
 * TODO resolve button functionality with and without jQuery-UI 
 * TODO should this widget take a width, or just use info from DOM style?
 * TODO should this widget take a data array and factory function to make children from? (could be runtime improvement over large async-fetched data
 * TODO choose scroll axis x/y
 * TODO make slide in initially to let user know interaction exists (configurable)
 */
(function($){  
	$.fn.paginate = function(arg) {  
  
		return this.each(function() {
			widget = $(this);
			if (widget.data('isPaginated')) {
				switch (arg) {
					case 'next':
						return widget.data('next')();
						
					case 'prev':
						return widget.data('prev')();
					
					default:
						return widget;
				}
			} else {
				initWidget(widget, arg);
			}
		});
		
		function initWidget(target, options) {
			
			var defaults = {  
				width: target.width(),  
				pageCount: 5,
				buttons: true,
				itemClassName: 'list-item',
				pageClassName: 'page',
				pageSpacing: 100,
				pageElement: 'div',
				commonElements: []
			};
			
			var widget, items;
			
			// tables have special treatment
			if (target.is('table')) {
				defaults.pageElement = 'table';
				
				// make widget a div
				widget = $('<div/>')
							.attr('id', target.attr('id'))
							.attr('class', target.attr('class'));
				
				// make columns from thead
				if (target.has('thead').length > 0) {
					var thead = $('<table/>').appendTo(widget);
					target.children('thead').find('th').each(function(){
						$(this).css('width', $(this).width()+'px');
						defaults.commonElements.push($('<col/>').width($(this).width())); // TODO copy all other th attrs
					});
					target.children('thead').find('th').appendTo(thead);
//					target.children('thead').remove();
				}
				
				// make items from tbody
				if (target.children('tbody').length > 0) {
					items = target.children('tbody').children('tr');
//					target.children('tbody').remove();
				} else {
					items = target.children('tr');
				}
				
				target.replaceWith(widget);
				
			// everything else
			} else {
				widget = target;
				items = target.children();
			}
			
			
			
			
		    
			var options = $.extend(defaults, options); 
			
			// init widget
			widget.data('page', 0)
			      .data('lastPage', Math.floor(items.length / options.pageCount))
			      .css('overflow', 'hidden');
			
			// make list
			var list = $('<div/>');
			list.width(Math.ceil(items.length/options.pageCount) * (options.width + options.pageSpacing))
			    .css('overflow', 'auto')
			    .appendTo(widget);
			
			// populate list
			var page;
			items.each(function(i) {
				item = $(this);
				
				// add jquery-ui theming
				item.addClass('ui-widget-content ui-corner-all')
				    .addClass(options.itemClassName);
				   
		        // paginate
		        if (i % options.pageCount == 0) {
		            page = $('<'+defaults.pageElement+'/>');
		            $(defaults.commonElements).each(function(){$(this).clone().appendTo(page)});
		            page.addClass(options.pageClassName)
		                .width(options.width)
		                .css('float', 'left')
		                .css('margin-right', options.pageSpacing);
		            list.append(page);
		        }
		        page.append(item);
			});
			
			// add navigation functions to widget
			var prev = function() {
				if (widget.data('page') > 0) {
					widget.data('page', widget.data('page') - 1);
					list.animate({
            			marginLeft: widget.data('page') * (options.width + options.pageSpacing) * -1
        			}, 300);
				}
				widget.trigger('page-change');
			};
			widget.data('prev', prev);
			var next = function(){
				if (widget.data('page') < widget.data('lastPage')) {
					widget.data('page', widget.data('page') + 1);
					list.animate({
            			marginLeft: widget.data('page') * (options.width + options.pageSpacing) * -1
        			}, 300);
				}
				widget.trigger('page-change');
			};
			widget.data('next', next);
			
			// add buttons
			if (options.buttons) {
				var buttons = $('<div/>').addClass('nav-buttons').appendTo(widget);
				var prevBtn = $('<button>prev</button>').appendTo(buttons);
				var nextBtn = $('<button>next</button>').appendTo(buttons);
				var refreshButtons = function() {
					if (widget.data('page') <= 0) {
						prevBtn[0].disabled = true;
					} else {
						prevBtn[0].disabled = false;
					}
					if (widget.data('page') >= widget.data('lastPage')) {
						nextBtn[0].disabled = true;
					} else {
						nextBtn[0].disabled = false;
					}
				};
				prevBtn.click(function() {
					prev();
				});
				nextBtn.click(function() {
					next();
				});
				refreshButtons();
				widget.bind('page-change', refreshButtons);
			}
			
			// configure widget
			widget.width(list.children(':first').outerWidth())
			      .data('isPaginated', true);
			
		};
		
	};  
})(jQuery); 