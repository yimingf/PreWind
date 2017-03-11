var dashboardApp = angular.module('dashboard',
  ['ngRoute', 'ngResource', 'ngCookies', 'customFiltersModule'])
  .config(function ($locationProvider, $routeProvider) {
    $locationProvider.html5Mode({
      enabled: false,
      requireBase: false
    });
  });