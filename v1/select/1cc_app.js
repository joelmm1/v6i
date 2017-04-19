//'use strict';
var app = angular.module( 'valuateApp', [ 'ngSanitize', 'ui.select', 'firebase' ] );
app.constant( 'APIBASE', 'http://35.160.86.253/nbb/public/nic/' );
/**
 * AngularJS default filter with the following expression:
 * "person in people | filter: {name: $select.search, age: $select.search}"
 * performs an AND between 'name: $select.search' and 'age: $select.search'.
 * We want to perform an OR.
 */


app.filter( 'unique', function() {
    // we will return a function which will take in a collection
    // and a keyname
    return function( collection, keyname ) {
        // we define our output and keys array;
        var output = [],
            keys = [];
        // we utilize angular's foreach function
        // this takes in our original collection and an iterator function
        angular.forEach( collection, function( item ) {
            // we check to see whether our object exists
            var key = item[ keyname ];
            // if it's not already part of our keys array
            if ( keys.indexOf( key ) === -1 ) {
                // add it to our keys array
                keys.push( key );
                // push this item to our final output array
                output.push( item );
            }
        } );
        // return our array which should be devoid of
        // any duplicates
        return output;
    };
} );

app.filter( 'carCCFilter', function() {
    return function( items, search ) {
        var result = [];
        angular.forEach( items, function( value, key ) {
            angular.forEach( value, function( value2, key2 ) {
                if ( value2 === search ) {
                    result.push( value );
                }
            } )
        } );
        return result;

    }
} );

app.service( 'sharedProperties', function() {
    var stringValue, theRealBrand;
    return {
        serveString: function() {
            ////alert(stringValue)
            theRealBrand = stringValue;
            return theRealBrand;
        },
        captureString: function( value ) {
            alert( value )
            stringValue = value;
        }
    }
} );

app.controller( 'DemoCtrl', [ 'sharedProperties', 'APIBASE', '$scope', '$rootScope', '$timeout', '$http', '$filter', '$q', '$interval', function( sharedProperties, APIBASE, $scope, $rootScope, $timeout, $http, $filter, $q, $interval ) {

    var engineCapacities, rawEngineCapacities;

    $http.get( APIBASE + 'engine_capacities' ).then( function( resp ) {
        rawEngineCapacities = resp.data;
        //console.log(rawEngineCapacities)
        //$scope.engineCapacities
        engineCapacities = rawEngineCapacities.replace( '"]1178', '"]' );

        $scope.engineCapacities = JSON.parse( engineCapacities );
        console.log('engineCapacities');
        console.log(engineCapacities);

        setTimeout( function() {
            $( '.theCarCC a' ).click( function() {
                $scope.searchParam = $( this ).html();

                $scope.searchCCParam = $( this ).html();
                //Filter by specific CC
                $http.get( APIBASE + 'engine_capacities/' + $( this ).html() ).then( function( resp ) {
                    $scope.searchCCResult = resp.data;

                    //Create new object the search EngineCC Brands
                    var searchCCResult = resp.data;
                    var params;
                    var k;

                    var getCarCCImage = function( k ) {

                        var getPrices = function() {
                            $http.post( APIBASE + 'value_car/quick', params ).then( function( resp ) {

                                var carMinimum_price = String( resp.data.minimum_price ).replace( /(.)(?=(\d{3})+$)/g, '$1,' );
                                var carMaximum_price = String( resp.data.maximum_price ).replace( /(.)(?=(\d{3})+$)/g, '$1,' );

                                var priceObj = {
                                    "minimum_price": carMinimum_price,
                                    "maximum_price": carMaximum_price
                                };
                                
                                //Merge new object
                                searchCCResult[ k ] = $.extend( {}, searchCCResult[ k ], priceObj );

                            } );
                        };

                        $http.get( APIBASE + 'model_image/' + searchCCResult[ k ].ModelID + '/' + searchCCResult[ k ].Year ).then( function( resp ) {

                            var theCarImg = resp.data.imageUrl;
                            
                            if (theCarImg=='none'){
                                theCarImg = 'images/default_car.jpg';
                            }

                            var imageObj = {
                                "image": theCarImg
                            };
                            
                            //Merge new object
                            searchCCResult[ k ] = $.extend( {}, searchCCResult[ k ], imageObj );

                            params = {
                                brand: searchCCResult[ k ].brand.toUpperCase(),
                                model: searchCCResult[ k ].model.toUpperCase(),
                                year: searchCCResult[ k ].Year,
                                mileage: '10000'
                            };

                            getPrices();
                        } );

                    };

                    for ( k = 0; k < searchCCResult.length; k++ ) {
                        //let m = k
                        getCarCCImage( k );
                    }


                    console.log( 'searchCCResult' );
                    //console.log(mergedSearch);

                    console.log( searchCCResult );

                    var brandsCC = [];
                    var i;
                    for ( i = 0; i < searchCCResult.length; i++ ) {
                        brandsCC.push( {
                            'name': searchCCResult[ i ].brand
                        } );
                    }

                    $scope.brandsCC = brandsCC;

                } );

                setTimeout(function(){
                    var logoCount = $('#car-attract .brand-item-wrapper>div').length;
                    //alert(logoCount);

                    if (logoCount==1){
                      $('#car-attract .brand-item-wrapper>div').css('width','100%');
                    };
                    if (logoCount==2){
                      $('#car-attract .brand-item-wrapper>div').css('width','50%');
                    };
                    if (logoCount==3){
                      $('#car-attract .brand-item-wrapper>div').css('width','33%');
                    };
                    if (logoCount==4){
                      $('#car-attract .brand-item-wrapper>div').css('width','25%');
                    };
                    if (logoCount==5){
                      $('#car-attract .brand-item-wrapper>div').css('width','20%');
                    };
                },1000);

            } );
        }, 0 );
        
        //Remove some CCs
        setTimeout(function(){
            $( '.theCarCC a' ).each( function() {
                    //$( this ).css('float','left')
                    var removeContent = $( this ).html();
                    //alert(111)
                    if((removeContent == '900')||(removeContent == '1000')||(removeContent == '1200')||(removeContent == '1300')||(removeContent == '1500')||(removeContent == '1600')||(removeContent == '1800')||(removeContent == '2000')||(removeContent == '2400')||(removeContent == '2500')||(removeContent == '3000')||(removeContent == '3500')){
                        $( this ).fadeIn();
                    } else {
                        $( this ).parent('li').css('display','none');
                    }
            });            
        },100);
        
    } );


    //Switch Search Param to search by the Car Brand    

    $scope.ShowId = function( event ) {
        console.log( event.target.id );
        $scope.searchParam = event.target.id;
    };



} ] );