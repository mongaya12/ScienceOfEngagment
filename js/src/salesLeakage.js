var salesLeakage = (function () {
  var barGraphHeight = 150
  var calculations = {}
  var data = {}
  var emailSent = false
  var formData = []
  var formattedData = {}
  var lcIndex = 0
  var reportCreated = false
  var savedInput = {}
  var uvIndex = 0

  // called on page load, fetches form data
  function init() {
    $.ajax({
      url: '/formData/salesLeakageFormData.json',
      cache: false,
      dataType: 'json',
      success: function (data) {
        formData = prg.getSharedFormData().concat(data)
        prg.viewReady('sales')
      },
      error: function () {
        console.error('An error occurred fetching salesLeakageFormData.json')
      }
    })
  }

  // called when leaving this view
  function hide() {
    $('#form-content').html('')
    $('#sales-report').hide()
    $('#form-footer').show()
    $('#report-footer').hide()
  }

  // called when entering this view
  function show() {
    if (!reportCreated) {
      showForm()
    } else {
      showReport()
    }
  }

  // populates form with formData
  function showForm() {
    var formContent = $('#form-content')

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

    $('#submit-btn').on('click', onSubmitClick)

    if ($('#nav-full').is(':visible')) {
      prg.showPageInfo()
    }
  }

  // called when the form submit button is clicked
  function onSubmitClick() {
    util.clearErrors(formData)

    if (util.validateFormInput(formData)) {
      util.collectFormInput(data, formData)
      calcSalesLeakage()
      formatData()
      clientInfo.collectData(submitForm, 'sales', formattedData)
    }
  }

  function submitForm() {
    util.removeEventHandlers()
    charts.clearChartsData()
    showReport()
    reportCreated = true
  }

  // calculate everything that shows up in the report
  function calcSalesLeakage() {
    var avgConversionRatePercent = data.avgConversionRate / 100
    var avgIncreaseLoyaltyTransactionsPercent = data.avgIncreaseLoyaltyTransactions / 100
    var percentVisitorsLoyaltyMembersPercent = data.percentVisitorsLoyaltyMembers / 100
    var percentCustomerChurnRate = data.financeCustomerChurnRate / 100
    var percentEmployeesKnowledgeablePercent = data.percentEmployeesKnowledgeable / 100
    var percentFinanceUptickInRevenue = data.financeUptickInRevenue / 100
    var percentFinancePercentRevenueEcommerce = data.financePercentRevenueEcommerce / 100
    var percentLostToReturns = data.financeCostReturnedMerchandise / 100
    var percentLostToOutOfStock = data.financeSalesLostToOutOfStock / 100

    calculations.B36 = ((data.financeAnnualRevenue - (data.financeAnnualRevenue - data.financeNetIncome))/data.financeAnnualRevenue)
    calculations.B39 = data.financeAnnualRevenue * percentFinancePercentRevenueEcommerce
    calculations.B37 = data.financeAnnualRevenue - calculations.B39
    calculations.B44 = data.avgCustomersDay * avgConversionRatePercent
    calculations.B19 = data.totalStores * data.employeePerStore
    calculations.B47 = calculations.B37 / calculations.B19

    //calculations for unconverted visitors --
    //per store --
    //sales
    calculations.unconvertedVisitors = Math.round(data.avgCustomersDay * (1 - avgConversionRatePercent))
    calculations.avgTransactionValueSales = data.financeAnnualRevenue / (calculations.B44 * data.totalStores * (52 * data.daysOpen))
    calculations.dailySalesStore = calculations.unconvertedVisitors * calculations.avgTransactionValueSales
    calculations.weeklySalesStore = calculations.dailySalesStore * data.daysOpen
    calculations.monthlySalesStore = (calculations.weeklySalesStore * 52) / 12
    calculations.quarterlySalesStore = calculations.monthlySalesStore * 3
    calculations.annualySalesStore = calculations.weeklySalesStore * 52
    //net income
    calculations.avgTransactionValueNet = calculations.avgTransactionValueSales * calculations.B36
    calculations.dailySalesNet = calculations.dailySalesStore * calculations.B36
    calculations.weeklySalesNet = calculations.weeklySalesStore * calculations.B36
    calculations.monthlySalesNet = calculations.monthlySalesStore * calculations.B36
    calculations.quarterlySalesNet = calculations.quarterlySalesStore * calculations.B36
    calculations.annualySalesNet = calculations.annualySalesStore * calculations.B36

    //for chain --
    //sales
    calculations.unconvertedVisitorsChain = calculations.unconvertedVisitors * data.totalStores
    calculations.dailySalesChain = calculations.dailySalesStore * data.totalStores
    calculations.weeklySalesChain = calculations.weeklySalesStore * data.totalStores
    calculations.monthlySalesChain = calculations.monthlySalesStore * data.totalStores
    calculations.quarterlySalesChain = calculations.quarterlySalesStore * data.totalStores
    calculations.annualySalesChain = calculations.annualySalesStore * data.totalStores
    //net income
    calculations.dailyNetChain = calculations.dailySalesNet * data.totalStores
    calculations.weeklyNetChain = calculations.weeklySalesNet * data.totalStores
    calculations.monthlyNetChain = calculations.monthlySalesNet * data.totalStores
    calculations.quarterlyNetChain = calculations.quarterlySalesNet * data.totalStores
    calculations.annualyNetChain = calculations.annualySalesNet * data.totalStores

    //graph3 calculations
    calculations.returnsCostRevenue = data.financeAnnualRevenue * percentLostToReturns
    calculations.returnsCostNet = data.financeNetIncome * percentLostToReturns
    calculations.outStockCostRevenue = data.financeAnnualRevenue * percentLostToOutOfStock
    calculations.outStockCostNet = data.financeNetIncome * percentLostToOutOfStock
    calculations.avgShrinkage = data.financeShrinkReserve / data.financeAnnualRevenue
    calculations.shrinkageLostRevenue = data.financeAnnualRevenue * calculations.avgShrinkage
    calculations.shrinkageLostNet = data.financeNetIncome * calculations.avgShrinkage

    //graph4 calculations
    //store
    //sales
    calculations.loyaltyMemberVisits = data.avgCustomersDay * percentVisitorsLoyaltyMembersPercent
    calculations.loyaltyPurchaseValue = calculations.avgTransactionValueSales * (1 + avgIncreaseLoyaltyTransactionsPercent)
    calculations.loyaltyDailyChurnLost = (calculations.loyaltyMemberVisits * percentCustomerChurnRate) * calculations.loyaltyPurchaseValue
    calculations.loyaltyWeeklyChurnLost = calculations.loyaltyDailyChurnLost * data.daysOpen
    calculations.loyaltyAnnualChurnLost = calculations.loyaltyWeeklyChurnLost * 52
    //net income
    calculations.loyaltyPurchaseValueNet = calculations.loyaltyPurchaseValue * calculations.B36
    calculations.loyaltyDailyChurnLostNet = calculations.loyaltyDailyChurnLost * calculations.B36
    calculations.loyaltyWeeklyChurnLostNet = calculations.loyaltyWeeklyChurnLost * calculations.B36
    calculations.loyaltyAnnualChurnLostNet = calculations.loyaltyAnnualChurnLost * calculations.B36

    //graph5 calculations
    //chain
    //sales
    calculations.loyaltyMemberVisitsChain = calculations.loyaltyMemberVisits * data.totalStores
    calculations.loyaltyPurchaseValueChain = calculations.loyaltyPurchaseValue * data.totalStores
    calculations.loyaltyDailyChurnLostChain = calculations.loyaltyDailyChurnLost * data.totalStores
    calculations.loyaltyWeeklyChurnLostChain = calculations.loyaltyWeeklyChurnLost * data.totalStores
    calculations.loyaltyAnnualChurnLostChain = calculations.loyaltyAnnualChurnLost * data.totalStores
    //net income
    calculations.loyaltyPurchaseValueNetChain = calculations.loyaltyPurchaseValueNet * data.totalStores
    calculations.loyaltyDailyChurnLostNetChain = calculations.loyaltyDailyChurnLostNet * data.totalStores
    calculations.loyaltyWeeklyChurnLostNetChain = calculations.loyaltyWeeklyChurnLostNet * data.totalStores
    calculations.loyaltyAnnualChurnLostNetChain = calculations.loyaltyAnnualChurnLostNet * data.totalStores

    //graph6 Calculations
    //var totalStoreEmployees = totalStores * employeePerStore
    calculations.annualRevenuePerEmployee = calculations.B47
    calculations.potentialRevenuePerEmployee = calculations.B47 * percentFinanceUptickInRevenue
    calculations.totalPotentialRevenueSales = calculations.potentialRevenuePerEmployee * calculations.B19 * (1 - percentEmployeesKnowledgeablePercent)
    calculations.totalPotentialRevenueNet = calculations.totalPotentialRevenueSales * calculations.B36

    calculations.unconvertedSales = calculations.annualySalesChain
    calculations.unconvertedSalesNet = calculations.annualyNetChain
    calculations.unconvertedReturnsSales = calculations.returnsCostRevenue
    calculations.unconvertedReturnsNet = calculations.returnsCostNet
    calculations.oosSales = calculations.outStockCostRevenue
    calculations.oosSalesNet = calculations.outStockCostNet
    calculations.shrinkageSales = calculations.shrinkageLostRevenue
    calculations.shrinkageNet = calculations.shrinkageLostNet
    calculations.churnSales = calculations.loyaltyAnnualChurnLostChain
    calculations.churnNet = calculations.loyaltyAnnualChurnLostNetChain
    calculations.poorKnowledgeSales = calculations.totalPotentialRevenueSales
    calculations.poorKnowledgeNet = calculations.totalPotentialRevenueNet
  }

  // format data for the report and for emails
  function formatData() {
    formattedData.annualSalesRevenue = '$' + util.commaSeparateNumber(Math.round(data.financeAnnualRevenue))
    formattedData.annualNetIncome = '$' + util.commaSeparateNumber(Math.round(data.financeNetIncome))

    // RETURNED MERCHANDISE
    var rmSales = Math.round(calculations.returnsCostRevenue)
    var rmNetIncome = Math.round(calculations.returnsCostNet)
    var rmSalesHeight, rmNetIncomeHeight

    if (rmSales > rmNetIncome) {
      rmSalesHeight = barGraphHeight
      rmNetIncomeHeight = (rmNetIncome / rmSales) * barGraphHeight
    } else {
      rmSalesHeight = (rmSales / rmNetIncome) * barGraphHeight
      rmNetIncomeHeight = barGraphHeight
    }

    formattedData.rmSales = '$' + util.commaSeparateNumber(rmSales)
    formattedData.rmSalesHeight = rmSalesHeight
    formattedData.rmNetIncome = '$' + util.commaSeparateNumber(rmNetIncome)
    formattedData.rmNetIncomeHeight = rmNetIncomeHeight
    formattedData.lostToReturns = data.financeCostReturnedMerchandise + '%'

    // OUT OF STOCK SITUATION
    var oosSales = Math.round(calculations.outStockCostRevenue)
    var oosNetIncome = Math.round(calculations.outStockCostNet)
    var oosSalesHeight, oosNetIncomeHeight

    if (oosSales > oosNetIncome) {
      oosSalesHeight = barGraphHeight
      oosNetIncomeHeight = (oosNetIncome / oosSales) * barGraphHeight
    } else {
      oosSalesHeight = (oosSales / oosNetIncome) * barGraphHeight
      oosNetIncomeHeight = barGraphHeight
    }

    formattedData.oosSales = '$' + util.commaSeparateNumber(oosSales)
    formattedData.oosSalesHeight = oosSalesHeight
    formattedData.oosNetIncome = '$' + util.commaSeparateNumber(oosNetIncome)
    formattedData.oosNetIncomeHeight = oosNetIncomeHeight
    formattedData.lostToOOS = data.financeSalesLostToOutOfStock + '%'

    // SHRINKAGE
    var shrinkageSales = Math.round(calculations.shrinkageLostRevenue)
    var shrinkageNetIncome = Math.round(calculations.shrinkageLostNet)
    var shrinkageSalesHeight, shrinkageNetIncomeHeight

    if (shrinkageSales > shrinkageNetIncome) {
      shrinkageSalesHeight = barGraphHeight
      shrinkageNetIncomeHeight = (shrinkageNetIncome / shrinkageSales) * barGraphHeight
    } else {
      shrinkageSalesHeight = (shrinkageSales / shrinkageNetIncome) * barGraphHeight
      shrinkageNetIncomeHeight = barGraphHeight
    }

    formattedData.shrinkageSales = '$' + util.commaSeparateNumber(shrinkageSales)
    formattedData.shrinkageSalesHeight = shrinkageSalesHeight
    formattedData.shrinkageNetIncome = '$' + util.commaSeparateNumber(shrinkageNetIncome)
    formattedData.shrinkageNetIncomeHeight = shrinkageNetIncomeHeight
    formattedData.lostToShrinkage = (calculations.avgShrinkage * 100).toFixed(2) + '%'

    // UNCONVERTED VISITORS
    formattedData.uvTimePeriods = ['Additional Annual Sales Opportunity', 'Quarterly Sales Opportunity', 'Monthly Sales Opportunity', 'Weekly Sales Opportunity',
      'Daily Sales Opportunity']

    formattedData.uvStore = util.commaSeparateNumber(calculations.unconvertedVisitors)
    formattedData.uvSalesStore = ['$' + util.commaSeparateNumber(Math.round(calculations.annualySalesStore)),
      '$' + util.commaSeparateNumber(calculations.quarterlySalesStore.toFixed(2)),
      '$' + util.commaSeparateNumber(calculations.monthlySalesStore.toFixed(2)),
      '$' + util.commaSeparateNumber(calculations.weeklySalesStore.toFixed(2)),
      '$' + util.commaSeparateNumber(calculations.dailySalesStore.toFixed(2))]
    formattedData.uvNetIncomeStore = ['$' + util.commaSeparateNumber(Math.round(calculations.annualySalesNet)),
      '$' + util.commaSeparateNumber(calculations.quarterlySalesNet.toFixed(2)),
      '$' + util.commaSeparateNumber(calculations.monthlySalesNet.toFixed(2)),
      '$' + util.commaSeparateNumber(calculations.weeklySalesNet.toFixed(2)),
      '$' + util.commaSeparateNumber(calculations.dailySalesNet.toFixed(2))]

    formattedData.uvChain = util.commaSeparateNumber(calculations.unconvertedVisitorsChain)
    formattedData.uvSalesChain = ['$' + util.commaSeparateNumber(Math.round(calculations.annualySalesChain)),
      '$' + util.commaSeparateNumber(calculations.quarterlySalesChain.toFixed(2)),
      '$' + util.commaSeparateNumber(calculations.monthlySalesChain.toFixed(2)),
      '$' + util.commaSeparateNumber(calculations.weeklySalesChain.toFixed(2)),
      '$' + util.commaSeparateNumber(calculations.dailySalesChain.toFixed(2))]
    formattedData.uvNetIncomeChain = ['$' + util.commaSeparateNumber(Math.round(calculations.annualyNetChain)),
      '$' + util.commaSeparateNumber(calculations.quarterlyNetChain.toFixed(2)),
      '$' + util.commaSeparateNumber(calculations.monthlyNetChain.toFixed(2)),
      '$' + util.commaSeparateNumber(calculations.weeklyNetChain.toFixed(2)),
      '$' + util.commaSeparateNumber(calculations.dailyNetChain.toFixed(2))]

    // LOYALTY CHURN
    formattedData.lcTimePeriods = ['Annual Loyalty Revenue Lost to Churn', 'Weekly Loyalty Revenue Lost', 'Daily Loyalty Revenue Lost',
      'Avg. Loyalty Member Purchase Value']

    formattedData.lcVisitsStore = util.commaSeparateNumber(Math.round(calculations.loyaltyMemberVisits))
    formattedData.lcSalesStore = ['$' + util.commaSeparateNumber(Math.round(calculations.loyaltyAnnualChurnLost)),
      '$' + util.commaSeparateNumber(calculations.loyaltyWeeklyChurnLost.toFixed(2)),
      '$' + util.commaSeparateNumber(calculations.loyaltyDailyChurnLost.toFixed(2)),
      '$' + util.commaSeparateNumber(calculations.loyaltyPurchaseValue.toFixed(2))]
    formattedData.lcNetIncomeStore = ['$' + util.commaSeparateNumber(Math.round(calculations.loyaltyAnnualChurnLostNet)),
      '$' + util.commaSeparateNumber(calculations.loyaltyWeeklyChurnLostNet.toFixed(2)),
      '$' + util.commaSeparateNumber(calculations.loyaltyDailyChurnLostNet.toFixed(2)),
      '$' + util.commaSeparateNumber(calculations.loyaltyPurchaseValueNet.toFixed(2))]

    formattedData.lcVisitsChain = util.commaSeparateNumber(Math.round(calculations.loyaltyMemberVisitsChain))
    formattedData.lcSalesChain = ['$' + util.commaSeparateNumber(Math.round(calculations.loyaltyAnnualChurnLostChain)),
      '$' + util.commaSeparateNumber(calculations.loyaltyWeeklyChurnLostChain.toFixed(2)),
      '$' + util.commaSeparateNumber(calculations.loyaltyDailyChurnLostChain.toFixed(2)),
      '$' + util.commaSeparateNumber(calculations.loyaltyPurchaseValueChain.toFixed(2))]
    formattedData.lcNetIncomeChain = ['$' + util.commaSeparateNumber(Math.round(calculations.loyaltyAnnualChurnLostNetChain)),
      '$' + util.commaSeparateNumber(calculations.loyaltyWeeklyChurnLostNetChain.toFixed(2)),
      '$' + util.commaSeparateNumber(calculations.loyaltyDailyChurnLostNetChain.toFixed(2)),
      '$' + util.commaSeparateNumber(calculations.loyaltyPurchaseValueNetChain.toFixed(2))]

    // DISENGAGED EMPLOYEES
    formattedData.uptick = data.financeUptickInRevenue + '%'
    formattedData.numEmployees = util.commaSeparateNumber(Math.round(calculations.B19))
    formattedData.deReturnedMerchandise = '$' + util.commaSeparateNumber(Math.round(calculations.annualRevenuePerEmployee))
    formattedData.deOOS = '$' + util.commaSeparateNumber(Math.round(calculations.potentialRevenuePerEmployee))

    var deSales = Math.round(calculations.totalPotentialRevenueSales)
    var deNetIncome = Math.round(calculations.totalPotentialRevenueNet)
    var deSalesHeight, deNetIncomeHeight

    if (deSales > deNetIncome) {
      deSalesHeight = barGraphHeight
      deNetIncomeHeight = (deNetIncome / deSales) * barGraphHeight
    } else {
      deSalesHeight = (deSales / deNetIncome) * barGraphHeight
      deNetIncomeHeight = barGraphHeight
    }

    formattedData.potentialRevenueSales = '$' + util.commaSeparateNumber(deSales)
    formattedData.deSalesHeight = deSalesHeight
    formattedData.potentialRevenueNetIncome = '$' + util.commaSeparateNumber(deNetIncome)
    formattedData.deNetIncomeHeight = deNetIncomeHeight
  }

  function showReport() {
    $('#form-content').html('')
    $('#form-footer').hide()
    $('#report-footer').show()
    prg.hidePageInfo()

    if (emailSent) {
      util.disableEmailReportBtn()
    } else {
      util.enableEmailReportBtn()
    }

    $('#annual-sales-revenue').html(formattedData.annualSalesRevenue)
    $('#annual-net-income').html(formattedData.annualNetIncome)

    // RETURNED MERCHANDISE BAR GRAPHS
    $('#rm-sales').html(formattedData.rmSales)
    $('div#returned-merchandise .bar-graph-left').height(formattedData.rmSalesHeight)
    $('#rm-net-income').html(formattedData.rmNetIncome)
    $('div#returned-merchandise .bar-graph-right').height(formattedData.rmNetIncomeHeight)
    $('#lost-to-returns').html(formattedData.lostToReturns)

    // OUT OF STOCK SITUATION BAR GRAPHS
    $('#oos-sales').html(formattedData.oosSales)
    $('div#out-of-stock .bar-graph-left').height(formattedData.oosSalesHeight)
    $('#oos-net-income').html(formattedData.oosNetIncome)
    $('div#out-of-stock .bar-graph-right').height(formattedData.oosNetIncomeHeight)
    $('#lost-to-out-of-stock').html(formattedData.lostToOOS)

    // SHRINKAGE BAR GRAPHS
    $('#shrinkage-sales').html(formattedData.shrinkageSales)
    $('div#shrinkage .bar-graph-left').height(formattedData.shrinkageSalesHeight)
    $('#shrinkage-net-income').html(formattedData.shrinkageNetIncome)
    $('div#shrinkage .bar-graph-right').height(formattedData.shrinkageNetIncomeHeight)
    $('#lost-to-shrinkage').html(formattedData.lostToShrinkage)

    // UNCONVERTED VISITORS
    var uvCurTab = [formattedData.uvSalesStore, formattedData.uvNetIncomeStore]

    $('#unconverted-visitors-value').html(formattedData.uvStore)
    $('#uv-time-period').html(formattedData.uvTimePeriods[uvIndex])
    $('#uv-sales').html(formattedData.uvSalesStore[uvIndex])
    $('#uv-net-income').html(formattedData.uvNetIncomeStore[uvIndex])

    $('#uv-chain-tab').click(function () {
      $('#uv-chain-tab').addClass('active')
      $('#uv-store-tab').removeClass('active')
      $('#unconverted-visitors-value').html(formattedData.uvChain)
      $('#uv-sales').html(formattedData.uvSalesChain[uvIndex])
      $('#uv-net-income').html(formattedData.uvNetIncomeChain[uvIndex])
      uvCurTab = [formattedData.uvSalesChain, formattedData.uvNetIncomeChain]
    })

    $('#uv-store-tab').click(function () {
      $('#uv-chain-tab').removeClass('active')
      $('#uv-store-tab').addClass('active')
      $('#unconverted-visitors-value').html(formattedData.uvStore)
      $('#uv-sales').html(formattedData.uvSalesStore[uvIndex])
      $('#uv-net-income').html(formattedData.uvNetIncomeStore[uvIndex])
      uvCurTab = [formattedData.uvSalesStore, formattedData.uvNetIncomeStore]
    })

    $('#uv-slider').on('input', function () {
      uvIndex = $('#uv-slider').val()
      $('#uv-time-period').html(formattedData.uvTimePeriods[uvIndex])
      $('#uv-sales').html(uvCurTab[0][uvIndex])
      $('#uv-net-income').html(uvCurTab[1][uvIndex])
    })

    // LOYALTY CHURN
    var lcCurTab = [formattedData.lcSalesStore, formattedData.lcNetIncomeStore]

    $('#loyalty-visits').html(formattedData.lcVisitsStore)
    $('#lc-time-period').html(formattedData.lcTimePeriods[lcIndex])
    $('#lc-sales').html(formattedData.lcSalesStore[lcIndex])
    $('#lc-net-income').html(formattedData.lcNetIncomeStore[lcIndex])

    $('#lc-chain-tab').click(function () {
      $('#lc-chain-tab').addClass('active')
      $('#lc-store-tab').removeClass('active')
      $('#loyalty-visits').html(formattedData.lcVisitsChain)
      $('#lc-sales').html(formattedData.lcSalesChain[lcIndex])
      $('#lc-net-income').html(formattedData.lcNetIncomeChain[lcIndex])
      lcCurTab = [formattedData.lcSalesChain, formattedData.lcNetIncomeChain]
    })

    $('#lc-store-tab').click(function () {
      $('#lc-chain-tab').removeClass('active')
      $('#lc-store-tab').addClass('active')
      $('#loyalty-visits').html(formattedData.lcVisitsStore)
      $('#lc-sales').html(formattedData.lcSalesStore[lcIndex])
      $('#lc-net-income').html(formattedData.lcNetIncomeStore[lcIndex])
      lcCurTab = [formattedData.lcSalesStore, formattedData.lcNetIncomeStore]
    })

    $('#lc-slider').on('input', function () {
      lcIndex = $('#lc-slider').val()
      $('#lc-time-period').html(formattedData.lcTimePeriods[lcIndex])
      $('#lc-sales').html(lcCurTab[0][lcIndex])
      $('#lc-net-income').html(lcCurTab[1][lcIndex])
    })

    // DISENGAGED EMPLOYEES
    $('#uptick').html(formattedData.uptick)
    $('#num-employees').html(formattedData.numEmployees)
    $('#de-returned-merchandise').html(formattedData.deReturnedMerchandise)
    $('#de-oos').html(formattedData.deOOS)

    $('#potential-revenue-sales').html(formattedData.potentialRevenueSales)
    $('div#disengaged-employees .bar-graph-left').height(formattedData.deSalesHeight)
    $('#potential-revenue-net-income').html(formattedData.potentialRevenueNetIncome)
    $('div#disengaged-employees .bar-graph-right').height(formattedData.deNetIncomeHeight)

    $('#sales-report').show()
    $('#edit-btn').on('click', editForm)
    $('#sales-menu-btn').addClass('report-created')

    if ($('#nav-full').is(':visible')) {
      $('#page-info-container').hide()
    }

    util.scrollToTop()
  }

  function editForm() {
    $('#sales-report').hide()
    $('#form-footer').show()
    $('#report-footer').hide()
    showForm()
    util.scrollTo('#form-content')
  }

  // info text displayed for this page
  function getInfoText() {
    return util.welcome() +
      '<p>This tool will quickly and easily help you calculate lost revenue per store as a result of unengaged employees. ' +
      'To use this tool, please utilize the slider to match your organization\'s numbers or utilize the default values. ' +
      'Once completed, you can get results delivered both on screen and to your email.</p>' +
      '<p class="hint-text">* To expand your results, try the Employee Turnover Cost Calculator, and then review your Value Leakage Summary for further insights.'
  }

  return {
    editForm: editForm,
    hide: hide,
    init: init,
    onSubmitClick: onSubmitClick,
    show: show,
    getInfoText: getInfoText,
    getCalculations: function () { return calculations },
    getData: function () { return data },
    getFormattedData: function () { return formattedData },
    getPageTitle: function () { return 'Sales Leakage Calculator' },
    reportCreated: function () { return reportCreated },
    setEmailSent: function () { emailSent = true }
  }
})()
