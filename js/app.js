// We setup the main Angular model that we will use for our application
// Good Angular practice is to organize your code in different modules, 
// for instance, one module per feature. However, since our App is
// simple we will keep all the code in the "dinnerPlanner" module
//
// Notice the 'ngRoute' and 'ngResource' in the module declaration. Those are some of the core Angular
// modules we are going to use in this app. If you check the index.html you will
// also see that we included separate JavaScript files for these modules. Angular
// has other core modules that you might want to use and explore when you go deeper
// into developing Angular applications. For this lab, these two will suffice.
var dashboardApp = angular.module('dashboard',
    ['ngRoute','ngResource', 'ngCookies', 'customFiltersModule'])
    .config(function($locationProvider) {
        $locationProvider.html5Mode({
            enabled:true,
            requireBase: false
        });
    });