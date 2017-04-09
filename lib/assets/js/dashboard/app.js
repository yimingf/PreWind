var dashboardApp = angular.module('dashboard',
  ['ngRoute', 'ngResource', 'ngCookies', 'customFiltersModule'])
  .config(function ($locationProvider) {
    $locationProvider.html5Mode({
      enabled: true,
      requireBase: false,
        rewriteLinks: false
    });
  });