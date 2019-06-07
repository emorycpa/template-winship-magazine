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
     * Bootstrap (v4.3.0): modal.js
     * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
     * --------------------------------------------------------------------------
     */

    // Load order errros
    if(!$) throw "jQuery required."
    if(!$.fn.modal ||
        !$.fn.modal ||
        !$.fn.modal.Constructor ||
        !$.fn.modal.Constructor.VERSION ||
        $.fn.modal.Constructor.VERSION.split('.')[0] !== "4"
        ) throw "Bootstrap version 4 required."
    
    // Global static values based on Bootstrap's conventions 
    var DATA_KEY = 'bs.modal';
    var EVENT_KEY = "." + DATA_KEY;
    var DATA_API_KEY = '.data-api';
    
    var Selector = {
        CONTENT: '.modal-content'
    };

    var KeyboardEventCode = {
        TAB : 9
    };

    

    var hide =   $.fn.modal.Constructor.prototype.hide; 
    $.fn.modal.Constructor.prototype.hide = function(){
        hide.apply(this, arguments)
       $(document).off('keydown' + EVENT_KEY); 
    }; 

    var _enforceFocus =   $.fn.modal.Constructor.prototype._enforceFocus; 
    $.fn.modal.Constructor.prototype._enforceFocus = function(){
      var $content = $(this._element).find(Selector.CONTENT);
      var focEls = $content.find(":tabbable")
      , $lastEl = $(focEls[focEls.length-1])
      , $firstEl = $(focEls[0]);
      $lastEl.on('keydown' + EVENT_KEY , $.proxy(function (ev) {
        if(ev.keyCode === KeyboardEventCode.TAB && !(ev.shiftKey | ev.ctrlKey | ev.metaKey | ev.altKey)) { // TAB pressed
          ev.preventDefault();
          $firstEl.focus();
        }
      }, this));
      $firstEl.on('keydown' + EVENT_KEY, $.proxy(function (ev) {
          if(ev.keyCode === KeyboardEventCode.TAB && ev.shiftKey) { // SHIFT-TAB pressed
            ev.preventDefault();
            $lastEl.focus();
          }
      }, this));
      _enforceFocus.apply(this, arguments);
    };

})(jQuery);