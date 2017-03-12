// Dinner controller that we use whenever we have view that needs to
// display or modify the dinner menu
dashboardApp.controller('DashboardCtrlForPredictions', function ($location, $scope, Data, $filter) {

    $scope.dataService = Data;

    var promiseDailyData= undefined;
    var promiseDailySpeedData = undefined;
    var wp1_ProductionValue = [];
    var wp2_ProductionValue = [];
    var wp3_ProductionValue = [];
    var ProductionDate=[];
    var wp1 = 1;
    $scope.nameOfWindfarms = ["wp1", "wp2", "wp3"];

    $scope.$on('farmUpdated',function () {
        var farm =$scope.nameOfWindfarm.replace( /^\D+/g, '');
        $scope.buildGraph(farm);
    });

        $scope.apiCallStatus = "Loading...";
        $scope.resultCounter = 0;
        $scope.dailyProduction = undefined;
        $scope.dailySpeedData = undefined;
        var count =0;
        //getting production data from API
        var promiseDailyData = $scope.dataService.BenchmarkDataForPrediction();
        promiseDailyData.then(
            function (response) {
                $scope.dailyProduction = response.data;
                $scope.buildDataFromResults();

            },
            function (response) {
                $scope.dailyProduction = undefined;
                $scope.apiCallStatus = "Error :(";
                alert("Error: " + JSON.stringify(response));
            });

   // };


    //Push the data into specific array
    $scope.buildDataFromResults = function() {
        $scope.dailyProduction.forEach(function (element) {
            if(element.date>11 && element.date<16) {
                wp1_ProductionValue.push(element.wp1);
                wp2_ProductionValue.push(element.wp2);
                wp3_ProductionValue.push(element.wp3);
                ProductionDate.push(element.date + "/"+ element.hour);
            }
        });

        //$scope.buildAllGraphs();
    };

    function getDailyWindspeedDataForWindFarm(wp) {
        //getting speed data from API
        var promiseDailySpeedData = $scope.dataService.getDailyWindspeedDataForPredictions(wp);
        promiseDailySpeedData.then(
            function (response) {
                $scope.dailySpeedData = response.data;
               // console.log(wp);
                if (wp==1){
                    $scope.drawgraph_wp1();
                }
                if (wp==2){
                    $scope.drawgraph_wp2();
                }
                if (wp==3){
                    $scope.drawgraph_wp3();
                }

            },
            function (response) {
                $scope.dailySpeedData = undefined;
                $scope.apiCallStatus = "Error :(";
                alert("Error: " + JSON.stringify(response));
            });

    }


    $scope.buildGraph = function(wp){
        getDailyWindspeedDataForWindFarm(wp)

    }

    //build graph for windfarm WP1
    $scope.drawgraph_wp1 = function(){
       // $scope.dailySpeedData = getDailyWindspeedDataForWindFarm(1);
        var uncertainty_ProductionUpperLimit = [];
        var uncertainty_ProductionLowerLimit = [];
        var uncertainty_ProductionDate = [];
        var wp1_SpeedData = [];
        var upperLimitValue;
        var lowerLimitValue;
        var j=0;


        //getting uncertainty production value via forloop
        var arrayLength_wp1_ProductionValue = wp1_ProductionValue.length;
        for (var i = 48; i< arrayLength_wp1_ProductionValue; i++) {
            j++;
            if(i<84){
                upperLimitValue = 0;
                lowerLimitValue = 0;
            }
            else {
                upperLimitValue = wp1_ProductionValue[i] + 2 + j;
                lowerLimitValue = wp1_ProductionValue[i] - 2 - j;
            }
            uncertainty_ProductionUpperLimit.push(upperLimitValue);
            uncertainty_ProductionLowerLimit.push(lowerLimitValue);
        }

        //getting uncertainty production hour via forloop
        var arrayLength_UncertaintyDate = ProductionDate.length;
        for (var i = 48; i < arrayLength_UncertaintyDate; i++) {
            uncertainty_ProductionDate.push(ProductionDate[i]);
        }



        $scope.dailySpeedData.forEach(function (element) {
            if(element.date != undefined) {
                if (element.date > 11 && element.date < 16) {
                    wp1_SpeedData.push(element.ws);
                }
            }
        });



        var trace1 = {
            x: ProductionDate,
            y: wp1_ProductionValue,
            mode: 'lines',
            name: 'ProductionValue',
            line: {
                dash: 'solid',
                width: 3
            }
        };

        var trace2 = {
            x: uncertainty_ProductionDate,
            y: uncertainty_ProductionUpperLimit,
            marker: {color: 'rgb(244, 119, 66)'},
            mode: 'lines',
            name: 'uncertainty range',
            line: {
                dash: 'solid',
                width: 2
            }
        };

        var trace3 = {
            x: uncertainty_ProductionDate,
            y: uncertainty_ProductionLowerLimit,
            marker: {color: 'rgb(244, 119, 66)'},
            mode: 'lines',
            name: 'uncertainty range',
            line: {
                dash: 'solid',
                width: 2
            }
        };

        var trace4 = {
            x: ["14/0","14/0","14/0","14/0","14/0","14/0","14/0","14/0","14/0","14/0"],
            y: [0, 10, 20, 40, 50, 60, 80, 90, 120],
            mode: 'lines',
            name: 'Split',
            line: {
                dash: 'solid',
                width: 2
            }
        };

        var trace5 = {
            x: ProductionDate,
            y: wp1_SpeedData,
            type: 'scatter',
            name: 'windspeed data',
            line: { // set the width of the line.
                width: 2,
                dash: 'dot',
            },
            yaxis: 'y2'
        };

        var data = [trace1, trace2, trace3, trace4, trace5];

        var layout = {
            xaxis: {
                title: 'date(Hour)',
                autorange: true
            },
            yaxis: {
                title: 'Production Value',
                range: [0, 120],
                autorange: false
            },
            yaxis2: {
                title: 'm/s',
                titlefont: {color: 'rgb(148, 103, 189)'},
                tickfont: {color: 'rgb(148, 103, 189)'},
                overlaying: 'y',
                side: 'right'
            },
            legend: {
                y: 2,
                traceorder: 'reversed',
                font: {
                    size: 16
                }
            }
        };

        Plotly.newPlot('wind-prediction-chart', data, layout, {modeBarButtonsToRemove: ['sendDataToCloud']});

    };



    $scope.drawgraph_wp2 = function(){

        var uncertainty_ProductionUpperLimit = [];
        var uncertainty_ProductionLowerLimit = [];
        var uncertainty_ProductionDate = [];
        var wp2_SpeedData = [];
        var upperLimitValue;
        var lowerLimitValue;
        var j=0;


        //getting uncertainty production value via forloop
        var arrayLength_wp2_ProductionValue = wp2_ProductionValue.length;
        for (var i = 48; i< arrayLength_wp2_ProductionValue; i++) {
            j++;
            if(i<92){
                upperLimitValue = 0;
                lowerLimitValue = 0;
            }
            else {
                upperLimitValue = wp2_ProductionValue[i] + j;
                lowerLimitValue = wp2_ProductionValue[i] - j;
            }
            uncertainty_ProductionUpperLimit.push(upperLimitValue);
            uncertainty_ProductionLowerLimit.push(lowerLimitValue);
        }

        //getting uncertainty production hour via forloop
        var arrayLength_UncertaintyDate = ProductionDate.length;
        for (var i = 48; i < arrayLength_UncertaintyDate; i++) {
            uncertainty_ProductionDate.push(ProductionDate[i]);
        }

      //  scope.dailySpeedData = getDailyWindspeedDataForWindFarm(2);
        $scope.dailySpeedData.forEach(function (element) {
            wp2_SpeedData.push(element.ws);
        });


        var trace1 = {
            x: ProductionDate,
            y: wp2_ProductionValue,
            mode: 'lines',
            name: 'ProductionValue',
            line: {
                dash: 'solid',
                width: 3
            }
        };

        var trace2 = {
            x: uncertainty_ProductionDate,
            y: uncertainty_ProductionUpperLimit,
            marker: {color: 'rgb(244, 119, 66)'},
            mode: 'lines',
            name: 'uncertainty range',
            line: {
                dash: 'solid',
                width: 2
            }
        };

        var trace3 = {
            x: uncertainty_ProductionDate,
            y: uncertainty_ProductionLowerLimit,
            marker: {color: 'rgb(244, 119, 66)'},
            mode: 'lines',
            name: 'uncertainty range',
            line: {
                dash: 'solid',
                width: 2
            }
        };

        var trace4 = {
            x: ["14/0","14/0","14/0","14/0","14/0","14/0","14/0","14/0","14/0","14/0"],
            y: [0, 10, 20, 40, 50, 60, 80, 90, 120],
            mode: 'lines',
            name: 'Split',
            line: {
                dash: 'solid',
                width: 2
            }
        };

        var trace5 = {
            x: ProductionDate,
            y: wp2_SpeedData,
            type: 'scatter',
            name: 'windspeed data',
            line: { // set the width of the line.
                width: 2,
                dash: 'dot',
            },
            yaxis: 'y2'
        };

        var data = [trace1, trace2, trace3, trace4, trace5];

        var layout = {
            xaxis: {
                title: 'date(Hour)',
                autorange: true
            },
            yaxis: {
                title: 'Production Value',
                range: [0, 120],
                autorange: false
            },
            yaxis2: {
                title: 'm/s',
                titlefont: {color: 'rgb(148, 103, 189)'},
                tickfont: {color: 'rgb(148, 103, 189)'},
                overlaying: 'y',
                side: 'right'
            },
            legend: {
                y: 2,
                traceorder: 'reversed',
                font: {
                    size: 16
                }
            }
        };

        Plotly.newPlot('wind-prediction-chart', data, layout, {modeBarButtonsToRemove: ['sendDataToCloud']});

    };

    $scope.drawgraph_wp3 = function(){

        var uncertainty_ProductionUpperLimit = [];
        var uncertainty_ProductionLowerLimit = [];
        var uncertainty_ProductionDate = [];
        var wp3_SpeedData = [];
        var upperLimitValue;
        var lowerLimitValue;
        var j=0;


        //getting uncertainty production value via forloop
        var arrayLength_wp3_ProductionValue = wp3_ProductionValue.length;
        for (var i = 48; i< arrayLength_wp3_ProductionValue; i++) {
            j++;
            if(i<84){
                upperLimitValue = 0;
                lowerLimitValue = 0;
            }
            else {
                upperLimitValue = wp3_ProductionValue[i] + 2 + j;
                lowerLimitValue = wp3_ProductionValue[i] - 2 - j;
            }
            uncertainty_ProductionUpperLimit.push(upperLimitValue);
            uncertainty_ProductionLowerLimit.push(lowerLimitValue);
        }

        //getting uncertainty production hour via forloop
        var arrayLength_UncertaintyDate = ProductionDate.length;
        for (var i = 48; i < arrayLength_UncertaintyDate; i++) {
            uncertainty_ProductionDate.push(ProductionDate[i]);
        }


       // scope.dailySpeedData = getDailyWindspeedDataForWindFarm(3);
        $scope.dailySpeedData.forEach(function (element) {
            if(element.date != undefined) {
                if (element.date > 11 && element.date < 16) {
                    wp3_SpeedData.push(element.ws);
                }
            }
        });

        var trace1 = {
            x: ProductionDate,
            y: wp3_ProductionValue,
            mode: 'lines',
            name: 'ProductionValue',
            line: {
                dash: 'solid',
                width: 3
            }
        };

        var trace2 = {
            x: uncertainty_ProductionDate,
            y: uncertainty_ProductionUpperLimit,
            marker: {color: 'rgb(244, 119, 66)'},
            mode: 'lines',
            name: 'uncertainty range',
            line: {
                dash: 'solid',
                width: 2
            }
        };

        var trace3 = {
            x: uncertainty_ProductionDate,
            y: uncertainty_ProductionLowerLimit,
            marker: {color: 'rgb(244, 119, 66)'},
            mode: 'lines',
            name: 'uncertainty range',
            line: {
                dash: 'solid',
                width: 2
            }
        };

        var trace4 = {
            x: ["14/0","14/0","14/0","14/0","14/0","14/0","14/0","14/0","14/0","14/0"],
            y: [0, 10, 20, 40, 50, 60, 80, 90, 120],
            mode: 'lines',
            name: 'Split',
            line: {
                dash: 'solid',
                width: 2
            }
        };

        var trace5 = {
            x: ProductionDate,
            y: wp3_SpeedData,
            type: 'scatter',
            name: 'windspeed data',
            line: { // set the width of the line.
                width: 2,
                dash: 'dot',
            },
            yaxis: 'y2'
        };

        var data = [trace1, trace2, trace3, trace4, trace5];

        var layout = {
            xaxis: {
                title: 'date(Hour)',
                autorange: true
            },
            yaxis: {
                title: 'Production Value',
                range: [0, 120],
                autorange: false
            },
            yaxis2: {
                title: 'm/s',
                titlefont: {color: 'rgb(148, 103, 189)'},
                tickfont: {color: 'rgb(148, 103, 189)'},
                overlaying: 'y',
                side: 'right'
            },
            legend: {
                y: 2,
                traceorder: 'reversed',
                font: {
                    size: 16
                }
            }
        };

        Plotly.newPlot('wind-prediction-chart', data, layout, {modeBarButtonsToRemove: ['sendDataToCloud']});

    };

    //Default case: First time load prediction graph of first wind farm
    $scope.buildGraph($scope.nameOfWindfarm.replace( /^\D+/g, ''));





});

