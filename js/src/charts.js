const charts = (function () {
  var charts = []

  function clearChartsData() {
    charts.forEach(function (chart) {
      chart.destroy()
    })

    charts = []
  }

  function createBarGraph(graph, salesReturn, salesStock, salesShrinkage, netReturn, netStock, netShrinkage) {
    var ctx = $('#myChart'+graph)
    var barChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ["Returned Merchandise", "Out of Stock Situation", "Shrinkage"],
        datasets: [
          {
            label: "Sales",
            backgroundColor: "rgba(237, 30, 121, 0.5)",
            borderColor: "rgba(237, 30, 121, 1)",
            borderWidth: 1,
            hoverBackgroundColor: "rgba(237, 30, 121, 0.7)",
            hoverBorderColor: "rgba(237, 30, 121, 1))",
            data: [salesReturn, salesStock, salesShrinkage],
            yAxisID: "y-axis-0"
          },
          {
            label: "Net Income",
            backgroundColor: "rgba(54,162,235,0.5)",
            borderColor: "rgba(54,162,235,1)",
            borderWidth: 1,
            hoverBackgroundColor: "rgba(54,162,235,0.7)",
            hoverBorderColor: "rgba(54,162,235,1)",
            data: [netReturn, netStock, netShrinkage]
          }
        ]
      },
      options: {
        animation: {
          onComplete: function () {
            var dataUrl = $('#myChart' + graph)[0].toDataURL()
            // $('#test').prop('src', dataUrl)
          }
        }
      }

    })

    charts.push(barChart)
  }

  function createBarGraph2(graph, perEmployee, potentialRevEmployee) {
    var ctx = $('#myChart'+graph)
    var barChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ["Returned Merchandise", "Out of Stock Situation"],
        datasets: [
          {
            label: "Sales",
            backgroundColor: "rgba(237, 30, 121, 0.5)",
            borderColor: "rgba(237, 30, 121, 1)",
            borderWidth: 1,
            hoverBackgroundColor: "rgba(237, 30, 121, 0.7)",
            hoverBorderColor: "rgba(237, 30, 121, 1))",
            data: [perEmployee, potentialRevEmployee],
            yAxisID: "y-axis-0"
          }
        ]
      }
    })

    charts.push(barChart)
  }

  function createDoughnutGraph(graph, sales, netIncome) {
    var ctx = $('#myChart'+graph)
    var chart = new Chart(ctx, {
      type: 'doughnut',
      animation: {
        animateScale:true
      },
      options: {
        legend: {
          display: false
        }
      },
      data: {
        labels: [
          "Net Income",
          "Sales"
        ],
        datasets: [
          {
            data: [netIncome, sales],
            backgroundColor: [
              "#4198E0",
              "rgba(237, 30, 121, .74)"
            ],
            hoverBackgroundColor: [
              "#4198E0",
              "rgba(237, 30, 121, .74)"
            ]
          }]
      }
    })

    charts.push(chart)
  }

//take out sales and put in net
  function createPieGraph(graph, salesSales, returnsSales, oos, shrinkage, churn, poorKnowledge, turnOver) {
    var ctx = $('#myChart'+graph)
    var chart = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: [
          "Unconverted Sales",
          "Unconverted Returns",
          "Lost Sales, OOS",
          "Shrinkage",
          "Lost Sales, Churn",
          "Lost Sales, Poor Knowledge",
          "Employee Turnover"
        ],
        datasets: [
          {
            data: [salesSales, returnsSales, oos, shrinkage, churn, poorKnowledge, turnOver],
            backgroundColor: [
              "rgba(127, 6, 60, 0.8)",
              "rgba(28, 65, 96, 0.8)",
              "rgba(201, 63, 129, 0.8)",
              "rgba(71, 129, 168, 0.8)",
              "rgba(229, 131, 178, 0.8)",
              "rgba(173, 203, 219, 0.8)",
              "rgba(237, 30, 121, 0.2)"
            ],
            hoverBackgroundColor: [
              "#7F063C",
              "#1C4160",
              "#C93F81",
              "#4781A8",
              "#E583B2",
              "#ADCBDB",
              "rgba(237, 30, 121, 0.3)"
            ],
            hoverBorderWidth: 4

          }]
      },
      options: {
        legend: {
          position: 'bottom',
          fullWidth: false
        },
        tooltips: {
          enabled: true
        }
      }
    })

    charts.push(chart)
  }

  return {
    clearChartsData: clearChartsData,
    createBarGraph: createBarGraph,
    createBarGraph2: createBarGraph2,
    createDoughnutGraph: createDoughnutGraph,
    createPieGraph: createPieGraph,
  }
})()