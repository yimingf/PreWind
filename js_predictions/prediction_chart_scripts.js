/* Wind production chart */
var dateArray = ["2012-01-01","2012-01-02","2012-01-03","2012-01-04","2012-01-05","2012-01-06","2012-01-07","2012-01-08","2012-01-09","2012-01-10","2012-01-11","2012-01-12","2012-01-13","2012-01-14","2012-01-15","2012-01-16","2012-01-17","2012-01-18","2012-01-19","2012-01-20","2012-01-21","2012-01-22","2012-01-23","2012-01-24","2012-01-25","2012-01-26","2012-01-27","2012-01-28","2012-01-29","2012-01-30","2012-01-31","2012-02-01","2012-02-02","2012-02-03","2012-02-04","2012-02-05","2012-02-06","2012-02-07","2012-02-08","2012-02-09","2012-02-10","2012-02-11","2012-02-12","2012-02-13","2012-02-14","2012-02-15","2012-02-16","2012-02-17","2012-02-18","2012-02-19","2012-02-20","2012-02-21","2012-02-22","2012-02-23","2012-02-24","2012-02-25","2012-02-26","2012-02-27","2012-02-28","2012-02-29"];

var windspeedArray = [4.01,4.01,3.42,3.42,3.07,3.57,5.06,5.06,4.55,2.32,4.55,3.8,4.43,3.95,4.56,3.39,8.7,4.72,3.87,2.15,2.81,4.74,6.43,4.72,4.75,3.17,4.75,6.85,4.79,2.19,4.74,5.03,2.7,2.78,2.28,5.06,3.08,3.5,5.06,4.47,1.68,3.93,5.87,4.79,1.87,6.43,3.3,5.03,2.73,6.85,3.35,4.32,8.7,2.93,5.87,4.29,6.43,4.56,0.6,4.74];

var productionArray = [0.3,0.35,0.747,0.747,0.747,0.2,0.521,0.521,0.521,0.361,0.361,0.361,0.361,0.456,0.456,0.456,0.822,0.822,0.822,0.822,0.576,0.576,0.576,0.351,0.351,0.351,0.351,0.135,0.135,0.135,0.175,0.175,0.175,0.175,0.065,0.065,0.065,0.09,0.09,0.09,0.09,0.336,0.336,0.336,0.551,0.551,0.551,0.551,0.777,0.777,0.777,0.045,0.8,0.551,0.777,0.045,0.551,0.8,0.1,0.5];

var trace1 = {
    x: dateArray,
    y: windspeedArray,
    type: 'scatter',
    name: 'windspeed data',
    line: { // set the width of the line.
        width: 3
    },
    yaxis: 'y2',
};

var trace2 = {
    x: dateArray,
    y: productionArray,
    type: 'bar',
    name: 'production data',
};

var layout = {
    title: '',
    yaxis: {title: '% of full capacity'},
    yaxis2: {
        title: 'm/s',
        titlefont: {color: 'rgb(148, 103, 189)'},
        tickfont: {color: 'rgb(148, 103, 189)'},
        overlaying: 'y',
        side: 'right'
    }
};

var data = [trace1, trace2];
Plotly.newPlot('wind-production-chart', data, layout);



/* Wind speed production */
var trace1 = {
    r: [77.5, 72.5, 70.0, 45.0, 22.5, 42.5, 40.0, 62.5],
    t: ['North', 'N-E', 'East', 'S-E', 'South', 'S-W', 'West', 'N-W'],
    name: '11-14 m/s',
    marker: {color: 'rgb(106,81,163)'},
    type: 'area'
};

var trace2 = {
    r: [57.5, 50.0, 45.0, 35.0, 20.0, 22.5, 37.5, 55.0],
    t: ['North', 'N-E', 'East', 'S-E', 'South', 'S-W', 'West', 'N-W'],
    name: '8-11 m/s',
    marker: {color: 'rgb(158,154,200)'},
    type: 'area'
};

var trace3 = {
    r: [40.0, 30.0, 30.0, 35.0, 7.5, 7.5, 32.5, 40.0],
    t: ['North', 'N-E', 'East', 'S-E', 'South', 'S-W', 'West', 'N-W'],
    name: '5-8 m/s',
    marker: {color: 'rgb(203,201,226)'},
    type: 'area'
};

var trace4 = {
    r: [20.0, 7.5, 15.0, 22.5, 2.5, 2.5, 12.5, 22.5],
    t: ['North', 'N-E', 'East', 'S-E', 'South', 'S-W', 'West', 'N-W'],
    name: '< 5 m/s',
    marker: {color: 'rgb(242,240,247)'},
    type: 'area'
};

var data = [trace1, trace2, trace3, trace4];

var layout = {
    title: '',
    font: {size: 16},
    legend: {font: {size: 16}},
    radialaxis: {ticksuffix: '%'},
    orientation: 270
};

Plotly.newPlot('wind-direction-chart', data, layout);

/* Monthly production data */
/* Wind production chart */
/*var dateArrayProd = ["January", "February", "March"];

var productionArrayProd = [0.3, 0.35, 0.747];

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
Plotly.newPlot('yearly-production-chart', dataProd, layoutProd);*/