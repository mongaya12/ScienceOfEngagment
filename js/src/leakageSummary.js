const leakageSummary = (function () {
  var calculations = {}
  var data = {}
  var emailSent = false
  var formData = []
  var formattedData = {}
  var impactReportCreated = false
  var impactIndex = 0
  var riskIndex = 0

  // called on page load, fetches form data
  function init() {
    $.ajax({
      url: '/formData/leakageSummaryFormData.json',
      cache: false,
      dataType: 'json',
      success: function (data) {
        formData = data
      },
      error: function () {
        console.error('An error occurred fetching leakageSummaryFormData.json')
      }
    })
  }

  // called when leaving this view
  function hide() {
    $('#form-content').html('')
    $('#summary-report').hide()
    $('#impact-report').hide()
    $('#form-footer').show()
    $('#report-footer').hide()
    $('#summary-reports-container').width('auto')
  }

  // called when entering this view
  function show() {
    charts.clearChartsData()

    if (!salesLeakage.reportCreated() && !turnoverLeakage.reportCreated()) {
      var html =
        '<div class="col-xs-12 text-center inputContainer">' +
        '  To get the summary please fill out the forms on "Sales Leakage Calculator" and/or "Employee Turnover Cost Calculator"' +
        '</div>'

      $('#form-content').html(html)
      return
    }

    formatRiskData()
    var missingDataMessage = ''

    if (salesLeakage.reportCreated()) {
      showSalesSummary()
    } else {
      missingDataMessage = 'No Sales Leakage Data'
    }

    if (turnoverLeakage.reportCreated()) {
      showTurnoverSummary()
    } else {
      missingDataMessage = 'No Employee Turnover Data'
    }

    if (!impactReportCreated) {
      showForm()
    } else {
      showImpactReport()
    }

    if ($('#nav-full').is(':visible')) {
      $('#page-info-container').hide()
    }
  }

  function formatRiskData() {
    const salesCalculations = salesLeakage.getCalculations()
    const turnoverCalculations = turnoverLeakage.getCalculations()

    if (salesLeakage.reportCreated()) {
      var totalValueSales = salesCalculations.unconvertedSales + salesCalculations.unconvertedReturnsSales + salesCalculations.oosSales + salesCalculations.shrinkageSales +
        salesCalculations.churnSales + salesCalculations.poorKnowledgeSales

      var totalValueProfit = salesCalculations.unconvertedSalesNet + salesCalculations.unconvertedReturnsNet + salesCalculations.oosSalesNet + salesCalculations.shrinkageNet +
        salesCalculations.churnNet + salesCalculations.poorKnowledgeNet

      if (turnoverLeakage.reportCreated()) {
        totalValueProfit += Math.round(turnoverCalculations.annualCostEmployeeTurnover)
      }

      formattedData.riskTotalSales = '$' + util.commaSeparateNumber(Math.round(totalValueSales))
      formattedData.riskTotalProfit = '$' + util.commaSeparateNumber(Math.round(totalValueProfit))

      formattedData.sliderLabels = ['Unconverted Sales', 'Unconverted Returns', 'Lost Sales, OOS', 'Shrinkage', 'Lost Sales, Churn', 'Lost Sales, Poor Knowledge']
      formattedData.riskSales = ['$' + util.commaSeparateNumber(Math.round(salesCalculations.unconvertedSales)),
        '$' + util.commaSeparateNumber(Math.round(salesCalculations.unconvertedReturnsSales)),
        '$' + util.commaSeparateNumber(Math.round(salesCalculations.oosSales)),
        '$' + util.commaSeparateNumber(Math.round(salesCalculations.shrinkageSales)),
        '$' + util.commaSeparateNumber(Math.round(salesCalculations.churnSales)),
        '$' + util.commaSeparateNumber(Math.round(salesCalculations.poorKnowledgeSales))]
      formattedData.riskNetIncome = ['$' + util.commaSeparateNumber(Math.round(salesCalculations.unconvertedSalesNet)),
        '$' + util.commaSeparateNumber(Math.round(salesCalculations.unconvertedReturnsNet)),
        '$' + util.commaSeparateNumber(Math.round(salesCalculations.oosSalesNet)),
        '$' + util.commaSeparateNumber(Math.round(salesCalculations.shrinkageNet)),
        '$' + util.commaSeparateNumber(Math.round(salesCalculations.churnNet)),
        '$' + util.commaSeparateNumber(Math.round(salesCalculations.poorKnowledgeNet))]
    } else {
      formattedData.riskTotalSales = 'No Data'
      formattedData.riskTotalProfit = 'No Data'
      formattedData.sliderLabels = ['','','','','','']
      formattedData.riskSales = ['No Data','No Data','No Data','No Data','No Data','No Data']
      formattedData.riskNetIncome = ['No Data','No Data','No Data','No Data','No Data','No Data']
    }

    if (turnoverLeakage.reportCreated()) {
      formattedData.riskEmployeeTurnover = '$' + util.commaSeparateNumber(Math.round(turnoverLeakage.getCalculations().annualCostEmployeeTurnover))

      if (!salesLeakage.reportCreated()) {
        totalValueProfit = Math.round(turnoverCalculations.annualCostEmployeeTurnover)
        formattedData.riskTotalProfit = '$' + util.commaSeparateNumber(Math.round(totalValueProfit))
      }
    } else {
      formattedData.riskEmployeeTurnover = 'No Data'
    }
  }

  function showSalesSummary() {
    $('#risk-total-sales').html(formattedData.riskTotalSales)
    $('#risk-total-profit').html(formattedData.riskTotalProfit)

    var riskSlider = $('#risk-slider')

    riskSlider.on('input', function () {
      riskIndex = riskSlider.val()
      $('#risk-label').html(formattedData.sliderLabels[riskIndex])
      $('#risk-sales').html(formattedData.riskSales[riskIndex])
      $('#risk-net-income').html(formattedData.riskNetIncome[riskIndex])
    })

    // load initial values
    riskSlider.trigger('input')

    $('#summary-report').show()
  }

  function showTurnoverSummary() {
    $('#risk-total-profit').html(formattedData.riskTotalProfit)
    $('#risk-employee-turnover').html(formattedData.riskEmployeeTurnover)

    $('#summary-report').show()
  }

  function showForm() {
    var formContent = $('#form-content')

    formContent.append('<h3>Impact Percentage</h3>')

    formData.forEach(function (entry) {
      var inputValue = data[entry.id] || ''
      var sliderValue = inputValue || entry.defaultValue

      var formInput =
        '<div id="' + entry.id + 'Container" class="form-group">' +
        '  <label class="form-input-label">' +
        '    <span class="label-text">' + entry.name + '</span>' +
        '    <span class="label-info-icon"></span>' +
        '    <img src="icons/arrow-right.svg" class="label-collapse-icon">' +
        '  </label>' +
        '  <div class="input-group">' +
        '    <input id="' + entry.id + '"' +
        '           type="text"' +
        '           class="form-control form-input"' +
        '           placeholder="' + entry.defaultValue + '"' +
        '           value="' + inputValue + '">' +
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
        '         value="' + sliderValue + '">' +
        '</div>'

      formContent.append(formInput)

      util.setEventHandlers(entry, data)
    })

    $('#reset-btn').on('click', function () {
      util.resetForm(formData, data)
    })

    $('#submit-btn').on('click', submitForm)
  }

  function submitForm() {
    util.clearErrors(formData)

    if (util.validateFormInput(formData)) {
      util.collectFormInput(data, formData)
      util.removeEventHandlers()
      showImpactReport()

      impactReportCreated = true
    }
  }

  function calcHypothesizedImpact() {
    if (salesLeakage.reportCreated()) {
      var salesCalculations = salesLeakage.getCalculations()

      //impact sales
      calculations.impactSales = (data.impactSales / 100) * salesCalculations.unconvertedSales
      calculations.impactReturns = (data.impactReturns / 100) * salesCalculations.unconvertedReturnsSales
      calculations.impactOos = (data.impactOos / 100) * salesCalculations.oosSales
      calculations.impactShrinkage = (data.impactShrinkage / 100) * salesCalculations.shrinkageSales
      calculations.impactChurn = (data.impactChurn / 100) * salesCalculations.churnSales
      calculations.impactKnowledge = (data.impactKnowledge / 100) * salesCalculations.poorKnowledgeSales

      //impact net
      calculations.impactSalesNet = (data.impactSales / 100) * salesCalculations.unconvertedSalesNet
      calculations.impactReturnsNet = (data.impactReturns / 100) * salesCalculations.unconvertedReturnsNet
      calculations.impactOosNet = (data.impactOos / 100) * salesCalculations.oosSalesNet
      calculations.impactShrinkageNet = (data.impactShrinkage / 100) * salesCalculations.shrinkageNet
      calculations.impactChurnNet = (data.impactChurn / 100) * salesCalculations.churnNet
      calculations.impactKnowledgeNet = (data.impactKnowledge / 100) * salesCalculations.poorKnowledgeNet

      calculations.totalImpactSales = calculations.impactSales + calculations.impactReturns + calculations.impactOos + calculations.impactShrinkage +
                                      calculations.impactChurn + calculations.impactKnowledge
      calculations.totalImpactProfit = calculations.impactSalesNet + calculations.impactReturnsNet + calculations.impactOosNet + calculations.impactShrinkageNet +
                                       calculations.impactChurnNet + calculations.impactKnowledgeNet
    }

    if(turnoverLeakage.reportCreated()) {
      calculations.impactTurnover = (data.impactTurnover / 100) * turnoverLeakage.getCalculations().annualCostEmployeeTurnover

      if (salesLeakage.reportCreated()) {
        calculations.totalImpactProfit += calculations.impactTurnover
      } else {
        calculations.totalImpactProfit = calculations.impactTurnover
      }
    }
  }

  function formatImpactData() {
    formattedData.impactTotalProfit = '$' + util.commaSeparateNumber(Math.round(calculations.totalImpactProfit))

    if (salesLeakage.reportCreated()) {
      var salesCalculations = salesLeakage.getCalculations()

      formattedData.impactTotalSales = '$' + util.commaSeparateNumber(Math.round(calculations.totalImpactSales))
      formattedData.impactSales = ['$' + util.commaSeparateNumber(Math.round(calculations.impactSales)),
                                   '$' + util.commaSeparateNumber(Math.round(calculations.impactReturns)),
                                   '$' + util.commaSeparateNumber(Math.round(calculations.impactOos)),
                                   '$' + util.commaSeparateNumber(Math.round(calculations.impactShrinkage)),
                                   '$' + util.commaSeparateNumber(Math.round(calculations.impactChurn)),
                                   '$' + util.commaSeparateNumber(Math.round(calculations.impactKnowledge))]
      formattedData.impactNetIncome = ['$' + util.commaSeparateNumber(Math.round(calculations.impactSalesNet)),
                                       '$' + util.commaSeparateNumber(Math.round(calculations.impactReturnsNet)),
                                       '$' + util.commaSeparateNumber(Math.round(calculations.impactOosNet)),
                                       '$' + util.commaSeparateNumber(Math.round(calculations.impactShrinkageNet)),
                                       '$' + util.commaSeparateNumber(Math.round(calculations.impactChurnNet)),
                                       '$' + util.commaSeparateNumber(Math.round(calculations.impactKnowledgeNet))]
    } else {

      formattedData.impactTotalSales = 'No Data'
      formattedData.impactSales = ['No Data','No Data','No Data','No Data','No Data','No Data']
      formattedData.impactNetIncome = ['No Data','No Data','No Data','No Data','No Data','No Data']
    }

    if (turnoverLeakage.reportCreated()) {
      formattedData.impactEmployeeTurnover = '$' + util.commaSeparateNumber(Math.round(calculations.impactTurnover))
    } else {
      formattedData.impactEmployeeTurnover = 'No Data'
    }
  }

  function showImpactReport() {
    calcHypothesizedImpact()
    formatImpactData()

    $('#form-content').html('')
    $('#form-footer').hide()
    $('#report-footer').show()
    prg.hidePageInfo()

    if (emailSent) {
      util.disableEmailReportBtn()
    } else {
      util.enableEmailReportBtn()
    }

    $('#impact-total-profit').html(formattedData.impactTotalProfit)

    if (salesLeakage.reportCreated()) {
      $('#impact-total-sales').html(formattedData.impactTotalSales)

      var impactSlider = $('#impact-slider')

      impactSlider.on('input', function () {
        impactIndex = impactSlider.val()
        $('#impact-label').html(formattedData.sliderLabels[impactIndex])
        $('#impact-sales').html(formattedData.impactSales[impactIndex])
        $('#impact-net-income').html(formattedData.impactNetIncome[impactIndex])
      })

      // load initial values
      impactSlider.trigger('input')
    }

    if (calculations.impactTurnover) {
      $('#impact-employee-turnover').html(formattedData.impactEmployeeTurnover)
    }

    $('#impact-report').show()
    $('#edit-btn').on('click', editForm)
    $('#summary-menu-btn').addClass('report-created')

    $('#summary-reports-container').width('inherit')
  }

  function editForm() {
    $('#impact-report').hide()
    $('#form-footer').show()
    $('#report-footer').hide()
    $('#summary-reports-container').width('auto')
    showForm()
    util.scrollTo('#form-content')
  }

  return {
    editForm: editForm,
    hide: hide,
    init: init,
    show: show,
    submitForm: submitForm,
    getCalculations: function () { return calculations },
    getFormattedData: function () { return formattedData },
    getData: function () { return data },
    getInfoText: function () { return '' },
    getPageTitle: function () { return 'Value Leakage Summary' },
    setEmailSent: function () { emailSent = true }
  }
})()
