// Here we create an Angular service that we will use for our
// model. In your controllers (or other services) you can include the
// dependency on any service you need. Angular will insure that the
// service is created first time it is needed and then just reuse it
// the next time.
dashboardApp.factory('Data', function ($resource, $http, $cookieStore) {

    var requestHeaders = {
        'x-apikey': '58bc9e6bb2bd024d547c0af7',
        "Accept": "application/json; charset=utf-8",
        "Content-Type": "application/json;charset=utf-8"
    };

    this.getMonthNameByNumber = function (monthNumber) {
        var monthNames = [ 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December' ];
        return monthNames[monthNumber - 1];
    };

    this.countNumberOfDaysSinceStartOfTheYear = function (year, month, date) {
        var firstDate = new Date(year,01,1);
        var secondDate = new Date(year,month,date);
        return this.countNumberOfDaysBetweenDates(firstDate, secondDate);
    };

    this.countNumberOfDaysBetweenDates = function (firstDate, secondDate) {
        var oneDay = 24*60*60*1000;
        return Math.round(Math.abs((firstDate.getTime() - secondDate.getTime())/(oneDay)));
    };

    this.BenchmarkDataGroupedByDate = $resource('https://windpowerdata-8069.restdb.io/rest/benchmark',
        {
            max: 1000,
            q: {},
            skip: 0,
            groupby: ["year", "month", "date"],
            aggregate: ["SUM:wp1", "SUM:wp2", "SUM:wp3"]
        },{
            get: {
                headers: requestHeaders
            }
        });

    this.BenchmarkDataGroupedByMonth = $resource('https://windpowerdata-8069.restdb.io/rest/benchmark',
        {
            max: 20,
            q: {},
            skip: 0,
            groupby: ["year", "month"],
            aggregate: ["SUM:wp1", "SUM:wp2", "SUM:wp3"]
        },{
        get: {
            headers: requestHeaders
        }
    });

    this.BenchmarkDataGroupedByYear = $resource('https://windpowerdata-8069.restdb.io/rest/benchmark',
        {
            max: 20,
            q: {},
            skip: 0,
            groupby: ["year"],
            aggregate: ["SUM:wp1", "SUM:wp2", "SUM:wp3"]
        },{
            get: {
                headers: requestHeaders
            }
        });



    // Angular service needs to return an object that has all the
    // methods created in it. You can consider that this is instead
    // of calling var model = new DinnerModel() we did in the previous labs
    // This is because Angular takes care of creating it when needed.
    return this;

});
