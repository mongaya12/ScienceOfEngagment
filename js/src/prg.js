// globals
//const API_BASE_URL = 'http://www.scienceofengagement.com/'

const prg = (function () {
  var activeView
  var sharedFormData = []
  var sharedData = {}
  var VIEWS = {}

  // called on page load, fetches form data
  function init(callback) {
    $.ajax({
      url: '/formData/sharedFormData.json',
      cache: false,
      dataType: 'json',
      success: function (data) {
        sharedFormData = data

        data.forEach(function (elem) {
          sharedData[elem.id] = ''
        })

        callback()
      },
      error: function () {
        console.error('An error occurred fetching sharedFormData.json')
      }
    })

    VIEWS = {
      sales: salesLeakage,
      summary: leakageSummary,
      turnover: turnoverLeakage
    }

    $('#report-footer').hide()
  }

  // called when client wants an email of a report they created
  function emailReport() {
    clientInfo.sendClientEmail(activeView, VIEWS[activeView])
  }

  // hides the page info box for the current view
  function hidePageInfo() {
    if ($('#nav').is(':visible')) {
      $('#page-info-container').hide()
      $('#nav-info-container > .info-icon').show()
    }
  }

  // hides the old view (if there is one) and displays the new view
  function setActiveView(view) {
    if (activeView) {
      util.removeEventHandlers()
      VIEWS[activeView].hide()

      if ($('#nav').is(':visible')) {
        util.toggleMenu()
      }
    }

    $('#' + activeView + '-menu-btn').removeClass('active')
    $('#' + view + '-menu-btn').addClass('active')
    $('#' + activeView + '-tab').removeClass('active')
    $('#' + view + '-tab').addClass('active')

    activeView = view
    $('#page-title').html(VIEWS[activeView].getPageTitle())

    if ($('#page-info-container').is(':visible')) {
      showPageInfo()
    }

    // set margins
    var content = $('#main-content')
    content.css('margin-top', $('header > nav').height())
    content.css('margin-bottom', $('footer').height())
  }

  // show the Value Leakage Summary page
  function showLeakageSummary() {
    if (activeView === 'summary') {
      return
    }

    setActiveView('summary')
    leakageSummary.show()
  }

  // display the page info box for the current view
  function showPageInfo() {
    $('#page-info-text').html(VIEWS[activeView].getInfoText())
    $('#page-info-container').show()
    $('#nav-info-container > .info-icon').hide()
  }

  // display the Sales Leakage Calculator page
  function showSalesLeakage() {
    if (activeView === 'sales') {
      return
    }

    setActiveView('sales')
    syncSharedData(sharedData, salesLeakage.getData())
    salesLeakage.show()
  }

  // display the Employee Turnover Cost Calculator page
  function showTurnoverLeakage() {
    if (activeView === 'turnover') {
      return
    }

    setActiveView('turnover')
    syncSharedData(sharedData, turnoverLeakage.getData())
    turnoverLeakage.show()
  }

  // sync data that is shared between sales and turnover (total num of stores, avg num employees per store)
  // so that switching between the two views preserves any changes
  function syncSharedData(srcData, dstData) {
    for (var key in sharedData) {
      if (srcData.hasOwnProperty(key) && srcData[key]) {
        dstData[key] = srcData[key]
      }
    }
  }

  // called when a view is done fetching its form data and is ready to be displayed,
  // will be shown if they match the query parameter, sales is the default
  function viewReady(view) {
    var queryString = window.location.search.substring(1)
    var pair = queryString.split('=')

    if (pair[0] === 'view' && pair[1]) {
      var viewToLoad = pair[1]

      if (viewToLoad === 'sales' && view === 'sales') {
        showSalesLeakage()
      } else if (viewToLoad === 'turnover' && view === 'turnover') {
        showTurnoverLeakage()
      }
    } else if (view === 'turnover') {
      showTurnoverLeakage()
    }
  }

  return {
    emailReport: emailReport,
    hidePageInfo: hidePageInfo,
    init: init,
    viewReady: viewReady,
    showPageInfo: showPageInfo,
    showLeakageSummary: showLeakageSummary,
    showSalesLeakage: showSalesLeakage,
    showTurnoverLeakage: showTurnoverLeakage,
    syncSharedData: syncSharedData,
    getSharedData: function () { return sharedData },
    getSharedFormData: function () { return sharedFormData },
  }
})()
