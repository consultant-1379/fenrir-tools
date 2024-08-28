    var performanceTestToolsApp = angular.module('PerformanceTestToolsApp', ['ngRoute', 'ngMaterial', 'ngMaterialCollapsible',
    'nodeManagement', 'nodeStore', 'fileCollectionVerification'] );

    performanceTestToolsApp.config(function($routeProvider, $locationProvider) {
        $locationProvider.html5Mode(true);
        $routeProvider.
           when('', {
                     templateUrl: 'assets/modules/home-page/home-page-container.template.html'
           }).
           when('/homepage', {
             templateUrl: 'assets/modules/home-page/home-page-container.template.html'
           }).
           when('/nodemanagement', {
             templateUrl: 'assets/modules/node-management/node-management-container.template.html'
           }).
           when('/filecollectionverification', {
             templateUrl: 'assets/modules/file-collection-verification/file-collection-verification-container.template.html'
           }).
           when('/helpandsetup', {
             templateUrl: 'assets/modules/help-and-setup/help-and-setup.template.html',
             controller: 'HelpAndSetupController'
           }).
           otherwise({
             redirectTo: '/homepage'
           });
      });

    performanceTestToolsApp.controller('performanceTestToolsController', function ($scope, $location, $timeout, $mdSidenav, $log) {
      $scope.changeView = function(path) {
        $location.path(path);
      };
    });

    performanceTestToolsApp.controller('FileCollectionVerificationController', function ($scope, $timeout, $mdSidenav, $log) {
      $scope.close = function() {
        alert("hey. FileCollectionVerificationController");
      };
    });

    performanceTestToolsApp.controller('HelpAndSetupController', function ($scope) {
      $scope.close = function() {
        alert("hey. HelpAndSetupController");
      };
});
