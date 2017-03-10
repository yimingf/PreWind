// Dinner controller that we use whenever we have view that needs to
// display or modify the dinner menu
dashboardApp.controller('DashboardCtrl', function ($scope, DataPredictions) {

    $scope.dataService = DataPredictions;
    $scope.nameOfWindfarms = ["wp1", "wp2", "wp3"];

    $scope.buildMonthlyProductionChart = function (yearNumber, nameOfWindfarm) {

        if(!$scope.validateWindfarmName(nameOfWindfarm)){
            alert("Invalid wind farm name: "+nameOfWindfarm);
            return;
        }

        $scope.dataService.BenchmarkDataGroupedByMonth.get({},
            function(data){
                console.log("Retrieved: "+JSON.stringify(data));
                var dataForTheYear = data[yearNumber];
                console.log("One year: "+JSON.stringify(dataForTheYear));

                var dateArrayProd = [];
                var productionArrayProd = [];

                //For every month try to build the month
                for(var monthNumber=1; monthNumber<=12; monthNumber++) {
                    if(dataForTheYear[monthNumber] !== undefined){
                        dateArrayProd.push($scope.dataService.getMonthNameByNumber(monthNumber));
                        productionArrayProd.push(dataForTheYear[monthNumber]["SUM "+nameOfWindfarm]);
                    }
                    console.log("DATA: "+JSON.stringify(dateArrayProd));
                    console.log("DATA2: "+JSON.stringify(productionArrayProd));

                    var trace1Prod = {
                        x: dateArrayProd,
                        y: productionArrayProd,
                        type: 'bar',
                        name: 'windspeed data',
                        line: { // set the width of the line.
                            width: 3
                        }
                    };

                    var layoutProd = {
                        title: '',
                        yaxis: {title: 'MW/h'},
                    };

                    var dataProd = [trace1Prod];
                    Plotly.newPlot('yearly-production-chart', dataProd, layoutProd);
                }
            },
            function(data){
                alert("Error: " + JSON.stringify(data));
            }
        );
    };

    $scope.validateWindfarmName = function (nameOfWindfarm) {
        if($scope.nameOfWindfarms.indexOf(nameOfWindfarm) === -1){
            return false;
        }
        return true;
    };

    $scope.buildMonthlyProductionChart(2011, "wp2");

});