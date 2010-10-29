/**
 * @author Deg Valentine
 * 
 * Paginates list into theme-rollable pages. 
 * 
 * TODO add item access functions, such as widget.paginate('get', page, index)
 * TODO should this widget take a width, or just use info from DOM style?
 * TODO should this widget take a data array and factory function to make children from? (could be runtime improvement over large async-fetched data
 * TODO choose scroll axis x/y
 * TODO make slide in initially to let user know interaction exists (configurable)
 * TODO document custom events: page-change, drag, snap
 * TODO add custom event on method call?
 * TODO refactor to functions more
 * TODO add animation easing with small bounce (does iPhone do this too?)
 * TODO add flick? scroll speed would start at release velocity and decline till it snaps
 */
(function($){  
$.fn.paginate = function(arg, arg2) {
	
	return this.each(dispatch);
	
	/**
	 * Dispatches to method or initializes widget.
	 */
	function dispatch(i, obj) {
		widget = $(obj);
		if (widget.data('isPaginated')) {
			switch (arg) {
				case 'prev':
					if (widget.data('has')(widget.data('page') - 1))
						return widget.data('goto')(widget.data('page') - 1);
					break;
				case 'next':
					if (widget.data('has')(widget.data('page') + 1))
						return widget.data('goto')(widget.data('page') + 1);
					break;
				case 'goto':
					return widget.data('goto')(arg2);
				case 'has':
					return widget.data('has')(arg2);
				case 'count':
					return widget.data('pageCount');
				case 'page':
					if ($.type(arg2) == 'number')
						return widget.data('goto')(arg2);
					return widget.data('page');
				
				// TODO throw/error on default?
			}
			return widget;
		} else {
			return initWidget(widget, arg);
		}
	}
	
	/**
	 * Initializes widget.
	 */
	function initWidget(widget, options) {
		
		var defaults = {  
			width: widget.width(),  
			itemsPerPage: 5,
			buttons: true,
			itemClassName: 'list-item',
			pageClassName: 'page',
			pageSpacing: 0,
			pageElement: 'div',
			commonElements: [],
			animationSpeed: 250, 
			gestureThreshold: 1000
		};
		var options = $.extend(defaults, options); 
		
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
				headers.each(function() {
					header = $(this);
					header.css('width', header.width()+'px');
					defaults.commonElements.push($('<col/>').width(header.width())); // TODO copy all other th attrs?
					header.appendTo(headerRow);
				});
			}
			widget.children('thead').remove();
			widget.find('tr:first').has('th').remove();
			
			// get list items
			var items = widget.find('tr');
			container = $('<td/>').addClass('container').attr('colspan', headers.length + 1).css('padding', 0);
			var tbody = $('<tbody/>').append($('<tr/>').append(container));
			
			widget.children('tbody').remove();
			widget.append(thead).append(tbody);
			
		// everything else
		} else {
			container = widget;
			items = widget.children();
		}
		
		// TODO document this better - wrapping container in a div to act as mask because <td> overflow:hidden doesn't work
		// TODO this is only needed on tables - can we refactor it?
		container = $('<div>').addClass('mask').appendTo(container);
		
		// init widget
		widget.data('page', 0)
		      .data('pageCount', Math.ceil(items.length / options.itemsPerPage));
		container.css('overflow', 'hidden');
		
		// =========================
		// PAGINATION
		// =========================
		
		// make page containerrest
		var pageContainer = $('<div/>')
			.addClass('page-container')
			.width(Math.ceil(items.length/options.itemsPerPage) * (options.width + options.pageSpacing))
		    .css('overflow', 'auto')
		    .appendTo(container);
		
		var page;
		items.each(function(i) {
			item = $(this);
			
			// add jquery-ui theming
			item.addClass('ui-widget-content ui-corner-all')
			    .addClass(options.itemClassName);
			   
	        // paginate
	        if (i % options.itemsPerPage == 0) {
	            page = $('<'+defaults.pageElement+'/>');
	            $(defaults.commonElements).each(function(){ $(this).clone().appendTo(page) });
	            page.addClass(options.pageClassName)
	                .width(options.width)
	                .css('float', 'left')
	                .css('margin-right', options.pageSpacing);
	            pageContainer.append(page);
	        }
	        page.append(item);
		});
		
		function hasPage(i) {
			return i >= 0 && i < widget.data('pageCount');
		}
		function goToPage(i) {
			if (!hasPage(i)) {
				return false; // TODO throw/error?
			}
			widget.data('page', i);
			pageContainer.animate({
    			marginLeft: i * (options.width + options.pageSpacing) * -1
			}, options.animationSpeed);
			widget.trigger('page-change');
		}
		widget.data('goto', goToPage).data('has', hasPage);
		
		
		// =========================
		// DRAG N SNAP
		// =========================
		// Mousedown allows the container to move horizontally with the drag.
		// Mouseup or mouseleave snaps the container to the nearest page and 
		// stops the container movement.
		container.bind('mousedown', function(e) {
			widget.trigger('drag');
			widget.data('startEvent', e);
			var initial = parseInt(pageContainer.css('margin-left')) - e.pageX;
			container.bind('mousemove', function(e) {
				pageContainer.css('margin-left', initial + e.pageX);
			});
		}).bind('mouseup mouseleave', function(e) {
			var startEvent = widget.data('startEvent');
			if (startEvent) {
				widget.trigger('snap');
				widget.removeData('startEvent');
				container.unbind('mousemove');
				
				var page = widget.data('page');
				var dpx = e.pageX - startEvent.pageX;
				var dt = e.timeStamp - startEvent.timeStamp;
				var speed = dpx / dt * 1000;
				
				// flicked
				if (Math.abs(speed) >= options.gestureThreshold) {
					if (speed < 0 && page < widget.data('pageCount') - 1) {
						return goToPage(page + 1);
					} else if (speed > 0 && page > 0) {
						return goToPage(page - 1);
					}
				
				// dragged
				} else {
					var delta = dpx / options.width;
					if (delta < -0.5 && page < widget.data('pageCount') - 1) {
						return goToPage(page + 1);
					} else if (delta > 0.5 && page > 0) {
						return goToPage(page - 1);
					}
				}
				
				goToPage(page);
			}
		});
		
		// configure widget
		container.width(pageContainer.children(':first').outerWidth());
		widget.data('isPaginated', true);
		
		return widget;
	}

	
}})(jQuery);
