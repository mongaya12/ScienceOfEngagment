var util = (function () {
  // remove any errors from a form
  function clearErrors(formData) {
    formData.forEach(function (entry) {
      $('#' + entry.id + 'Container').removeClass('has-error')
    })
  }

  // clear a single input to default
  function clearInput(id, data) {
    $('#' + id).prop('value', '')
    handleInputChange(id, data)
  }

  // collect user input from a form
  function collectFormInput(data, formData) {
    formData.forEach(function (entry) {
      var value = $('#' + entry.id).val()
      data[entry.id] = value ? parseFloat(value) : parseFloat(entry.defaultValue)
    })

    prg.syncSharedData(data, prg.getSharedData())
  }

  // add commas to long numbers
  function commaSeparateNumber(val){
    while (/(\d+)(\d{3})/.test(val.toString())){
      val = val.toString().replace(/(\d+)(\d{3})/, '$1'+','+'$2')
    }
    return val
  }

  function disableEmailReportBtn() {
    $('#email-report').prop('disabled', true)
  }

  function enableEmailReportBtn() {
    $('#email-report').prop('disabled', false)
  }

  // called when the value to an input field changes
  function handleInputChange(inputId, data) {
    var elem = $('#' + inputId)
    var value = elem.val()

    if (value) {
      data[inputId] = value
    } else {
      value = elem.attr('placeholder')
      data[inputId] = ''
    }

    $('#' + inputId + 'Slider').prop('value', value)
  }

  // called when the value of a slider changes
  function handleSliderChange(inputId, data) {
    var value = $('#' + inputId + 'Slider').val()
    $('#' + inputId).prop('value', value)
    data[inputId] = value
  }

  function hideHelp(id, text) {
    var label = $('div#' + id + 'Container > label.form-input-label')
    label.removeClass('help')

    var labelText = label.find('span.label-text')
    labelText.html(text)
  }

  function removeEventHandlers() {
    $('#edit-btn').off()
    $('#reset-btn').off()
    $('#submit-btn').off()
  }

  // reset a form to its default values
  function resetForm(formData, data) {
    formData.forEach(function (entry) {
      clearInput(entry.id, data)
    })
  }

  // scroll to a part of the page with the given id
  function scrollTo(id) {
    var top = $(id).offset().top
    var inputHeight = $('div#form-content .form-group').first().height()
    var navHeight = $('header > nav').height()
    $('html, body').animate({ scrollTop: top - (inputHeight + navHeight) })
  }

  // scroll to top of the page
  function scrollToTop() {
    $('html, body').animate({ scrollTop: 0 })
  }

  // add event handlers to the form input field
  function setEventHandlers(entry, data) {
    var elem = $('#' + entry.id)
    elem.on('input', function () {
      handleInputChange(entry.id, data)
    })

    var sliderElem = $('#' + entry.id + 'Slider')
    sliderElem.on('input', function () {
      handleSliderChange(entry.id, data)
    })

    var containerElem = $('#' + entry.id + 'Container')
    var clearInputElem = containerElem.find('img.form-input-clear-icon')
    clearInputElem.on('click', function () {
      clearInput(entry.id, data)
    })

    var infoElem = containerElem.find('.label-info-icon')

    if (entry.help) {
      infoElem.on('click', function () {
        showHelp(entry.id, entry.help)
      })

      containerElem.find('.label-collapse-icon').on('click', function () {
        hideHelp(entry.id, entry.name)
      })
    }
    else {
      infoElem.hide()
    }
  }

  // show help text
  function showHelp(id, text) {
    var label = $('div#' + id + 'Container > label.form-input-label')
    label.addClass('help')

    var labelText = label.find('span.label-text')
    labelText.html(text)
  }

  // show/hide the drop down menu
  function toggleMenu() {
    $('#menu').toggle()
  }

  // return true if all input valid, false otherwise
  // scrolls to and focuses the first invalid input, if any
  function validateFormInput(formData) {
    var allInputValid = true
    var firstError

    formData.forEach(function (entry) {
      var value = $('#' + entry.id).val() || entry.defaultValue

      if (!$.isNumeric(value) || value < 0) {
        allInputValid = false
        $('#' + entry.id + 'Container').addClass('has-error')

        if (!firstError) {
          firstError = entry.id
        }
      }
    })

    if (firstError) {
      scrollTo('#' + firstError)
      $('#' + firstError).focus()
    }

    return allInputValid
  }

  // return welcome text depending on whether in desktop mode or not
  function welcome() {
    if ($('#nav').is(':visible')) {
      return '<p>Welcome! To begin, follow the instructions below. To switch to the Employee Turnover Cost Calculator, please use the white arrow at right.</p>'
    } else {
      return '<p>Welcome! To begin, follow the instructions below.</p>'
    }
  }

  return {
    clearErrors: clearErrors,
    clearInput: clearInput,
    collectFormInput: collectFormInput,
    commaSeparateNumber: commaSeparateNumber,
    disableEmailReportBtn: disableEmailReportBtn,
    enableEmailReportBtn: enableEmailReportBtn,
    handleInputChange: handleInputChange,
    handleSliderChange: handleSliderChange,
    removeEventHandlers: removeEventHandlers,
    resetForm: resetForm,
    scrollTo: scrollTo,
    scrollToTop: scrollToTop,
    setEventHandlers: setEventHandlers,
    showHelp: showHelp,
    toggleMenu: toggleMenu,
    validateFormInput: validateFormInput,
    welcome: welcome
  }
})()