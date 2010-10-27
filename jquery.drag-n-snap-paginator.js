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
	$.fn.paginate = function(arg, arg2) {
		var el = this;
		return this.each(function(i, obj) {
			widget = $(obj);
			if (widget.data('isPaginated')) {
				switch (arg) {
					case 'next':
						return widget.data('next')();
						
					case 'prev':
						return widget.data('prev')();
					
					case 'goto':
						return widget.data('goto')(arg2);
					
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
				pageSpacing: 100,
				pageElement: 'div',
				commonElements: []
			};
			
			var widget, container, items;
			
			// tables have special treatment
			// widget must not change type so future DOM selections retain attached data 
			if (widget.is('table')) {
				defaults.pageElement = 'table';

				// make columns headers from <th> in first <tr>
				var headers = widget.find('tr:first').children('th');
				if (headers.length > 0) {
					var headerRow = $('<tr/>');
					var thead = $('<thead/>').append(headerRow);
					headers.each(function(){
						header = $(this);
						header.css('width', header.width()+'px');
						defaults.commonElements.push($('<col/>').width(header.width())); // TODO copy all other th attrs?
						header.appendTo(headerRow);
					});
				}
				widget.find('tr:first').has('th').remove();
				//FIXME first row is empty!!
				
				
				
				
				// get list items
				var items = widget.find('tr');
				container = $('<td/>').attr('colspan', headers.length + 1);
				var tbody = $('<tbody/>').append($('<tr/>').append(container));
				
				widget.children('thead, tbody').remove();
				widget.append(thead).append(tbody);
				
			// everything else
			} else {
				container = widget;
				items = widget.children();
			}
			
			// TODO document this better - wrapping container in a div to act as mask because <td> overflow:hidden doesn't work 
			container = $('<div>').addClass('mask').appendTo(container);
			
			var options = $.extend(defaults, options); 
			
			// init widget
			widget.data('page', 0)
			      .data('lastPage', Math.floor(items.length / options.pageCount));
			container.css('overflow', 'hidden');
			
			// make list
			var list = $('<div/>');
			list.width(Math.ceil(items.length/options.pageCount) * (options.width + options.pageSpacing))
			    .css('overflow', 'auto')
			    .appendTo(container);
			
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
			var goToPage = function(i) {
				console.log(i);
				if (i < 0 || i >= widget.data('last-page')) {
					// TODO throw error
					return;
				}
				widget.data('page', i);
				list.animate({
        			marginLeft: i * (options.width + options.pageSpacing) * -1
    			}, 300);
				widget.trigger('page-change');
			}
			widget.data('goto', goToPage);
			var prev = function() {
				goToPage(widget.data('page') - 1);
			};
			widget.data('prev', prev);
			var next = function(){
				goToPage(widget.data('page') + 1);
			};
			widget.data('next', next);
			
			// add buttons
			if (options.buttons) {
				var buttons = $('<div/>').addClass('nav-buttons').appendTo(container);
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
			container.width(list.children(':first').outerWidth());
			widget.data('isPaginated', true);
			
		};
		
	};  
})(jQuery); 