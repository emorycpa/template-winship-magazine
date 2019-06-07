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
     * Bootstrap (v4.3.0): collapse.js
     * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
     * --------------------------------------------------------------------------
     */

    // Load order errros
    if(!$) throw "jQuery required."
    if(!$.fn.collapse ||
        !$.fn.collapse ||
        !$.fn.collapse.Constructor ||
        !$.fn.collapse.Constructor.VERSION ||
        $.fn.collapse.Constructor.VERSION.split('.')[0] !== "4"
        ) throw "Bootstrap version 4 required."
    
    // Global static values based on Bootstrap's conventions 
    var DATA_KEY = 'bs.collapse';
    var EVENT_KEY = "." + DATA_KEY;
    var DATA_API_KEY = '.data-api';
    
    var Selector = {
        COLLAPSE_WITH_PARENT: '.collapse[data-parent]',
        DATA_TOGGLE: '[data-toggle="collapse"]'
    };

    var KeyboardEventCode = {
      //ARROW_LEFT : 37,
      ARROW_UP : 38,
      //ARROW_RIGHT : 39,
      ARROW_DOWN : 40,
      HOME : 36,
      END : 35,
      PAGE_UP : 33,
      PAGE_DOWN : 34
    };


    // Need to finish development. 
    // event.ctrlKey


})(jQuery);