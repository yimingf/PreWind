// Dinner controller that we use whenever we have view that needs to
// display or modify the dinner menu
dashboardApp.controller('DashboardCtrl', function ($scope, Data) {

    $scope.dataService = Data;

    //Checks the cookie with dishes in menu on startup, and in case there are any, adds them to the menu
    $scope.getBenchmarkDataGroupedByMonth = function(){

        $scope.dataService.BenchmarkDataGroupedByMonth.get({},function(data){
            console.log("Retrieved: "+JSON.stringify(data));
            alert(JSON.stringify(data));
        },function(data){
            alert("Error: " + JSON.stringify(data));
        });
    };

    $scope.getBenchmarkDataGroupedByMonth();

});