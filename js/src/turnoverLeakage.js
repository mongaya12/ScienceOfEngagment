const turnoverLeakage = (function () {
  var calculations = {}
  var data = {}
  var emailSent = false
  var formData = []
  var formattedData = {}
  var reportCreated = false
  var savedInput = {}

  // called on page load, fetches form data
  function init() {
    $.ajax({
      url: '/formData/turnoverLeakageFormData.json',
      cache: false,
      dataType: 'json',
      success: function (data) {
        formData = data;
        // show();

        prg.getSharedFormData().forEach(function (entry, index) {
          formData[0].entries.splice(index, 0, entry);
        })

        prg.viewReady('turnover');
        
      },
      error: function () {
        console.error('An error occurred fetching turnoverLeakageFormData.json');
      }
    })
  }

  // called when leaving this view
  function hide() {
    // $('#form-content').html('');
    $('#turnover-report').hide();
    $('#form-footer').show();
    $('#report-footer').hide();
  }

  // called when entering this view
  function show() {
    if (!reportCreated) {
      showForm();
    } else {
      showReport();
    }
  }

  // populates form with formData
  function showForm() {
    var formContent = $('#form-content');
    var counter = 0,step_counter_2,step_counter_3,step_counter_4,last_container_id,continue_btn;
    var box_step_move = [];
    formData.forEach(function (group, groupIndex) {
      formContent.append('<div id="group-' + groupIndex + '"></div>');
      var groupElem = $('#group-' + groupIndex);

      if (group.name) {
        var raw_string = group.name.replace(/ /g, ''),container_id_string;
        var return_new_string = raw_string.toLowerCase();
        if( counter == 1 || counter == 3 || counter == 7 ){
          
          $('.forms-display-steps').append('<div id="'+return_new_string+'" class="informations-forms hide-display"><div class="the-forms"></div></div>');
          last_container_id = return_new_string;
          continue_btn = return_new_string;

           $('#'+return_new_string + '> .the-forms').append('<div class="group-title "><h3>' + group.name + '</h3></div>');

           box_step_move.push(return_new_string);
        }

        if( counter <= 1 ){
          step_counter_1 = return_new_string;
          $('#'+container_id_string + '> .the-forms').append('<div class="group-title group-name-ctm"><h3>' + group.name + '</h3></div>');
        }

        if( counter == 2 ){
          step_counter_2 = last_container_id;
          container_id_string = step_counter_2;
          $('#'+container_id_string + '> .the-forms').append('<div class="group-title group-name-ctm"><h3>' + group.name + '</h3></div>');
        }


        if( counter >= 4 && counter <= 6){
          step_counter_3 = last_container_id;
          container_id_string = step_counter_3;
          $('#'+container_id_string + '> .the-forms').append('<div class="group-title group-name-ctm"><h3>' + group.name + '</h3></div>');
        }

        if( counter >= 7 && counter <= 10 ){
          step_counter_4 = last_container_id;
          container_id_string = step_counter_4;
          $('#'+container_id_string + '> .the-forms').append('<div class="group-title group-name-ctm"><h3>' + group.name + '</h3></div>');
        }
        
        
        
       
        
      }

      group.entries.forEach(function (entry) {
        var inputValue = data[entry.id] !== undefined ? data[entry.id] : '';
        var sliderValue = inputValue !== '' ? inputValue : entry.defaultValue;
        
        var formInput =
          '<div id="' + entry.id + 'Container" class="form-group" data-mh="form-field-group">' +
          '  <label class="form-input-label">' +
          '    <span class="label-text">' + entry.name + '</span>' +
          '    <i class="fa fa-question-circle label-info-icon" aria-hidden="true"></i>' +
          '    <i class="fa fa-times-circle label-collapse-icon" aria-hidden="true"></i> ' +
          '  </label>' +
          '  <div class="input-group">' +
          '    <input id="' + entry.id + '"' +
          '           type="text"' +
          '           class="form-control form-input"' +
          '           placeholder="' + entry.defaultValue + '"' +
          '           value="' + inputValue + '">' + //REMOVE THE SAMPLE VALUE THEN REPLACE WITH inputValue
          '    <span class="input-group-addon form-input form-input-addon">' + entry.addon + '</span>' +
          '    <span class="input-group-addon form-input form-input-addon form-input-clear">' +
          '      <img src="icons/close.svg" class="form-input-clear-icon">' +
          '    </span>' +
          '  </div>' +
          '  <input id="' + entry.id + 'Slider"' +
          '         type="range"' +
          '         class="form-slider"' +
          '         min="' + entry.minValue + '"' +
          '         max="' + entry.maxValue + '"' +
          '         step="' + (entry.step || 1) + '"' +
          '         value="' + sliderValue + '">' +
          '</div>';

        if( group.name ){
          // $('#'+return_new_string + '> .the-forms').append(formInput);
          if( counter <= 1  ){
            $('#'+step_counter_1 + '> .the-forms').append(formInput);
          }else if( counter >= 1 && counter <= 2 ){
            $('#'+step_counter_2 + '> .the-forms').append(formInput);
          }else if( counter >= 4 && counter <= 6 ){
            $('#'+step_counter_3 + '> .the-forms').append(formInput);
          }else if( counter > 7 ){
            $('#'+step_counter_4 + '> .the-forms').append(formInput);
          }else{
            $('#'+return_new_string + '> .the-forms').append(formInput);
          }

        }else{
          groupElem.append(formInput);
        }

        util.setEventHandlers(entry, data);
      });
      

      

      
      counter++;
    })

    var counter_next = 2; 
    box_step_move.forEach(function (group, groupIndex) { 

      $('#'+group).addClass('counter_'+ counter_next );
      if (group) {
        if( $('#'+group + '> .the-forms .continue_next-step').length == 0 ){
          $('#'+group + '> .the-forms').append('<div class="continue-wrapper"><a href="#" class="continue-next-step action-not-ready" data-currentstep="'+counter_next+'" data-reportstatus=""><span>Continue</span> <i class="fa fa-long-arrow-right" aria-hidden="true"></i></a></div>');
        }

      }

      counter_next++;
    });

    $('#reset-btn').on('click', function () {
      util.resetForm(consolidateFormData(), data)
    })

    $(document).on('click','.continue-next-step',function(e){

      e.preventDefault();

      var current_step = $(this).data('currentstep');

      

      if( $(this).attr('data-reportstatus') == 'active'  ){
        onSubmitClick();
        showReport();
        
        $('.add-logo-leftflank').remove();
        if( $('.add-logo-leftflank').length == 0 ){
          $('.leftbar-flank').append('<div class="add-logo-leftflank"> <img src="../../imgs/hughesON.png"> </div>');
        }
      }

      if( current_step == 4 ){
          onSubmitClick();
          showReport();

          

          $('#turnover-report').css('display','flex');
          $('.add-logo-leftflank').remove();

          if( $('.add-logo-leftflank').length == 0 ){
            $('.leftbar-flank').append('<div class="add-logo-leftflank"> <img src="../../imgs/hughesON.png"> </div>');
          }
          
      }

    });

    $(document).on('click','.email-report',function(e){

      e.preventDefault();
      
      $('#client-info-modal-new').modal('show');
          

    });

    $('#submit-btn').on('click', onSubmitClick)

    if ($('#nav-full').is(':visible')) {
      prg.showPageInfo()
    }
  }

  // collapses formData into a single array (it's normally an array of objects that contain arrays),
  // allows the use of util functions
  function consolidateFormData() {
    return formData.reduce(function (acc, group) {
      return acc.concat(group.entries)
    }, [])
  }

  // show/hide help text
  function toggleHelp(groupIndex, entryIndex) {
    $('#helpText-' + groupIndex + '-' + entryIndex).toggle()
  }

  // called when the form submit button is clicked
  function onSubmitClick() {
    
    util.clearErrors(consolidateFormData())

    // if input valid then collect and format the data so that it's ready for email
    if (util.validateFormInput(consolidateFormData())) {
      util.collectFormInput(data, consolidateFormData())
      calcTurnoverLeakage()
      formatData()
      clientInfo.collectData(submitForm, 'turnover', formattedData)
    }
  }

  function submitForm() {
    util.removeEventHandlers()
    showReport()
    reportCreated = true
  }

  // calculate everything that shows up in the report
  function calcTurnoverLeakage() {
    calculations.lostProductivityPercent = data.lostProductivity / 100
    calculations.annualTurnoverRatePercent = data.annualTurnoverRate / 100

    //Turnover Calculations
    calculations.totalEmployees = data.totalStores * data.employeePerStore
    calculations.totalExitInterview = (data.exitInterviewTime * data.hourlyWage) + data.paperworkWage
    calculations.totalProductivityLoss = data.daysToReplace * data.hoursDaily * calculations.lostProductivityPercent * data.departEmployeeRate
    calculations.totalAdverstising = (data.daysAdvertise * data.pricePerDay) + data.internetCost + data.referralBonus
    calculations.totalResume = data.resumeReview * data.resumeHours * data.reviewerWage
    calculations.totalInterview = data.candidatesInterview * data.interviewees * data.interviewTime * data.intervieweesWage
    calculations.totalReference =  data.referenceCheck * data.references * data.referenceHours * data.referenceWage
    calculations.totalBackgroundCheck = data.backgroundCheck * data.candidatesCheck
    calculations.totalDrugScreen = data.drugScreening
    calculations.totalTraining = data.trainHours * data.trainWage
    calculations.totalMentoring = data.mentorHours * data.mentorWage
    //totals
    calculations.perEmployeeTurnover = (calculations.totalExitInterview + calculations.totalProductivityLoss + calculations.totalAdverstising +
                                       calculations.totalResume + calculations.totalInterview + calculations.totalReference +
                                       calculations.totalBackgroundCheck + calculations.totalDrugScreen + calculations.totalTraining +
                                       calculations.totalMentoring).toFixed(2)
    calculations.annualCostEmployeeTurnover = ((calculations.totalEmployees * calculations.annualTurnoverRatePercent) * calculations.perEmployeeTurnover).toFixed(2)
  }

  // add formatting to calculations, used in report and for emails
  function formatData() {
    formattedData.annualTurnoverCost = '$' + util.commaSeparateNumber(calculations.annualCostEmployeeTurnover)
    formattedData.perEmployeeTurnover = '$' + util.commaSeparateNumber(calculations.perEmployeeTurnover)
    formattedData.totalEmployees = util.commaSeparateNumber(calculations.totalEmployees)
    formattedData.annualTurnoverRate = data.annualTurnoverRate + '%'
    formattedData.exitInterview = '$' + calculations.totalExitInterview.toFixed(2)
    formattedData.productivityLoss = '$' + calculations.totalProductivityLoss.toFixed(2)
    formattedData.advertising = '$' + calculations.totalAdverstising.toFixed(2)
    formattedData.resumeResearch = '$' + calculations.totalResume.toFixed(2)
    formattedData.interviewing = '$' + calculations.totalInterview.toFixed(2)
    formattedData.referenceChecking = '$' + calculations.totalReference.toFixed(2)
    formattedData.backgroundChecks = '$' + calculations.totalBackgroundCheck.toFixed(2)
    formattedData.drugScreening = '$' + calculations.totalDrugScreen.toFixed(2)
    formattedData.training = '$' + calculations.totalTraining.toFixed(2)
    formattedData.mentoring = '$' + calculations.totalMentoring.toFixed(2)
  }

  function showReport() {
    // $('#form-content').html('')
    $('#form-footer').hide()
    $('#report-footer').show()
    prg.hidePageInfo()

    if (emailSent) {
      util.disableEmailReportBtn()
    } else {
      util.enableEmailReportBtn()
    }

    $('#annual-turnover-cost').html(formattedData.annualTurnoverCost)
    $('#per-employee-turnover-cost').html(formattedData.perEmployeeTurnover)
    $('#total-employees').html(formattedData.totalEmployees)
    $('#annual-turnover-rate').html(formattedData.annualTurnoverRate)
    $('#exit-interview').html(formattedData.exitInterview)
    $('#productivity-loss').html(formattedData.productivityLoss)
    $('.last-row-box span#advertising').html(formattedData.advertising)
    $('#resume-research').html(formattedData.resumeResearch)
    $('#interviewing').html(formattedData.interviewing)
    $('#reference-checking').html(formattedData.referenceChecking)
    $('#background-checks').html(formattedData.backgroundChecks)
    $('#drug-screening').html(formattedData.drugScreening)
    $('#training').html(formattedData.training)
    $('#mentoring').html(formattedData.mentoring)

    $('#turnover-report').show()
    $('#edit-btn').on('click', editForm)
    $('#turnover-menu-btn').addClass('report-created')

    // desktop mode
    if ($('#nav-full').is(':visible')) {
      $('#page-info-container').hide()
    }

    util.scrollToTop()
  }

  function editForm() {
    $('#turnover-report').hide()
    $('#form-footer').show()
    $('#report-footer').hide()
    showForm()
    util.scrollTo('#form-content')
  }

  // info text displayed for this page
  function getInfoText() {
    return util.welcome() +
      '<p>This tool will quickly and easily help your organization understand overall costs associated with employee turnover. ' +
      'To use this tool, please utilize the slider to match your organization\'s numbers or utilize the default values. ' +
      'Once completed, you can get results delivered both on screen and to your email.</p>' +
      '<p class="hint-text">* To expand your results, try the Sales Leakage Calculator, and then review your Value Leakage Summary for further insights.'
  }

  return {
    editForm: editForm,
    hide: hide,
    init: init,
    onSubmitClick: onSubmitClick,
    show: show,
    toggleHelp: toggleHelp,
    getInfoText: getInfoText,
    getCalculations: function () { return calculations },
    getData: function () { return data },
    getFormattedData: function () { return formattedData },
    getPageTitle: function () { return 'Employee Turnover Cost Calculator' },
    reportCreated: function () { return reportCreated },
    setEmailSent: function () { emailSent = true }
  }
})()
