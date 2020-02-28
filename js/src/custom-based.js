$( document ).ready(function() {
    var active_step = [],entry = [];
    var scope = {
        // Initializes all functions.
        init: function() {
            scope.heightBrowser();
            scope.customJS();
            scope.progressSteps();
            scope.progressBarListing();
            scope.continueClickForm();
            scope.displayCalculatorSteps();
            scope.formControlField();
            scope.reviewFormDirectly();
            scope.filterMinMaxInputValue();
        },
        filterMinMaxInputValue: function(){
            var flags = false;
            $(document).on('input','.form-input',function(e){
                var elem_id = $(this).attr('id');
                var $this = $(this);
                var get_slider = $('#'+elem_id+'Slider');
                var slider_min = get_slider.prop('min');
                var slider_max = get_slider.prop('max');
                var no_error = true;
                var get_current_step = $('label.steps').text();
				var validNumber = new RegExp(/^\d*\.?\d*$/);
				var lastValid = $this.val();

                if( get_slider.length > 0 ){
					if( validNumber.test( $this.val() ) ) {
						this.value = $this.val();
					}else{
						this.value = '';
					}
                    if( parseFloat( $this.val() ) >= slider_min && parseFloat( $this.val() ) <= slider_max && parseFloat( $this.val() ) >= slider_min ){
                        $this.css('border','').addClass('has_val');
                        no_error = true;
                    }else{
                        $this.css('border','1px solid red').removeClass('has_val');
                        no_error = false;
                        $('.informations-forms.counter_'+get_current_step+' .continue-next-step').addClass('action-not-ready');
                    }
                }
                var currentStep = $('.informations-forms.counter_' + get_current_step ),
                    totalInput = $('input:visible', currentStep);

                if( $('.informations-forms.counter_' + get_current_step + ' input.has_val').length == totalInput.length ) {
                    currentStep.find('.continue-next-step').removeClass('action-not-ready');
                }else{
                    currentStep.find('.continue-next-step').removeClass('action-not-ready').addClass('action-not-ready');
                }

            });
        },
        reviewFormDirectly: function(){
            $(document).on('click','.target-specific-step',function(e){
                e.preventDefault();
                var formDisplayWrapper = $('.forms-display-steps'),
                    whatStep = $(this).data('whichstep'),
                    theCurrentForm = $('.forms-display-steps .counter_' + whatStep);
                    reDirectButtonForm = $('.forms-display-steps .counter_' + whatStep + ' .continue-wrapper').find('span').text('Save ');
                    reportWrapper = $('#turnover-report').hide();

                    theCurrentForm.show();
                    theCurrentForm.addClass('report-edit');
                    $('.pills-tab.counter_5.is_active').removeClass('is_active');
                    $('.pills-tab.counter_'+whatStep).addClass('is_active');
                    $('.pills-tab.counter_'+whatStep).removeClass('is_completed');
                    $('label.steps').text(whatStep);
                    $('.pills-container').addClass('restrict_pills');
                    var stepbystep = scope.progressSteps();
                    var current_labeled = $('.pills-tab.counter_'+whatStep+' .pill-description span').text();
                    var current_step_num = $('.pills-tab.counter_'+whatStep+' .pill-description p').text();
                    $('.leftbar-flank').css('background','url('+ stepbystep.step[whatStep]['image_src'] +')');
                    $('.leftbar-flank .content-steps').find('label').text(current_labeled);
                    $('.leftbar-flank .current-step-side').text(current_step_num);
                    $('.leftbar-flank .number-step').text(whatStep);
                    $('.forms-display-steps .counter_' + whatStep + ' .continue-wrapper .continue-next-step').attr('data-reportstatus','active');
                    $('.add-logo-leftflank').remove();
                    if( $('.add-logo-leftflank').length == 0 ){
                        $('.leftbar-flank').append('<div class="add-logo-leftflank"> <img src="../../imgs/Hughes-echostar.png"> </div>');
                    }
            });
        },
        displayCalculatorSteps: function(){
            $('#launch-calculator').on('click',function(e){
                e.preventDefault();
                var current_step = 'counter_1';
                $('.landing-page').hide();
                $('.calculator-steps').show().fadeIn();
            });
        },
        formControlField: function( data ){

            if( typeof data !== "undefined" ){
                var formControl = $('.informations-forms.'+data+' .form-control');
                $.each(formControl, function(key,value){
                    $(this).text();
                });
            }
        },
        continueClickForm: function(){
            var pillstab = $('.pills-tab');
            $(document).on('click','.continue-next-step',function(e){
                e.preventDefault();
                var current_step = $(this).data('currentstep');
                var next_step = current_step + 1;
                var nextPillTab  = 'counter_' + next_step;
                var current_form_display = $(this).parents('.informations-forms');
                var stepbystep = scope.progressSteps();
                var current_labeled,current_step_title;
                current_form_display.hide();
                if( $(this).attr('data-reportstatus') == 'active'  ){
                    $('#turnover-report').show();
                    $('.pills-tab.counter_'+current_step).removeClass('is_active');
                    $('.pills-tab.counter_'+current_step).addClass('is_completed');
                    $('.pills-tab.counter_5').addClass('is_active');
                    $('.leftbar-flank .content-steps').find('label').text('step five');
                    $('.leftbar-flank .current-step-side').text('Report');
                    $('.leftbar-flank .number-step').text(5);

                    $('label.steps').text(5);
                    $('.leftbar-flank').css('background','url('+ stepbystep.step[4]['image_src'] +')');

                    return;
                }
                $.each( pillstab, function( key,value ){
                    if( $(this).hasClass('report-edit') ){
                        $(this).removeClass('is_active');
                    }
                    if( $(this).hasClass('is_active') ){
                        $(this).removeClass('is_active');
                        $(this).addClass('is_completed');
                    }
                    if( $(this).hasClass(""+nextPillTab+"") ){
                        $(this).addClass('is_active');
                        if( $(this).hasClass('is_completed') && $(this).hasClass('is_active') ){
                            $(this).removeClass('is_completed');

                        }
                        current_labeled = $(this).find('span').text();
                        current_step_title = $(this).find('p').text();
                        $('.informations-forms.'+nextPillTab).css('display','inline-block');
                        $('.leftbar-flank').css('background','url('+ stepbystep.step[current_step]['image_src'] +')');
                        $('.leftbar-flank .content-steps').find('label').text(current_labeled);
                        $('.leftbar-flank .current-step-side').text(current_step_title);
                        $('.leftbar-flank .number-step').text(next_step);
                    }
                } );
                $('label.steps').text(next_step);
            });
            // this is for previous
            $(document).on('click','.pills-tab.is_completed',function(e){
                e.preventDefault();
                var previous_step = $(this).data('pillstate');
                var current_form = $('.pills-tab.is_active').data('pillstate');
                var next_step = previous_step;
                var nextPillTab  = 'counter_' + next_step;
                var current_form_display = $(this).parents('.informations-forms');
                var stepbystep = scope.progressSteps();
                var current_labeled,current_step_title;
                current_form_display.hide();
                $('#turnover-report').hide();
                $.each( pillstab, function( key,value ){

                    if( $(this).hasClass('is_active') ){
                        $(this).removeClass('is_active');

                        $('.informations-forms.counter_'+current_form).hide();
                    }
                    if( $(this).hasClass(""+nextPillTab+"") ){
                        $(this).addClass('is_active');
                        $(this).removeClass('is_completed');
                        current_labeled = $(this).find('span').text();
                        current_step_title = $(this).find('p').text();
                        $('.informations-forms.'+nextPillTab).css('display','inline-block');
                        $('.leftbar-flank').css('background','url('+ stepbystep.step[previous_step]['image_src'] +')');
                        $('.leftbar-flank .content-steps').find('label').text(current_labeled);
                        $('.leftbar-flank .current-step-side').text(current_step_title);
                        $('.leftbar-flank .number-step').text(next_step);
                    }
                } );
                $('label.steps').text(next_step);
            });
        },
        progressBarListing: function(){
            var bar_pills = $('.progressbar-pills');
            if( bar_pills.length > 0 ){
                var the_progress_steps = scope.progressSteps();
                var active_box = $('.the-slides-calculation');
                var html = '<div class="pills-container">';
                var new_ctr = 1;
                for(i = 0; i < the_progress_steps['step'].length; i++){
                    var active = "";
                    if( active_box.hasClass('active-boxed') && active_box.data('countboxs') == new_ctr ){
                        active = "is_active";
                        active_step = the_progress_steps['step'][i];
                    }
                    html += '<div class="pills-tab counter_'+ new_ctr +' '+ active +'" data-pillstate="'+ new_ctr +'"><div class="the_pill"></div><div class="pill-description"><span>'+ the_progress_steps['step'][i]['title'] +'</span><p>'+ the_progress_steps['step'][i]['sub_title'] +'</p></div></div>';
                    new_ctr++;
                }
                html += '</div>';
                bar_pills.append(html);
            }
        },
        progressSteps: function(){
            var stepbystep = {
                "step" : [
                    {
                        'step' : 1,
                        'title' : 'step one',
                        'container' : 'informations-forms',
                        'sub_title' : 'About The Company',
                        'image_src' : '../../imgs/Step-One-Image.jpg',
                        'json_file' : 'sharedFormData.json'
                    },
                     {
                        'step' : 2,
                        'title' : 'step two',
                        'container' : 'exitcost-forms',
                        'sub_title' : 'Exit Costs',
                        'image_src' : '../../imgs/Step-Two-Image.jpg',
                        'json_file' : 'sharedFormData.json',
                        'section_start' : ''
                    },
                    {
                        'step' : 3,
                        'title' : 'step three',
                        'container' : 'recruitment-forms',
                        'sub_title' : 'Recruitment',
                        'image_src' : '../../imgs/Step-Three-Image.jpg',
                        'json_file' : 'sharedFormData.json',
                        'section_start' : ''
                    },
                    {
                        'step' : 4,
                        'title' : 'step four',
                        'container' : 'onboarding-forms',
                        'sub_title' : 'Onboarding',
                        'image_src' : '../../imgs/Step-Four-Image.jpg',
                        'json_file' : 'sharedFormData.json',
                        'section_start' : ''
                    },
                    {
                        'step' : 5,
                        'title' : 'step five',
                        'container' : 'report-forms',
                        'sub_title' : 'Report',
                        'image_src' : '../../imgs/Step-Five-Image.jpg',
                        'pre-footer' : '<span class="top-title">Hughes<span class="light-top-title">ON</span><span class="small-top-tm">TM</span></span>'
                    }
                ]

            }
            return stepbystep;
        },
        heightBrowser: function(){
            var browserHeight = window.innerHeight;

            if( $('div').data('browserheight') === true ){
                $('[data-browserheight^="true"]').css('height',browserHeight);
            }
        },
        customJS: function(){
            // $(window).on('load',function(){
            //     continue-next-step
            // });
            var app = new Vue({
                el: '.calculator-steps',
                data: {
                    background_img : 'imgs/Step-One-Image.jpg'
                }
            });
        }
    }

    scope.init();
    window.onresize = function() {
        scope.heightBrowser();
        //   scope.initReadMoreLess();
    };
});