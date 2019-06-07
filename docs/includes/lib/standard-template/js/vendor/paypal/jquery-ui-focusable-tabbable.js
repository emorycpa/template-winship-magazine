// Based on jQuery UI version 1.12.1

// NOT REQUIRED WITH MODERN JQUERY

/*!
 * jQuery UI Focusable @VERSION
 * http://jqueryui.com
 *
 * Copyright jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 */

//>>label: :focusable Selector
//>>group: Core
//>>description: Selects elements which can be focused.
//>>docs: http://api.jqueryui.com/focusable-selector/

(function($){
    focusable = function( element, hasTabindex ) {
        var map, mapName, img, focusableIfVisible, fieldset,
            nodeName = element.nodeName.toLowerCase();
    
        if ( "area" === nodeName ) {
            map = element.parentNode;
            mapName = map.name;
            if ( !element.href || !mapName || map.nodeName.toLowerCase() !== "map" ) {
                return false;
            }
            img = $( "img[usemap='#" + mapName + "']" );
            return img.length > 0 && img.is( ":visible" );
        }
    
        if ( /^(input|select|textarea|button|object)$/.test( nodeName ) ) {
            focusableIfVisible = !element.disabled;
    
            if ( focusableIfVisible ) {
    
                // Form controls within a disabled fieldset are disabled.
                // However, controls within the fieldset's legend do not get disabled.
                // Since controls generally aren't placed inside legends, we skip
                // this portion of the check.
                fieldset = $( element ).closest( "fieldset" )[ 0 ];
                if ( fieldset ) {
                    focusableIfVisible = !fieldset.disabled;
                }
            }
        } else if ( "a" === nodeName ) {
            focusableIfVisible = element.href || hasTabindex;
        } else {
            focusableIfVisible = hasTabindex;
        }
    
        return focusableIfVisible && $( element ).is( ":visible" ) && visible( $( element ) );
    };
    
    $.extend( $.expr.pseudos, {
        focusable: function( element ) {
            return focusable( element, $.attr( element, "tabindex" ) != null );
        }
    } );

    $.extend( $.expr.pseudos, {
        tabbable: function( element ) {
            var tabIndex = $.attr( element, "tabindex" ),
                hasTabindex = tabIndex != null;
            return ( !hasTabindex || tabIndex >= 0 ) && focusable( element, hasTabindex );
        }
    });


})(jQuery);
