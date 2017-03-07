// Dinner controller that we use whenever we have view that needs to
// display or modify the dinner menu
dashboardApp.controller('DashboardCtrl', function ($scope, Data) {

    $scope.dataService = Data;

    $scope.nameOfWindfarm = "wp1";
    $scope.currentYear = 2012;
    $scope.currentMonth = 6;
    $scope.currentDate = 26;

    $scope.nameOfWindfarms = ["wp1", "wp2", "wp3"];
    $scope.farmsFullCapacity = {"wp1": 110, "wp2": 48, "wp3": 11};
    $scope.yearsMontlyProductionArray = undefined;
    $scope.yearsMontlyProductionMonthNamesArray = undefined;
    $scope.averageMonthlyProduction = undefined;
    $scope.yearsPercentOfFullCapacity = undefined;
    $scope.apiCallStatus = undefined;
    $scope.dailyProduction = undefined;
    $scope.monthlyProduction = undefined;
    $scope.lastYearsPercentOfFullCapacity = undefined;

    //Make all calls to api to retrieve data
    $scope.buildDataFromApi = function () {
        $scope.apiCallStatus = "Loading...";
        $scope.resultCounter = 0;

        var promiseDailyData = $scope.dataService.getBenchmarkDataGroupedByDate();
        promiseDailyData.then(
            function (response) {
                $scope.resultCounter++;
                console.log("Retrieved daily: "+JSON.stringify(response.data));
                $scope.dailyProduction = response.data;
                if($scope.resultCounter == 3){
                    $scope.buildDataFromResults();
                }
            },
            function (response) {
                $scope.dailyProduction = undefined;
                $scope.apiCallStatus = "Error :(";
                alert("Error: " + JSON.stringify(response));
            }
        );

        var promiseMonthlyData = $scope.dataService.getBenchmarkDataGroupedByMonth();
        promiseMonthlyData.then(
            function (response) {
                $scope.resultCounter++;

                console.log("Retrieved montly: "+JSON.stringify(response.data));
                $scope.monthlyProduction = response.data;
                if($scope.resultCounter == 3){
                    $scope.buildDataFromResults();
                }
            },
            function (response) {
                $scope.monthlyProduction = undefined;
                $scope.apiCallStatus = "Error :(";
                alert("Error: " + JSON.stringify(response));
            }
        );

        var promiseYearlyData = $scope.dataService.getBenchmarkDataGroupedByYear();
        promiseYearlyData.then(
            function (response) {
                $scope.resultCounter++;

                console.log("Retrieved yearly: "+JSON.stringify(response.data));
                $scope.yearlyProduction = response.data;
                if($scope.resultCounter == 3){
                    $scope.buildDataFromResults();
                }
            },
            function (response) {
                $scope.yearlyProduction = undefined;
                $scope.apiCallStatus = "Error :(";
                alert("Error: " + JSON.stringify(response));
            }
        );
    };

    $scope.buildDataFromResults = function(){

        if(!$scope.validateWindfarmName($scope.nameOfWindfarm)){
            alert("Invalid wind farm name: "+nameOfWindfarm);
            return;
        }

        $scope.apiCallStatus = undefined;
        console.log("Should build data from results...");

        //Build stuff from daily data
        //Loop through every day
        $scope.cumulativeYearlyProductionMap = {};
        var obj = {name: 'misko', gender: 'male'};
        var log = [];
        angular.forEach($scope.dailyProduction, function(monthlyData, year) {
            var yearDailyCumulativeProductionDateArray = [];
            var yearDailyCumulativeProductionArray = [];
            var yearsCululativeValue = 0;

            //Loop through all months
            angular.forEach(monthlyData, function(dailyValues, month) {
                //Loop through all days
                angular.forEach(dailyValues, function(dailyValue, date) {
                    yearsCululativeValue += dailyValue["SUM "+$scope.nameOfWindfarm];
                    yearDailyCumulativeProductionArray.push(yearsCululativeValue);
                    //yearDailyCumulativeProductionDateArray.push(year + "-" + month + "-" + date);
                    yearDailyCumulativeProductionDateArray.push(date + " " + $scope.dataService.getMonthNameByNumber(month));
                });
            });

            $scope.cumulativeYearlyProductionMap[year] = {
                dates: yearDailyCumulativeProductionDateArray,
                values: yearDailyCumulativeProductionArray
            };
            //console.log("Cumulative values: "+JSON.stringify($scope.cumulativeYearlyProductionMap));
        });

        //Build stuff from monthly data
        $scope.yearsMontlyProductionMonthNamesArray = [];
        $scope.yearsMontlyProductionArray = [];
        //For every month try to build the month
        for(var monthNumber=1; monthNumber<=$scope.currentMonth; monthNumber++) {
            if($scope.monthlyProduction[$scope.currentYear] !== undefined){
                $scope.yearsMontlyProductionMonthNamesArray.push($scope.dataService.getMonthNameByNumber(monthNumber));
                $scope.yearsMontlyProductionArray.push($scope.monthlyProduction[$scope.currentYear][monthNumber]["SUM "+$scope.nameOfWindfarm]);
            }
        }

        //Build stuff from yearly data
        $scope.yearsTotalProduction = $scope.yearlyProduction[$scope.currentYear]["SUM "+$scope.nameOfWindfarm];
        //Percent of capacity
        var numberOfDaysSinceStartOfTheYear = $scope.dataService.countNumberOfDaysSinceStartOfTheYear(
            $scope.currentYear, $scope.currentMonth, $scope.currentDate);
        var fullCapacity = numberOfDaysSinceStartOfTheYear * 24 * $scope.farmsFullCapacity[$scope.nameOfWindfarm];
        $scope.yearsPercentOfFullCapacity = $scope.yearsTotalProduction / fullCapacity * 100;

        //Last years data
        $scope.lastYearsTotalProduction = undefined;
        if($scope.yearlyProduction[$scope.currentYear - 1] !== undefined){
            $scope.lastYearsTotalProduction = $scope.yearlyProduction[$scope.currentYear - 1]["SUM "+$scope.nameOfWindfarm];
            $scope.lastYearsPercentOfFullCapacity = $scope.lastYearsTotalProduction / (365 * 24 * $scope.farmsFullCapacity[$scope.nameOfWindfarm]) * 100;
        }


        //Build grapsh
        $scope.buildAllGraphs();
    };

    $scope.buildAllGraphs = function(){
        $scope.buildMonthlyProductionChart();
        $scope.buildCumulativeProductionChart();
    };

    $scope.buildCumulativeProductionChart = function () {
        var dateArray = $scope.cumulativeYearlyProductionMap[$scope.currentYear].dates;
        var cumulativeProductionArray = $scope.cumulativeYearlyProductionMap[$scope.currentYear].values;
        var dateArray2 = $scope.cumulativeYearlyProductionMap[$scope.currentYear - 1].dates;
        var cumulativeProductionArray2 = $scope.cumulativeYearlyProductionMap[$scope.currentYear - 1].values;

        var trace1 = {
            x: dateArray,
            y: cumulativeProductionArray,
            type: 'scatter',
            name: $scope.currentYear,
            line: { // set the width of the line.
                width: 3
            }
        };

        var trace2 = {
            x: dateArray2,
            y: cumulativeProductionArray2,
            type: 'scatter',
            name: $scope.currentYear - 1,
            line: { // set the width of the line.
                width: 3
            }
        };

        var layoutProd2 = {
            title: '',
            yaxis: {title: 'MW/h'},
            hovermode:'closest'
        };

        var data = [trace1, trace2];

        Plotly.newPlot('cumulative-production-chart', data, layoutProd2);
    };

    $scope.buildMonthlyProductionChart = function () {

        var trace1Prod = {
            x: $scope.yearsMontlyProductionMonthNamesArray,
            y: $scope.yearsMontlyProductionArray,
            type: 'bar',
            name: 'windspeed data',
            line: { // set the width of the line.
                width: 3
            },
            mode:'markers',
            marker:{size:16}
        };

        var layoutProd = {
            title: '',
            yaxis: {title: 'MW/h'},
            hovermode:'closest'
        };

        var dataProd = [trace1Prod];

        var myPlot = document.getElementById('yearly-production-chart');
        Plotly.newPlot('yearly-production-chart', dataProd, layoutProd);

        myPlot.on('plotly_click', function(data){
            var pts = '';
            for(var i=0; i < data.points.length; i++){
                pts = 'x = '+data.points[i].x +'\ny = '+
                    data.points[i].y.toPrecision(4) + '\n\n';
            }
            alert('Closest point clicked:\n\n'+pts);
        });
    };

    $scope.validateWindfarmName = function (nameOfWindfarm) {
        if($scope.nameOfWindfarms.indexOf(nameOfWindfarm) === -1){
            return false;
        }
        return true;
    };

    $scope.buildDataFromApi(2012, "wp2");
    /*$scope.buildMonthlyProductionChart(2012, "wp2");
    $scope.buildKeyMetricsView(2012, "wp2");*/

});