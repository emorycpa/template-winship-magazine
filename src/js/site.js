(function ($) {
    if (!$) throw "jQuery library is required."

    //Global reference
    const timeoutDelay = 50;
    const $win = $(window);
    const $doc = $(document);
    const $body = $("body");

    //Cached references
    let $siteHeader = $("#siteHeader");
    let $searchToggle = $("#searchToggle");
    let $searchInput = $("#searchInput");
    let $searchSubmit = $("#searchSubmit");
    let $dropdownToggles = $("#siteHeader .dropdown-toggle");

    //Timeout Vars
    let scrollTimeout;
    let resizeTimeout;

    //Add attribute to activate header nav dropdowns on large screens only
    const activateDropdownsFn = function () {
        if (lg == true || xl == true) {
            $dropdownToggles.attr("role", "button").attr("data-toggle", "dropdown").attr("aria-haspopup", "true").attr("aria-expanded", "false");
        } else {
            $dropdownToggles.removeAttr("role").removeAttr("data-toggle").removeAttr("aria-haspopup").removeAttr("aria-expanded");
        }
    }

    //scrollFn
    const scrollFn = function () {
        //Collapse nav on scroll
        if ($doc.scrollTop() > $siteHeader.height()) {
            $siteHeader.addClass("shrink");
        } else {
            $siteHeader.removeClass("shrink");
        }
        return null;
    };

    //resizeFn
    const resizeFn = function () {
        //Push body away from fixed header
        $body.css("padding-top", $siteHeader.height());
        //Detect screen width and activate header nav dropdowns accordingly
        activateDropdownsFn();
    }

    //Toggle Search Input box on click for large screens
    $searchToggle.click(function () {
        if ($win.width() > 992) {
            $searchInput.toggleClass("d-lg-block");
            $searchSubmit.toggleClass("d-lg-block");
        } else {
            $searchInput.toggleClass("d-none");
            $searchSubmit.toggleClass("d-none");
        }
    });

    //Setup listeners
    $doc.scroll(function () {
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(scrollFn, timeoutDelay);
    });

    $win.resize(function () {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(resizeFn, timeoutDelay * 4);
    });

    //Ready function
    $doc.ready(function () {
        //Ensure cached references are complete
        $siteHeader = $("#siteHeader");
        $searchToggle = $("#searchToggle");
        $searchInput = $("#searchInput");
        $dropdownToggles = $("#siteHeader .dropdown-toggle");

        //Trigger resize events when page loads
        $win.resize();
    });

    // Init BS tooltips and popovers
    $(function () {
        $('[data-toggle="tooltip"]').tooltip();
        $('[data-toggle="popover"]').popover();
    })

})(jQuery);