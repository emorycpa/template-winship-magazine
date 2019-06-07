(function($){
    /*
     * Extends Bootstrap v4.3.0
     * Copyright (c) <2018> Educational Research Solutions, Inc.
     * All rights reserved. 
     * Based on work by PayPal and Twitter (copyrights found below)
     * and is subject to their terms and conditions.
     * 
     * Modifications licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
     * 
     * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
     */
    
     /**
     * --------------------------------------------------------------------------
     * Bootstrap (v4.3.0): carousel.js
     * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
     * --------------------------------------------------------------------------
     */

    // Load order errros
    if(!$) throw "jQuery required."
    if(!$.fn.carousel ||
        !$.fn.carousel ||
        !$.fn.carousel.Constructor ||
        !$.fn.carousel.Constructor.VERSION ||
        $.fn.carousel.Constructor.VERSION.split('.')[0] !== "4"
        ) throw "Bootstrap version 4 required."
    
    // Global static values based on Bootstrap's conventions 
    var DATA_KEY = 'bs.carousel';
    var EVENT_KEY = "." + DATA_KEY;
    var DATA_API_KEY = '.data-api';

    var Direction = {
        NEXT: 'next',
        PREV: 'prev',
        LEFT: 'left',
        RIGHT: 'right'
    };

    var Selector = {
        ACTIVE: '.active',
        ACTIVE_ITEM: '.active.carousel-item',
        ITEM: '.carousel-item',
        NEXT_PREV: '.carousel-item-next, .carousel-item-prev',
        PAUSE_PLAY: '.carousel-pause-play',
        INDICATORS: '.carousel-indicators',
        DATA_SLIDE: '[data-slide], [data-slide-to]',
        DATA_RIDE: '[data-ride="carousel"]',
        DATA_SLIDE_PREV: '[data-slide="prev"]',
        DATA_SLIDE_NEXT: '[data-slide="next"]'
    };
    
    var Event = {
        SLIDE: "slide" + EVENT_KEY,
        SLID: "slid" + EVENT_KEY,
        KEYDOWN: "keydown" + EVENT_KEY,
        MOUSEENTER: "mouseenter" + EVENT_KEY,
        MOUSELEAVE: "mouseleave" + EVENT_KEY,
        TOUCHEND: "touchend" + EVENT_KEY,
        LOAD_DATA_API: "load" + EVENT_KEY + DATA_API_KEY,
        CLICK_DATA_API: "click" + EVENT_KEY + DATA_API_KEY
        };

    var ClassName = {
        CAROUSEL: 'carousel',
        ACTIVE: 'active',
        SLIDE: 'slide',
        RIGHT: 'carousel-item-right',
        LEFT: 'carousel-item-left',
        NEXT: 'carousel-item-next',
        PREV: 'carousel-item-prev',
        ITEM: 'carousel-item'
        };
    
    var KeyboardEventCode = {
        ARROW_LEFT : 37,
        ARROW_UP : 38,
        ARROW_RIGHT : 39,
        ARROW_DOWN : 40,
        RETURN : 13,
        SPACE : 32
    }

    var uuidv4 = function uuidv4() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    var _accessibleSetup = function _accessibleSetup (config) {
        var carousel = this;
        carousel._accessibility = {}
        carousel._accessibility.elements = [];
        carousel._accessibility.addedLabelDescription = false;
        var $carousel = $(carousel._element);
        if(carousel._element.id == '') {
            carousel._element.id = 'carousel-' + uuidv4();
        }
        
        //Fix if there are no indicator element
        if(!carousel._indicatorsElement) {
            $_indicatorElement = $('<ol class="carousel-indicators invisible"></ol>');
            carousel._indicatorsElement = $_indicatorElement[0];
            $_indicatorElement.appendTo(carousel._element);
            $(carousel._element).find(Selector.ITEM).each(function(index){
                $('<li data-target="#'+ carousel._element.id +'" data-slide-to="'+index+'"></li>').appendTo($_indicatorElement);
            });
            carousel._accessibility.elements.push($_indicatorElement);
        }

        //Change role for indicators
        $(carousel._indicatorsElement).attr('role', 'tablist');

        //Setup IDs and labels for items
        $carousel.find(Selector.ITEM).each(function(index){
            
            var $item = $(this);
            
            //Change item role
            $item.attr('role', 'tabpanel');
            
            //Setup Id if needed
            if(!this.id) {
                this.id = carousel._element.id + '-' + index;
            }

            // Get Control
            var $relatedIndicator = $(carousel._element).find(Selector.INDICATORS + " [data-slide-to='" + index +"'] ");
            if($relatedIndicator[0]) {
                var relatedIndicator = $relatedIndicator[0];
                // Setup label relationship
                if(relatedIndicator.id == ''){
                    relatedIndicator.id = this.id + '-indicator';
                }
                if(!$item.attr('aria-label') && !$item.attr('aria-labbledby')){
                    $item.attr('aria-labelledby', relatedIndicator.id);
                
                    //Create label 
                    var slideLabel = 'Slide ' + index;
                    var captionTitle = $item.find('h1, h2, h3, h4, h5, h6').text();
                    if(captionTitle){
                        slideLabel += ": " + captionTitle;
                    }
                    var $slideLabel = $('<span class="sr-only">'+slideLabel+'</span>');
                    $slideLabel.appendTo($relatedIndicator);
                    carousel._accessibility.elements.push($slideLabel);
                }
                // and control relationship
                $relatedIndicator.attr('role', 'tab');
                $relatedIndicator.attr('aria-controls', this.id);
            }
        });
        // create button for screen reader users to pause carousel for virtual mode review
        $complementaryLandmark = $('<aside class="sr-only sr-only-focusable" aria-label="Carousel pause/play control"></aside>');
        $carousel.prepend($complementaryLandmark)

        $pausePlayButton = $('<button class="carousel-pause-play sr-only-focusable" title="Pause/Play carousel button can be used by screen reader users to stop carousel animations"></button>')
        
        if(carousel._isPaused){
            $pausePlayButton.html("Play Carousel");
        } else {
            $pausePlayButton.html("Pause Carousel");
        }
        
        $complementaryLandmark.append($pausePlayButton);

        carousel._accessibility.elements.push($complementaryLandmark);
        //Set role if not explicitly set 
        if (typeof $carousel.attr('role') !== 'string') {
            $carousel.attr('role', 'complementary');
        }

        // Setup labels if not explicitly set
        if (typeof  $carousel.attr('aria-label') !== 'string' &&
                    $carousel.attr('aria-labelledby') !== 'string' &&
                    $carousel.attr('aria-describedby') !== 'string'
                    ){
            var titleId = $carousel.attr('id') + '-title';
            var descId = $carousel.attr('id') + '-desc';
            var $ariaLabel = $('<p id="' + titleId + '" class="sr-only">A carousel is a rotating set of images, rotation stops on keyboard focus on carousel tab controls or hovering the mouse pointer over images.  Use the tabs or the previous and next buttons to change the displayed slide.</p>');
            var $ariaDescription = $('<h2 id="' + descId + '" class="sr-only">Carousel content with ' + $carousel.find(Selector.ITEM).length + ' slides.</h2>');
            
            $carousel
                .attr('aria-labelledby', titleId)
                .attr('aria-describedby', descId)
                .prepend($ariaLabel)
                .prepend($ariaDescription);
            carousel._accessibility.addedLabelDescription = true;
            carousel._accessibility.elements.push($ariaLabel);
            carousel._accessibility.elements.push($ariaDescription);
        }
    };

    $.fn.carousel.Constructor.prototype._accessibleSetup = _accessibleSetup; 
    
    var _addEventListeners = $.fn.carousel.Constructor.prototype._addEventListeners 
    
    $.fn.carousel.Constructor.prototype._addEventListeners = function _accessibleAddEventListeners(event) {
        var carousel = this;
        var $carousel = $(carousel._element);
        _addEventListeners.call(carousel);
        
        if (carousel._config.keyboard) {
            $carousel.on(Event.SLID, function (event) {
                //Focus on indicator only if keyboard event
                if(carousel.keyboardEvent == true){
                    setTimeout(function(){
                        carousel.keyboardEvent = false;
                    }, 0);
                    var activeIndicator = $carousel.find(Selector.INDICATORS + " " + Selector.ACTIVE);
                    if(activeIndicator[0]) activeIndicator[0].focus();
                }

            });
        }
        $carousel.on(Event.CLICK_DATA_API, Selector.PAUSE_PLAY, function(event) {
            if(carousel._isPaused) {
                carousel.cycle();
                $carousel.find(Selector.PAUSE_PLAY).html("Pause Carousel");
            } else {
                carousel.pause();
                $carousel.find(Selector.PAUSE_PLAY).html("Play Carousel");
            }
        });
    }


    var _keydown = $.fn.carousel.Constructor.prototype._keydown;
    
    $.fn.carousel.Constructor.prototype._keydown = function _accessibleKeydown(event) {
        
        var carousel = this;

        carousel.keyboardEvent = true;
        
        //Normalize Up with Left and Down with Right
        switch (event.which) {
            case(KeyboardEventCode.ARROW_UP):
                event.which = KeyboardEventCode.ARROW_LEFT;
                break;
            case(KeyboardEventCode.ARROW_DOWN):
                event.which = KeyboardEventCode.ARROW_RIGHT;
                break;
            default:
            break;
        }

        _keydown.call(carousel, event);
    };

    var _slide = $.fn.carousel.Constructor.prototype._slide;
    $.fn.carousel.Constructor.prototype._slide = function _accessibleSlide(direction, element) {
        var carousel = this;
        var $carousel = $(carousel._element);
        
        var activeElement =  $carousel.find(Selector.ACTIVE_ITEM)[0];
        
        var newElement = element || activeElement && carousel._getItemByDirection(direction, activeElement);
        
        var nextElement = carousel._getItemByDirection(Direction.NEXT, newElement);
        var nextElementIndex = carousel._getItemIndex(nextElement);
        var nextNextElement = carousel._getItemByDirection(Direction.NEXT, nextElement);

        
        var prevElementIndex = carousel._getItemIndex(carousel._getItemByDirection(Direction.PREV, newElement));

        var numberOfItems =  $carousel.find(Selector.ITEM).length;

        $carousel.find(Selector.DATA_SLIDE_PREV).attr('aria-label', 'Show slide ' + (prevElementIndex + 1) + ' of ' + numberOfItems);
        $carousel.find(Selector.DATA_SLIDE_NEXT).attr('aria-label', 'Show slide ' + (nextElementIndex + 1) + ' of ' + numberOfItems);

        _slide.call(carousel, direction, element);

        $carousel.find('[aria-controls="' + nextElement.id + '"]').attr({
            "aria-selected": "false",
            "tabIndex" : "-1"
        });
        
        $carousel.find('[aria-controls="' + nextNextElement.id + '"]').attr({
            "aria-selected": "true",
            "tabIndex": "0"
        });

    };

    var dispose = $.fn.carousel.Constructor.prototype.dispose;

    $.fn.carousel.Constructor.prototype.dispose = function _accessibleDispose() {
        var carousel = this;
        var $carousel = $(carousel._element);
        carousel._accessibility.elements.each(function($element){
            $element.remove();
        });

        $carousel.find(Selector.ITEM)
            .removeAttr('role')
            .removeAttr('aria-selected')
            .removeAttr('tabIndex');

        $carousel.find(Selector.INDICATORS)
            .removeAttr('role')
            .removeAttr('aria-controls');

        if(carousel._accessibility.addedLabelDescription){
            $carousel
                .removeAttr('aria-labelledby')
                .removeAttr('aria-describedby');
        }
        carousel._accessibility = null;
        dispose.call(carousel);
    };

    $(window).on(Event.LOAD_DATA_API, function () {
        $(Selector.DATA_RIDE).each(function () {
            var $carousel = $(this);
            $carousel.carousel('_accessibleSetup');
        });
    });

})(jQuery);