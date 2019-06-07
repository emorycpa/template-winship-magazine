(function ($) {
    if (!$) throw 'jQuery library is required.'

    //Global reference
    const timeoutDelay = 50;
    const $win = $(window);
    const $doc = $(document);
    const $body = $('body');

    //Cached references
    let $siteHeader = $('#siteHeader');
    let $searchSubmit = $('#search-submit');
    let $searchToggle = $('#search-toggle');
    let $searchInput = $('#search-input');
    let $navMain = $('#nav-main');
    let $dropdownToggles = $('#siteHeader .dropdown-toggle');
    let $tooltip = $('[data-toggle="tooltip"]');
    let $popover = $('[data-toggle="popover"]');
    let $main = $('#main').offset().top;

    //Timeout Vars
    let scrollTimeout;
    let resizeTimeout;
    let resizeOrientationchangeTimeout;

    //Add attribute to activate header nav dropdowns on large screens only
    const activateDropdownsFn = function () {

        // If this dropdown is set to show children on mobile, and window is < lg
        if (($dropdownToggles.hasClass('dropdown-show-children-mobile')) && (window.matchMedia && window.matchMedia("(max-width: 992px)").matches)) {
            $dropdownToggles.removeAttr( // remove button attributes
                'role data-toggle aria-haspopup aria-expanded'
            ).attr('tabindex', '-1'); // remove ability to tab focus
        }

        // If window is > lg
        else if (window.matchMedia && window.matchMedia("(min-width: 992px)").matches) {
            $dropdownToggles.attr({ // add button attributes
                role: 'button',
                'data-toggle': 'dropdown',
                'aria-haspopup': true,
                'aria-expanded': false
            }).removeAttr('tabindex'); // add ability to tab focus
        }

        // Otherwise
        else {
            $dropdownToggles.removeAttr( // remove button attributes
                'role data-toggle aria-haspopup aria-expanded'
            );
        }

    };

    const carouselResize = function () {
        $('.carousel').each(function () {
            let $carousel = $(this);
            let heights = [];
            let tallest = null;
            let $slides = $carousel.find('.carousel-item');
            //Reset get hight
            $slides.each(function () {
                // console.log($(this));
                // console.log($(this).outerHeight());
                $(this).css('min-height', '0'); //reset min-height
            });
            $slides.each(function () {
                // console.log($(this).outerHeight());
                heights.push($(this).height());
            });
            // console.log(heights);
            tallest = Math.max.apply(null, heights); //cache largest value
            tallest += 5; // Add a bit for rendering bug in Safari
            $slides.each(function () {
                $(this).css('min-height', tallest + 'px');
            });
        });
    };

    //Wrap email address text that's wider than its container
    const linkWrapFn = function () {
        $('a[href^="mailto"]:contains(@)').each(function () {
            let $mailto = $(this);
            if ($mailto.outerWidth() > $mailto.parent().innerWidth()) {
                $mailto.css('word-break', 'break-all');
            }
        });
    };

    //scrollFn
    const scrollFn = function () {
        //Collapse nav on scroll
        var topOffset = $doc.scrollTop();
        if (topOffset >= 50) {
            $siteHeader.addClass('scroll-down');
            $siteHeader.removeClass('scroll-top');
        } else if (topOffset === 0) {
            $siteHeader.addClass('scroll-top');
            $siteHeader.removeClass('scroll-down');
        }
        if (topOffset >= $main) {
            $('#sticky-div').addClass('sidebar-sticky');
        } else {
            $('#sticky-div').removeClass('sidebar-sticky');
        }
    };

    //resizeFn
    const resizeFn = function () {
        //Detect screen width and activate header nav dropdowns accordingly
        activateDropdownsFn();
    };

    // resizeOrientationchangeFn
    const resizeOrientationchangeFn = function () {
        //Fix header 
        $main = $('#main').offset().top;
        // Fix carousel heights to always be equal within a given carousel
        carouselResize();
    };

    //Emergency Announcement
    const emergencyAnnouncementSetup = function () {
        const pollInterval = 60000;
        const feedURL = 'https://www.emory.edu/template_shared/alert-feed.cfm';
        const elementID = 'emerg-alert-system';
        const pollFn = function () {
            $.ajax({
                url: feedURL,
                cache: false,
                success: function (data) {
                    const alert = data.toString().trim().length === 0 ? false : true;
                    const emergencyElement = $("#" + elementID);
                    emergencyElement.empty();
                    if (alert) {
                        emergencyElement.append(
                            '<div class="alert alert-danger alert-dismissible fade show" role="alert">' +
                            data.toString().replace(/<[^>]+>/g, '') +
                            '<button type="button" class="close" data-dismiss="alert" aria-label="Close">' +
                            '<span aria-hidden="true">&times;</span>' +
                            '</button>' +
                            '</div>'
                        );
                    }
                }
            });
        }
        $siteHeader.append('<div id="' + elementID + '"></div>');
        setTimeout(pollFn, pollInterval);
        pollFn();
    };

    //Search Callback
    const searchValidate = function (ev) {
        let inputQ = $(this).find("[name='q']");
        if (inputQ.val() == '') {
            inputQ.focus();
            ev.preventDefault();
        }

    }

    //Templates
    const _trumbaTemplate = [
        '{.section data}<div class="card-body p-0 d-flex flex-wrap justify-items-stretch">',
        '{.section trumba}{.section items}{.repeated section @}<div class="row no-gutters w-100 calendar__item">',

        '<div class="col-3 col-lg-2 calendar__date">',
        '<div><small>{trumba|customDateTimeRangeFormat ddd localstart localend}</small></div>',
        '<div>{trumba|customDateTimeRangeFormat "MMM" localstart localend}</div>',
        '<div>{trumba|customDateTimeRangeFormat d localstart localend}</div>',
        '</div>',
        '<div class="col-9 col-lg-10 calendar__details">',
        '<a href="{guid|trumbaUrl}">',
        '{title}',
        '</a>',
        '</div>',
        '</div>{.end}{.end}',
        '{.or}<div class="no-events"></div></div>{.end}',
        '</div>{.end}'
    ];

    const _newsTemplate = [
        '{.section data}{.section feed}{.section entries}<div class="card-group">',
        '{.repeated section @}<div class="card">',
        '<img class="card-img-top" src="{thumbnail}"/>',
        '<div class="card-body">',
        '<a href="{link}">',
        '<div class="h6 card-title">{title}</div>',
        '</a>',
        '</div>',
        '</div>{.end}',
        '</div>{.or}<div class="no-events"></div>{.end}{.end}{.end}'
    ];

    //Add formatters
    $.template.addFormatter("trumbaUrl", function (value, context) {
        var eventId = value.split('/').pop();
        return (context.get('settings.localCalendar') ? context.get('settings.localCalendar') : 'http://www.trumba.com/calendars/' + context.get('settings.calendar')) + '?trumbaEmbed=eventid%3D' + eventId + '%26view%3Devent%26-childview%3D';
    });

    $.template.addFormatter("customDateTimeFormat", function (value, context, mask) {
        return Date.parse(value).toString(mask);
    });

    $.template.addFormatter("customDateTimeRangeFormat", function (value, context, mask, date1, date2) {
        // Shift second date value by one second if is midnight 
        var parsedDate1 = Date.parse(value[date1]);
        var parsedDate2 = Date.parse(value[date2]);
        if (parsedDate2.toString('HHmmss') === '000000') {
            parsedDate2 = parsedDate2.addSeconds(-1);
        }
        if (
            (parsedDate1.toString(mask) == parsedDate2.toString(mask)) ||
            //Special state for all days events (one day events are all considered all day events)
            Date.parse(value[date1]).add({
                "days": 1
            }).equals(Date.parse(value[date2]))
        ) {
            return parsedDate1.toString(mask);
        } else {
            return parsedDate1.toString(mask) + '-' + parsedDate2.toString(mask);
        }
        return '<!-- customDateTimeRange -->';
    });

    //Register templates
    $.trumbaRegisterTemplate("default", $.template(_trumbaTemplate));

    $.newsRegisterTemplate("default", $.template(_newsTemplate));

    //Setup listeners
    $doc.scroll(function () {
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(scrollFn, timeoutDelay);
    });

    $win.resize(function () {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(resizeFn, timeoutDelay * 4);
    });

    $win.on('resize orientationchange', function () {
        clearTimeout(resizeOrientationchangeTimeout);
        resizeOrientationchangeTimeout = setTimeout(resizeOrientationchangeFn, timeoutDelay);
    });

    //Ready function
    $doc.ready(function () {
        //Ensure cached references are complete
        $siteHeader = $('#siteHeader');
        $searchSubmit = $('#search-submit');
        $searchToggle = $('#search-toggle');
        $searchInput = $('#search-input');
        $dropdownToggles = $('#siteHeader .dropdown-toggle');
        $tooltip = $('[data-toggle="tooltip"]');
        $popover = $('[data-toggle="popover"]');
        $main = $('#main').offset().top;

        //Trigger resize events when page loads
        $win.resize();

        //Init BS tooltips and popovers
        $tooltip.tooltip();
        $popover.popover();

        //Hide navbar search input and submit buttons, reveal toggle button
        $searchInput.addClass('d-lg-none');
        $searchSubmit.addClass('d-lg-none');
        $searchToggle.addClass('d-lg-flex');

        //Toggle navbar search input and submit buttons
        $searchToggle.click(function () {
            $searchInput.toggleClass('d-lg-none d-block slide-horiz-rtl');
            $searchSubmit.toggleClass('d-lg-none d-block slide-horiz-rtl');
            $searchToggle.toggleClass('search-close');
        });



        //Apply email link wrapping
        linkWrapFn();

        //Setup emergancy annoucement system
        emergencyAnnouncementSetup();

        // Compact Header Search Bar/Main Menu toggle
        if ($siteHeader.hasClass('compact-header')) {
            // Add body class
            $body.addClass('compact');
            // Hide main menu when Search bar is toggled
            if ($searchToggle.click(function () {
                    if (!$searchToggle.hasClass('search-close')) {
                        $navMain.removeClass('d-none');
                    } else {
                        $navMain.addClass('d-none');
                    }
                }));
            // If Search bar is toggled and user switches to smaller screen, reveal main menu and un-toggle Search Bar
            $win.resize(function () {
                if (($win.width() < 992) && ($navMain.hasClass('d-none'))) {
                    $navMain.removeClass('d-none');
                    $searchToggle.removeClass('search-close');
                    $searchInput.addClass('d-lg-none');
                    $searchSubmit.addClass('d-lg-none');
                }
            });

        }

        // If page has a Media Gallery, load Chocolat and settings
        if ($('.media-gallery')[0]) {
            // Load Chocolat
            $('.media-gallery').Chocolat({
                imageSelector: '.media-gallery-item',
                separator2: 'of '
            });
            // Hide attribute popups on .media-gallery-item
            $(".media-gallery-item").hover(function () {
                $(this).attr("rel", $(this).attr("title"));
                $(this).removeAttr("title");
            }, function () {
                $(this).attr("title", $(this).attr("rel"));
                $(this).removeAttr("rel");
            });
        }

        // If a sticky-div exists, add special body attributes
        if ($('#sticky-div')[0]) {
            // Add scrollspy settings
            $body.attr({
                "data-spy": "scroll",
                "data-target": "#sticky-div",
                "data-offset": "55"
            });
        }

        // If header is for Microsite, add special body class
        if ($siteHeader.hasClass('header-microsite')) {
            $body.addClass('microsite');
        }

        // If header is for Magazine, add special body class
        if ($siteHeader.hasClass('header-magazine')) {
            $body.addClass('magazine');
        }

        //Setup listern for null search submissions
        $siteHeader.find('form.header-search').submit(searchValidate);


        // If Formstack form is embedded
        if ($('.fsEmbed')[0]) {

            // Formstack accessibility
            $optionLabel = $('.fsOptionLabel');
            $checkbox = $('.fieldset-content .fsField[type="checkbox"]');
            $radio = $('.fieldset-content .fsField[type="radio"]');
            $fieldsetContent = $('.fsRowBody[fs-field-type!="datetime"] fieldset'); // Fieldsets except "date/time"
            $matrix = $('.fsMatrix td');

            // Custom check/radio buttons
            $optionLabel.addClass('form-check-label custom-control').removeClass('fsOptionLabel vertical horizontal');
            $checkbox.parent($optionLabel).addClass('custom-checkbox');
            $checkbox.addClass('custom-control-input').removeClass('fsField vertical horizontal').after('<span class="custom-control-indicator"></span><span class="custom-control-label"></span>'); // Add custom input icons
            $radio.parent($optionLabel).addClass('custom-radio');
            $radio.addClass('custom-control-input').removeClass('fsField vertical horizontal').after('<span class="custom-control-indicator"></span><span class="custom-control-label"></span>'); // Add custom input icons
            $fieldsetContent.children('.fieldset-content').addClass('form-check').removeClass('fieldset-content');

            // Matrix component
            $matrix.each(function () {

                // Wrap custom control div around components
                $(this).wrapInner('<div class="form-check p-0"/>');
                $matrixLabel = $(this).find('.form-check').children('label');
                $matrixInput = $(this).find('.form-check').children('input');

                // Add custom classes to <label>, add screenreader <span> to hide label text
                $matrixLabel.addClass('form-check-label custom-control custom-radio').removeClass('hidden').wrapInner('<span class="sr-only"/>');

                // move <input/> inside of <label>
                $matrixLabel.append($matrixInput);

                // Add custom input icons
                $matrixInput.addClass('custom-control-input').removeClass('fsField').after('<span class="custom-control-indicator"></span><span class="custom-control-label"></span>');
            });

            // Add <label> to second Address input boxes (Address 2)
            $address2 = $('.fsFieldAddress2');
            $address2.each(function () {
                $address2ID = $(this).prop('id');
                $address2Label = '<label class="sr-only" for="' + $address2ID + '">Address Line 2</label>'
                $(this).before($address2Label);
            });

            // Remove ID reference from "Address" component label (which referenced nothing)
            $addressSectionLabel = $('.fsCell[fs-field-type="address"] > .fsLabel');
            $addressSectionLabel.each(function () {
                $(this).removeAttr('for');
            });

            // Add aria-label/hidden to hidden inputs
            $calendarPickerLink = $('.fsCalendarPickerLink');
            $calendarPickerLink.each(function () {
                $(this).attr('aria-label', 'Hidden Input');
            });
            $hiddenDialog = $('.fs-form-dialog--hidden');
            $hiddenDialog.each(function () {
                $(this).attr({
                    'aria-label': 'Hidden Input',
                    'aria-hidden': 'true'
                });
            });

            // Change Events/Products <div> label to <label>
            $eventProductQuantity = $('.fsProductField__fields > div.fsProductField__fields__quantity')
            $eventProductQuantity.replaceWith(function () {
                return $('<label/>', {
                    html: this.innerHTML
                });
            });

            // Make File Upload button enhanced and branded
            $fileLabel = $('.fsBody div[fs-field-type="file"] .fsLabel');
            $fileInput = $('.fsBody div[fs-field-type="file"] input[type="file"]');
            $faUploadIcon = '<span class="fas fa-fw fa-upload" aria-hidden="true"></span> ';

            $fileLabel.each(function () {
                // Add FontAwesome upload icon to label text
                $(this).prepend($faUploadIcon);
                // Add file upload preview div
                $(this).after('<div class="file-upload-preview"></div>');
            });

            // https://tympanus.net/codrops/2015/09/15/styling-customizing-file-inputs-smart-way/
            $fileInput.each(function () {

                // Switch places of label and input for accessibility focus
                $(this).insertBefore($(this).prev($fileLabel));

                var $input = $(this);

                // Show uploaded filename and image preview
                $input.on('change', function (e) {

                    // Determine if file is valid image type
                    var file = this.files[0];
                    var fileType = file["type"];
                    var validImageTypes = ["image/gif", "image/jpeg", "image/png"];

                    // If file not image, do nothin
                    if ($.inArray(fileType, validImageTypes) < 0) {
                        console.log('Not a valid image file; no preview will be shown.');

                    } else {
                        // If file is image, display file path
                        var preview = $(".file-upload-preview");
                        preview.empty();
                        var fileName = e.target.value.split('\\').pop();

                        // Display filename above image preview
                        preview.show().append('<small>' + fileName + '</small>');

                        // Generate image preview
                        if (typeof (FileReader) != "undefined") {
                            var reader = new FileReader();
                            
                            // Give attributes to new img
                            reader.onload = function (e) {
                                $("<img />", {
                                    "src": e.target.result,
                                    "class": "img-fluid border p-1 d-block",
                                    "style": "max-width:250px;max-height:450px",
                                    "alt": "Image Preview" + fileName
                                }).appendTo(preview);
                
                            }
                            reader.readAsDataURL($(this)[0].files[0]);

                        } else {
                            console.log("This browser does not support FileReader.");
                        }
                        
                    }

                });

            });

            console.log('Formstack accessibility and enhancement module activated.');
        }

    });

})(jQuery);