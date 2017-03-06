// Dinner controller that we use whenever we have view that needs to
// display or modify the dinner menu
dashboardApp.controller('DashboardCtrl', function ($scope, Data) {

    $scope.dataService = Data;
    $scope.nameOfWindfarms = ["wp1", "wp2", "wp3"];

    $scope.buildKeyMetricsView = function (yearNumber, nameOfWindfarm) {
        if(!$scope.validateWindfarmName(nameOfWindfarm)){
            alert("Invalid wind farm name: "+nameOfWindfarm);
            return;
        }

        $scope.yearsTotalProduction = "Loading...";
        $scope.lastYearsTotalProduction = undefined;

        $scope.dataService.BenchmarkDataGroupedByYear.get({},
            function(data){
                console.log("Retrieved: "+JSON.stringify(data));
                $scope.yearsTotalProduction = data[yearNumber]["SUM "+nameOfWindfarm];
                var lastYearsProduction = data[yearNumber - 1] !== undefined ? data[yearNumber - 1]["SUM "+nameOfWindfarm] : undefined;
                if(lastYearsProduction !== undefined){
                    $scope.lastYearsTotalProduction = lastYearsProduction;
                }
            },
            function(data){
                $scope.yearsTotalProduction = "Error :(";
                $scope.lastYearsTotalProduction = undefined;
                alert("Error: " + JSON.stringify(data));
            }
        );
    };

    $scope.buildMonthlyProductionChart = function (yearNumber, nameOfWindfarm) {

        if(!$scope.validateWindfarmName(nameOfWindfarm)){
            alert("Invalid wind farm name: "+nameOfWindfarm);
            return;
        }

        $scope.dataService.BenchmarkDataGroupedByMonth.get({},
            function(data){
                //console.log("Retrieved: "+JSON.stringify(data));
                var dataForTheYear = data[yearNumber];
                //console.log("One year: "+JSON.stringify(dataForTheYear));

                var dateArrayProd = [];
                var productionArrayProd = [];

                //For every month try to build the month
                for(var monthNumber=1; monthNumber<=12; monthNumber++) {
                    if(dataForTheYear[monthNumber] !== undefined){
                        dateArrayProd.push($scope.dataService.getMonthNameByNumber(monthNumber));
                        productionArrayProd.push(dataForTheYear[monthNumber]["SUM "+nameOfWindfarm]);
                    }

                    var trace1Prod = {
                        x: dateArrayProd,
                        y: productionArrayProd,
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

    $scope.buildMonthlyProductionChart(2012, "wp2");
    $scope.buildKeyMetricsView(2012, "wp2");

});