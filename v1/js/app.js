'use strict';
var app = angular.module('valuateApp', []);
app.constant('APIBASE', 'http://35.160.86.253/nbb/public/nic/');
/**
 * AngularJS default filter with the following expression:
 * "person in people | filter: {name: $select.search, age: $select.search}"
 * performs an AND between 'name: $select.search' and 'age: $select.search'.
 * We want to perform an OR.
 */

//app.controller('DemoCtrl', function ($scope, $http, $timeout, $interval) {
app.controller('DemoCtrl', ['APIBASE', '$scope', '$rootScope', '$timeout', '$http', '$filter', '$q', '$interval', function(APIBASE, $scope, $rootScope, $timeout, $http, $filter, $q, $interval) {

    //The DATA Sources
    $scope.car = {};
    
    //Get Car Brands
    
    $http.get(APIBASE+'get_brands').then(function(resp) {
        $rootScope.cars = resp.data;
        setTimeout(function(){
            //alert(resp.data);
            $('#make_select_search_lp').multipleSelect({
                placeholder: "Car Make",
                filter: true,
                selectAll: false,
                single:true
            });
        },0)
    });
    
    
    //Get Car Year List
    var getYears = function () {
        $http.get(APIBASE + 'get_years_unfiltered').then(function (resp) {
            $rootScope.years = resp.data;
        });
        
        var k = 0;
        
        setTimeout(function(){
        // Date  select with search
            do{
                $('#date_select_search_lp').multipleSelect({
                                placeholder: "Select Year",
                                filter: true,
                                selectAll: false,
                                single:true
                            }); 
            }while(k==1);
        
            
        },1000)

        
    };
    
    //getYears();
    
    
    $scope.alertPicked = function(){
        var ccc = $scope.picked;
        alert(ccc[0].Name);
        getYears();
    };
    
    
    
}]);