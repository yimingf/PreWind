dashboardApp.controller('DashboardCtrl', function ($location, $scope, Data, $filter) {

	$scope.dataService = Data;

    $scope.textNameOfWindfarms = {
    	"wp1": "Långå wind park",
		"wp2": "Lillgrund",
		"wp3": "Karehamn",
        "wp4": "Utugruden",
        "wp5": "Bockstigen",
        "wp6": "Anholt",
        "wp7": "Horns Rev II",
        "wp8": "Rødsand II",
        "wp9": "Hywind",
        "wp10": "Kemin Ajoksen I"
	};
	$scope.nameOfWindfarms = ["wp1", "wp2", "wp3"];
    $scope.nameOfSelectedWindfarm = $scope.textNameOfWindfarms["wp1"];

	$scope.currentYear = 2012;
	$scope.currentMonth = 6;
	$scope.currentDate = 26;

	$scope.farmsFullCapacity = {"wp1": 110, "wp2": 48, "wp3": 11};
	$scope.yearsMontlyProductionArray = undefined;
	$scope.yearsMontlyProductionMonthNamesArray = undefined;
	$scope.averageMonthlyProduction = undefined;
	$scope.yearsPercentOfFullCapacity = undefined;
    $scope.yearsEmptyDays = {2011: 0, 2012: 0};
	$scope.apiCallStatus = undefined;
	$scope.dailyProduction = undefined;
	$scope.monthlyProduction = undefined;
	$scope.lastYearsPercentOfFullCapacity = undefined;
	$scope.dailyWindForecastData = undefined;
	$scope.dailyProductionDataMap = {};

	$scope.requestsToWaitFor = 4;

	$scope.setCurrentYear = function (year) {
		$scope.currentYear = year;
		if (year == 2012) {
			$scope.currentMonth = 6;
			$scope.currentDate = 26;
		}
		else{
			$scope.currentMonth = 12;
			$scope.currentDate = 31;
		}
		$scope.buildDataFromApi($scope.currentYear, $scope.shortNameOfWindfarm);
	};

	$scope.setCurrentWindfarmId = function (windfarmId) {
		console.log("From: "+windfarmId);
		if($scope.textNameOfWindfarms[windfarmId] != undefined){
			if(["wp1", "wp4", "wp7", "wp10"].indexOf(windfarmId) != -1){
                $scope.shortNameOfWindfarm = "wp1";
			}
			else if(["wp2", "wp5", "wp8"].indexOf(windfarmId) != -1){
                $scope.shortNameOfWindfarm = "wp2";
            }
            else if(["wp3", "wp6", "wp9"].indexOf(windfarmId) != -1){
                $scope.shortNameOfWindfarm = "wp3";
            }

            console.log("Selected: "+$scope.shortNameOfWindfarm);
            $location.search().wf = windfarmId;
            $scope.nameOfSelectedWindfarm = $scope.textNameOfWindfarms[windfarmId];
		}

		$scope.buildDataFromApi($scope.currentYear, $scope.shortNameOfWindfarm);
		//Broadcasting the change event to prediction controller (which is a child controller in this case)
		$scope.$broadcast('farmUpdated');

	};

	//Make all calls to api to retrieve data
	$scope.buildDataFromApi = function () {
		$scope.apiCallStatus = "Getting data from API...";
		$scope.resultCounter = 0;

		var promiseDailyData = $scope.dataService.getBenchmarkDataGroupedByDate();
		promiseDailyData.then(
			function (response) {
				$scope.resultCounter++;
				//console.log("Retrieved daily: "+JSON.stringify(response.data));
				$scope.dailyProduction = response.data;
				if($scope.resultCounter == $scope.requestsToWaitFor){
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

				//console.log("Retrieved montly: "+JSON.stringify(response.data));
				$scope.monthlyProduction = response.data;
				if($scope.resultCounter == $scope.requestsToWaitFor){
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

				//console.log("Retrieved yearly: "+JSON.stringify(response.data));
				$scope.yearlyProduction = response.data;
				if($scope.resultCounter == $scope.requestsToWaitFor){
					$scope.buildDataFromResults();
				}
			},
			function (response) {
				$scope.yearlyProduction = undefined;
				$scope.apiCallStatus = "Error :(";
				alert("Error: " + JSON.stringify(response));
			}
		);

		var promiseDailyWindData = $scope.dataService.getDailyWindspeedData($scope.shortNameOfWindfarm.substring(2));
		promiseDailyWindData.then(
			function (response) {
				$scope.resultCounter++;
				//console.log("Retrieved daily wind data: "+JSON.stringify(response.data));
				$scope.dailyWindForecastData = {};
				$scope.dailyWindForecastData[2012] = {};
				$scope.dailyWindForecastData[2011] = {};

				angular.forEach(response.data, function(value, key) {
					if(value.year >= $scope.currentYear - 1) {
						if($scope.dailyWindForecastData[value.year] === undefined){
							$scope.dailyWindForecastData[value.year] = {};
						}
						if($scope.dailyWindForecastData[value.year][value.month] === undefined){
							$scope.dailyWindForecastData[value.year][value.month] = {};
						}

						$scope.dailyWindForecastData[value.year][value.month][value.date] = {
							"ws": value.ws,
							"wd": value.wd
						};
					}
				});

				//console.log("Wind array: "+JSON.stringify($scope.dailyWindForecastData));

				if($scope.resultCounter == $scope.requestsToWaitFor){
					$scope.buildDataFromResults();
				}
			},
			function (response) {
				$scope.dailyWindForecastData = undefined;
				$scope.apiCallStatus = "Error :(";
				alert("Error: " + JSON.stringify(response));
			}
		);
	};

	$scope.buildDataFromResults = function(){

		if(!$scope.validateWindfarmName($scope.shortNameOfWindfarm)){
			alert("Invalid wind farm name: "+shortNameOfWindfarm);
			return;
		}

		$scope.apiCallStatus = undefined;
		console.log("Should build data from results...");

		//Build stuff from daily data
		//Loop through every day
		angular.forEach($scope.dailyProduction, function(monthlyData, year) {
			var yearDailyCumulativeProductionDateArray = [];
			var yearDailyCumulativeProductionArray = [];
			var yearsCululativeValue = 0;

			var yearDailyProductionDateArray = [];
			var yearDailyWindArray = [];
			var yearDailyProductionArray = [];
			var yearDailyProductionAndWindVectors = [];

			//Loop through all months
			angular.forEach(monthlyData, function(dailyValues, month) {
				//Loop through all days
				angular.forEach(dailyValues, function(dailyValue, date) {
					//console.log("DailyValue: "+year+"-"+month+"-"+date+" - "+JSON.stringify(dailyValue));
					yearsCululativeValue += dailyValue["SUM "+$scope.shortNameOfWindfarm];
					yearDailyCumulativeProductionArray.push(yearsCululativeValue);
					//yearDailyCumulativeProductionDateArray.push(year + "-" + month + "-" + date);
					yearDailyCumulativeProductionDateArray.push(date + " " + $scope.dataService.getMonthNameByNumber(month));
					yearDailyProductionDateArray.push(year+"-"+month+"-"+date);
					yearDailyProductionArray.push(dailyValue["SUM "+$scope.shortNameOfWindfarm]);
					yearDailyWindArray.push($scope.dailyWindForecastData[year][month][date]["ws"])
					if(dailyValue["SUM "+$scope.shortNameOfWindfarm] == 0){
                        $scope.yearsEmptyDays[year] = $scope.yearsEmptyDays[year] + 1;
					}

				});
			});

			$scope.dailyProductionDataMap[year] = {
				datesCumulative: yearDailyCumulativeProductionDateArray,
				valuesCumulative: yearDailyCumulativeProductionArray,
				datesDailyProduction: yearDailyProductionDateArray,
				valuesDailyProduction: yearDailyProductionArray,
				valuesDailyWindSpeed: yearDailyWindArray
			};
			//console.log("dailyProductionDataMap: "+JSON.stringify($scope.dailyProductionDataMap));
		});

		//Build stuff from monthly data
		$scope.yearsMontlyProductionMonthNamesArray = [];
		$scope.yearsMontlyProductionArray = [];
		//For every month try to build the month
		for(var monthNumber=1; monthNumber<=$scope.currentMonth; monthNumber++) {
			if($scope.monthlyProduction[$scope.currentYear] !== undefined){
				$scope.yearsMontlyProductionMonthNamesArray.push($scope.dataService.getMonthNameByNumber(monthNumber));
				$scope.yearsMontlyProductionArray.push($scope.monthlyProduction[$scope.currentYear][monthNumber]["SUM "+$scope.shortNameOfWindfarm]);
			}
		}

		//Build stuff from yearly data
		$scope.yearsTotalProduction = $scope.yearlyProduction[$scope.currentYear]["SUM "+$scope.shortNameOfWindfarm];
		//Percent of capacity
		var numberOfDaysSinceStartOfTheYear = $scope.dataService.countNumberOfDaysSinceStartOfTheYear(
			$scope.currentYear, $scope.currentMonth, $scope.currentDate);
		var fullCapacity = numberOfDaysSinceStartOfTheYear * 24 * $scope.farmsFullCapacity[$scope.shortNameOfWindfarm];
		$scope.yearsPercentOfFullCapacity = $scope.yearsTotalProduction / fullCapacity * 100;

		//Last years data
		$scope.lastYearsTotalProduction = undefined;
		if($scope.yearlyProduction[$scope.currentYear - 1] !== undefined){
			$scope.lastYearsTotalProduction = $scope.yearlyProduction[$scope.currentYear - 1]["SUM "+$scope.shortNameOfWindfarm];
			$scope.lastYearsPercentOfFullCapacity = $scope.lastYearsTotalProduction / (365 * 24 * $scope.farmsFullCapacity[$scope.shortNameOfWindfarm]) * 100;
		}


		//Build grapsh
		$scope.buildAllGraphs();
	};

	$scope.isNumberIncrease = function(firstNumber, secondNumber){
		if(firstNumber === undefined || secondNumber === undefined ||
				firstNumber < secondNumber)
			return false;
		return true;
	};
	$scope.getYearsTotalProduction = function () {
		return $scope.yearsTotalProduction;
	};
	$scope.getLastYearsTotalProduction = function () {
		if(angular.isDefined($scope.lastYearsTotalProduction))
			return $scope.lastYearsTotalProduction;
		return "N/A";
	};
	$scope.getYearsAverageProduction = function () {
		if($scope.yearsMontlyProductionMonthNamesArray === undefined)
			return "N/A";
		return ($scope.yearsTotalProduction / $scope.yearsMontlyProductionMonthNamesArray.length);
	};
	$scope.getLastYearsAverageProduction = function () {
		if(angular.isDefined($scope.lastYearsTotalProduction))
			return $scope.lastYearsTotalProduction / 12;
		return "N/A";
	};
	$scope.getYearsPercentOfFullCapacity = function(){
		return $scope.yearsPercentOfFullCapacity;
	};
	$scope.getLastYearsPercentOfFullCapacity = function(){
		if(angular.isDefined($scope.lastYearsPercentOfFullCapacity))
			return $scope.lastYearsPercentOfFullCapacity;
		return "N/A";
	};
	$scope.getYearsEmptyDays = function () {
        return $scope.yearsEmptyDays[$scope.currentYear];
    };
    $scope.getLastYearsEmptyDays = function () {
        if(angular.isDefined($scope.yearsEmptyDays[$scope.currentYear - 1]))
            return $scope.yearsEmptyDays[$scope.currentYear - 1];
        return "N/A";
    };



	$scope.buildAllGraphs = function(){
		$scope.buildMonthlyProductionChart();
		$scope.buildCumulativeProductionChart();
		$scope.buildPowerCurveChart();
		$scope.buildWindProductionChart();
		$scope.buildTempPressureChart();
		$scope.buildWindRoseChart();
	};

	$scope.buildWindProductionChart = function (monthName) {

		if(angular.isUndefined(monthName)){
			var dateArray = $scope.dailyProductionDataMap[$scope.currentYear].datesDailyProduction;
			var dailyPowerArray = $scope.dailyProductionDataMap[$scope.currentYear].valuesDailyProduction;
			var dailyWindSpeedArray = $scope.dailyProductionDataMap[$scope.currentYear].valuesDailyWindSpeed;
		}
		else{
			var dateArray = [];
			var dailyPowerArray = [];
			var dailyWindSpeedArray = [];

			var monthValue = $scope.currentYear + "-" + $scope.dataService.getMonthNumberByName(monthName);

			for(var i=0;i<$scope.dailyProductionDataMap[$scope.currentYear].datesDailyProduction.length; i++){
				if($scope.dailyProductionDataMap[$scope.currentYear].datesDailyProduction[i].indexOf(monthValue) != -1){
					dateArray.push($scope.dailyProductionDataMap[$scope.currentYear].datesDailyProduction[i]);
					dailyPowerArray.push($scope.dailyProductionDataMap[$scope.currentYear].valuesDailyProduction[i]);
					dailyWindSpeedArray.push($scope.dailyProductionDataMap[$scope.currentYear].valuesDailyWindSpeed[i])
				}
			}
		}



		/*console.log(JSON.stringify(dateArray));
		console.log(JSON.stringify(dailyPowerArray));
		console.log(JSON.stringify(dailyWindSpeedArray));*/

		var trace1 = {
			x: dateArray,
			y: dailyWindSpeedArray,
			type: 'scatter',
			name: 'windspeed data',
			line: { // set the width of the line.
				width: 2
			},
			yaxis: 'y2',
		};

		var trace2 = {
			x: dateArray,
			y: dailyPowerArray,
			type: 'bar',
			name: 'production data',
		};

		var layout = {
			title: '',
			yaxis: {title: 'MW/h',range:[0,2500]},
			yaxis2: {
				title: 'm/s',
				titlefont: {color: 'rgb(148, 103, 189)'},
				tickfont: {color: 'rgb(148, 103, 189)'},
				overlaying: 'y',
				side: 'right',
				range: [0,10]
			}
		};

		var data = [trace1, trace2];
		Plotly.newPlot('wind-production-chart', data, layout, {modeBarButtonsToRemove: ['sendDataToCloud']});
	};

	$scope.buildPowerCurveChart = function () {

		var dailyPowerArray = $scope.dailyProductionDataMap[$scope.currentYear].valuesDailyProduction;
		var dailyWindSpeedArray = $scope.dailyProductionDataMap[$scope.currentYear].valuesDailyWindSpeed;

		trace1 = {
			x: dailyWindSpeedArray,
			y: dailyPowerArray,
			marker: {color: 'rgb(21, 83, 125)'},
			mode: 'markers',
			name: 'Power Output (W)',
			type: 'scatter',
			uid: '095034'
		};
		trace2 = {
			x: [0, 0.5, 1, 1.5, 2,
				2.5, 3, 3.5, 4, 4.5,
				5, 5.5, 6, 6.5, 7,
				7.5],
			y: [0, 0, 0, 0, 70,
				100, 250, 400, 500, 650,
				800, 1000, 1200, 1400, 1700,
				2000],
			connectgaps: false,
			line: {
				color: 'rgb(58, 211, 164)',
				width: 4
			},
			name: 'Power Output (W) - fit',
			opacity: 0.5,
			type: 'scatter',
			uid: '8e7154',
			xaxis: 'x',
			yaxis: 'y'
		};
		data = [trace1, trace2];
		layout = {
			autosize: true,
			showlegend: false,
			title: 'D400 Power Curve',
			xaxis: {
				autorange: true,
				range: [1.26701153999, 14.73298846],
				title: 'Wind Speed (m/s)',
				type: 'linear'
			},
			yaxis: {
				autorange: true,
				range: [-65.7530924456, 991.790117646],
				title: 'Power Output (W)',
				type: 'linear'
			}
		};
		Plotly.newPlot('power-curve-chart', data, layout, {modeBarButtonsToRemove: ['sendDataToCloud']}
		);
	};

	$scope.buildCumulativeProductionChart = function () {
		var dateArray = $scope.dailyProductionDataMap[$scope.currentYear].datesCumulative;
		var cumulativeProductionArray = $scope.dailyProductionDataMap[$scope.currentYear].valuesCumulative;

		var trace1 = {
			x: dateArray,
			y: cumulativeProductionArray,
			type: 'scatter',
			name: $scope.currentYear,
			line: { // set the width of the line.
				width: 3
			}
		};

		if($scope.dailyProductionDataMap[$scope.currentYear - 1] !== undefined){
			var dateArray2 = $scope.dailyProductionDataMap[$scope.currentYear - 1].datesCumulative;
			var cumulativeProductionArray2 = $scope.dailyProductionDataMap[$scope.currentYear - 1].valuesCumulative;

			var trace2 = {
				x: dateArray2,
				y: cumulativeProductionArray2,
				type: 'scatter',
				name: $scope.currentYear - 1,
				line: { // set the width of the line.
					width: 3
				}
			};
			var data = [trace1, trace2];
		}
		else{
			var data = [trace1];
		}

		var layoutProd2 = {
			title: '',
			yaxis: {title: 'MW/h'},
			hovermode:'closest'
		};


		Plotly.newPlot('cumulative-production-chart', data, layoutProd2, {modeBarButtonsToRemove: ['sendDataToCloud']});
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
		Plotly.newPlot('yearly-production-chart', dataProd, layoutProd, {modeBarButtonsToRemove: ['sendDataToCloud']});

		myPlot.on('plotly_click', function(data){
			var pts = '';
			var clickedMonth = '';
			for(var i=0; i < data.points.length; i++){
				pts = 'x = '+data.points[i].x +'\ny = '+
					data.points[i].y.toPrecision(4) + '\n\n';
				clickedMonth = data.points[i].x;
			}
			//alert('Closest point clicked:\n\n'+pts);
			$scope.buildWindProductionChart(clickedMonth);
		});
	};

    $scope.buildTempPressureChart = function () {
		url=$location.absUrl();
		urlLen=url.length;
		WFname=url.substring(urlLen-3,urlLen);
		//console.log(WFname);
        var dateArray = $scope.dailyProductionDataMap[$scope.currentYear].datesDailyProduction;
        var dailyPowerArray = $scope.dailyProductionDataMap[$scope.currentYear].valuesDailyProduction;
        var dailyWindSpeedArray = $scope.dailyProductionDataMap[$scope.currentYear].valuesDailyWindSpeed;

        Plotly.d3.csv("data/weather/PT_"+WFname+".csv", function(data){ 
            var dailyTemperatureArray=[];
            var dailyPressureArray=[];
            for (i in data){
                dailyTemperatureArray.push((parseFloat(data[i].T6)+parseFloat(data[i].T12)+parseFloat(data[i].T18))/3);
                dailyPressureArray.push((parseFloat(data[i].P6)+parseFloat(data[i].P12)+parseFloat(data[i].P18))/3);
            }
        var trace1 = {
            x: dateArray,
            y: dailyPressureArray,
            type: 'scatter',
            name: 'Pressure',
            line: {width: 2},
            yaxis: 'y',
        };
        var trace2 = {
            x: dateArray,
            y: dailyTemperatureArray,
            type: 'scatter',
            name: 'Temperature',
            line: {width: 2},
            yaxis: 'y2',
        };
        var trace3 = {
            x: dateArray,
            y: dailyWindSpeedArray,
            type: 'scatter',
            name: 'Wind Speed',
            line: {width: 2},
            yaxis: 'y3',
        };        
        var layout = {
            title: '',
			legend: {x: 1.1},
            yaxis: {title: 'Pa'},
            yaxis2: {
                title: 'Celcius',
                overlaying: 'y',
				zeroline: false,
                side: 'right'
            },
            yaxis3: {
                //title: 'm/s',
                overlaying: 'y',
				zeroline: false,
                range:[-10,10],
				showticklabels: false,
                //side: 'right'
            }
        };

        var plotData = [trace1, trace2, trace3];
        Plotly.newPlot('temp-pressure-chart', plotData, layout, {modeBarButtonsToRemove: ['sendDataToCloud']});
        });
    };

	$scope.buildWindRoseChart = function() {
		yearlyData=$scope.dailyWindForecastData[$scope.currentYear];
		dailyData=[];
		for (month in yearlyData){
			for (day in yearlyData[month]){
				if (yearlyData[month][day].ws>0){
					dailyData.push(yearlyData[month][day]);
				}
			}
		}
		num=dailyData.length;
		console.log(dailyData,num);
		directionFrequency=[0,0,0,0,0,0,0,0];
		ntick=3;
		maxSpeed=9.0;
		speedFrequency=new Array(ntick);
		for (i=0;i<ntick;i++) {
			speedFrequency[i]=new Array(8);
			for(j=0;j<8;j++) { speedFrequency[i][j]=0;}
		}
		for (d in dailyData){
			index=Math.floor((dailyData[d].wd+22.5)/45)%8;
			directionFrequency[index]+=1;
			for (i=Math.floor(dailyData[d].ws/(maxSpeed/ntick));i<ntick ;i++){
				speedFrequency[i][index]+=1;
			}
		}
		console.log(directionFrequency);
		console.log(speedFrequency);

		var trace1={
			r: speedFrequency[0],
			t: ['N',"NE","E",'SE','S','SW','W','NW'],
			name: '0-3m/s',
			type: 'area'
		};
		var trace2={
			r: speedFrequency[1],
			t: ['N',"NE","E",'SE','S','SW','W','NW'],
			name: '3-6m/s',
			type: 'area'
		};
		var trace3={
			r: speedFrequency[2],
			t: ['N',"NE","E",'SE','S','SW','W','NW'],
			name: '6-9m/s',
			type: 'area'
		};		
		var plotdata=[trace3,trace2,trace1];
		var layout={
			radialaxis: {ticksuffix: '%'},
			orientation: 270,
		}
		Plotly.newPlot("windrose-chart",plotdata,layout);
	}

	$scope.validateWindfarmName = function (shortNameOfWindfarm) {
		if($scope.nameOfWindfarms.indexOf(shortNameOfWindfarm) === -1){
			return false;
		}
		return true;
	};

	//$scope.buildDataFromApi($scope.currentYear, $scope.shortNameOfWindfarm);
	/*$scope.buildMonthlyProductionChart(2012, "wp2");
	$scope.buildKeyMetricsView(2012, "wp2");*/

    if ($location.search().wf === undefined ) {
        $scope.setCurrentWindfarmId("wp1");
    }
    else {
        $scope.setCurrentWindfarmId($location.search().wf);
    }

});