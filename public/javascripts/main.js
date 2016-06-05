$(document).ready(function () {

  /**
   * Formats a Date object to a string.
   *
   * @param date
   */
  function formatDate(date) {
    var year = date.getFullYear();
    var month = ("0" + (date.getMonth() + 1)).slice(-2);
    var day = ("0" + date.getDate()).slice(-2);
    var hour = ("0" + date.getHours()).slice(-2);
    var minutes = ("0" + date.getMinutes()).slice(-2);

    return year + "-" + month + "-" + day + " " + hour + ":" + minutes;
  }

  /**
   * Creates a line chart.
   *
   * @param ctx
   * @param labelName
   */
  function createLineChart(ctx, labelName, color) {
    var color = color || "75,192,192";
    var data = {
      labels: [],
      datasets: [
        {
          label: labelName,
          fill: false,
          lineTension: 0.1,
          backgroundColor: "rgba(" + color + ",0.4)",
          borderColor: "rgba(" + color + ",1)",
          borderCapStyle: "butt",
          borderDash: [],
          borderDashOffset: 0.0,
          borderJoinStyle: "miter",
          pointBorderColor: "rgba(" + color + ",1)",
          pointBackgroundColor: "#fff",
          pointBorderWidth: 1,
          pointHoverRadius: 5,
          pointHoverBackgroundColor: "rgba(" + color + ",1)",
          pointHoverBorderColor: "rgba(220,220,220,1)",
          pointHoverBorderWidth: 2,
          pointRadius: 1,
          pointHitRadius: 10,
          data: []
        }
      ]
    };

    return new Chart(ctx, {
      type: 'line',
      data: data,
      options: {
        legend: {
          display: false
        }
      }
    });
  }

  /**
   * Updates the charts data and re-renders it.
   *
   * @param chart
   * @param labels
   * @param data
   */
  function updateChartData(chart, labels, data) {
    chart.data.labels = labels;
    chart.data.datasets[0].data = data;
    chart.update();
  }

  /**
   * Fetches new data from the server with the corresponding dates and resets the charts.
   *
   * @param startDate
   * @param endDate
   */
  function refreshCharts() {
    var startDate = $inputStart.val();
    var endDate = $inputEnd.val();

    $.ajax({
      url: "/data/within-dates",
      method: "GET",
      data: {
        startDate: startDate,
        endDate: endDate
      },
      dataType: "json"
    }).done(function (data) {
      var labels = data.labels;
      var temperature = data.temperature;
      var humidity = data.humidity;

      updateChartData(temperatureChart, labels, temperature);
      updateChartData(humidityChart, labels, humidity);

    }).fail(function (jqXHR, textStatus) {
      console.log("Request failed while refreshing chart data.");
    });
  }

  /**
   * Updates device settings values on settings modal.
   */
  var deviceInterval = null;
  var deviceDisplay = undefined;

  function updateDeviceSettings(response) {
    // store values from server
    deviceInterval = response.interval;
    deviceDisplay = response.display;
    // set values
    $(".input-interval").val(deviceInterval);
    $(".checkbox-display").prop("checked", deviceDisplay);
  }

  /**
   * Fetches the device settings from the server and sets the values to the corresponding input fields.
   */
  function refreshDeviceSettings() {
    $.ajax({
      url: "/settings/device",
      method: "GET",
      dataType: "json"
    }).done(function (response) {
      updateDeviceSettings(response);
    }).fail(function (jqXHR, textStatus) {
      console.log("Request failed while refreshing device settings.");
    });
  }

  // initialize DateTimePicker
  $("#dtBox").DateTimePicker({
    dateTimeFormat: "yyyy-MM-dd HH:mm",
    titleContentDateTime: "",
    buttonsToDisplay: ["SetButton", "ClearButton"],
    animationDuration: 200
  });

  // initialize input fields
  var $inputStart = $(".input-start");
  var $inputEnd = $(".input-end");
  $inputStart.val(formatDate(new Date((new Date()).setDate(new Date().getDate() - 1)))); // current date - 1 day
  $inputEnd.val(formatDate(new Date()));
  refreshDeviceSettings();

  // create charts
  var temperatureChart = createLineChart($("#chart-temperature"), "Temperature", "220,21,87");
  var humidityChart = createLineChart($("#chart-humidity"), "Humidity", "75,192,192");
  refreshCharts();

  // add listeners
  $(".btn-search").on("click", function () {
    refreshCharts();
  });

  $(".input-interval").on("keypress", function () {
    $(".btn-save").show();
  });

  $(".checkbox-display").on("change", function () {
    $(".btn-save").show();
  });

  $(".btn-save").on("click", function () {
    $(".btn-save").prop("disabled", true);
    $.ajax({
      url: "/settings/device",
      data: {
        interval: $(".input-interval").val(),
        display: $(".checkbox-display").is(":checked")
      },
      method: "POST",
      dataType: "json"
    }).done(function (response) {
      $(".btn-save").prop("disabled", false);
      updateDeviceSettings(response);
      // remove modal
      $(".btn-save").hide();
      $(".settings-modal").modal("hide");
    }).fail(function (jqXHR, textStatus) {
      console.log("Request failed while saving device settings.");
      $(".btn-save").prop("disabled", false);
    });
  });

  $(".settings-modal").on("show.bs.modal", function (e) { // event fires immediately when the show instance method is called
    // reset values to original ones
    $(".input-interval").val(deviceInterval);
    $(".checkbox-display").prop("checked", deviceDisplay);
    // initially hide save button
    $(".btn-save").hide();
  });

});
