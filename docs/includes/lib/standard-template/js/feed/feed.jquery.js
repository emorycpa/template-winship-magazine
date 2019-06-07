//Emory University Feed Implimentations
(function(defaults, $, window, document, undefined) {

    'use strict';

    var log = console.log | function(){};

    var defaults = defaults;

    var _templates = {};

	$.extend({
		// Function to change the default properties of the plugin
		// Usage:
		// jQuery.trumbaSetup({property:'Custom value'});
		trumbaSetup : function(options) {
            defaults = $.extend({}, defaults, options);
            return defaults;
        },
        // Function to register or change templating function
        // name: required string -- used in option object to select template to be applied
        // fn: required function with follow signiture -->
        //      fn(data) return String
        //      data is a single parameter of type object -->
        //          settings: object with excicuted options for the given invocation
        //          data: json returned by proxy
    	// Usage:
		// jQuery.trumbaRegisterTemplate(String:name, Function:fn);
        trumbaRegisterTemplate : function(name, fn) {
            if($.isFunction(fn)) {
                _templates[name] = fn;
            } else {
                log("Template must be a function that accepts a single parameter");
            }
		}
	}).fn.extend({
		// Usage:
		// jQuery(selector).trumbaSetup(options);
		trumba : function(options) {

			var settings = $.extend({}, defaults, options);



			return $(this).each(function() {

                var $obj = $(this);
                
                $obj.addClass('events-loading');
                    
                    $.ajax({
                        dataType: "jsonp",
                        url: settings.url, 
                        data: {
                            "calendar" : settings.calendar, 
                            "num" : settings.num,
                            "filter" : settings.filter,
                            "refreshInterval" : settings.refresh, 
                            "currentTime" : (function(){return new Date().getTime();})()
                        }
                    }).done(function(data){
                        var dataObject = {
                            "settings" : settings,
                            "data" : data
                        };

                        if($.isFunction(_templates[settings.template])){
                            $obj.html(_templates[settings.template](dataObject));
                        }

                        
                        if($.isFunction(settings.callback)){
                            settings.callback(data, $obj);
                        }
                    }).always(function(){
                        $obj.removeClass('events-loading').addClass('events-loaded');
                    });
                $("body").trigger('trumba.load');
			});
		}
	});
})({
    "url" : "",
    "calendar" : "",
    "filter" : "",
    "num" : 3,
    "refresh" : 120,
    "localCalendar" : "",
    "callback" : function(){},
    "template": "default"
}, jQuery, window, document);
//Emory University Feed Implimentations
(function(defaults, $, window, document, undefined) {

    'use strict';

    var log = console.log | function(){};

    var defaults = defaults;

    var _templates = {};

	$.extend({
		// Function to change the default properties of the plugin
		// Usage:
		// jQuery.newsSetup({property:'Custom value'});
		newsSetup : function(options) {
            defaults = $.extend({}, defaults, options);
            return defaults;
        },
        // Function to register or change templating function
        // name: required string -- used in option object to select template to be applied
        // fn: required function with follow signiture -->
        //      fn(data) return String
        //      data is a single parameter of type object -->
        //          settings: object with excicuted options for the given invocation
        //          data: json returned by proxy
    	// Usage:
		// jQuery.trumbaRegisterTemplate(String:name, Function:fn);
        newsRegisterTemplate : function(name, fn) {
            if($.isFunction(fn)) {
                _templates[name] = fn;
            } else {
                log("Template must be a function that accepts a single parameter");
            }
		}
	}).fn.extend({
		// Usage:
		// jQuery(selector).news(options);
		news : function(options) {

			var settings = $.extend({}, defaults, options);

			return $(this).each(function() {

                var $obj = $(this);
                
                $obj.addClass('news-loading');
                    
                    $.ajax({
                        dataType: "jsonp",
                        url: settings.url, 
                        data: {
                            feed : settings.feed, 
                            num : settings.num, 
                            refreshInterval : settings.refresh, 
                            currentTime : (function(){return new Date().getTime();})()
                        }
                    }).done(function(data){
                        var dataObject = {
                            settings : settings,
                            data : data
                        };

                        if($.isFunction(_templates[settings.template])){
                            $obj.html(_templates[settings.template](dataObject));
                        }

                        
                        if($.isFunction(settings.callback)){
                            settings.callback(data, $obj);
                        }
                    }).always(function(){
                        $obj.removeClass('news-loading').addClass('news-loaded');
                    });
                $("body").trigger('news.load');
			});
		}
	});
})({
    "url" : "",
    "feed" : "",
    "num" : 4,
    "refresh" : 120,
    "callback" : function(){},
    "template": "default"
}, jQuery, window, document);