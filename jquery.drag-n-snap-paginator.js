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
		
		function initWidget(widget, options) {
			
			var defaults = {  
				width: widget.width(),  
				pageCount: 5,
				buttons: true,
				itemClassName: 'list-item',
				pageClassName: 'page',
				pageSpacing: 100
			};
		    
			var options = $.extend(defaults, options); 
			
			var items = widget.children();
			
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
		            page = $('<div/>');
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