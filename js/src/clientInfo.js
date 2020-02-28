const clientInfo = (function () {
  var data = {}
  var hughesEmailData = {}
  var infoCollected = false
  var formData = [
    { id: 'name' },
    { id: 'company' },
    { id: 'email' },
    { id: 'phone' }
  ]

  // get the client's data to send emails and show reports
  function collectData(cb, reportType, reportData) {
    if (infoCollected) {
      cb()
    } else {
      showModal()

      hughesEmailData = {
        callback: cb,
        reportType: reportType,
        reportData: reportData
      }
    }
  }

  function closeModal() {
    $('#client-info-modal').modal('hide')
  }

  function showModal() {
    $('#client-info-modal').modal('show')
    $('input#name').focus()
  }

  function submitForm() {
    util.clearErrors(formData)

    if (validateFormInput()) {
      collectFormInput()
      sendHughesEmail()
    }
  }

  function validateFormInput() {
    var name = $('#name').val()
    var company = $('#company').val()
    var email = $('#email').val()

    var errors = []

    if (name === '') {
      errors.push('nameContainer')
    }

    if (company === '') {
      errors.push('companyContainer')
    }

    if (!/.+@.+\..+/.test(email)) {
      errors.push('emailContainer')
    }

    errors.forEach(function (id) {
      $('#' + id).addClass('has-error')
    })

    return errors.length === 0
  }

  function collectFormInput() {
    data.fname = $('#name').val()
    data.lname = $('#company').val()
    data.email = $('#email').val()
    data.phone = $('#phone').val()
  }

  // sends an email to the client using the website
  function sendClientEmail(reportType, view) {
    var reqBody = {
      clientData: data,
      recipient: 'client',
      reportType: reportType,
      reportData: view.getFormattedData()
    }

    sendEmail(reqBody, function (data) {
      console.log(data)
      view.setEmailSent()
      util.disableEmailReportBtn()
    })
  }

  // sends an email to hughes notifying that someone has created a report
  function sendHughesEmail() {
    var reqBody = {
      clientData: data,
      recipient: 'hughes',
      reportType: hughesEmailData.reportType,
      reportData: hughesEmailData.reportData
    }

    sendEmail(reqBody)

    hughesEmailData.callback()
    closeModal()
    infoCollected = true
  }

  function sendEmail(data, success) {
    success = success || function (data) { console.log(data); $('#client-info-modal-new').modal('hide');$('#client-info-modal-success').modal('show') }

    $.ajax({
      url: '/emailHandler.php',
      data: JSON.stringify(data),
      contentType: 'application/json; charset=utf-8',
      type: 'POST',
      success: success,
      error: function (request, status, error) {
        console.error(error)
      },
      
    })



  }

  return {
    collectData: collectData,
    sendClientEmail: sendClientEmail,
    submitForm: submitForm
  }
})()
