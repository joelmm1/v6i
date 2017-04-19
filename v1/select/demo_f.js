//'use strict';
var app = angular.module( 'valuateApp', [ 'ngSanitize', 'ui.select', 'firebase' ] );
app.constant( 'APIBASE', 'http://35.160.86.253/nbb/public/nic/' );
/**
 * AngularJS default filter with the following expression:
 * "person in people | filter: {name: $select.search, age: $select.search}"
 * performs an AND between 'name: $select.search' and 'age: $select.search'.
 * We want to perform an OR.
 */
app.constant( 'FBDB', 'https://test-ffbac.firebaseio.com/' );

app.factory( 'userProfileFactory', [ 'FBDB', '$q', function( FBDB, $q ) {
    var personalKey;
    return {
        userProfile: function( searchEmail ) {
            var deferred = $q.defer();
            var FBref = new Firebase( FBDB );
            var promise = FBref.orderByChild( 'text' )
                .startAt( searchEmail )
                .endAt( searchEmail )
                .on( 'value', function( snapshot ) {
                    var data = snapshot.val();
                    personalKey = Object.keys( data )[ 0 ];
                    deferred.resolve( personalKey );
                } );
            return deferred.promise;
        }
    };
} ] );
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
app.filter( 'propsFilter', function() {
    return function( items, props ) {
        var out = [];
        if ( angular.isArray( items ) ) {
            var keys = Object.keys( props );
            items.forEach( function( item ) {
                var itemMatches = false;
                for ( var i = 0; i < keys.length; i++ ) {
                    var prop = keys[ i ];
                    var text = props[ prop ].toLowerCase();
                    if ( item[ prop ].toString().toLowerCase().indexOf( text ) !== -1 ) {
                        itemMatches = true;
                        break;
                    }
                }
                if ( itemMatches ) {
                    out.push( item );
                }
            } );
        } else {
            // Let the output be the input untouched
            out = items;
        }
        return out;
    };
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
            //alert(value)
            stringValue = value;
        }
    }
} );
app.controller( 'DemoCtrl', [ 'sharedProperties', 'APIBASE', '$scope', '$rootScope', '$timeout', '$http', '$filter', '$q', '$interval', function( sharedProperties, APIBASE, $scope, $rootScope, $timeout, $http, $filter, $q, $interval ) {
    var varnewMileage;
    var reValidate;

        //Filter Mechanism
    var theBrand, theID, theYear, theBodyType, theModel, theMilleage, the_subModel, thecarColor = "WHITE",
        theModelID, carCountry, engineCap, samePriceMin, samePriceMax, the_subModelID, carExtras, carImage, 
        carImageQuick, clearPlaceholder, clearQuickValues, extraoptions = {}, fuelType, driveTrain, dataa, valueRequest;
    
// Disable Buttons for Form Validation Logic
    var disableValue = function(){
        //Quick Valuation Value Button
        $('a.quick.scrollB :input[type="submit"]').prop('disabled', true).addClass('disabled');
        $('a.quick.scrollB').removeAttr('href');
        
        //Advanced Valuation Next Button
        
        $('#msform fieldset:nth-child(1) .next.action-button:input[type="button"]').prop('disabled', true).addClass('disabled');
        $('#browseByTab1 .j-row .mileage_input').prop('disabled', true).addClass('disabled');
        
        $scope.brandDisabled = false, $scope.modelDisabled = true, $scope.yearDisabled = true, $scope.submodelDisabled = true; 
        
    };
    var enableValue = function(){
        $('a.quick.scrollB :input[type="submit"]').prop('disabled', false).removeClass('disabled');
        $('a.quick.scrollB').attr('href','#browseByTab3');
    };
    //$('a.scrollB').attr('href','#browseByTab3');
    
    disableValue();
    
// End Form Validation Logic

    $scope.bodyClass = "landing";
    //The DATA Sources
    $scope.car = {};
    //Get Car Brands
    $http.get( APIBASE + 'get_brands' ).then( function( resp ) {
        //$rootScope.cars = resp.data;
        $rootScope.cars = resp.data.popular;
    } );
    //Get Car Year by Brand ID
    //    var getYears = function(theID){ 
    //        $http.get(APIBASE+'get_years/'+theID).then(function (resp) {
    //          $scope.years = resp.data;
    //        });
    //    };
    var getYears = function( theModelID ) {
        $http.get( APIBASE + 'get_years/' + theModelID ).then( function( resp ) {
            $rootScope.years = resp.data;
            if((resp.data.length)>0){
                $scope.yearDisabled = false;
            }
            
        } );
        //console.log($rootScope.mileage);
    };
    
    
    var getCountries = function( theModelID ) {
        $http.get( APIBASE + 'countries/' + theModelID ).then( function( resp ) {
            //alert(theModelID)
            $scope.carCountry = resp.data;
        } );
        
        $http.get( APIBASE + 'colors/' + theModelID).then( function( resp ) {
            
        //$http.get( APIBASE + 'get_colors').then( function( resp ) {    
            $scope.carcolor = resp.data;
            console.log("carcoloe");
            console.log(resp.data);
        } );
        
    };
    
    
    //Get Car Body Type by Brand ID & Year
    var getbodyTypes = function( theID, theYear ) {
        $http.get( APIBASE + 'get_body_types_filtered/' + theID + '/' + theYear ).then( function( resp ) {
            $scope.bodytypes = resp.data;
        } );
    };
    //Get Car Model by Body Type, Brand ID & Year
    //    var getModels = function(brandid,year,bodytype){ 
    //            $http.get(APIBASE+'get_models_filtered/'+brandid+'/'+year+'/'+bodytype).then(function (resp) {
    //          $scope.models = resp.data;
    //        });
    //    };
    var getModels = function( brandid ) {
        $http.get( APIBASE + 'get_models_unfiltered/' + brandid ).then( function( resp ) {
            console.log(resp.data);
            $rootScope.models = resp.data;
            if((resp.data.length)>0){
                $scope.modelDisabled = false;
            }
        } );
    };
    var getSubModels = function( modelid, theYear ) {
        ////alert("modelid"+" "+theYear);
        $http.get( APIBASE + 'get_trims/' + modelid + '/' + theYear ).then( function( resp ) {
            $rootScope.submodels = resp.data;
            if((resp.data.length)>0){
                $scope.submodelDisabled = false;
            }
        } );
    };

    var invisibleCount = 0;
    var TheBrand;
    var showplaceholders = true;
    
    //Show placeholders y default
    
    $scope.brandPlaceholder = true;
    $scope.modelPlaceholder = true;
    $scope.carYearPlaceholder = true;
    $scope.subModelPlaceholder = true;
    $scope.milleagePlaceholder = true;

    $scope.showPlaceholders = function() {
        if(showplaceholders==true){
            $scope.brandPlaceholder = false;
            $scope.modelPlaceholder = false;
            $scope.carYearPlaceholder = false;
            $scope.subModelPlaceholder = false;
            $scope.milleagePlaceholder = false; 
        }
    };
    
    $scope.hidePlaceholders = function(){
        showplaceholders = false;
        setTimeout(function(){
            $scope.brandPlaceholder = true;
            $scope.modelPlaceholder = true;
            $scope.carYearPlaceholder = true;
            $scope.subModelPlaceholder = true;
            $scope.milleagePlaceholder = true;
        },1000);
    };

    $scope.brandClearFields = function() {
        $scope.modelPlaceholder = false;
        $scope.carYearPlaceholder = false;
        $scope.subModelPlaceholder = false;
        $scope.milleagePlaceholder = false;  
    };

    $scope.modelClearFields = function() {
        $scope.carYearPlaceholder = false;
        $scope.subModelPlaceholder = false;
        $scope.milleagePlaceholder = false; 
    };

    $scope.yearClearFields = function() {
        $scope.subModelPlaceholder = false;
        $scope.milleagePlaceholder = false; 
    };

    $scope.clearFields = function() {
        clearPlaceholder = false;
    };

    $scope.quickClearFields = function() {
        clearQuickValues = true;
    };
    
    $scope.quickReClearFields = function() {
        $scope.modelDisabled = true;
        $scope.yearDisabled = true;
        $scope.submodelDisabled = true;
        $('#browseByTab1 .j-row .mileage_input').prop('disabled', true).addClass('disabled');
        
        setTimeout(function(){
            $scope.cars.selected.Brand = "";
            $scope.cars.selected.model = "";
            $scope.cars.selected.carYear = "";
            $scope.cars.selected.subModel = "";
            $scope.cars.selected.carCountry = "";
            $scope.cars.selected.carColor = "";
            $scope.readmileage = "";

            $scope.brandPlaceholder = false;
            $scope.modelPlaceholder = false;
            $scope.carYearPlaceholder = false;
            $scope.subModelPlaceholder = false;
            $scope.milleagePlaceholder = false;
        },500);
    };
    
    $scope.resetFields = function() {
            showplaceholders = true;
            $scope.car.selected.Brand = "";
            $scope.car.selected.Model = "";
            $scope.car.selected.carYear = "";
            $scope.car.selected.subModel = "";
            $scope.milleageValue = "";
            
            //Disable Dropdowns
            $scope.modelDisabled = true;
            $scope.yearDisabled = true;
            $scope.submodelDisabled = true;
            $('#browseByTab1 .j-row .mileage_input').prop('disabled', true).addClass('disabled');
            $('a.quick.scrollB :input[type="submit"]').prop('disabled', true).removeClass('disabled');
        };

    //Get Car Brands
    $scope.seiveBrand = function( value ) {
        theBrand = value.Name.toUpperCase();
        TheBrand = value.Name.toUpperCase();
        $rootScope.theBrand = value.Name;
        theID = value.ID;
        getModels( theID );
        //Clear Fields
        
        if ( clearPlaceholder === false ) {
            $scope.cars.selected.model = "";
            $scope.cars.selected.carYear = "";
            $scope.cars.selected.subModel = "";
            $scope.cars.selected.carCountry = "";
            $scope.cars.selected.carColor = "";
            $scope.readmileage = "";
        }

        if ( clearQuickValues === true ) {
            $scope.car.selected.Model = "";
            $scope.car.selected.carYear = "";
            $scope.car.selected.subModel = "";
            $scope.milleageValue = "";
            
            //Disable Dropdowns
            $scope.modelDisabled = true;
            $scope.yearDisabled = true;
            $scope.submodelDisabled = true;
            $('#browseByTab1 .j-row .mileage_input').prop('disabled', true).addClass('disabled');
        }

    };


    //Get Car Body Type by Brand ID & Year
    //    $scope.seiveYear = function(value) {
    //        theYear = value.Year;
    //        getbodyTypes(theID,theYear);
    //    };
    //Get Car Model by Brand ID

    $scope.seiveYear = function( value ) {
        theYear = value.Year.toString();
        $rootScope.theYear = value.Year.toString();
        console.log( "theModelID: " + theModelID );
        console.log( "theYear: " + theYear );
        getSubModels( theModelID, theYear );
        getModels( theID );

        //Clear Fields
        if ( clearPlaceholder === false ) {
            $scope.cars.selected.subModel = "";
            $scope.cars.selected.carCountry = "";
            $scope.cars.selected.carColor = "";
            $scope.readmileage = "";
        }

        if ( clearQuickValues === true ) {
            $scope.car.selected.subModel = "";
            $scope.milleageValue = "";
  
            //Disable Dropdowns
            $scope.submodelDisabled = true;
            $('#browseByTab1 .j-row .mileage_input').prop('disabled', true).addClass('disabled');
        }

        $http.get( APIBASE + 'model_image/' + theModelID + '/' + theYear ).then( function( resp ) {
            carImageQuick = resp.data;
            console.log( carImageQuick )
            if ( carImageQuick.imageUrl == "none" ) {
                carImageQuick.imageUrl = "images/placeholder.jpg";
            }

            $rootScope.carImageQuick = carImageQuick.imageUrl;
            $scope.carImageUrl = carImageQuick.imageUrl;
        } );

    };
    //Get Car Model by Body Type, Brand ID & Year
    $scope.seiveBodyType = function( value ) {
        theBodyType = value.BodyType;
        getModels( theID, theYear, theBodyType );
    };
    $scope.seiveModel = function( value ) {

        $rootScope.theModel = value.DisplayName.toLowerCase();
        theModel = value.Name.toUpperCase();
        theModelID = value.ID;
        getYears( theModelID );
        getCountries( theModelID );
        //Clear Fields
        if ( clearPlaceholder === false ) {
            $scope.cars.selected.carYear = "";
            $scope.cars.selected.subModel = "";
            $scope.cars.selected.carCountry = "";
            $scope.cars.selected.carColor = "";
            $scope.readmileage = "";
        };

        if ( clearQuickValues === true ) {
            $scope.car.selected.carYear = "";
            $scope.car.selected.subModel = "";
            $scope.milleageValue = "";
            
            
            //Disable Dropdowns
            $scope.yearDisabled = true;
            $scope.submodelDisabled = true; 
            $('#browseByTab1 .j-row .mileage_input').prop('disabled', true).addClass('disabled');
        }
        
    };
    $scope.seivesubModel = function( value ) {
        console.log( "valuevalu" );
        console.log( value );
        //Clear Fields
        if ( clearPlaceholder === false ) {
            $scope.cars.selected.carCountry = "";
            $scope.cars.selected.carColor = "";
            $scope.readmileage = "";
        };

        $rootScope.the_subModel = value.Name;
        $rootScope.the_subModelID = value.ID.toString();
        the_subModel = value.Name;
        the_subModelID = value.ID;
        engineCap = value.EngineCap.toString();
        fuelType = value.FuelType;
        driveTrain = value.DriveTrain;
        
        
        $rootScope.engineCap = value.EngineCap.toString();
        $http.get( APIBASE + 'get_extras/' + theModelID ).then( function( resp ) {
            carExtras = resp.data;

            console.log( carExtras );
            
            var interior = [];
            var exterior = [];
            var i;
            for ( i = 0; i < carExtras.length; i++ ) {
                
                
                
                if ( carExtras[ i ].CategoryName == "Interior" ) {
                    if ( carExtras[ i ].Enabled == 1 ) {
                        extraoptions[carExtras[ i ].Name] = "yes";
                        carExtras[ i ].Enabled = "enabled";
                    } else {
                        extraoptions[carExtras[ i ].Name] = "no";
                        carExtras[ i ].Enabled = "disabled";
                    }
                    interior.push( {
                        "displayname": carExtras[ i ].DisplayName,
                        "enabled": carExtras[ i ].Enabled,
                        "name": carExtras[ i ].Name
                    } );
                } else if ( carExtras[ i ].CategoryName == "Exterior" ) {
                    if ( carExtras[ i ].Enabled == 1 ) {
                        extraoptions[carExtras[ i ].Name] = "yes";
                        carExtras[ i ].Enabled = "enabled";
                    } else {
                        extraoptions[carExtras[ i ].Name] = "no";
                        carExtras[ i ].Enabled = "disabled";
                    }
                    exterior.push( {
                        "displayname": carExtras[ i ].DisplayName,
                        "enabled": carExtras[ i ].Enabled,
                        "name": carExtras[ i ].Name
                    } );
                }
            };

            console.log(extraoptions);

            console.log( interior );

            var interiorOne = [];
            var interiorTwo = [];
            var exteriorOne = [];
            var exteriorTwo = [];
            var a;
            for ( a = 0; a < interior.length; a++ ) {
                $scope.index = a;
                if ( a % 2 == 0 ) {
                    interiorOne.push( {
                        "displayname": interior[ a ].displayname,
                        "enabled": interior[ a ].enabled,
                        "name": interior[ a ].name
                    } );
                } else {
                    interiorTwo.push( {
                        "displayname": interior[ a ].displayname,
                        "enabled": interior[ a ].enabled,
                        "name": interior[ a ].name
                    } );
                }
            };
            var b;
            for ( b = 0; b < exterior.length; b++ ) {
                $scope.index = a;
                if ( b % 2 == 0 ) {
                    exteriorOne.push( {
                        "displayname": exterior[ b ].displayname,
                        "enabled": exterior[ b ].enabled,
                        "name": exterior[ b ].name
                    } );
                } else {
                    exteriorTwo.push( {
                        "displayname": exterior[ b ].displayname,
                        "enabled": exterior[ b ].enabled,
                        "name": exterior[ b ].name
                    } );
                }
            };
            console.log( 'interiorOne' );
            console.log( interiorOne );
            $scope.interiorOne = interiorOne;
            $scope.interiorTwo = interiorTwo;
            $scope.exteriorOne = exteriorOne;
            $scope.exteriorTwo = exteriorTwo;

            setTimeout( function() {
                $( "div.disabled input" ).prop( "disabled", true );
                $( "div.enabled input" ).prop( "disabled", false );

                extrasTriggerPrice();
                extrasTrigger();

            }, 1000 );

            //The Extras Activation


            setTimeout( function() {
                //Switches Styling Scripts

                $( '.gender :radio' ).rcSwitcher( {
                        // reverse: true,
                        theme: 'yellowish-green',
                        width: 48,
                        height: 16,
                        onText: '',
                        offText: '',
                        blobOffset: 2,
                        inputs: false,
                        autoStick: true,
                    } )
                    // Listen to status changes
                    .on( 'turnon.rcSwitcher', function( e, data ) {
                        // console.log( data.$input[0].checked );
                    } );

                $( '.level :radio' ).rcSwitcher( {
                    // reverse: true,
                    theme: 'flat',
                    // width: 70,
                    blobOffset: 1,
                } );


                $( '.permissions :checkbox' ).rcSwitcher( {
                    // reverse: true,
                    // inputs: true,
                    blobOffset: 2,
                    // autoFontSize: true,
                    theme: 'yellowish-green',
                    width: 54,
                    height: 22,
                    onText: '',
                    offText: '',
                    inputs: false,

                    autoStick: true,
                } ).on( 'toggle.rcSwitcher', function( e, data, type ) {
                    // console.log( type );
                } );

                $( '.delete :checkbox' ).rcSwitcher( {
                    // reverse: true,
                    inputs: true,
                    // width: 70,
                    // height: 24,
                    // blobOffset: 2,
                    onText: 'Del',
                    offText: 'No',
                    theme: 'modern',
                    // autoFontSize: true,
                } ).on( {
                    'enable.rcSwitcher': function( e, data ) {
                        console.log( 'Enabled', data );
                    },

                    'disable.rcSwitcher': function( e, data ) {
                        console.log( 'Disabled' );
                    }
                } );

                /*-------------------------------------------------------------------*\
                |                           Testing Input Changes
                \*-------------------------------------------------------------------*/

                // Auto Check Radio Button
                // NOTE: Radio Button Are Disabled Only By Activating Another Sibiling Radio


                $( '.toggle-radio' ).on( 'click', function( e ) {
                    if ( $( ':radio[value=male]' ).is( ':checked' ) )
                        $( ':radio[value=male]' ).prop( 'checked', false )
                    else
                        $( ':radio[value=male]' ).prop( 'checked', true )

                    $( ':radio[value=male]' ).change();
                } );





                // Toggle Disable State Of radio Button
                $( '.toggle-radio-disable' ).on( 'click', function( e ) {
                    if ( $( ':radio[value=male]' ).is( ':disabled' ) )
                        $( ':radio[value=male]' ).prop( 'disabled', false )
                    else
                        $( ':radio[value=male]' ).prop( 'disabled', true )

                    $( ':radio[value=male]' ).change();
                } );

                // Toggle Checked Status For Check Box
                $( '.toggle-checkbox' ).on( 'click', function( e ) {
                    if ( $( ':checkbox[value=1]' ).is( ':checked' ) )
                        $( ':checkbox[value=1]' ).prop( 'checked', false )
                    else
                        $( ':checkbox[value=1]' ).prop( 'checked', true )

                    $( ':checkbox[value=1]' ).change();
                } );


                // Toggle Disabled Status For Check Box
                $( '.toggle-checkbox-disable' ).on( 'click', function( e ) {

                    if ( $( ':checkbox[value=1]' ).is( ':disabled' ) )
                        $( ':checkbox[value=1]' ).prop( 'disabled', false )
                    else
                        $( ':checkbox[value=1]' ).prop( 'disabled', true )

                    $( ':checkbox[value=1]' ).change();
                } );

                //End Switches Styling Scripts
            }, 500 );


        } );


        $http.get( APIBASE + 'model_image/' + theModelID + '/' + theYear ).then( function( resp ) {
            carImage = resp.data;
            if ( carImage.imageUrl == "none" ) {
                carImage.imageUrl = "images/placeholder.jpg";
            }

            //$scope.carImageUrl = carImage.imageUrl; 
            $scope.carImageQuick = carImage.imageUrl;

        } );


        ///nic/get_extras/{trimid}
        //var params={brand:theBrand,model:theModel,year:theYear,bodytype:theBodyType};
        //console.log(params);
        //reValuee();

        $('#browseByTab1 .j-row .mileage_input').prop('disabled', false).removeClass('disabled');

    };
    
    $scope.seiveMilleage = function( value ) {
        //alert(value)
        $rootScope.readMileage = String( value.replace( /,/g, "" ) ).replace( /(.)(?=(\d{3})+$)/g, '$1,' );
        theMilleage = value.replace( /,/g, "" ); //.toString();
        $rootScope.theMilleage = value.replace( /,/g, "" ); //.toString();

        //enable next button on filling the mileage input field
        enableValue();
    };
    
    
    
    $scope.seiveCarColor = function( value ) {
        //Clear Field
               
        setTimeout( function() {
            $( '.enabled .stoggler' ).click().click();
            valueRequest = false;
        }, 500 );  

        $scope.readmileage = "";

        thecarColor = value.Name; //
        $rootScope.thecarColor = value.Name;
        //reValuee();
        
        //Activate Next Btn
        $('#msform fieldset:nth-child(1) .next.action-button:input[type="button"]').prop('disabled', false).removeClass('disabled');
    };
    //Get Valuation Results
    $scope.seiveCarCountry = function( value ) {
  
        //Clear Fields
        if ( clearPlaceholder === false ) {
            $scope.cars.selected.carColor = "";
            $scope.readmileage = "";
        };

        carCountry = value.Name.toUpperCase();
        $rootScope.carCountry = value.Name;
        invisibleCount = invisibleCount + 1;
        if ( invisibleCount > 1 ) {
            $( ".btn_overlay_adv" ).addClass( 'invisible' );
        }
    };
    $scope.valuate = function() {
        //alert(111)
        clearPlaceholder = true;
        $scope.thePlaceholder = clearPlaceholder;

        //If user does not use the mileage slider
        if ( typeof varnewMileage === 'undefined' ) {
            varnewMileage = $rootScope.theMilleage;
            //$rootScope.varnewMileage = $rootScope.theMilleage;
        }
        //var params={brand:theBrand,model:theModel,year:theYear,bodytype:theBodyType};
        
        //alert(the_subModel);
        
        var paramss = {
            brand: theBrand,
            model: theModel,
            year: theYear,
            mileage: theMilleage,
            trim: $rootScope.the_subModelID
        };

        console.log( 'paramss' );
        console.log( paramss );
        //var params={"inputdata":JSON.stringify(dat)};
        var undefinedParams = [];
        var emptyValue = false;
        var list = '<ul style="text-align: left;left: 50%;position: relative; list-style: inherit;">';
        for ( var i in paramss ) {
            if ( typeof paramss[ i ] === 'undefined' ) {
                undefinedParams.push( i );
                emptyValue = true;
            }
        }
        if ( emptyValue == true ) {
            var i;
            for ( i = 0; i < undefinedParams.length; i++ ) {
                console.log( "Trimmmm " + undefinedParams[ i ] );
                if ( undefinedParams[ i ] == "Trim" ) {
                    undefinedParams[ i ] = "Sub Model";
                } else if ( undefinedParams[ i ] == "Enginecap" ) {
                    undefinedParams[ i ] = "";
                }
                list += "<li>" + undefinedParams[ i ] + "</li>";
            }
            list += "</ul>";
            swal( {
                title: "Fill in the fields below to proceed",
                text: list,
                html: true
            } );
        } else {
            //$(".btn_overlay").addClass('.invisible')    
        }
        sharedProperties.captureString( theBrand ); //capture values from DemoCntrl
        $http.post( APIBASE + 'value_car/quick', paramss ).then( function( resp ) {
            console.log( paramss );
            console.log(resp.data);
            
            $scope.quickMin = resp.data.minimum_price;
            $scope.quickMax = resp.data.maximum_price;
            
            $rootScope.advancedValuation = resp.data;
            if ( isNaN( resp.data.minimum_price ) == false ) {
                $rootScope.carMinimum_price = "KES " + String( resp.data.minimum_price ).replace( /(.)(?=(\d{3})+$)/g, '$1,' );
                samePriceMin = $rootScope.carMinimum_price;
            } else {
                $rootScope.carMinimum_price = samePriceMin; //"0";
            }
            if ( isNaN( resp.data.maximum_price ) == false ) {
                $rootScope.carMaximum_price = "KES " +String( resp.data.maximum_price ).replace( /(.)(?=(\d{3})+$)/g, '$1,' );
                samePriceMax = $rootScope.carMaximum_price;
            } else {
                $rootScope.carMaximum_price = samePriceMax; //"0";
            }
            //$scope.changeScreen('result1');
            console.log( $rootScope.advancedValuation );
            ////alert(resp.data.Brand);
        } );
    };
    //}]);
    //app.controller('DemoCtrl', function ($scope, $http, $timeout, $interval) {
    //app.controller('resultsCtrl', ['sharedProperties', 'APIBASE', '$scope', '$rootScope', '$timeout', '$http', '$filter', '$q', '$interval', function(sharedProperties, APIBASE, $scope, $rootScope, $timeout, $http, $filter, $q, $interval) {
    //alert("aaaa");
    //the engine Capacity
    $scope.seiveCarCC = function( value ) {
        //alert(value);
        engineCap = value.toString();
        $rootScope.engineCap = value.toString(); //value.replace(/,/g , "");//.toString();
        //$rootScope.theMilleage = value.replace(/,/g , "");//.toString();
        reValuee();
    };

    $scope.seiveMilleage_adv = function( value ) {

        varnewMileage = value.replace( /,/g, "" ); //.toString();
        console.log( 'varnewMileage' );
        console.log( varnewMileage );
        //$rootScope.theMilleage = value.replace(/,/g , "");//.toString();
        reValuee();
    };

    var dat;
    $scope.bodyClass = 111; //$rootScope.theBrand;
    //Get Car Brands
    //$timeout(function () {
    $http.get( APIBASE + 'get_brands' ).then( function( resp ) {
        $scope.theBrands = resp.data.popular;
        console.log('$scope.carss');
        console.log(resp.data);
    } );
    //}, 3000);
    //Switches Logic
    var drivetrain = driveTrain,
        transmission = "AUTO",
        powersteering = "no",
        abs = "no",
        cruiseC = "no",
        radio = "no",
        cddvd = "no",
        ac = "no",
        powerdoor = "no",
        tg = "no",
        securityS = "no",
        pseats = "no",
        lseats = "no",
        rims = "no",
        fogL = "no",
        xenonL = "no",
        airbag = "no",
        condition = "SOUND";
    var drivetrainC = 1,
        transmissionC = 1,
        powersteeringC = 1,
        absC = 1,
        cruiseCC = 1,
        radioC = 1,
        cddvdC = 1,
        acC = 1,
        powerdoorC = 1,
        tgC = 1,
        securitySC = 1,
        pseatsC = 1,
        lseatsC = 1,
        rimsC = 1,
        fogLC = 1,
        xenonLC = 1,
        airbagC = 1;

    var extrasTrigger = function() {
        //alert(111)

        //$('input[type=radio][name=cake_size]').change(function() {
        $( '.drivetrain input[type="radio"]' ).on( 'change', function() {
            if ( this.value == '2WD' ) {
                drivetrain = "2WD";
            } else if ( this.value == '4WD' ) {
                drivetrain = "4WD";
            }
        } );
        
        $( '.transmission input[type="radio"]' ).on( 'change', function() {
            if ( this.value == 'MANUAL' ) {
                transmission = "MANUAL";
            } else if ( this.value == 'AUTO' ) {
                transmission = "AUTO";
            }
        } );
        //More Extras
        $( '.condition input[type="radio"]' ).on( 'change', function() {
            if ( this.value == 'SOUND' ) {
                condition = "SOUND";
            } else if ( this.value == 'FAULT' ) {
                condition = "FAULT";
            }
        } );

        //var obj = {key1: value1, key2: value2};
        
        $( '.extras .stoggler' ).on( 'click', function() {
            
            var switchClass = $(this).parents('div.enabled').attr('class');
            var switchVariable = switchClass.replace('enabled', '').replace(' ','');
          
            if ($(this).hasClass( 'on' ) ) {
                powersteering = "no";
                extraoptions[switchVariable] = "no";
                console.log("off")
                console.log(extraoptions);
            } else {
                console.log("on")
                extraoptions[switchVariable] = "yes";
                console.log(extraoptions);
            };
        } );





    }

    /* Horizontal sliders */
    /********************************************************/
    // Single value slider with fixed minimum
    var advancedValuation;
    var reValuee = function() {
        //setTimeout(function(){
        if ( typeof carCountry === 'undefined' ) {
            carCountry = 'LOCAL';
        };






        var defaults = {
            "brand": $rootScope.theBrand.toUpperCase(),
            "color": thecarColor.toUpperCase(),
            "model": $rootScope.theModel.toUpperCase(),
            "trim": $rootScope.the_subModelID,
            //"fueltype": fuelType,
            "year": $rootScope.theYear,
            "mileage": varnewMileage, //:$rootScope.theMilleage,
            "drivetrain": driveTrain,
            "transmission": transmission.toUpperCase(),
            "country": carCountry,
            "enginecap": engineCap,
            "mech": condition,
            
        };
        /* Merge defaults and options, without modifying defaults */
        dataa = $.extend({}, defaults, extraoptions);
        
        $rootScope.dataa = dataa;
        
        
        
        $rootScope.extras = {
            "brand": $rootScope.theBrand,
            "color": thecarColor,
            "model": $rootScope.theModel,
            "submodel": $rootScope.the_subModel,
            "fueltype": fuelType,
            "year": $rootScope.theYear,
            "mileage": String( varnewMileage ).replace( /(.)(?=(\d{3})+$)/g, '$1,' ), //:$rootScope.theMilleage,
            "drivetrain": driveTrain,
            "transmission": transmission,
            "country": carCountry,
            "enginecap": engineCap,
            "mech": condition,
            "powersteering": powersteering,
            "abs": abs,
            "cruisectrl": cruiseC,
            "amfm": radio,
            "cddvd": cddvd,
            "ac": ac,
            "powerdoor": powerdoor,
            "tiptronicgearbox": tg,
            "securitysystem": securityS,
            "powerseats": pseats,
            "leatherseats": lseats,
            "alloyrims": rims,
            "foglights": fogL,
            "xenonlights": xenonL,
            "srsairbags": airbag
        };
        //},3000);
        console.log( dataa );
        //Validation Alert Pop Up
        if ( reValidate ) {
            reValidate = false;
            var undefinedParams = [];
            var emptyValue = false;
            var list = '<ul style="text-align: left;left: 50%;position: relative; list-style: inherit;">';
            for ( var i in dataa ) {
                if ( typeof dataa[ i ] === 'undefined' ) {
                    undefinedParams.push( i );
                    emptyValue = true;
                }
            }
            if ( emptyValue == true ) {
                var i;
                for ( i = 0; i < undefinedParams.length; i++ ) {
                    console.log( undefinedParams[ i ] );
                    if ( undefinedParams[ i ] == "Trim" ) {
                        undefinedParams[ i ] = "Sub Model";
                    } else if ( undefinedParams[ i ] == "Enginecap" ) {
                        undefinedParams[ i ] = "";
                    }
                    list += "<li>" + undefinedParams[ i ] + "</li>";
                }
                list += "</ul>";
                swal( {
                    title: "Fill in the fields below to proceed",
                    text: list,
                    html: true
                } );
            } else {
                //$(".btn_overlay").addClass('.invisible')    
            }
        }
        //End of Validation Alert Pop Up
        var params = {
            "inputdata": JSON.stringify( dataa )
        };
        
        
        $http.post( APIBASE + 'value_car/advanced_dynamic', params ).then( function( resp ) {
            
            console.log("paramsparamsparamsparamsparamsparams");
        
            console.log(dataa);
        
            advancedValuation = resp.data;
            console.log( "kaka: " + isNaN( advancedValuation.minimum_price ) )
            console.log( "cccc: " + advancedValuation.minimum_price )
            console.log( "typeof: " + typeof( advancedValuation.minimum_price ) )
            if ( ( isNaN( advancedValuation.minimum_price ) == false ) && advancedValuation.minimum_price !== null ) {
                $rootScope.carMinimum_price = "KES " + String( advancedValuation.minimum_price ).replace( /(.)(?=(\d{3})+$)/g, '$1,' );
                samePriceMin = $rootScope.carMinimum_price;
            } else {
                $rootScope.carMinimum_price = samePriceMin; // "KES 0";
            }
            if ( ( isNaN( advancedValuation.maximum_price ) == false ) && advancedValuation.minimum_price !== null ) {
                $rootScope.carMaximum_price = "KES " + String( advancedValuation.maximum_price ).replace( /(.)(?=(\d{3})+$)/g, '$1,' );
                samePriceMax = $rootScope.carMaximum_price;
            } else {
                $rootScope.carMaximum_price = samePriceMax; //"0"; 
            }
            console.log( advancedValuation );
        } );
    };
    $rootScope.revaluate = function() {
        reValidate = true;
        reValuee();
        setTimeout( function() {
            $( '.adv_val_results ul li' ).each( function() {
                var extraValue = $( this ).find( 'span' ).html();
                if ( extraValue == "no" ) {
                    $( this ).css( 'display', 'none' );
                }
            } );
        }, 250 )
    };
    //Change Price
    //$('.powersteering input[type="checkbox"]')
    var extrasTriggerPrice = function() {
        $( '.stoggler' ).on( 'click', function() {
            setTimeout( function() {
                reValuee();
            }, 1000 );
        } );
        $( 'input[type="radio"]' ).on( 'change', function() {
            reValuee();
        } );
    };

    $scope.seive_Milleage = function( value ) {
        $rootScope.theMilleage = value;
        reValuee();
    };
    $scope.sieve_the_theModel = function( value ) {
        ////alert("value")
    };
    //Populate Extras on Results Page
    var extrasList = [];
$scope.populateExtras = function(){

        $('li.customExtras').fadeOut(0);
    
        $('#msform .extras>div>div').each(function(){

            var extraName = $(this).find('label').html();
            var extraValue = $(this).find('.stoggler').attr('class').replace('stoggler', '').replace(' ','');

            if(extraValue=='off'){
               extraValue = 'No'; 
            } else {
               extraValue = 'Yes';
            };
            
            extrasList.push( {
                            "extraName": extraName,
                            "extraValue": extraValue
                        } );
        });
        
        $scope.extrasList = extrasList;
    };   
    
    
    //Print the Cert
    $scope.printPDFCert = function() {
        
        swal( {
                title: "Fill in the fields below to proceed",
                text: '<p>Thanks</p>',
                html: true
            } );
        
        loaded = function( id ) {
            $scope.downloadURL = "http://api.grabz.it/services/getjspicture.ashx?id=" + id + "&isAttachment=1&fileName=.pdf";
            //alert(id);
            //window.open($scope.downloadURL);
            //window.open($scope.downloadURL, "_blank", "toolbar=yes,scrollbars=yes,resizable=yes,top=500,left=500,width=400,height=400");
            //            var w=window.open($scope.downloadURL, '_blank');
            //            w.focus();
        };
        //var theCertMarkup = '<!DOCTYPE html><html lang="en"><head><title>NIC Blue Book Car Valuation results table</title><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><style type="text/css">*{margin: 0;padding: 0;border: none;}.main-container{min-width: 200px;max-width: 1200px;margin: 0 auto;padding: 20px 10px 0;}*{margin:0;padding:0;border:none}@media screen and (min-width:981px){html{font-size:10px}}@media screen and (min-width:641px) and (max-width:980px){html{font-size:8px}}@media screen and (max-width:640px){html{font-size:7px}}body{font-family:"PT Sans",sans-serif;font-size:1.4rem;color:#000}a{text-decoration:none;color:#000;transition:color .4s ease-out}a:hover{color:#a74752}a:focus{outline-color:#a74752}p{line-height:3rem;margin-bottom:1rem}p:last-of-type{margin-bottom:0}.link{display:inline-block;padding:.5em 1.5em}.link_black{color:#fff;background-color:#000;transition:background-color .4s ease-out}.link_black:hover,.link_black:focus{background-color:#333;color:#fff}.link_black:focus{outline-color:#000}.link_animated-slide{overflow:hidden;position:relative;-webkit-transform:translateZ(0);transform:translateZ(0)}.link_animated-slide:before{content:"";display:block;width:100%;height:100%;position:absolute;top:0;left:-1px;-webkit-transform:translate3d(-100%, 0, 0);transform:translate3d(-100%, 0, 0);transition:-webkit-transform .2s ease-out 0s;transition:transform .2s ease-out 0s;transition:transform .2s ease-out 0s, -webkit-transform .2s ease-out 0s}.link_animated-slide:hover:before,.link_animated-slide:focus:before{-webkit-transform:translate3d(1px, 0, 0);transform:translate3d(1px, 0, 0)}.link_animated-slide:focus{outline:none}.link_animated-slide__label{position:relative;z-index:2}.link_animated-slide-white-border-black{border:1px solid #000;color:#000}.link_animated-slide-white-border-black:before{background-color:#000}.link_animated-slide-white-border-black:hover .link_animated-slide__label,.link_animated-slide-white-border-black:focus .link_animated-slide__label{color:#fff}.link__label{display:inline-block;vertical-align:middle}.link_animated-slide-white-border-black:focus{outline-color:#000}.title{font-size:3.5rem;font-weight:300;color:#000}.title_middle{font-size:2.8rem}.title_small{font-size:2.4rem}.title_little{font-size:2rem}.title_uppercase{text-transform:uppercase}.title_bottom-decor{margin-bottom:1rem}.title_bottom-decor:after{content:"";display:block;width:5rem;height:2px;background-color:#000;position:absolute;bottom:0;left:50%;-webkit-transform:translate(-50%, 0);transform:translate(-50%, 0)}.subtitle{margin-bottom:1.5rem;color:#a74752;font-size:1.6rem}.title_white{color:#fff}.title_white:after{background-color:#fff}@media screen and (max-width:640px){.title_bottom-decor{margin-bottom:1rem}}.icon:before{content:"";display:block;width:1.6rem;height:1.6rem;background-repeat:no-repeat;background-position:50% 50%;background-size:contain}.icon{display:inline-block;vertical-align:middle}.icon_small:before{width:2.4rem;height:2.4rem}.icon_large:before{width:4.8rem;height:4.8rem}.icon{margin-right:1rem}.icon-github:before{background-image:url("../icons/github.svg")}.header{padding:2rem 0;background-color:#000}.wrapper{padding-top:9rem;padding-bottom:9rem;text-align:center}.wrapper_shadow{box-shadow:0 0 2rem 1rem #eee;border-bottom:1px solid #eee}@media screen and (max-width:640px){.wrapper{padding-top:6rem;padding-bottom:6rem}}.main-container{min-width:100px;max-width:1200px;padding:0 2rem;margin:0 auto}.main-container__header{text-align:center;position:relative;padding-bottom:1rem;margin-bottom:7rem}@media screen and (max-width:640px){.main-container__header{margin-bottom:4rem}}.footer{background-color:#fff;border-top:1px solid #eee;box-shadow:0 0 .8rem #eee;padding:2rem 0;min-width:100%}.footer{text-align:center}.logo{font-size:2rem;font-weight:300;color:#fff;text-align:center}.description-plugin{padding-top:9rem;text-align:center}.description-plugin__content{width:85%;font-size:1.8rem;margin:0 auto}.demo-links{display:-webkit-flex;display:flex;-webkit-flex-wrap:wrap;flex-wrap:wrap}.demo-link{box-sizing:border-box;text-align:center}.demo-links_4column .demo-link{width:23.5%;margin-top:1.9vw}.demo-links_4column .demo-link:nth-of-type(1),.demo-links_4column .demo-link:nth-of-type(2),.demo-links_4column .demo-link:nth-of-type(3),.demo-links_4column .demo-link:nth-of-type(4){margin-top:0}.demo-links_4column .demo-link:nth-of-type(4n+2){margin-left:2%;margin-right:1%}.demo-links_4column .demo-link:nth-of-type(4n+3){margin-right:2%;margin-left:1%}@media screen and (max-width:980px){.demo-links_4column .demo-link{width:32.5%;margin-top:1vw}.demo-links_4column .demo-link:nth-of-type(4){margin-top:1vw}.demo-links_4column .demo-link:nth-of-type(4n+2),.demo-links_4column .demo-link:nth-of-type(4n+3){margin-left:0;margin-right:0}.demo-links_4column .demo-link:nth-of-type(3n+2){margin-right:1%;margin-left:1%}}@media screen and (max-width:480px){.demo-links_4column .demo-link{width:49%;margin-top:1.8vw}.demo-links_4column .demo-link:nth-of-type(3),.demo-links_4column .demo-link:nth-of-type(4){margin-top:1.8vw}.demo-links_4column .demo-link:nth-of-type(3n+2){margin-right:0;margin-left:0}.demo-links_4column .demo-link:nth-of-type(2n+1){margin-right:1%;margin-left:0}.demo-links_4column .demo-link:nth-of-type(2n+2){margin-right:0;margin-left:1%}}.demo-links{-webkit-justify-content:center;justify-content:center}.demo-link{border:1px solid #000}.word-author{font-size:2rem;font-weight:bold;text-align:center;padding-top:9rem;padding-bottom:9rem}@media screen and (max-width:640px){.word-author{padding-top:6rem;padding-bottom:6rem}}.word-author__inner{display:-webkit-flex;display:flex;-webkit-align-items:center;align-items:center;-webkit-justify-content:center;justify-content:center}.word-author__layout{width:32%}.b-share_theme_counter .b-share-btn__wrap{float:none !important;margin:0 .5rem 0 0 !important;display:inline-block;vertical-align:text-bottom}@media screen and (max-width:640px){.word-author__inner{-webkit-flex-wrap:wrap;flex-wrap:wrap}.share-label{display:none}}.word-author__iconbox{display:inline-block}.word-author__iconbox:before{content:"";display:inline-block;vertical-align:middle;margin-right:1.4rem;width:4.2rem;height:4.2rem;background-repeat:no-repeat;background-position:50% 50%;background-size:contain}.word-author__label{font-weight:300}.world-author__link{transition:color .3s ease-out}.word-author_claret .world-author__link{color:#a74752}.word-author_claret .world-author__link:hover{color:#721621}.word-author{background-color:#eee}.word-author__buy-icon:before{background-image:url("../icons/dollar_claret.svg")}.word-author__look-projects-icon:before{background-image:url("../icons/eye.svg")}@media screen and (min-width:401px){.word-author__share-icon:before{background-image:url("../icons/share.svg")}}@media screen and (max-width:480px){.word-author__layout{width:48%}.word-author__share{display:none}}.b-share_theme_counter{display:inline-block;vertical-align:text-bottom}@font-face{font-family:"fontello";src:url("../icons/fontello.eot?70583804");src:url("../icons/fontello.eot?70583804#iefix") format("embedded-opentype"),url("../icons/fontello.woff?70583804") format("woff"),url("../icons/fontello.ttf?70583804") format("truetype"),url("../icons/fontello.svg?70583804#fontello") format("svg");font-weight:normal;font-style:normal}[class^="icon-"]:before,[class*=" icon-"]:before{font-family:"fontello";font-style:normal;font-weight:normal;speak:none;display:inline-block;text-decoration:inherit;width:1em;text-align:center;font-variant:normal;text-transform:none;line-height:1em;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale}.icon-twitter:before{content:"\e800"}.icon-facebook:before{content:"\e801"}.icon-github:before{content:"\e802"}.icon-user:before{content:"\e803"}.icon-gplus:before{content:"\e804"}.icon-location:before{content:"\e805"}.icon-briefcase:before{content:"\e806"}.icon-mail:before{content:"\e807"}.icon-android:before{content:"\e808"}.icon-html5:before{content:"\e809"}.icon-css3:before{content:"\e80a"}.icon-drupal:before{content:"\e80b"}.icon-joomla:before{content:"\e80c"}.icon-apple:before{content:"\e80d"}.icon-wordpress:before{content:"\e80e"}.icon-camera:before{content:"\e80f"}.icon-chart-bar:before{content:"\e810"}.icon-linkedin:before{content:"\e816"}.icon-codeopen:before{content:"\e817"}.mr-table{border-spacing:0;border-collapse:collapse}.mr-table__mobile-caption{display:none}.mr-table_bg_column{width:30%}@media screen and (max-width:768px){.mr-table,.mr-table__thead,.mr-table__tbody,.mr-table__tr{display:block}.mr-table__th,.mr-table__td{display:-webkit-flex;display:flex}.mr-table .mr-table__head{display:none}.mr-table .mr-table_bg_column{width:auto;padding:20px 15px}.mr-table .mr-table__mobile-caption,.mr-table .mr-table__value{display:block}.mr-table .mr-table__mobile-caption{margin-right:2%}}@media screen and (max-width:768px){.mr-table_evenly .mr-table__mobile-caption,.mr-table_evenly .mr-table__value{width:48%}}.mr-table_bg .mr-table__head{background-color:#2196f3;color:#fff}.mr-table_bg .mr-table__tr:hover{background-color:#eee}@media screen and (max-width:768px){.mr-table_bg .mr-table__td:first-of-type{background-color:#2196f3;color:#fff}.mr-table_bg .mr-table__tr:hover{background:inherit}}@media only screen and (min-width:769px){.mr-table_bg_no .mr-table__head{border-bottom:1px solid #eee}}@media only screen and (max-width:768px){.mr-table_bg_no .mr-table__td{display:block}.mr-table_bg_no .mr-table_mobile_caption{font-weight:700;margin-bottom:10px}}.mr-table{width:100%;font-family:"Roboto",sans-serif;font-weight:300;font-size:14px}@media screen and (min-width:769px){.mr-table{box-shadow:0 1px 3px 0 rgba(0,0,0,0.12),0 1px 2px 0 rgba(0,0,0,0.24)}}.mr-table__td,.mr-table__th{padding:1.5em 1em;text-align:left}.mr-table__th{font-size:16px;font-weight:300}.mr-table__tr{border-bottom:1px solid #eee;transition:background-color .2s ease-in}.mr-table__tr:last-of-type{border-bottom:none}@media screen and (max-width:768px){.mr-table{box-shadow:none}.mr-table__tr{margin-bottom:30px;box-shadow:0 1px 3px 0 rgba(0,0,0,0.12),0 1px 2px 0 rgba(0,0,0,0.24);background-color:#fff}.mr-table__tr:hover{background:none}.mr-table__td{border-bottom:1px solid #eee}.mr-table__td:last-of-type{border-bottom:none}}@media screen and (max-width:640px){.mr-table{font-size:12px}.mr-table__th{font-size:14px}}.mr-tables{display:-webkit-flex;display:flex;-webkit-justify-content:space-between;justify-content:space-between}.mr-table_2column{width:49%}.mr-table_3column{width:32%}.mr-table_4column{width:24%}@media only screen and (max-width:768px){.mr-tables{-webkit-flex-wrap:wrap;flex-wrap:wrap}}@media only screen and (min-width:481px) and (max-width:768px){.mr-table_3column,.mr-table_4column{width:49%}}@media only screen and (max-width:480px){.mr-table_2column,.mr-table_3column,.mr-table_4column{width:100%}}.mr-table_price .mr-table__th{text-align:center}.mr-table__tariff,.mr-table__price-value{display:block}.mr-table__price-value{margin:1em 0 .5em}.mr-table__decor-arrow{display:inline-block;vertical-align:middle;position:relative;margin-right:10px;height:20px;width:20px}.mr-table__decor-arrow:after{content:"";display:block;width:70%;height:33.33%;position:absolute;top:0;left:5px;-webkit-transform:rotate(135deg) translateY(-25%);transform:rotate(135deg) translateY(-25%)}.mr-table__button{display:block;width:50%;cursor:pointer;margin:0 auto;padding:.5em 1em;text-align:center}@media screen and (max-width:768px){.mr-table_price .mr-table__price-head,.mr-table_price .mr-table__th,.mr-table_price .mr-table__price-tr,.mr-table_price .mr-table__td{display:block}}.mr-table_price{transition:box-shadow .2s ease-in}.mr-table_price:hover{box-shadow:0 1px 10px 0 rgba(0,0,0,0.12),0 1px 10px 0 rgba(0,0,0,0.24)}.mr-table_price .mr-table__th{border-bottom:1px solid #eee}.mr-table__tariff{font-weight:400;font-size:28px;color:#36bae2}.mr-table__price-value{font-weight:300;font-size:35px}.mr-table__price-tr{border-bottom:1px solid #eee}.mr-table__decor-arrow:after{border-right:2px solid #36bae2;border-top:2px solid #36bae2}.mr-table__button{font-size:14px;font-weight:400;background-color:transparent;color:#000;border:1px solid #36bae2;transition:color .2s ease-in}@media screen and (max-width:768px){.mr-table_price{box-shadow:0 1px 3px 0 rgba(0,0,0,0.12),0 1px 2px 0 rgba(0,0,0,0.24)}.mr-table__tariff{font-size:24px}.mr-table__price-value{font-size:28px}}@media screen and (max-width:640px){.responsive_price_table{font-size:12px}.mr-table__tariff{font-size:16px}.mr-table__price-value{font-size:18px}}.mr-table_price-head-bg .mr-table__th{background-color:#7049ba}.mr-table_price-head-bg .mr-table__th,.mr-table_price-head-bg .mr-table__tariff{color:#fff}.mr-table_price-head-bg .responsive_price_table_decor:after,.mr-table_price-head-bg .mr-table__button{border-color:#7049ba}.mr-table_price-bg{background-color:#36bae2}.mr-table_price-bg,.mr-table_price-bg .mr-table__tariff,.mr-table_price-bg .mr-table__button{color:#fff}.mr-table_price-bg .mr-table__decor-arrow:after,.mr-table_price-bg .mr-table__button{border-color:#fff}.mr-table_versions .mr-table__head{border-bottom:1px solid #eee}.mr-table-active-column{background-color:#017bbd;border-bottom:1px solid #2bb8e6;font-weight:700;color:#fff}@media screen and (max-width:768px){.mr-table_versions .mr-table__td:first-of-type{background-color:#eee}.mr-table-active-column{background:none;color:#017bbd}}.mr-table__avatarbox,.mr-table__username,.mr-table__post{width:100%}.mr-table__social{text-decoration:none}.mr-table__icon-label{display:none}@media only screen and (max-width:768px){.mr-table_team .mr-table__th{-webkit-flex-wrap:wrap;flex-wrap:wrap;-webkit-justify-content:center;justify-content:center}.mr-table_team .mr-table__td{display:block}}.mr-table_team{box-shadow:0 1px 3px 0 rgba(0,0,0,0.12),0 1px 2px 0 rgba(0,0,0,0.24)}.mr-table_team:hover{box-shadow:0 1px 10px 0 rgba(0,0,0,0.12),0 1px 10px 0 rgba(0,0,0,0.24)}.mr-table_team .mr-table__th{text-align:center;background-color:#18bd9b;color:#fff}.mr-table_team .mr-table__td{border-top:1px solid #eee}.mr-table__avatar{border-radius:50%;border:3px solid #fff;width:100px;height:100px}.mr-table__username{margin-top:10px;font-size:18px;font-weight:300}.mr-table__icon{margin:0 10px 20px 0}.mr-table__icon:last-of-type{margin-right:0}.mr-table__icon{width:16px;height:16px;display:inline-block;cursor:pointer;padding:10px;border-radius:50%;background-color:#18bd9b;box-shadow:0 1px 3px 0 rgba(0,0,0,0.12),0 1px 2px 0 rgba(0,0,0,0.24)}.mr-table__icon:before{color:#fff;font-size:16px}.mr-table__title{font-size:20px;font-weight:300;margin-bottom:15px}@media screen and (max-width:480px){.mr-table{margin-bottom:5vw}}@media screen and (min-width:480px) and (max-width:768px){.mr-table{margin-bottom:2vw}}</style><link href="https://fonts.googleapis.com/css?family=Roboto:400,300,700" rel="stylesheet"></head><body><div class="main-container"><table class="mr-table mr-table_evenly mr-table_versions"> <thead class="mr-table__thead"><tr class="mr-table__head"><th class="mr-table__th">Selected Option</th> <th class="mr-table__th mr-table-active-column">Option Result</th></tr></thead><tbody class="mr-table__tbody"><tr class="mr-table__tr"><td class="mr-table__td"><span class="mr-table__mobile-caption"><img src="http://brand2d.com/nicbluebook/logo.png"/></span><span class="mr-table__value"></span></td><td class="mr-table__td"><span class="mr-table__mobile-caption">Selected Make & Brand</span><span class="mr-table__value">YOUR VEHICLE IS VALUED BETWEEN:</span></td><td class="mr-table__td mr-table-active-column"><span class="mr-table__mobile-caption">'+$rootScope.theBrand+' '+$rootScope.theModel+'</span><span class="mr-table__value">'+$rootScope.carMinimum_price+' - '+$rootScope.carMaximum_price+'</span></td></tr><tr class="mr-table__tr"><td class="mr-table__td"><span class="mr-table__mobile-caption">Selected Vehicle</span><span class="mr-table__value">Vehicle Image:</span></td><td class="mr-table__td mr-table-active-column" style="width:50%;"><span class="mr-table__mobile-caption" style="width:0%" >'+$rootScope.theBrand+' '+$rootScope.theModel+', '+$rootScope.the_subModel+'</span><span class="mr-table__value" style="width:100%" ><img style="width:100%" src="http://brand2d.com/nicbluebook/car.jpg" alt="Selected Vehicle"></span></td></tr><tr class="mr-table__tr"><td class="mr-table__td"><span class="mr-table__mobile-caption">Selected Option</span><span class="mr-table__value">Vehicle Make:</span></td><td class="mr-table__td mr-table-active-column"><span class="mr-table__mobile-caption">Option Result</span><span class="mr-table__value">'+$rootScope.theBrand+'</span></td></tr><tr class="mr-table__tr"><td class="mr-table__td"><span class="mr-table__mobile-caption">Selected Option</span><span class="mr-table__value">Vehicle Model:</span></td><td class="mr-table__td mr-table-active-column"><span class="mr-table__mobile-caption">Option Result</span><span class="mr-table__value">'+$rootScope.theModel+'</span></td></tr><tr class="mr-table__tr"><td class="mr-table__td"><span class="mr-table__mobile-caption">Selected Option</span><span class="mr-table__value">Vehicle Sub Model:</span></td><td class="mr-table__td mr-table-active-column"><span class="mr-table__mobile-caption">Option Result</span><span class="mr-table__value">'+$rootScope.the_subModel+'</span></td></tr><tr class="mr-table__tr"><td class="mr-table__td"><span class="mr-table__mobile-caption">Selected Option</span><span class="mr-table__value">Year of Manufacture:</span></td><td class="mr-table__td mr-table-active-column"><span class="mr-table__mobile-caption">Option Result</span><span class="mr-table__value">'+$rootScope.theYear+'</span></td></tr><tr class="mr-table__tr"><td class="mr-table__td"><span class="mr-table__mobile-caption">Selected Option</span><span class="mr-table__value">Mileage:</span></td><td class="mr-table__td mr-table-active-column"><span class="mr-table__mobile-caption">Option Result</span><span class="mr-table__value">'+$rootScope.theMilleage+' KM</span></td></tr><tr class="mr-table__tr"><td class="mr-table__td"><span class="mr-table__mobile-caption">Selected Option</span><span class="mr-table__value">Drive Train:</span></td><td class="mr-table__td mr-table-active-column"><span class="mr-table__mobile-caption">Option Result</span><span class="mr-table__value">'+drivetrain+'</span></td></tr><tr class="mr-table__tr"><td class="mr-table__td"><span class="mr-table__mobile-caption">Selected Option</span><span class="mr-table__value">Transmission:</span></td><td class="mr-table__td mr-table-active-column"><span class="mr-table__mobile-caption">Option Result</span><span class="mr-table__value">'+transmission+'</span></td></tr><tr class="mr-table__tr"><td class="mr-table__td"><span class="mr-table__mobile-caption">Selected Option</span><span class="mr-table__value">Country:</span></td><td class="mr-table__td mr-table-active-column"><span class="mr-table__mobile-caption">Option Result</span><span class="mr-table__value">'+carCountry+'</span></td></tr><tr class="mr-table__tr"><td class="mr-table__td"><span class="mr-table__mobile-caption">Selected Option</span><span class="mr-table__value">Power Steering:</span></td><td class="mr-table__td mr-table-active-column"><span class="mr-table__mobile-caption">Option Result</span><span class="mr-table__value">'+powersteering+'</span></td></tr><tr class="mr-table__tr"><td class="mr-table__td"><span class="mr-table__mobile-caption">Selected Option</span><span class="mr-table__value">Automatic Breaking System:</span></td><td class="mr-table__td mr-table-active-column"><span class="mr-table__mobile-caption">Option Result</span><span class="mr-table__value">'+abs+'</span></td></tr><tr class="mr-table__tr"><td class="mr-table__td"><span class="mr-table__mobile-caption">Selected Option</span><span class="mr-table__value">Cruise Control:</span></td><td class="mr-table__td mr-table-active-column"><span class="mr-table__mobile-caption">Option Result</span><span class="mr-table__value">'+cruiseC+'</span></td></tr><tr class="mr-table__tr"><td class="mr-table__td"><span class="mr-table__mobile-caption">Selected Option</span><span class="mr-table__value">AM/FM Radio:</span></td><td class="mr-table__td mr-table-active-column"><span class="mr-table__mobile-caption">Option Result</span><span class="mr-table__value">'+radio+'</span></td></tr><tr class="mr-table__tr"><td class="mr-table__td"><span class="mr-table__mobile-caption">Selected Option</span><span class="mr-table__value">CD/DVD Player:</span></td><td class="mr-table__td mr-table-active-column"><span class="mr-table__mobile-caption">Option Result</span><span class="mr-table__value">'+cddvd+'</span></td></tr><tr class="mr-table__tr"><td class="mr-table__td"><span class="mr-table__mobile-caption">Selected Option</span><span class="mr-table__value">Air Conditioner:</span></td><td class="mr-table__td mr-table-active-column"><span class="mr-table__mobile-caption">Option Result</span><span class="mr-table__value">'+ac+'</span></td></tr><tr class="mr-table__tr"><td class="mr-table__td"><span class="mr-table__mobile-caption">Selected Option</span><span class="mr-table__value">Power Door:</span></td><td class="mr-table__td mr-table-active-column"><span class="mr-table__mobile-caption">Option Result</span><span class="mr-table__value">'+powerdoor+'</span></td></tr><tr class="mr-table__tr"><td class="mr-table__td"><span class="mr-table__mobile-caption">Selected Option</span><span class="mr-table__value">Tiptronic Gearbox:</span></td><td class="mr-table__td mr-table-active-column"><span class="mr-table__mobile-caption">Option Result</span><span class="mr-table__value">'+tg+'</span></td></tr><tr class="mr-table__tr"><td class="mr-table__td"><span class="mr-table__mobile-caption">Selected Option</span><span class="mr-table__value">Security System:</span></td><td class="mr-table__td mr-table-active-column"><span class="mr-table__mobile-caption">Option Result</span><span class="mr-table__value">'+securityS+'</span></td></tr><tr class="mr-table__tr"><td class="mr-table__td"><span class="mr-table__mobile-caption">Selected Option</span><span class="mr-table__value">Power Seats:</span></td><td class="mr-table__td mr-table-active-column"><span class="mr-table__mobile-caption">Option Result</span><span class="mr-table__value">'+pseats+'</span></td></tr><tr class="mr-table__tr"><td class="mr-table__td"><span class="mr-table__mobile-caption">Selected Option</span><span class="mr-table__value">Leather Seats:</span></td><td class="mr-table__td mr-table-active-column"><span class="mr-table__mobile-caption">Option Result</span><span class="mr-table__value">'+lseats+'</span></td></tr><tr class="mr-table__tr"><td class="mr-table__td"><span class="mr-table__mobile-caption">Selected Option</span><span class="mr-table__value">Alloy Rims:</span></td><td class="mr-table__td mr-table-active-column"><span class="mr-table__mobile-caption">Option Result</span><span class="mr-table__value">'+rims+'</span></td></tr><tr class="mr-table__tr"><td class="mr-table__td"><span class="mr-table__mobile-caption">Selected Option</span><span class="mr-table__value">Fog Lights:</span></td><td class="mr-table__td mr-table-active-column"><span class="mr-table__mobile-caption">Option Result</span><span class="mr-table__value">'+fogL+'</span></td></tr><tr class="mr-table__tr"><td class="mr-table__td"><span class="mr-table__mobile-caption">Selected Option</span><span class="mr-table__value">Xenon Lights:</span></td><td class="mr-table__td mr-table-active-column"><span class="mr-table__mobile-caption">Option Result</span><span class="mr-table__value">'+xenonL+'</span></td></tr><tr class="mr-table__tr"><td class="mr-table__td"><span class="mr-table__mobile-caption">Selected Option</span><span class="mr-table__value">SRS Airbags:</span></td><td class="mr-table__td mr-table-active-column"><span class="mr-table__mobile-caption">Option Result</span><span class="mr-table__value">'+airbag+'</span></td></tr> <tr class="mr-table__tr"> <td class="mr-table__td"> <p>Disclaimer: This results are based on the accuracy of the information given. For a more detailed valuation of your vehicle please contact Regent Autovaluers.</p></td></tr></tbody></table></div></body></html>';
        //var theCertMarkup = '<!DOCTYPE html><html lang="en"><head><title>NIC Blue Book Car Valuation results table</title><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><link href="https://fonts.googleapis.com/css?family=Roboto:400,300,700" rel="stylesheet"><style type="text/css">*{margin: 0;padding: 0;border: none;}.main-container{min-width: 200px;max-width: 1200px;margin: 0 auto;padding: 20px 10px 0;}*{margin:0;padding:0;border:none}@media screen and (min-width:981px){html{font-size:10px}}@media screen and (min-width:641px) and (max-width:980px){html{font-size:8px}}@media screen and (max-width:640px){html{font-size:7px}}body{font-family:"PT Sans",sans-serif;font-size:1.4rem;color:#000}a{text-decoration:none;color:#000;transition:color .4s ease-out}a:hover{color:#a74752}a:focus{outline-color:#a74752}p{line-height:3rem;margin-bottom:1rem}p:last-of-type{margin-bottom:0}.link{display:inline-block;padding:.5em 1.5em}.link_black{color:#fff;background-color:#000;transition:background-color .4s ease-out}.link_black:hover,.link_black:focus{background-color:#333;color:#fff}.link_black:focus{outline-color:#000}.link_animated-slide{overflow:hidden;position:relative;-webkit-transform:translateZ(0);transform:translateZ(0)}.link_animated-slide:before{content:"";display:block;width:100%;height:100%;position:absolute;top:0;left:-1px;-webkit-transform:translate3d(-100%, 0, 0);transform:translate3d(-100%, 0, 0);transition:-webkit-transform .2s ease-out 0s;transition:transform .2s ease-out 0s;transition:transform .2s ease-out 0s, -webkit-transform .2s ease-out 0s}.link_animated-slide:hover:before,.link_animated-slide:focus:before{-webkit-transform:translate3d(1px, 0, 0);transform:translate3d(1px, 0, 0)}.link_animated-slide:focus{outline:none}.link_animated-slide__label{position:relative;z-index:2}.link_animated-slide-white-border-black{border:1px solid #000;color:#000}.link_animated-slide-white-border-black:before{background-color:#000}.link_animated-slide-white-border-black:hover .link_animated-slide__label,.link_animated-slide-white-border-black:focus .link_animated-slide__label{color:#fff}.link__label{display:inline-block;vertical-align:middle}.link_animated-slide-white-border-black:focus{outline-color:#000}.title{font-size:3.5rem;font-weight:300;color:#000}.title_middle{font-size:2.8rem}.title_small{font-size:2.4rem}.title_little{font-size:2rem}.title_uppercase{text-transform:uppercase}.title_bottom-decor{margin-bottom:1rem}.title_bottom-decor:after{content:"";display:block;width:5rem;height:2px;background-color:#000;position:absolute;bottom:0;left:50%;-webkit-transform:translate(-50%, 0);transform:translate(-50%, 0)}.subtitle{margin-bottom:1.5rem;color:#a74752;font-size:1.6rem}.title_white{color:#fff}.title_white:after{background-color:#fff}@media screen and (max-width:640px){.title_bottom-decor{margin-bottom:1rem}}.icon:before{content:"";display:block;width:1.6rem;height:1.6rem;background-repeat:no-repeat;background-position:50% 50%;background-size:contain}.icon{display:inline-block;vertical-align:middle}.icon_small:before{width:2.4rem;height:2.4rem}.icon_large:before{width:4.8rem;height:4.8rem}.icon{margin-right:1rem}.icon-github:before{background-image:url("../icons/github.svg")}.header{padding:2rem 0;background-color:#000}.wrapper{padding-top:9rem;padding-bottom:9rem;text-align:center}.wrapper_shadow{box-shadow:0 0 2rem 1rem #eee;border-bottom:1px solid #eee}@media screen and (max-width:640px){.wrapper{padding-top:6rem;padding-bottom:6rem}}.main-container{min-width:100px;max-width:1200px;padding:0 2rem;margin:0 auto}.main-container__header{text-align:center;position:relative;padding-bottom:1rem;margin-bottom:7rem}@media screen and (max-width:640px){.main-container__header{margin-bottom:4rem}}.footer{background-color:#fff;border-top:1px solid #eee;box-shadow:0 0 .8rem #eee;padding:2rem 0;min-width:100%}.footer{text-align:center}.logo{font-size:2rem;font-weight:300;color:#fff;text-align:center}.description-plugin{padding-top:9rem;text-align:center}.description-plugin__content{width:85%;font-size:1.8rem;margin:0 auto}.demo-links{display:-webkit-flex;display:flex;-webkit-flex-wrap:wrap;flex-wrap:wrap}.demo-link{box-sizing:border-box;text-align:center}.demo-links_4column .demo-link{width:23.5%;margin-top:1.9vw}.demo-links_4column .demo-link:nth-of-type(1),.demo-links_4column .demo-link:nth-of-type(2),.demo-links_4column .demo-link:nth-of-type(3),.demo-links_4column .demo-link:nth-of-type(4){margin-top:0}.demo-links_4column .demo-link:nth-of-type(4n+2){margin-left:2%;margin-right:1%}.demo-links_4column .demo-link:nth-of-type(4n+3){margin-right:2%;margin-left:1%}@media screen and (max-width:980px){.demo-links_4column .demo-link{width:32.5%;margin-top:1vw}.demo-links_4column .demo-link:nth-of-type(4){margin-top:1vw}.demo-links_4column .demo-link:nth-of-type(4n+2),.demo-links_4column .demo-link:nth-of-type(4n+3){margin-left:0;margin-right:0}.demo-links_4column .demo-link:nth-of-type(3n+2){margin-right:1%;margin-left:1%}}@media screen and (max-width:480px){.demo-links_4column .demo-link{width:49%;margin-top:1.8vw}.demo-links_4column .demo-link:nth-of-type(3),.demo-links_4column .demo-link:nth-of-type(4){margin-top:1.8vw}.demo-links_4column .demo-link:nth-of-type(3n+2){margin-right:0;margin-left:0}.demo-links_4column .demo-link:nth-of-type(2n+1){margin-right:1%;margin-left:0}.demo-links_4column .demo-link:nth-of-type(2n+2){margin-right:0;margin-left:1%}}.demo-links{-webkit-justify-content:center;justify-content:center}.demo-link{border:1px solid #000}.word-author{font-size:2rem;font-weight:bold;text-align:center;padding-top:9rem;padding-bottom:9rem}@media screen and (max-width:640px){.word-author{padding-top:6rem;padding-bottom:6rem}}.word-author__inner{display:-webkit-flex;display:flex;-webkit-align-items:center;align-items:center;-webkit-justify-content:center;justify-content:center}.word-author__layout{width:32%}.b-share_theme_counter .b-share-btn__wrap{float:none !important;margin:0 .5rem 0 0 !important;display:inline-block;vertical-align:text-bottom}@media screen and (max-width:640px){.word-author__inner{-webkit-flex-wrap:wrap;flex-wrap:wrap}.share-label{display:none}}.word-author__iconbox{display:inline-block}.word-author__iconbox:before{content:"";display:inline-block;vertical-align:middle;margin-right:1.4rem;width:4.2rem;height:4.2rem;background-repeat:no-repeat;background-position:50% 50%;background-size:contain}.word-author__label{font-weight:300}.world-author__link{transition:color .3s ease-out}.word-author_claret .world-author__link{color:#a74752}.word-author_claret .world-author__link:hover{color:#721621}.word-author{background-color:#eee}.word-author__buy-icon:before{background-image:url("../icons/dollar_claret.svg")}.word-author__look-projects-icon:before{background-image:url("../icons/eye.svg")}@media screen and (min-width:401px){.word-author__share-icon:before{background-image:url("../icons/share.svg")}}@media screen and (max-width:480px){.word-author__layout{width:48%}.word-author__share{display:none}}.b-share_theme_counter{display:inline-block;vertical-align:text-bottom}@font-face{font-family:"fontello";src:url("../icons/fontello.eot?70583804");src:url("../icons/fontello.eot?70583804#iefix") format("embedded-opentype"),url("../icons/fontello.woff?70583804") format("woff"),url("../icons/fontello.ttf?70583804") format("truetype"),url("../icons/fontello.svg?70583804#fontello") format("svg");font-weight:normal;font-style:normal}[class^="icon-"]:before,[class*=" icon-"]:before{font-family:"fontello";font-style:normal;font-weight:normal;speak:none;display:inline-block;text-decoration:inherit;width:1em;text-align:center;font-variant:normal;text-transform:none;line-height:1em;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale}.icon-twitter:before{content:"\e800"}.icon-facebook:before{content:"\e801"}.icon-github:before{content:"\e802"}.icon-user:before{content:"\e803"}.icon-gplus:before{content:"\e804"}.icon-location:before{content:"\e805"}.icon-briefcase:before{content:"\e806"}.icon-mail:before{content:"\e807"}.icon-android:before{content:"\e808"}.icon-html5:before{content:"\e809"}.icon-css3:before{content:"\e80a"}.icon-drupal:before{content:"\e80b"}.icon-joomla:before{content:"\e80c"}.icon-apple:before{content:"\e80d"}.icon-wordpress:before{content:"\e80e"}.icon-camera:before{content:"\e80f"}.icon-chart-bar:before{content:"\e810"}.icon-linkedin:before{content:"\e816"}.icon-codeopen:before{content:"\e817"}.mr-table{border-spacing:0;border-collapse:collapse}.mr-table__mobile-caption{display:none}.mr-table_bg_column{width:30%}@media screen and (max-width:768px){.mr-table,.mr-table__thead,.mr-table__tbody,.mr-table__tr{display:block}.mr-table__th,.mr-table__td{display:-webkit-flex;display:flex}.mr-table .mr-table__head{display:none}.mr-table .mr-table_bg_column{width:auto;padding:20px 15px}.mr-table .mr-table__mobile-caption,.mr-table .mr-table__value{display:block}.mr-table .mr-table__mobile-caption{margin-right:2%}}@media screen and (max-width:768px){.mr-table_evenly .mr-table__mobile-caption,.mr-table_evenly .mr-table__value{width:48%}}.mr-table_bg .mr-table__head{background-color:#2196f3;color:#fff}.mr-table_bg .mr-table__tr:hover{background-color:#eee}@media screen and (max-width:768px){.mr-table_bg .mr-table__td:first-of-type{background-color:#2196f3;color:#fff}.mr-table_bg .mr-table__tr:hover{background:inherit}}@media only screen and (min-width:769px){.mr-table_bg_no .mr-table__head{border-bottom:1px solid #eee}}@media only screen and (max-width:768px){.mr-table_bg_no .mr-table__td{display:block}.mr-table_bg_no .mr-table_mobile_caption{font-weight:700;margin-bottom:10px}}.mr-table{width:100%;font-family:"Roboto",sans-serif;font-weight:300;font-size:14px}@media screen and (min-width:769px){.mr-table{box-shadow:0 1px 3px 0 rgba(0,0,0,0.12),0 1px 2px 0 rgba(0,0,0,0.24)}}.mr-table__td,.mr-table__th{padding:1.5em 1em;text-align:left}.mr-table__th{font-size:16px;font-weight:300}.mr-table__tr{border-bottom:1px solid #eee;transition:background-color .2s ease-in}.mr-table__tr:last-of-type{border-bottom:none}@media screen and (max-width:768px){.mr-table{box-shadow:none}.mr-table__tr{margin-bottom:0px;box-shadow:0 1px 3px 0 rgba(0,0,0,0.12),0 1px 2px 0 rgba(0,0,0,0.24);background-color:#fff}.mr-table__tr:hover{background:none}.mr-table__td{border-bottom:1px solid #eee}.mr-table__td:last-of-type{border-bottom:none}}@media screen and (max-width:640px){.mr-table{font-size:12px}.mr-table__th{font-size:14px}}.mr-tables{display:-webkit-flex;display:flex;-webkit-justify-content:space-between;justify-content:space-between}.mr-table_2column{width:49%}.mr-table_3column{width:32%}.mr-table_4column{width:24%}@media only screen and (max-width:768px){.mr-tables{-webkit-flex-wrap:wrap;flex-wrap:wrap}}@media only screen and (min-width:481px) and (max-width:768px){.mr-table_3column,.mr-table_4column{width:49%}}@media only screen and (max-width:480px){.mr-table_2column,.mr-table_3column,.mr-table_4column{width:100%}}.mr-table_price .mr-table__th{text-align:center}.mr-table__tariff,.mr-table__price-value{display:block}.mr-table__price-value{margin:1em 0 .5em}.mr-table__decor-arrow{display:inline-block;vertical-align:middle;position:relative;margin-right:10px;height:20px;width:20px}.mr-table__decor-arrow:after{content:"";display:block;width:70%;height:33.33%;position:absolute;top:0;left:5px;-webkit-transform:rotate(135deg) translateY(-25%);transform:rotate(135deg) translateY(-25%)}.mr-table__button{display:block;width:50%;cursor:pointer;margin:0 auto;padding:.5em 1em;text-align:center}@media screen and (max-width:768px){.mr-table_price .mr-table__price-head,.mr-table_price .mr-table__th,.mr-table_price .mr-table__price-tr,.mr-table_price .mr-table__td{display:block}}.mr-table_price{transition:box-shadow .2s ease-in}.mr-table_price:hover{box-shadow:0 1px 10px 0 rgba(0,0,0,0.12),0 1px 10px 0 rgba(0,0,0,0.24)}.mr-table_price .mr-table__th{border-bottom:1px solid #eee}.mr-table__tariff{font-weight:400;font-size:28px;color:#36bae2}.mr-table__price-value{font-weight:300;font-size:35px}.mr-table__price-tr{border-bottom:1px solid #eee}.mr-table__decor-arrow:after{border-right:2px solid #36bae2;border-top:2px solid #36bae2}.mr-table__button{font-size:14px;font-weight:400;background-color:transparent;color:#000;border:1px solid #36bae2;transition:color .2s ease-in}@media screen and (max-width:768px){.mr-table_price{box-shadow:0 1px 3px 0 rgba(0,0,0,0.12),0 1px 2px 0 rgba(0,0,0,0.24)}.mr-table__tariff{font-size:24px}.mr-table__price-value{font-size:28px}}@media screen and (max-width:640px){.responsive_price_table{font-size:12px}.mr-table__tariff{font-size:16px}.mr-table__price-value{font-size:18px}}.mr-table_price-head-bg .mr-table__th{background-color:#7049ba}.mr-table_price-head-bg .mr-table__th,.mr-table_price-head-bg .mr-table__tariff{color:#fff}.mr-table_price-head-bg .responsive_price_table_decor:after,.mr-table_price-head-bg .mr-table__button{border-color:#7049ba}.mr-table_price-bg{background-color:#36bae2}.mr-table_price-bg,.mr-table_price-bg .mr-table__tariff,.mr-table_price-bg .mr-table__button{color:#fff}.mr-table_price-bg .mr-table__decor-arrow:after,.mr-table_price-bg .mr-table__button{border-color:#fff}.mr-table_versions .mr-table__head{border-bottom:1px solid #eee}.mr-table-active-column{background-color:#017bbd;border-bottom:1px solid #2bb8e6;font-weight:700;color:#fff}@media screen and (max-width:768px){.mr-table_versions .mr-table__td:first-of-type{background-color:#eee}.mr-table-active-column{background:none;color:#017bbd}}.mr-table__avatarbox,.mr-table__username,.mr-table__post{width:100%}.mr-table__social{text-decoration:none}.mr-table__icon-label{display:none}@media only screen and (max-width:768px){.mr-table_team .mr-table__th{-webkit-flex-wrap:wrap;flex-wrap:wrap;-webkit-justify-content:center;justify-content:center}.mr-table_team .mr-table__td{display:block}}.mr-table_team{box-shadow:0 1px 3px 0 rgba(0,0,0,0.12),0 1px 2px 0 rgba(0,0,0,0.24)}.mr-table_team:hover{box-shadow:0 1px 10px 0 rgba(0,0,0,0.12),0 1px 10px 0 rgba(0,0,0,0.24)}.mr-table_team .mr-table__th{text-align:center;background-color:#18bd9b;color:#fff}.mr-table_team .mr-table__td{border-top:1px solid #eee}.mr-table__avatar{border-radius:50%;border:3px solid #fff;width:100px;height:100px}.mr-table__username{margin-top:10px;font-size:18px;font-weight:300}.mr-table__icon{margin:0 10px 20px 0}.mr-table__icon:last-of-type{margin-right:0}.mr-table__icon{width:16px;height:16px;display:inline-block;cursor:pointer;padding:10px;border-radius:50%;background-color:#18bd9b;box-shadow:0 1px 3px 0 rgba(0,0,0,0.12),0 1px 2px 0 rgba(0,0,0,0.24)}.mr-table__icon:before{color:#fff;font-size:16px}.mr-table__title{font-size:20px;font-weight:300;margin-bottom:15px}@media screen and (max-width:480px){.mr-table{margin-bottom:5vw}}@media screen and (min-width:480px) and (max-width:768px){.mr-table{margin-bottom:2vw}}</style></head><body><div class="main-container"><table class="mr-table mr-table_evenly mr-table_versions"> <tbody class="mr-table__tbody"><tr class="mr-table__tr"><td class="mr-table__td"><span class="mr-table__value"><h2 style="font-size:14px; color:#eb549f; padding:20px;"> YOUR VEHICLE IS VALUED BETWEEN:</h2></span> <span class="mr-table__value"><h2 style="font-size:14px; color:#eb549f; padding:20px;">Ksh. 1,566,000 - Ksh. 2,600,000</h2></span></td></tr><tr class="mr-table__tr"> <td class="mr-table__td" style="width:95.7%;"><span class="mr-table__value" style="width:100%" ><img style="width:100%" src="images/1.jpg" alt="Selected Vehicle"></span><span class="mr-table__mobile-caption" style="width:100%;" ><span class="mr-table__mobile-caption"></span> <p style="margin:30px 30px;"><strong>Disclaimer:</strong> This results are based on the accuracy of the information given. For a more detailed valuation of your vehicle please contact Regent Autovaluers.</p></span></td></tr><tr class="mr-table__tr"><td class="mr-table__td"> <span class="mr-table__value">Vehicle Make:</span> <span class="mr-table__value">'+$rootScope.theBrand+'</span></td></tr><tr class="mr-table__tr"><td class="mr-table__td"><span class="mr-table__value">Vehicle Model:</span><span class="mr-table__value">'+$rootScope.theModel+'</span> </td></tr><tr class="mr-table__tr"><td class="mr-table__td"><span class="mr-table__value">Vehicle Sub Model:</span><span class="mr-table__value">'+$rootScope.the_subModel+'</span></td></tr><tr class="mr-table__tr"><td class="mr-table__td"><span class="mr-table__value">Year of Manufacture:</span> <span class="mr-table__value">'+$rootScope.theYear+'</span></td></tr><tr class="mr-table__tr"><td class="mr-table__td"><span class="mr-table__value">Mileage:</span><span class="mr-table__value">'+$rootScope.theMilleage+' KM</span></td></tr><tr class="mr-table__tr"><td class="mr-table__td"><span class="mr-table__value">Drive Train:</span><span class="mr-table__value">'+drivetrain+'</span></td></tr><tr class="mr-table__tr"><td class="mr-table__td"><span class="mr-table__value">Transmission:</span><span class="mr-table__value">'+transmission+'</span></td></tr><tr class="mr-table__tr"><td class="mr-table__td"><span class="mr-table__value">Country:</span><span class="mr-table__value">'+carCountry+'</span></td></tr><tr class="'+powersteering+' mr-table__tr"><td class="mr-table__td"><span class="mr-table__value">Power Steering:</span><span class="mr-table__value">'+powersteering+'</span></td></tr><tr class="'+abs+' mr-table__tr"><td class="mr-table__td"><span class="mr-table__value">Automatic Breaking System:</span><span class="mr-table__value">'+abs+'</span></td></tr><tr class="'+cruiseC+' mr-table__tr"><td class="mr-table__td"><span class="mr-table__value">Cruise Control:</span><span class="mr-table__value">'+cruiseC+'</span></td></tr><tr class="'+radio+' mr-table__tr"><td class="mr-table__td"><span class="mr-table__value">AM/FM Radio:</span><span class="mr-table__value">'+radio+'</span></td></tr><tr class="'+cddvd+' mr-table__tr"><td class="mr-table__td"><span class="mr-table__value">CD/DVD Player:</span><span class="mr-table__value">'+cddvd+'</span></td></tr><tr class="'+ac+' mr-table__tr"><td class="mr-table__td"><span class="mr-table__value">Air Conditioner:</span><span class="mr-table__value">'+ac+'</span></td></tr><tr class="'+powerdoor+' mr-table__tr"><td class="mr-table__td"><span class="mr-table__value">Power Door:</span><span class="mr-table__value">'+powerdoor+'</span></td></tr><tr class="'+tg+' mr-table__tr"><td class="mr-table__td"><span class="mr-table__value">Tiptronic Gearbox:</span><span class="mr-table__value">'+tg+'</span></td></tr><tr class="'+securityS+' mr-table__tr"><td class="mr-table__td"><span class="mr-table__value">Security System:</span><span class="mr-table__value">'+securityS+'</span></td></tr><tr class="'+pseats+' mr-table__tr"><td class="mr-table__td"><span class="mr-table__value">Power Seats:</span><span class="mr-table__value">'+pseats+'</span></td></tr><tr class="'+lseats+' mr-table__tr"><td class="mr-table__td"><span class="mr-table__value">Leather Seats:</span><span class="mr-table__value">'+lseats+'</span></td></tr><tr class="'+rims+' mr-table__tr"><td class="mr-table__td"><span class="mr-table__value">Alloy Rims:</span><span class="mr-table__value">'+rims+'</span></td></tr><tr class="'+fogL+' mr-table__tr"><td class="mr-table__td"><span class="mr-table__value">Fog Lights:</span><span class="mr-table__value">'+fogL+'</span></td></tr><tr class="'+xenonL+' mr-table__tr"><td class="mr-table__td"><span class="mr-table__value">Xenon Lights:</span><span class="mr-table__value">'+xenonL+'</span></td></tr><tr class="'+airbag+' mr-table__tr"><td class="mr-table__td"><span class="mr-table__value">SRS Airbags:</span><span class="mr-table__value">'+airbag+'</span></td></tr></tbody></table></div></body></html>';
        var theCertMarkup = '<!DOCTYPE html><html lang="en"><head><title>NIC Blue Book Car Valuation results table</title><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><link href="https://fonts.googleapis.com/css?family=Roboto:400,300,700" rel="stylesheet"><style type="text/css">*{margin: 0;padding: 0;border: none;}.main-container{min-width: 200px;max-width: 1200px;margin: 0 auto;padding: 20px 10px 0;}.no{display: none !important;}*{margin:0;padding:0;border:none}@media screen and (min-width:981px){html{font-size:10px}}@media screen and (min-width:641px) and (max-width:980px){html{font-size:8px}}@media screen and (max-width:640px){html{font-size:7px}}body{font-family:"PT Sans",sans-serif;font-size:1.4rem;color:#000}a{text-decoration:none;color:#000;transition:color .4s ease-out}a:hover{color:#a74752}a:focus{outline-color:#a74752}p{line-height:3rem;margin-bottom:1rem}p:last-of-type{margin-bottom:0}.link{display:inline-block;padding:.5em 1.5em}.link_black{color:#fff;background-color:#000;transition:background-color .4s ease-out}.link_black:hover,.link_black:focus{background-color:#333;color:#fff}.link_black:focus{outline-color:#000}.link_animated-slide{overflow:hidden;position:relative;-webkit-transform:translateZ(0);transform:translateZ(0)}.link_animated-slide:before{content:"";display:block;width:100%;height:100%;position:absolute;top:0;left:-1px;-webkit-transform:translate3d(-100%, 0, 0);transform:translate3d(-100%, 0, 0);transition:-webkit-transform .2s ease-out 0s;transition:transform .2s ease-out 0s;transition:transform .2s ease-out 0s, -webkit-transform .2s ease-out 0s}.link_animated-slide:hover:before,.link_animated-slide:focus:before{-webkit-transform:translate3d(1px, 0, 0);transform:translate3d(1px, 0, 0)}.link_animated-slide:focus{outline:none}.link_animated-slide__label{position:relative;z-index:2}.link_animated-slide-white-border-black{border:1px solid #000;color:#000}.link_animated-slide-white-border-black:before{background-color:#000}.link_animated-slide-white-border-black:hover .link_animated-slide__label,.link_animated-slide-white-border-black:focus .link_animated-slide__label{color:#fff}.link__label{display:inline-block;vertical-align:middle}.link_animated-slide-white-border-black:focus{outline-color:#000}.title{font-size:3.5rem;font-weight:300;color:#000}.title_middle{font-size:2.8rem}.title_small{font-size:2.4rem}.title_little{font-size:2rem}.title_uppercase{text-transform:uppercase}.title_bottom-decor{margin-bottom:1rem}.title_bottom-decor:after{content:"";display:block;width:5rem;height:2px;background-color:#000;position:absolute;bottom:0;left:50%;-webkit-transform:translate(-50%, 0);transform:translate(-50%, 0)}.subtitle{margin-bottom:1.5rem;color:#a74752;font-size:1.6rem}.title_white{color:#fff}.title_white:after{background-color:#fff}@media screen and (max-width:640px){.title_bottom-decor{margin-bottom:1rem}}.icon:before{content:"";display:block;width:1.6rem;height:1.6rem;background-repeat:no-repeat;background-position:50% 50%;background-size:contain}.icon{display:inline-block;vertical-align:middle}.icon_small:before{width:2.4rem;height:2.4rem}.icon_large:before{width:4.8rem;height:4.8rem}.icon{margin-right:1rem}.icon-github:before{background-image:url("../icons/github.svg")}.header{padding:2rem 0;background-color:#000}.wrapper{padding-top:9rem;padding-bottom:9rem;text-align:center}.wrapper_shadow{box-shadow:0 0 2rem 1rem #eee;border-bottom:1px solid #eee}@media screen and (max-width:640px){.wrapper{padding-top:6rem;padding-bottom:6rem}}.main-container{min-width:100px;max-width:1200px;padding:0 2rem;margin:0 auto}.main-container__header{text-align:center;position:relative;padding-bottom:1rem;margin-bottom:7rem}@media screen and (max-width:640px){.main-container__header{margin-bottom:4rem}}.footer{background-color:#fff;border-top:1px solid #eee;box-shadow:0 0 .8rem #eee;padding:2rem 0;min-width:100%}.footer{text-align:center}.logo{font-size:2rem;font-weight:300;color:#fff;text-align:center}.description-plugin{padding-top:9rem;text-align:center}.description-plugin__content{width:85%;font-size:1.8rem;margin:0 auto}.demo-links{display:-webkit-flex;display:flex;-webkit-flex-wrap:wrap;flex-wrap:wrap}.demo-link{box-sizing:border-box;text-align:center}.demo-links_4column .demo-link{width:23.5%;margin-top:1.9vw}.demo-links_4column .demo-link:nth-of-type(1),.demo-links_4column .demo-link:nth-of-type(2),.demo-links_4column .demo-link:nth-of-type(3),.demo-links_4column .demo-link:nth-of-type(4){margin-top:0}.demo-links_4column .demo-link:nth-of-type(4n+2){margin-left:2%;margin-right:1%}.demo-links_4column .demo-link:nth-of-type(4n+3){margin-right:2%;margin-left:1%}@media screen and (max-width:980px){.demo-links_4column .demo-link{width:32.5%;margin-top:1vw}.demo-links_4column .demo-link:nth-of-type(4){margin-top:1vw}.demo-links_4column .demo-link:nth-of-type(4n+2),.demo-links_4column .demo-link:nth-of-type(4n+3){margin-left:0;margin-right:0}.demo-links_4column .demo-link:nth-of-type(3n+2){margin-right:1%;margin-left:1%}}@media screen and (max-width:480px){.demo-links_4column .demo-link{width:49%;margin-top:1.8vw}.demo-links_4column .demo-link:nth-of-type(3),.demo-links_4column .demo-link:nth-of-type(4){margin-top:1.8vw}.demo-links_4column .demo-link:nth-of-type(3n+2){margin-right:0;margin-left:0}.demo-links_4column .demo-link:nth-of-type(2n+1){margin-right:1%;margin-left:0}.demo-links_4column .demo-link:nth-of-type(2n+2){margin-right:0;margin-left:1%}}.demo-links{-webkit-justify-content:center;justify-content:center}.demo-link{border:1px solid #000}.word-author{font-size:2rem;font-weight:bold;text-align:center;padding-top:9rem;padding-bottom:9rem}@media screen and (max-width:640px){.word-author{padding-top:6rem;padding-bottom:6rem}}.word-author__inner{display:-webkit-flex;display:flex;-webkit-align-items:center;align-items:center;-webkit-justify-content:center;justify-content:center}.word-author__layout{width:32%}.b-share_theme_counter .b-share-btn__wrap{float:none !important;margin:0 .5rem 0 0 !important;display:inline-block;vertical-align:text-bottom}@media screen and (max-width:640px){.word-author__inner{-webkit-flex-wrap:wrap;flex-wrap:wrap}.share-label{display:none}}.word-author__iconbox{display:inline-block}.word-author__iconbox:before{content:"";display:inline-block;vertical-align:middle;margin-right:1.4rem;width:4.2rem;height:4.2rem;background-repeat:no-repeat;background-position:50% 50%;background-size:contain}.word-author__label{font-weight:300}.world-author__link{transition:color .3s ease-out}.word-author_claret .world-author__link{color:#a74752}.word-author_claret .world-author__link:hover{color:#721621}.word-author{background-color:#eee}.word-author__buy-icon:before{background-image:url("../icons/dollar_claret.svg")}.word-author__look-projects-icon:before{background-image:url("../icons/eye.svg")}@media screen and (min-width:401px){.word-author__share-icon:before{background-image:url("../icons/share.svg")}}@media screen and (max-width:480px){.word-author__layout{width:48%}.word-author__share{display:none}}.b-share_theme_counter{display:inline-block;vertical-align:text-bottom}@font-face{font-family:"fontello";src:url("../icons/fontello.eot?70583804");src:url("../icons/fontello.eot?70583804#iefix") format("embedded-opentype"),url("../icons/fontello.woff?70583804") format("woff"),url("../icons/fontello.ttf?70583804") format("truetype"),url("../icons/fontello.svg?70583804#fontello") format("svg");font-weight:normal;font-style:normal}[class^="icon-"]:before,[class*=" icon-"]:before{font-family:"fontello";font-style:normal;font-weight:normal;speak:none;display:inline-block;text-decoration:inherit;width:1em;text-align:center;font-variant:normal;text-transform:none;line-height:1em;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale}.icon-twitter:before{content:"\e800"}.icon-facebook:before{content:"\e801"}.icon-github:before{content:"\e802"}.icon-user:before{content:"\e803"}.icon-gplus:before{content:"\e804"}.icon-location:before{content:"\e805"}.icon-briefcase:before{content:"\e806"}.icon-mail:before{content:"\e807"}.icon-android:before{content:"\e808"}.icon-html5:before{content:"\e809"}.icon-css3:before{content:"\e80a"}.icon-drupal:before{content:"\e80b"}.icon-joomla:before{content:"\e80c"}.icon-apple:before{content:"\e80d"}.icon-wordpress:before{content:"\e80e"}.icon-camera:before{content:"\e80f"}.icon-chart-bar:before{content:"\e810"}.icon-linkedin:before{content:"\e816"}.icon-codeopen:before{content:"\e817"}.mr-table{border-spacing:0;border-collapse:collapse}.mr-table__mobile-caption{display:none}.mr-table_bg_column{width:30%}@media screen and (max-width:768px){.mr-table,.mr-table__thead,.mr-table__tbody,.mr-table__tr{display:block}.mr-table__th,.mr-table__td{display:-webkit-flex;display:flex}.mr-table .mr-table__head{display:none}.mr-table .mr-table_bg_column{width:auto;padding:20px 15px}.mr-table .mr-table__mobile-caption,.mr-table .mr-table__value{display:block}.mr-table .mr-table__mobile-caption{margin-right:2%}}@media screen and (max-width:768px){.mr-table_evenly .mr-table__mobile-caption,.mr-table_evenly .mr-table__value{width:48%}}.mr-table_bg .mr-table__head{background-color:#2196f3;color:#fff}.mr-table_bg .mr-table__tr:hover{background-color:#eee}@media screen and (max-width:768px){.mr-table_bg .mr-table__td:first-of-type{background-color:#2196f3;color:#fff}.mr-table_bg .mr-table__tr:hover{background:inherit}}@media only screen and (min-width:769px){.mr-table_bg_no .mr-table__head{border-bottom:1px solid #eee}}@media only screen and (max-width:768px){.mr-table_bg_no .mr-table__td{display:block}.mr-table_bg_no .mr-table_mobile_caption{font-weight:700;margin-bottom:10px}}.mr-table{width:100%;font-family:"Roboto",sans-serif;font-weight:300;font-size:14px}@media screen and (min-width:769px){.mr-table{box-shadow:0 1px 3px 0 rgba(0,0,0,0.12),0 1px 2px 0 rgba(0,0,0,0.24)}}.mr-table__td,.mr-table__th{padding:1.5em 1em;text-align:left}.mr-table__th{font-size:16px;font-weight:300}.mr-table__tr{border-bottom:1px solid #eee;transition:background-color .2s ease-in}.mr-table__tr:last-of-type{border-bottom:none}@media screen and (max-width:768px){.mr-table{box-shadow:none}.mr-table__tr{margin-bottom:0px;box-shadow:0 1px 3px 0 rgba(0,0,0,0.12),0 1px 2px 0 rgba(0,0,0,0.24);background-color:#fff}.mr-table__tr:hover{background:none}.mr-table__td{border-bottom:1px solid #eee}.mr-table__td:last-of-type{border-bottom:none}}@media screen and (max-width:640px){.mr-table{font-size:12px}.mr-table__th{font-size:14px}}.mr-tables{display:-webkit-flex;display:flex;-webkit-justify-content:space-between;justify-content:space-between}.mr-table_2column{width:49%}.mr-table_3column{width:32%}.mr-table_4column{width:24%}@media only screen and (max-width:768px){.mr-tables{-webkit-flex-wrap:wrap;flex-wrap:wrap}}@media only screen and (min-width:481px) and (max-width:768px){.mr-table_3column,.mr-table_4column{width:49%}}@media only screen and (max-width:480px){.mr-table_2column,.mr-table_3column,.mr-table_4column{width:100%}}.mr-table_price .mr-table__th{text-align:center}.mr-table__tariff,.mr-table__price-value{display:block}.mr-table__price-value{margin:1em 0 .5em}.mr-table__decor-arrow{display:inline-block;vertical-align:middle;position:relative;margin-right:10px;height:20px;width:20px}.mr-table__decor-arrow:after{content:"";display:block;width:70%;height:33.33%;position:absolute;top:0;left:5px;-webkit-transform:rotate(135deg) translateY(-25%);transform:rotate(135deg) translateY(-25%)}.mr-table__button{display:block;width:50%;cursor:pointer;margin:0 auto;padding:.5em 1em;text-align:center}@media screen and (max-width:768px){.mr-table_price .mr-table__price-head,.mr-table_price .mr-table__th,.mr-table_price .mr-table__price-tr,.mr-table_price .mr-table__td{display:block}}.mr-table_price{transition:box-shadow .2s ease-in}.mr-table_price:hover{box-shadow:0 1px 10px 0 rgba(0,0,0,0.12),0 1px 10px 0 rgba(0,0,0,0.24)}.mr-table_price .mr-table__th{border-bottom:1px solid #eee}.mr-table__tariff{font-weight:400;font-size:28px;color:#36bae2}.mr-table__price-value{font-weight:300;font-size:35px}.mr-table__price-tr{border-bottom:1px solid #eee}.mr-table__decor-arrow:after{border-right:2px solid #36bae2;border-top:2px solid #36bae2}.mr-table__button{font-size:14px;font-weight:400;background-color:transparent;color:#000;border:1px solid #36bae2;transition:color .2s ease-in}@media screen and (max-width:768px){.mr-table_price{box-shadow:0 1px 3px 0 rgba(0,0,0,0.12),0 1px 2px 0 rgba(0,0,0,0.24)}.mr-table__tariff{font-size:24px}.mr-table__price-value{font-size:28px}}@media screen and (max-width:640px){.responsive_price_table{font-size:12px}.mr-table__tariff{font-size:16px}.mr-table__price-value{font-size:18px}}.mr-table_price-head-bg .mr-table__th{background-color:#7049ba}.mr-table_price-head-bg .mr-table__th,.mr-table_price-head-bg .mr-table__tariff{color:#fff}.mr-table_price-head-bg .responsive_price_table_decor:after,.mr-table_price-head-bg .mr-table__button{border-color:#7049ba}.mr-table_price-bg{background-color:#36bae2}.mr-table_price-bg,.mr-table_price-bg .mr-table__tariff,.mr-table_price-bg .mr-table__button{color:#fff}.mr-table_price-bg .mr-table__decor-arrow:after,.mr-table_price-bg .mr-table__button{border-color:#fff}.mr-table_versions .mr-table__head{border-bottom:1px solid #eee}.mr-table-active-column{background-color:#017bbd;border-bottom:1px solid #2bb8e6;font-weight:700;color:#fff}@media screen and (max-width:768px){.mr-table_versions .mr-table__td:first-of-type{background-color:#eee}.mr-table-active-column{background:none;color:#017bbd}}.mr-table__avatarbox,.mr-table__username,.mr-table__post{width:100%}.mr-table__social{text-decoration:none}.mr-table__icon-label{display:none}@media only screen and (max-width:768px){.mr-table_team .mr-table__th{-webkit-flex-wrap:wrap;flex-wrap:wrap;-webkit-justify-content:center;justify-content:center}.mr-table_team .mr-table__td{display:block}}.mr-table_team{box-shadow:0 1px 3px 0 rgba(0,0,0,0.12),0 1px 2px 0 rgba(0,0,0,0.24)}.mr-table_team:hover{box-shadow:0 1px 10px 0 rgba(0,0,0,0.12),0 1px 10px 0 rgba(0,0,0,0.24)}.mr-table_team .mr-table__th{text-align:center;background-color:#18bd9b;color:#fff}.mr-table_team .mr-table__td{border-top:1px solid #eee}.mr-table__avatar{border-radius:50%;border:3px solid #fff;width:100px;height:100px}.mr-table__username{margin-top:10px;font-size:18px;font-weight:300}.mr-table__icon{margin:0 10px 20px 0}.mr-table__icon:last-of-type{margin-right:0}.mr-table__icon{width:16px;height:16px;display:inline-block;cursor:pointer;padding:10px;border-radius:50%;background-color:#18bd9b;box-shadow:0 1px 3px 0 rgba(0,0,0,0.12),0 1px 2px 0 rgba(0,0,0,0.24)}.mr-table__icon:before{color:#fff;font-size:16px}.mr-table__title{font-size:20px;font-weight:300;margin-bottom:15px}@media screen and (max-width:480px){.mr-table{margin-bottom:5vw}}@media screen and (min-width:480px) and (max-width:768px){.mr-table{margin-bottom:2vw}}</style></head><body><div class="main-container"><table class="mr-table mr-table_evenly mr-table_versions"> <tbody class="mr-table__tbody"><tr class="mr-table__tr"><td class="mr-table__td"><span class="mr-table__value"><h2 style="font-size:14px; color:#eb549f; padding:20px;"> YOUR VEHICLE IS VALUED BETWEEN:</h2></span> <span class="mr-table__value"><h2 style="font-size:14px; color:#eb549f; padding:20px;">' + $rootScope.carMinimum_price + ' - ' + $rootScope.carMaximum_price + '</h2></span></td></tr><tr class="mr-table__tr"> <td class="mr-table__td" style="width:95.7%;"><span class="mr-table__value" style="width:100%" ><img style="width:100%" src="' + $scope.carImageUrl + '" alt="Selected Vehicle"></span><span class="mr-table__mobile-caption" style="width:100%;" ><span class="mr-table__mobile-caption"></span> <p style="margin:30px 30px;"><strong>Disclaimer:</strong> This results are based on the accuracy of the information given. For a more detailed valuation of your vehicle please contact Regent Autovaluers.</p></span></td></tr><tr class="mr-table__tr"><td class="mr-table__td"> <span class="mr-table__value">Vehicle Make:</span> <span class="mr-table__value">' + $rootScope.theBrand + '</span></td></tr><tr class="mr-table__tr"><td class="mr-table__td"><span class="mr-table__value">Vehicle Model:</span><span class="mr-table__value">' + $rootScope.theModel + '</span> </td></tr><tr class="mr-table__tr"><td class="mr-table__td"><span class="mr-table__value">Vehicle Sub Model:</span><span class="mr-table__value">' + $rootScope.the_subModel + '</span></td></tr><tr class="mr-table__tr"><td class="mr-table__td"><span class="mr-table__value">Year of Manufacture:</span> <span class="mr-table__value">' + $rootScope.theYear + '</span></td></tr><tr class="mr-table__tr"><td class="mr-table__td"><span class="mr-table__value">Mileage:</span><span class="mr-table__value">' + $rootScope.theMilleage + ' KM</span></td></tr><tr class="mr-table__tr"><td class="mr-table__td"><span class="mr-table__value">Drive Train:</span><span class="mr-table__value">' + drivetrain + '</span></td></tr><tr class="mr-table__tr"><td class="mr-table__td"><span class="mr-table__value">Transmission:</span><span class="mr-table__value">' + transmission + '</span></td></tr><tr class="mr-table__tr"><td class="mr-table__td"><span class="mr-table__value">Country:</span><span class="mr-table__value">' + carCountry + '</span></td></tr><tr class="' + powersteering + ' mr-table__tr"><td class="mr-table__td"><span class="mr-table__value">Power Steering:</span><span class="mr-table__value">' + powersteering + '</span></td></tr><tr class="' + abs + ' mr-table__tr"><td class="mr-table__td"><span class="mr-table__value">Automatic Breaking System:</span><span class="mr-table__value">' + abs + '</span></td></tr><tr class="' + cruiseC + ' mr-table__tr"><td class="mr-table__td"><span class="mr-table__value">Cruise Control:</span><span class="mr-table__value">' + cruiseC + '</span></td></tr><tr class="' + radio + ' mr-table__tr"><td class="mr-table__td"><span class="mr-table__value">AM/FM Radio:</span><span class="mr-table__value">' + radio + '</span></td></tr><tr class="' + cddvd + ' mr-table__tr"><td class="mr-table__td"><span class="mr-table__value">CD/DVD Player:</span><span class="mr-table__value">' + cddvd + '</span></td></tr><tr class="' + ac + ' mr-table__tr"><td class="mr-table__td"><span class="mr-table__value">Air Conditioner:</span><span class="mr-table__value">' + ac + '</span></td></tr><tr class="' + powerdoor + ' mr-table__tr"><td class="mr-table__td"><span class="mr-table__value">Power Door:</span><span class="mr-table__value">' + powerdoor + '</span></td></tr><tr class="' + tg + ' mr-table__tr"><td class="mr-table__td"><span class="mr-table__value">Tiptronic Gearbox:</span><span class="mr-table__value">' + tg + '</span></td></tr><tr class="' + securityS + ' mr-table__tr"><td class="mr-table__td"><span class="mr-table__value">Security System:</span><span class="mr-table__value">' + securityS + '</span></td></tr><tr class="' + pseats + ' mr-table__tr"><td class="mr-table__td"><span class="mr-table__value">Power Seats:</span><span class="mr-table__value">' + pseats + '</span></td></tr><tr class="' + lseats + ' mr-table__tr"><td class="mr-table__td"><span class="mr-table__value">Leather Seats:</span><span class="mr-table__value">' + lseats + '</span></td></tr><tr class="' + rims + ' mr-table__tr"><td class="mr-table__td"><span class="mr-table__value">Alloy Rims:</span><span class="mr-table__value">' + rims + '</span></td></tr><tr class="' + fogL + ' mr-table__tr"><td class="mr-table__td"><span class="mr-table__value">Fog Lights:</span><span class="mr-table__value">' + fogL + '</span></td></tr><tr class="' + xenonL + ' mr-table__tr"><td class="mr-table__td"><span class="mr-table__value">Xenon Lights:</span><span class="mr-table__value">' + xenonL + '</span></td></tr><tr class="' + airbag + ' mr-table__tr"><td class="mr-table__td"><span class="mr-table__value">SRS Airbags:</span><span class="mr-table__value">' + airbag + '</span></td></tr></tbody></table></div></body></html>';
        GrabzIt( "MGYzMWUzNjI1M2QyNDc1OTljZTMyOTU3NjI1NWEwOWQ=" ).ConvertHTML( theCertMarkup, {
            "format": "pdf",
            "download": 1
        } ).Create();
    };
    //Print the Cert
    $scope.simplePrintPDFCert = function() {
        
        swal( {
                title: "Fill in the fields below to proceed",
                text: '<p>Thanks</p>',
                html: true
            } );
        
        //var theCertMarkup = '<!DOCTYPE html><html lang="en"><head><title>NIC Blue Book Car Valuation results table</title><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><style type="text/css">*{margin: 0;padding: 0;border: none;}.main-container{min-width: 200px;max-width: 1200px;margin: 0 auto;padding: 20px 10px 0;}*{margin:0;padding:0;border:none}@media screen and (min-width:981px){html{font-size:10px}}@media screen and (min-width:641px) and (max-width:980px){html{font-size:8px}}@media screen and (max-width:640px){html{font-size:7px}}body{font-family:"PT Sans",sans-serif;font-size:1.4rem;color:#000}a{text-decoration:none;color:#000;transition:color .4s ease-out}a:hover{color:#a74752}a:focus{outline-color:#a74752}p{line-height:3rem;margin-bottom:1rem}p:last-of-type{margin-bottom:0}.link{display:inline-block;padding:.5em 1.5em}.link_black{color:#fff;background-color:#000;transition:background-color .4s ease-out}.link_black:hover,.link_black:focus{background-color:#333;color:#fff}.link_black:focus{outline-color:#000}.link_animated-slide{overflow:hidden;position:relative;-webkit-transform:translateZ(0);transform:translateZ(0)}.link_animated-slide:before{content:"";display:block;width:100%;height:100%;position:absolute;top:0;left:-1px;-webkit-transform:translate3d(-100%, 0, 0);transform:translate3d(-100%, 0, 0);transition:-webkit-transform .2s ease-out 0s;transition:transform .2s ease-out 0s;transition:transform .2s ease-out 0s, -webkit-transform .2s ease-out 0s}.link_animated-slide:hover:before,.link_animated-slide:focus:before{-webkit-transform:translate3d(1px, 0, 0);transform:translate3d(1px, 0, 0)}.link_animated-slide:focus{outline:none}.link_animated-slide__label{position:relative;z-index:2}.link_animated-slide-white-border-black{border:1px solid #000;color:#000}.link_animated-slide-white-border-black:before{background-color:#000}.link_animated-slide-white-border-black:hover .link_animated-slide__label,.link_animated-slide-white-border-black:focus .link_animated-slide__label{color:#fff}.link__label{display:inline-block;vertical-align:middle}.link_animated-slide-white-border-black:focus{outline-color:#000}.title{font-size:3.5rem;font-weight:300;color:#000}.title_middle{font-size:2.8rem}.title_small{font-size:2.4rem}.title_little{font-size:2rem}.title_uppercase{text-transform:uppercase}.title_bottom-decor{margin-bottom:1rem}.title_bottom-decor:after{content:"";display:block;width:5rem;height:2px;background-color:#000;position:absolute;bottom:0;left:50%;-webkit-transform:translate(-50%, 0);transform:translate(-50%, 0)}.subtitle{margin-bottom:1.5rem;color:#a74752;font-size:1.6rem}.title_white{color:#fff}.title_white:after{background-color:#fff}@media screen and (max-width:640px){.title_bottom-decor{margin-bottom:1rem}}.icon:before{content:"";display:block;width:1.6rem;height:1.6rem;background-repeat:no-repeat;background-position:50% 50%;background-size:contain}.icon{display:inline-block;vertical-align:middle}.icon_small:before{width:2.4rem;height:2.4rem}.icon_large:before{width:4.8rem;height:4.8rem}.icon{margin-right:1rem}.icon-github:before{background-image:url("../icons/github.svg")}.header{padding:2rem 0;background-color:#000}.wrapper{padding-top:9rem;padding-bottom:9rem;text-align:center}.wrapper_shadow{box-shadow:0 0 2rem 1rem #eee;border-bottom:1px solid #eee}@media screen and (max-width:640px){.wrapper{padding-top:6rem;padding-bottom:6rem}}.main-container{min-width:100px;max-width:1200px;padding:0 2rem;margin:0 auto}.main-container__header{text-align:center;position:relative;padding-bottom:1rem;margin-bottom:7rem}@media screen and (max-width:640px){.main-container__header{margin-bottom:4rem}}.footer{background-color:#fff;border-top:1px solid #eee;box-shadow:0 0 .8rem #eee;padding:2rem 0;min-width:100%}.footer{text-align:center}.logo{font-size:2rem;font-weight:300;color:#fff;text-align:center}.description-plugin{padding-top:9rem;text-align:center}.description-plugin__content{width:85%;font-size:1.8rem;margin:0 auto}.demo-links{display:-webkit-flex;display:flex;-webkit-flex-wrap:wrap;flex-wrap:wrap}.demo-link{box-sizing:border-box;text-align:center}.demo-links_4column .demo-link{width:23.5%;margin-top:1.9vw}.demo-links_4column .demo-link:nth-of-type(1),.demo-links_4column .demo-link:nth-of-type(2),.demo-links_4column .demo-link:nth-of-type(3),.demo-links_4column .demo-link:nth-of-type(4){margin-top:0}.demo-links_4column .demo-link:nth-of-type(4n+2){margin-left:2%;margin-right:1%}.demo-links_4column .demo-link:nth-of-type(4n+3){margin-right:2%;margin-left:1%}@media screen and (max-width:980px){.demo-links_4column .demo-link{width:32.5%;margin-top:1vw}.demo-links_4column .demo-link:nth-of-type(4){margin-top:1vw}.demo-links_4column .demo-link:nth-of-type(4n+2),.demo-links_4column .demo-link:nth-of-type(4n+3){margin-left:0;margin-right:0}.demo-links_4column .demo-link:nth-of-type(3n+2){margin-right:1%;margin-left:1%}}@media screen and (max-width:480px){.demo-links_4column .demo-link{width:49%;margin-top:1.8vw}.demo-links_4column .demo-link:nth-of-type(3),.demo-links_4column .demo-link:nth-of-type(4){margin-top:1.8vw}.demo-links_4column .demo-link:nth-of-type(3n+2){margin-right:0;margin-left:0}.demo-links_4column .demo-link:nth-of-type(2n+1){margin-right:1%;margin-left:0}.demo-links_4column .demo-link:nth-of-type(2n+2){margin-right:0;margin-left:1%}}.demo-links{-webkit-justify-content:center;justify-content:center}.demo-link{border:1px solid #000}.word-author{font-size:2rem;font-weight:bold;text-align:center;padding-top:9rem;padding-bottom:9rem}@media screen and (max-width:640px){.word-author{padding-top:6rem;padding-bottom:6rem}}.word-author__inner{display:-webkit-flex;display:flex;-webkit-align-items:center;align-items:center;-webkit-justify-content:center;justify-content:center}.word-author__layout{width:32%}.b-share_theme_counter .b-share-btn__wrap{float:none !important;margin:0 .5rem 0 0 !important;display:inline-block;vertical-align:text-bottom}@media screen and (max-width:640px){.word-author__inner{-webkit-flex-wrap:wrap;flex-wrap:wrap}.share-label{display:none}}.word-author__iconbox{display:inline-block}.word-author__iconbox:before{content:"";display:inline-block;vertical-align:middle;margin-right:1.4rem;width:4.2rem;height:4.2rem;background-repeat:no-repeat;background-position:50% 50%;background-size:contain}.word-author__label{font-weight:300}.world-author__link{transition:color .3s ease-out}.word-author_claret .world-author__link{color:#a74752}.word-author_claret .world-author__link:hover{color:#721621}.word-author{background-color:#eee}.word-author__buy-icon:before{background-image:url("../icons/dollar_claret.svg")}.word-author__look-projects-icon:before{background-image:url("../icons/eye.svg")}@media screen and (min-width:401px){.word-author__share-icon:before{background-image:url("../icons/share.svg")}}@media screen and (max-width:480px){.word-author__layout{width:48%}.word-author__share{display:none}}.b-share_theme_counter{display:inline-block;vertical-align:text-bottom}@font-face{font-family:"fontello";src:url("../icons/fontello.eot?70583804");src:url("../icons/fontello.eot?70583804#iefix") format("embedded-opentype"),url("../icons/fontello.woff?70583804") format("woff"),url("../icons/fontello.ttf?70583804") format("truetype"),url("../icons/fontello.svg?70583804#fontello") format("svg");font-weight:normal;font-style:normal}[class^="icon-"]:before,[class*=" icon-"]:before{font-family:"fontello";font-style:normal;font-weight:normal;speak:none;display:inline-block;text-decoration:inherit;width:1em;text-align:center;font-variant:normal;text-transform:none;line-height:1em;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale}.icon-twitter:before{content:"\e800"}.icon-facebook:before{content:"\e801"}.icon-github:before{content:"\e802"}.icon-user:before{content:"\e803"}.icon-gplus:before{content:"\e804"}.icon-location:before{content:"\e805"}.icon-briefcase:before{content:"\e806"}.icon-mail:before{content:"\e807"}.icon-android:before{content:"\e808"}.icon-html5:before{content:"\e809"}.icon-css3:before{content:"\e80a"}.icon-drupal:before{content:"\e80b"}.icon-joomla:before{content:"\e80c"}.icon-apple:before{content:"\e80d"}.icon-wordpress:before{content:"\e80e"}.icon-camera:before{content:"\e80f"}.icon-chart-bar:before{content:"\e810"}.icon-linkedin:before{content:"\e816"}.icon-codeopen:before{content:"\e817"}.mr-table{border-spacing:0;border-collapse:collapse}.mr-table__mobile-caption{display:none}.mr-table_bg_column{width:30%}@media screen and (max-width:768px){.mr-table,.mr-table__thead,.mr-table__tbody,.mr-table__tr{display:block}.mr-table__th,.mr-table__td{display:-webkit-flex;display:flex}.mr-table .mr-table__head{display:none}.mr-table .mr-table_bg_column{width:auto;padding:20px 15px}.mr-table .mr-table__mobile-caption,.mr-table .mr-table__value{display:block}.mr-table .mr-table__mobile-caption{margin-right:2%}}@media screen and (max-width:768px){.mr-table_evenly .mr-table__mobile-caption,.mr-table_evenly .mr-table__value{width:48%}}.mr-table_bg .mr-table__head{background-color:#2196f3;color:#fff}.mr-table_bg .mr-table__tr:hover{background-color:#eee}@media screen and (max-width:768px){.mr-table_bg .mr-table__td:first-of-type{background-color:#2196f3;color:#fff}.mr-table_bg .mr-table__tr:hover{background:inherit}}@media only screen and (min-width:769px){.mr-table_bg_no .mr-table__head{border-bottom:1px solid #eee}}@media only screen and (max-width:768px){.mr-table_bg_no .mr-table__td{display:block}.mr-table_bg_no .mr-table_mobile_caption{font-weight:700;margin-bottom:10px}}.mr-table{width:100%;font-family:"Roboto",sans-serif;font-weight:300;font-size:14px}@media screen and (min-width:769px){.mr-table{box-shadow:0 1px 3px 0 rgba(0,0,0,0.12),0 1px 2px 0 rgba(0,0,0,0.24)}}.mr-table__td,.mr-table__th{padding:1.5em 1em;text-align:left}.mr-table__th{font-size:16px;font-weight:300}.mr-table__tr{border-bottom:1px solid #eee;transition:background-color .2s ease-in}.mr-table__tr:last-of-type{border-bottom:none}@media screen and (max-width:768px){.mr-table{box-shadow:none}.mr-table__tr{margin-bottom:30px;box-shadow:0 1px 3px 0 rgba(0,0,0,0.12),0 1px 2px 0 rgba(0,0,0,0.24);background-color:#fff}.mr-table__tr:hover{background:none}.mr-table__td{border-bottom:1px solid #eee}.mr-table__td:last-of-type{border-bottom:none}}@media screen and (max-width:640px){.mr-table{font-size:12px}.mr-table__th{font-size:14px}}.mr-tables{display:-webkit-flex;display:flex;-webkit-justify-content:space-between;justify-content:space-between}.mr-table_2column{width:49%}.mr-table_3column{width:32%}.mr-table_4column{width:24%}@media only screen and (max-width:768px){.mr-tables{-webkit-flex-wrap:wrap;flex-wrap:wrap}}@media only screen and (min-width:481px) and (max-width:768px){.mr-table_3column,.mr-table_4column{width:49%}}@media only screen and (max-width:480px){.mr-table_2column,.mr-table_3column,.mr-table_4column{width:100%}}.mr-table_price .mr-table__th{text-align:center}.mr-table__tariff,.mr-table__price-value{display:block}.mr-table__price-value{margin:1em 0 .5em}.mr-table__decor-arrow{display:inline-block;vertical-align:middle;position:relative;margin-right:10px;height:20px;width:20px}.mr-table__decor-arrow:after{content:"";display:block;width:70%;height:33.33%;position:absolute;top:0;left:5px;-webkit-transform:rotate(135deg) translateY(-25%);transform:rotate(135deg) translateY(-25%)}.mr-table__button{display:block;width:50%;cursor:pointer;margin:0 auto;padding:.5em 1em;text-align:center}@media screen and (max-width:768px){.mr-table_price .mr-table__price-head,.mr-table_price .mr-table__th,.mr-table_price .mr-table__price-tr,.mr-table_price .mr-table__td{display:block}}.mr-table_price{transition:box-shadow .2s ease-in}.mr-table_price:hover{box-shadow:0 1px 10px 0 rgba(0,0,0,0.12),0 1px 10px 0 rgba(0,0,0,0.24)}.mr-table_price .mr-table__th{border-bottom:1px solid #eee}.mr-table__tariff{font-weight:400;font-size:28px;color:#36bae2}.mr-table__price-value{font-weight:300;font-size:35px}.mr-table__price-tr{border-bottom:1px solid #eee}.mr-table__decor-arrow:after{border-right:2px solid #36bae2;border-top:2px solid #36bae2}.mr-table__button{font-size:14px;font-weight:400;background-color:transparent;color:#000;border:1px solid #36bae2;transition:color .2s ease-in}@media screen and (max-width:768px){.mr-table_price{box-shadow:0 1px 3px 0 rgba(0,0,0,0.12),0 1px 2px 0 rgba(0,0,0,0.24)}.mr-table__tariff{font-size:24px}.mr-table__price-value{font-size:28px}}@media screen and (max-width:640px){.responsive_price_table{font-size:12px}.mr-table__tariff{font-size:16px}.mr-table__price-value{font-size:18px}}.mr-table_price-head-bg .mr-table__th{background-color:#7049ba}.mr-table_price-head-bg .mr-table__th,.mr-table_price-head-bg .mr-table__tariff{color:#fff}.mr-table_price-head-bg .responsive_price_table_decor:after,.mr-table_price-head-bg .mr-table__button{border-color:#7049ba}.mr-table_price-bg{background-color:#36bae2}.mr-table_price-bg,.mr-table_price-bg .mr-table__tariff,.mr-table_price-bg .mr-table__button{color:#fff}.mr-table_price-bg .mr-table__decor-arrow:after,.mr-table_price-bg .mr-table__button{border-color:#fff}.mr-table_versions .mr-table__head{border-bottom:1px solid #eee}.mr-table-active-column{background-color:#017bbd;border-bottom:1px solid #2bb8e6;font-weight:700;color:#fff}@media screen and (max-width:768px){.mr-table_versions .mr-table__td:first-of-type{background-color:#eee}.mr-table-active-column{background:none;color:#017bbd}}.mr-table__avatarbox,.mr-table__username,.mr-table__post{width:100%}.mr-table__social{text-decoration:none}.mr-table__icon-label{display:none}@media only screen and (max-width:768px){.mr-table_team .mr-table__th{-webkit-flex-wrap:wrap;flex-wrap:wrap;-webkit-justify-content:center;justify-content:center}.mr-table_team .mr-table__td{display:block}}.mr-table_team{box-shadow:0 1px 3px 0 rgba(0,0,0,0.12),0 1px 2px 0 rgba(0,0,0,0.24)}.mr-table_team:hover{box-shadow:0 1px 10px 0 rgba(0,0,0,0.12),0 1px 10px 0 rgba(0,0,0,0.24)}.mr-table_team .mr-table__th{text-align:center;background-color:#18bd9b;color:#fff}.mr-table_team .mr-table__td{border-top:1px solid #eee}.mr-table__avatar{border-radius:50%;border:3px solid #fff;width:100px;height:100px}.mr-table__username{margin-top:10px;font-size:18px;font-weight:300}.mr-table__icon{margin:0 10px 20px 0}.mr-table__icon:last-of-type{margin-right:0}.mr-table__icon{width:16px;height:16px;display:inline-block;cursor:pointer;padding:10px;border-radius:50%;background-color:#18bd9b;box-shadow:0 1px 3px 0 rgba(0,0,0,0.12),0 1px 2px 0 rgba(0,0,0,0.24)}.mr-table__icon:before{color:#fff;font-size:16px}.mr-table__title{font-size:20px;font-weight:300;margin-bottom:15px}@media screen and (max-width:480px){.mr-table{margin-bottom:5vw}}@media screen and (min-width:480px) and (max-width:768px){.mr-table{margin-bottom:2vw}}</style><link href="https://fonts.googleapis.com/css?family=Roboto:400,300,700" rel="stylesheet"></head><body><div class="main-container"><table class="mr-table mr-table_evenly mr-table_versions"> <thead class="mr-table__thead"><tr class="mr-table__head"><th class="mr-table__th">Selected Option</th> <th class="mr-table__th mr-table-active-column">Option Result</th></tr></thead><tbody class="mr-table__tbody"><tr class="mr-table__tr"><td class="mr-table__td"><span class="mr-table__mobile-caption"><img src="http://brand2d.com/nicbluebook/logo.png"/></span><span class="mr-table__value"></span></td><td class="mr-table__td"><span class="mr-table__mobile-caption">Selected Make & Brand</span><span class="mr-table__value">YOUR VEHICLE IS VALUED BETWEEN:</span></td><td class="mr-table__td mr-table-active-column"><span class="mr-table__mobile-caption">'+$rootScope.theBrand+' '+$rootScope.theModel+'</span><span class="mr-table__value">'+$rootScope.carMinimum_price+' - '+$rootScope.carMaximum_price+'</span></td></tr><tr class="mr-table__tr"><td class="mr-table__td"><span class="mr-table__mobile-caption">Selected Vehicle</span><span class="mr-table__value">Vehicle Image:</span></td><td class="mr-table__td mr-table-active-column" style="width:50%;"><span class="mr-table__mobile-caption" style="width:0%" >'+$rootScope.theBrand+' '+$rootScope.theModel+'</span><span class="mr-table__value" style="width:100%" ><img style="width:100%" src="http://brand2d.com/nicbluebook/car.jpg" alt="Selected Vehicle"></span></td></tr><tr class="mr-table__tr"><td class="mr-table__td"><span class="mr-table__mobile-caption">Selected Option</span><span class="mr-table__value">Vehicle Make:</span></td><td class="mr-table__td mr-table-active-column"><span class="mr-table__mobile-caption">Option Result</span><span class="mr-table__value">'+$rootScope.theBrand+'</span></td></tr><tr class="mr-table__tr"><td class="mr-table__td"><span class="mr-table__mobile-caption">Selected Option</span><span class="mr-table__value">Vehicle Model:</span></td><td class="mr-table__td mr-table-active-column"><span class="mr-table__mobile-caption">Option Result</span><span class="mr-table__value">'+$rootScope.theModel+'</span></td></tr><tr class="mr-table__tr"><td class="mr-table__td"><span class="mr-table__mobile-caption">Selected Option</span><span class="mr-table__value">Year of Manufacture:</span></td><td class="mr-table__td mr-table-active-column"><span class="mr-table__mobile-caption">Option Result</span><span class="mr-table__value">'+$rootScope.theYear+'</span></td></tr><tr class="mr-table__tr"><td class="mr-table__td"><span class="mr-table__mobile-caption">Selected Option</span><span class="mr-table__value">Mileage:</span></td><td class="mr-table__td mr-table-active-column"><span class="mr-table__mobile-caption">Option Result</span><span class="mr-table__value">'+$rootScope.theMilleage+' KM</span></td></tr> <tr class="mr-table__tr"> <td class="mr-table__td"> <p>Disclaimer: This results are based on the accuracy of the information given. For a more detailed valuation of your vehicle please contact Regent Autovaluers.</p></td></tr></tbody></table></div></body></html>';
        var theCertMarkup = '<!DOCTYPE html><html lang="en"><head><title>NIC Blue Book Car Valuation results table</title><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><link href="https://fonts.googleapis.com/css?family=Roboto:400,300,700" rel="stylesheet"><style type="text/css">*{margin: 0;padding: 0;border: none;}.main-container{min-width: 200px;max-width: 1200px;margin: 0 auto;padding: 20px 10px 0;}.no{display: none !important;}*{margin:0;padding:0;border:none}@media screen and (min-width:981px){html{font-size:10px}}@media screen and (min-width:641px) and (max-width:980px){html{font-size:8px}}@media screen and (max-width:640px){html{font-size:7px}}body{font-family:"PT Sans",sans-serif;font-size:1.4rem;color:#000}a{text-decoration:none;color:#000;transition:color .4s ease-out}a:hover{color:#a74752}a:focus{outline-color:#a74752}p{line-height:3rem;margin-bottom:1rem}p:last-of-type{margin-bottom:0}.link{display:inline-block;padding:.5em 1.5em}.link_black{color:#fff;background-color:#000;transition:background-color .4s ease-out}.link_black:hover,.link_black:focus{background-color:#333;color:#fff}.link_black:focus{outline-color:#000}.link_animated-slide{overflow:hidden;position:relative;-webkit-transform:translateZ(0);transform:translateZ(0)}.link_animated-slide:before{content:"";display:block;width:100%;height:100%;position:absolute;top:0;left:-1px;-webkit-transform:translate3d(-100%, 0, 0);transform:translate3d(-100%, 0, 0);transition:-webkit-transform .2s ease-out 0s;transition:transform .2s ease-out 0s;transition:transform .2s ease-out 0s, -webkit-transform .2s ease-out 0s}.link_animated-slide:hover:before,.link_animated-slide:focus:before{-webkit-transform:translate3d(1px, 0, 0);transform:translate3d(1px, 0, 0)}.link_animated-slide:focus{outline:none}.link_animated-slide__label{position:relative;z-index:2}.link_animated-slide-white-border-black{border:1px solid #000;color:#000}.link_animated-slide-white-border-black:before{background-color:#000}.link_animated-slide-white-border-black:hover .link_animated-slide__label,.link_animated-slide-white-border-black:focus .link_animated-slide__label{color:#fff}.link__label{display:inline-block;vertical-align:middle}.link_animated-slide-white-border-black:focus{outline-color:#000}.title{font-size:3.5rem;font-weight:300;color:#000}.title_middle{font-size:2.8rem}.title_small{font-size:2.4rem}.title_little{font-size:2rem}.title_uppercase{text-transform:uppercase}.title_bottom-decor{margin-bottom:1rem}.title_bottom-decor:after{content:"";display:block;width:5rem;height:2px;background-color:#000;position:absolute;bottom:0;left:50%;-webkit-transform:translate(-50%, 0);transform:translate(-50%, 0)}.subtitle{margin-bottom:1.5rem;color:#a74752;font-size:1.6rem}.title_white{color:#fff}.title_white:after{background-color:#fff}@media screen and (max-width:640px){.title_bottom-decor{margin-bottom:1rem}}.icon:before{content:"";display:block;width:1.6rem;height:1.6rem;background-repeat:no-repeat;background-position:50% 50%;background-size:contain}.icon{display:inline-block;vertical-align:middle}.icon_small:before{width:2.4rem;height:2.4rem}.icon_large:before{width:4.8rem;height:4.8rem}.icon{margin-right:1rem}.icon-github:before{background-image:url("../icons/github.svg")}.header{padding:2rem 0;background-color:#000}.wrapper{padding-top:9rem;padding-bottom:9rem;text-align:center}.wrapper_shadow{box-shadow:0 0 2rem 1rem #eee;border-bottom:1px solid #eee}@media screen and (max-width:640px){.wrapper{padding-top:6rem;padding-bottom:6rem}}.main-container{min-width:100px;max-width:1200px;padding:0 2rem;margin:0 auto}.main-container__header{text-align:center;position:relative;padding-bottom:1rem;margin-bottom:7rem}@media screen and (max-width:640px){.main-container__header{margin-bottom:4rem}}.footer{background-color:#fff;border-top:1px solid #eee;box-shadow:0 0 .8rem #eee;padding:2rem 0;min-width:100%}.footer{text-align:center}.logo{font-size:2rem;font-weight:300;color:#fff;text-align:center}.description-plugin{padding-top:9rem;text-align:center}.description-plugin__content{width:85%;font-size:1.8rem;margin:0 auto}.demo-links{display:-webkit-flex;display:flex;-webkit-flex-wrap:wrap;flex-wrap:wrap}.demo-link{box-sizing:border-box;text-align:center}.demo-links_4column .demo-link{width:23.5%;margin-top:1.9vw}.demo-links_4column .demo-link:nth-of-type(1),.demo-links_4column .demo-link:nth-of-type(2),.demo-links_4column .demo-link:nth-of-type(3),.demo-links_4column .demo-link:nth-of-type(4){margin-top:0}.demo-links_4column .demo-link:nth-of-type(4n+2){margin-left:2%;margin-right:1%}.demo-links_4column .demo-link:nth-of-type(4n+3){margin-right:2%;margin-left:1%}@media screen and (max-width:980px){.demo-links_4column .demo-link{width:32.5%;margin-top:1vw}.demo-links_4column .demo-link:nth-of-type(4){margin-top:1vw}.demo-links_4column .demo-link:nth-of-type(4n+2),.demo-links_4column .demo-link:nth-of-type(4n+3){margin-left:0;margin-right:0}.demo-links_4column .demo-link:nth-of-type(3n+2){margin-right:1%;margin-left:1%}}@media screen and (max-width:480px){.demo-links_4column .demo-link{width:49%;margin-top:1.8vw}.demo-links_4column .demo-link:nth-of-type(3),.demo-links_4column .demo-link:nth-of-type(4){margin-top:1.8vw}.demo-links_4column .demo-link:nth-of-type(3n+2){margin-right:0;margin-left:0}.demo-links_4column .demo-link:nth-of-type(2n+1){margin-right:1%;margin-left:0}.demo-links_4column .demo-link:nth-of-type(2n+2){margin-right:0;margin-left:1%}}.demo-links{-webkit-justify-content:center;justify-content:center}.demo-link{border:1px solid #000}.word-author{font-size:2rem;font-weight:bold;text-align:center;padding-top:9rem;padding-bottom:9rem}@media screen and (max-width:640px){.word-author{padding-top:6rem;padding-bottom:6rem}}.word-author__inner{display:-webkit-flex;display:flex;-webkit-align-items:center;align-items:center;-webkit-justify-content:center;justify-content:center}.word-author__layout{width:32%}.b-share_theme_counter .b-share-btn__wrap{float:none !important;margin:0 .5rem 0 0 !important;display:inline-block;vertical-align:text-bottom}@media screen and (max-width:640px){.word-author__inner{-webkit-flex-wrap:wrap;flex-wrap:wrap}.share-label{display:none}}.word-author__iconbox{display:inline-block}.word-author__iconbox:before{content:"";display:inline-block;vertical-align:middle;margin-right:1.4rem;width:4.2rem;height:4.2rem;background-repeat:no-repeat;background-position:50% 50%;background-size:contain}.word-author__label{font-weight:300}.world-author__link{transition:color .3s ease-out}.word-author_claret .world-author__link{color:#a74752}.word-author_claret .world-author__link:hover{color:#721621}.word-author{background-color:#eee}.word-author__buy-icon:before{background-image:url("../icons/dollar_claret.svg")}.word-author__look-projects-icon:before{background-image:url("../icons/eye.svg")}@media screen and (min-width:401px){.word-author__share-icon:before{background-image:url("../icons/share.svg")}}@media screen and (max-width:480px){.word-author__layout{width:48%}.word-author__share{display:none}}.b-share_theme_counter{display:inline-block;vertical-align:text-bottom}@font-face{font-family:"fontello";src:url("../icons/fontello.eot?70583804");src:url("../icons/fontello.eot?70583804#iefix") format("embedded-opentype"),url("../icons/fontello.woff?70583804") format("woff"),url("../icons/fontello.ttf?70583804") format("truetype"),url("../icons/fontello.svg?70583804#fontello") format("svg");font-weight:normal;font-style:normal}[class^="icon-"]:before,[class*=" icon-"]:before{font-family:"fontello";font-style:normal;font-weight:normal;speak:none;display:inline-block;text-decoration:inherit;width:1em;text-align:center;font-variant:normal;text-transform:none;line-height:1em;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale}.icon-twitter:before{content:"\e800"}.icon-facebook:before{content:"\e801"}.icon-github:before{content:"\e802"}.icon-user:before{content:"\e803"}.icon-gplus:before{content:"\e804"}.icon-location:before{content:"\e805"}.icon-briefcase:before{content:"\e806"}.icon-mail:before{content:"\e807"}.icon-android:before{content:"\e808"}.icon-html5:before{content:"\e809"}.icon-css3:before{content:"\e80a"}.icon-drupal:before{content:"\e80b"}.icon-joomla:before{content:"\e80c"}.icon-apple:before{content:"\e80d"}.icon-wordpress:before{content:"\e80e"}.icon-camera:before{content:"\e80f"}.icon-chart-bar:before{content:"\e810"}.icon-linkedin:before{content:"\e816"}.icon-codeopen:before{content:"\e817"}.mr-table{border-spacing:0;border-collapse:collapse}.mr-table__mobile-caption{display:none}.mr-table_bg_column{width:30%}@media screen and (max-width:768px){.mr-table,.mr-table__thead,.mr-table__tbody,.mr-table__tr{display:block}.mr-table__th,.mr-table__td{display:-webkit-flex;display:flex}.mr-table .mr-table__head{display:none}.mr-table .mr-table_bg_column{width:auto;padding:20px 15px}.mr-table .mr-table__mobile-caption,.mr-table .mr-table__value{display:block}.mr-table .mr-table__mobile-caption{margin-right:2%}}@media screen and (max-width:768px){.mr-table_evenly .mr-table__mobile-caption,.mr-table_evenly .mr-table__value{width:48%}}.mr-table_bg .mr-table__head{background-color:#2196f3;color:#fff}.mr-table_bg .mr-table__tr:hover{background-color:#eee}@media screen and (max-width:768px){.mr-table_bg .mr-table__td:first-of-type{background-color:#2196f3;color:#fff}.mr-table_bg .mr-table__tr:hover{background:inherit}}@media only screen and (min-width:769px){.mr-table_bg_no .mr-table__head{border-bottom:1px solid #eee}}@media only screen and (max-width:768px){.mr-table_bg_no .mr-table__td{display:block}.mr-table_bg_no .mr-table_mobile_caption{font-weight:700;margin-bottom:10px}}.mr-table{width:100%;font-family:"Roboto",sans-serif;font-weight:300;font-size:14px}@media screen and (min-width:769px){.mr-table{box-shadow:0 1px 3px 0 rgba(0,0,0,0.12),0 1px 2px 0 rgba(0,0,0,0.24)}}.mr-table__td,.mr-table__th{padding:1.5em 1em;text-align:left}.mr-table__th{font-size:16px;font-weight:300}.mr-table__tr{border-bottom:1px solid #eee;transition:background-color .2s ease-in}.mr-table__tr:last-of-type{border-bottom:none}@media screen and (max-width:768px){.mr-table{box-shadow:none}.mr-table__tr{margin-bottom:0px;box-shadow:0 1px 3px 0 rgba(0,0,0,0.12),0 1px 2px 0 rgba(0,0,0,0.24);background-color:#fff}.mr-table__tr:hover{background:none}.mr-table__td{border-bottom:1px solid #eee}.mr-table__td:last-of-type{border-bottom:none}}@media screen and (max-width:640px){.mr-table{font-size:12px}.mr-table__th{font-size:14px}}.mr-tables{display:-webkit-flex;display:flex;-webkit-justify-content:space-between;justify-content:space-between}.mr-table_2column{width:49%}.mr-table_3column{width:32%}.mr-table_4column{width:24%}@media only screen and (max-width:768px){.mr-tables{-webkit-flex-wrap:wrap;flex-wrap:wrap}}@media only screen and (min-width:481px) and (max-width:768px){.mr-table_3column,.mr-table_4column{width:49%}}@media only screen and (max-width:480px){.mr-table_2column,.mr-table_3column,.mr-table_4column{width:100%}}.mr-table_price .mr-table__th{text-align:center}.mr-table__tariff,.mr-table__price-value{display:block}.mr-table__price-value{margin:1em 0 .5em}.mr-table__decor-arrow{display:inline-block;vertical-align:middle;position:relative;margin-right:10px;height:20px;width:20px}.mr-table__decor-arrow:after{content:"";display:block;width:70%;height:33.33%;position:absolute;top:0;left:5px;-webkit-transform:rotate(135deg) translateY(-25%);transform:rotate(135deg) translateY(-25%)}.mr-table__button{display:block;width:50%;cursor:pointer;margin:0 auto;padding:.5em 1em;text-align:center}@media screen and (max-width:768px){.mr-table_price .mr-table__price-head,.mr-table_price .mr-table__th,.mr-table_price .mr-table__price-tr,.mr-table_price .mr-table__td{display:block}}.mr-table_price{transition:box-shadow .2s ease-in}.mr-table_price:hover{box-shadow:0 1px 10px 0 rgba(0,0,0,0.12),0 1px 10px 0 rgba(0,0,0,0.24)}.mr-table_price .mr-table__th{border-bottom:1px solid #eee}.mr-table__tariff{font-weight:400;font-size:28px;color:#36bae2}.mr-table__price-value{font-weight:300;font-size:35px}.mr-table__price-tr{border-bottom:1px solid #eee}.mr-table__decor-arrow:after{border-right:2px solid #36bae2;border-top:2px solid #36bae2}.mr-table__button{font-size:14px;font-weight:400;background-color:transparent;color:#000;border:1px solid #36bae2;transition:color .2s ease-in}@media screen and (max-width:768px){.mr-table_price{box-shadow:0 1px 3px 0 rgba(0,0,0,0.12),0 1px 2px 0 rgba(0,0,0,0.24)}.mr-table__tariff{font-size:24px}.mr-table__price-value{font-size:28px}}@media screen and (max-width:640px){.responsive_price_table{font-size:12px}.mr-table__tariff{font-size:16px}.mr-table__price-value{font-size:18px}}.mr-table_price-head-bg .mr-table__th{background-color:#7049ba}.mr-table_price-head-bg .mr-table__th,.mr-table_price-head-bg .mr-table__tariff{color:#fff}.mr-table_price-head-bg .responsive_price_table_decor:after,.mr-table_price-head-bg .mr-table__button{border-color:#7049ba}.mr-table_price-bg{background-color:#36bae2}.mr-table_price-bg,.mr-table_price-bg .mr-table__tariff,.mr-table_price-bg .mr-table__button{color:#fff}.mr-table_price-bg .mr-table__decor-arrow:after,.mr-table_price-bg .mr-table__button{border-color:#fff}.mr-table_versions .mr-table__head{border-bottom:1px solid #eee}.mr-table-active-column{background-color:#017bbd;border-bottom:1px solid #2bb8e6;font-weight:700;color:#fff}@media screen and (max-width:768px){.mr-table_versions .mr-table__td:first-of-type{background-color:#eee}.mr-table-active-column{background:none;color:#017bbd}}.mr-table__avatarbox,.mr-table__username,.mr-table__post{width:100%}.mr-table__social{text-decoration:none}.mr-table__icon-label{display:none}@media only screen and (max-width:768px){.mr-table_team .mr-table__th{-webkit-flex-wrap:wrap;flex-wrap:wrap;-webkit-justify-content:center;justify-content:center}.mr-table_team .mr-table__td{display:block}}.mr-table_team{box-shadow:0 1px 3px 0 rgba(0,0,0,0.12),0 1px 2px 0 rgba(0,0,0,0.24)}.mr-table_team:hover{box-shadow:0 1px 10px 0 rgba(0,0,0,0.12),0 1px 10px 0 rgba(0,0,0,0.24)}.mr-table_team .mr-table__th{text-align:center;background-color:#18bd9b;color:#fff}.mr-table_team .mr-table__td{border-top:1px solid #eee}.mr-table__avatar{border-radius:50%;border:3px solid #fff;width:100px;height:100px}.mr-table__username{margin-top:10px;font-size:18px;font-weight:300}.mr-table__icon{margin:0 10px 20px 0}.mr-table__icon:last-of-type{margin-right:0}.mr-table__icon{width:16px;height:16px;display:inline-block;cursor:pointer;padding:10px;border-radius:50%;background-color:#18bd9b;box-shadow:0 1px 3px 0 rgba(0,0,0,0.12),0 1px 2px 0 rgba(0,0,0,0.24)}.mr-table__icon:before{color:#fff;font-size:16px}.mr-table__title{font-size:20px;font-weight:300;margin-bottom:15px}@media screen and (max-width:480px){.mr-table{margin-bottom:5vw}}@media screen and (min-width:480px) and (max-width:768px){.mr-table{margin-bottom:2vw}}</style></head><body><div class="main-container"><table class="mr-table mr-table_evenly mr-table_versions"> <tbody class="mr-table__tbody"><tr class="mr-table__tr"><td class="mr-table__td"><span class="mr-table__value"><h2 style="font-size:14px; color:#eb549f; padding:20px;"> YOUR VEHICLE IS VALUED BETWEEN:</h2></span> <span class="mr-table__value"><h2 style="font-size:14px; color:#eb549f; padding:20px;">' + $rootScope.carMinimum_price + ' - ' + $rootScope.carMaximum_price + '</h2></span></td></tr><tr class="mr-table__tr"> <td class="mr-table__td" style="width:95.7%;"><span class="mr-table__value" style="width:100%" ><img style="width:100%" src="' + $scope.carImageUrl + '" alt="Selected Vehicle"></span><span class="mr-table__mobile-caption" style="width:100%;" ><span class="mr-table__mobile-caption"></span> <p style="margin:30px 30px;"><strong>Disclaimer:</strong> This results are based on the accuracy of the information given. For a more detailed valuation of your vehicle please contact Regent Autovaluers.</p></span></td></tr><tr class="mr-table__tr"><td class="mr-table__td"> <span class="mr-table__value">Vehicle Make:</span> <span class="mr-table__value">' + $rootScope.theBrand + '</span></td></tr><tr class="mr-table__tr"><td class="mr-table__td"><span class="mr-table__value">Vehicle Model:</span><span class="mr-table__value">' + $rootScope.theModel + '</span> </td></tr><tr class="mr-table__tr"><td class="mr-table__td"><span class="mr-table__value">Year of Manufacture:</span> <span class="mr-table__value">' + $rootScope.theYear + '</span></td></tr><tr class="mr-table__tr"><td class="mr-table__td"><span class="mr-table__value">Mileage:</span><span class="mr-table__value">' + $rootScope.theMilleage + ' KM</span></td></tr></tbody></table></div></body></html>';
        GrabzIt( "MGYzMWUzNjI1M2QyNDc1OTljZTMyOTU3NjI1NWEwOWQ=" ).ConvertHTML( theCertMarkup, {
            "format": "pdf",
            "download": 1
        } ).Create();
        $( ".btn_overlay_cert" ).addClass( 'invisible' );
    };
} ] );


app.controller( 'certCtrl', [ 'userProfileFactory', 'FBDB', '$scope', '$timeout', '$interval', '$rootScope', "$firebaseArray", "$firebaseObject", function( userProfileFactory, FBDB, $scope, $timeout, $interval, $rootScope, $firebaseArray, $firebaseObject ) {

    var ref = new Firebase( "https://test-ffbac.firebaseio.com/" );
    var newPrice;

    var pushUrl = $firebaseArray( ref );
    // create a synchronized array

    $scope.urlID = window.location.href;

    var urlID = window.location.href;
    //var newPrice = "2010"; //parseInt(($scope.newMessageText).replace(/,/g, ''));

    var query = ref.orderByChild( "text" ).equalTo( urlID ).limitToFirst( 1 );
    query.on( "value", function( snapshot ) {
        if ( snapshot.hasChildren() === false ) {
            pushUrl.$add( {
                text: window.location.href,
                price: "1000"
            } );
        } else {

                userProfileFactory.userProfile( urlID ).then( function( personalKey ) {

                    $firebaseObject( ref.child( personalKey ) ).$loaded( function( data ) {
                        
                        $rootScope.newPrice = parseInt( data.price ); //parseInt(($scope.newMessageText).replace(/,/g, ''));
                        //console.log($rootScope.newPrice);
                    } );
                } );

                //Auto add the serial number
                var promise = $timeout(function(){
                    $rootScope.sNumber = $rootScope.newPrice+1;
                    //console.log("The autoadd: "+$rootScope.sNumber);
                },2000);
                    userProfileFactory.userProfile( urlID ).then( function( personalKey ) {

                        $firebaseObject( ref.child( personalKey ) ).$loaded( function( data ) {                       
                            //Updates the Serial Number  
                        var promises = $interval(function(){
                            //console.log("The new: "+$rootScope.sNumber);
                            if ( ( $rootScope.sNumber >= parseInt(data.price) ) ) {
                                ref.child( personalKey ).update( {
                                    price: $rootScope.sNumber
                                } );
                                $interval.cancel(promises);
                            }
                        },3000);
                            

                        } );
                    } );
                


        }
    } );


    $( document ).ready( function() {
            var quickCert;
            var extrasMarkupColOne = "";
            var extrasMarkupColTwo = "";
            var n = 0;
        
            var loopExtras = function(){
                $('#msform .extras>div>div').each(function(){
                    n++;
                    var extraName = $(this).find('label').html();
                    var extraValue = $(this).find('.stoggler').attr('class').replace('stoggler', '').replace(' ','');
                                
                    if(extraValue=='off'){
                       extraValue = 'No'; 
                    } else {
                       extraValue = 'Yes';
                    };
            
                    if (n % 2 == 0) {
                        extrasMarkupColOne += "<li>" + extraName + ": <strong>" + extraValue + "</strong></li>";
                    } else {
                        extrasMarkupColTwo += "<li>" + extraName + ": <strong>" + extraValue + "</strong></li>";
                    }
                    
                });
            };
        
        
            $('.quick-print').click( function() {
                quickCert = true;
            });
            
            $scope.formMsg = "Congratulations!";
            $scope.formColor = "#50d322";
            
            //The terms and Conditions
            
            $('.tcnpolicy').click(function(){
                
                swal();
                var windowH = $(window).height();
            
                $('.sweet-alert').height(windowH-100).addClass('theTerms');
                swal( {
                    title: "GENERAL TERMS AND CONDITIONS",
                    text: '<section class="pfblock terms" id="contact"> <div class="container"> <div class="row"> <div class="col-sm-12"> <div class="pfblock-header"><div class="pfblock-subtitle"> Part A - Banking relationship </div></div><div> <p>1.&nbsp; The terms of our relationship:If you wish to use any of our products you need to complete an application form or makeyour application through other channels as we may deem appropriate. This may includeelectronic, internet or mobile phone application. Eligibility criteria applies and the Bankreserves the right to accept or refuse an application without disclosing the reason.<br><br>2.&nbsp; Pre-conditions to use of any product:We are not obligated to provide any funds to you or otherwise allow you to use a productif:<br>a) The Bank considers there is a default<br>b) The appropriate documentation or security has not been provided<br>c) Your request exceeds the applicable limit<br><br>3.&nbsp; Bank Charges, interest, commission, legal charges and other expenses: (Completesection 3 as per existing terms section 6)The bank is entitled to be paid by or receive from the Customer and may debit any of theCustomer"s accounts for:<br>(a) Unless otherwise agreed in writing, interest on loanaccounts or any other facility granted by the Bank, at any rate not exceeding thatprescribed by law, which rate may be different for different accounts.Interest is calculated as prescribed by the Governing Law. The Bank need not notify theCustomer of the change in the rate of interest applicable. Where a higher rate of interesthas been agreed between the Bank and the Customer in anysecurity given by the Customer to the Bank, the Bank may apply the higher rate.<br>(b) Advocate and Client charges incurred by the Bank on behalf of the Customer orincurred in obtaining legal advice in</p></div><div class="pfblock-header"> <h2 class="pfblock-title"> </h2> <div class="pfblock-subtitle"> Part B - Operating Accounts </div></div><div> <p>4.&nbsp;Authority:<br>When you apply for a product, you must give us account operating authority details for allauthorised signatories. For joint accounts the method of operation must be indicated. If nomethod is specified, any one of the signatories may operate the account.If there is a change in signatories, this must be notified to the bank in writing. On receipt ofthese instructions the change will be effected within 5 banking days. This therefore meanswe will honour any payments or instructions signed in accordance with the previousauthority if dated before, but presented after.<br>The authorized signatory should use the same signature all through. If they wish to update,they will need to visit their nearest branch to do so.<br>We are authorized to accept for credit of the joint account, any cheque or otherinstrument payable to one or more of you; each of you is liable to us jointly and separatelyfor the balance owing (including if we permit an overdrawing);<br><br>If one of the signatories dies, the surviving accountholders(s)may give instructions andobtains title to the account.<br><br>5.&nbsp; Instructions<br>Instructions must be given in writing. We may accept instructions by email, fax or throughany electronic banking service but you are responsible for ensuring the accuracy andcompleteness of instructions. You agree not to challenge their validity, admissibility orenforceability on the basis they are in electronic form.<br><br>6.&nbsp; Communication to you:<br>All notices, statements, letters and other communication from the Bank may be sent to thelast address given by the Customer and the date on the Bank’s copy of any such communicationis taken to be the date of dispatch.<br>Any written communication from the Bank to the customer including but not limited to anynotice given pursuant to these general Terms and Conditions shall be deemed to havebeen received by the customer. The Customer has no claims on the Bank for damageresulting from losses, delays, misunderstanding, mutilations, duplications or any otherirregularities due to transmission of any communication whether to or from the Customer,the Bank or any other means of communication.<br>The customer’s notices and communications are effective when we actually receivethem in legible form.</p></div><div class="pfblock-header"> <h2 class="pfblock-title"> </h2> <div class="pfblock-subtitle"> Part C - Electronic Banking </div></div><div> <p>This includes and is not limited to:<br>internet banking, phone banking, SMS banking, electronic alert, mobile banking,money transfer services, point of sale banking, eStatements<br>Electronic banking services, and certain facilities under the electronic banking services,may be available only for certain types of accounts and not others.<br>Electronic banking services may be limited to specific amounts set by law or by us or bythe owner or operator of the electronic equipment. i.e. maximum and minimum dailywithdrawal amounts that may vary.<br>If the account operating authority for a joint account is “both/all to sign”, the customeragrees that each joint accountholder is taken to be subscribing to the electronic bankingservices, and access to the electronic banking services may be restricted to viewing ofinformation only and not conducting transactions.<br>The Bank is also not responsible for any services that are not controlled by us, throughwhich the Customer or an authorized person accesses any electronic banking services,and The Bank will not be liable for any loss the Customer incurs in connection with thatservice.</p></div><div class="pfblock-header"> <h2 class="pfblock-title"> </h2> <div class="pfblock-subtitle"> Part D - Cards </div></div><div> <p>The Bank may issue ATM cards, debit cards, prepaid cards or credit cards. Additional termsapply to specific types of cards.<br>If the Bank asks the Customer to collect a card from us and it is not collected within 90 daysof request, it will be destroyed.<br>The card remains The Bank’s property and is not transferable to another person. The Bankmay suspend the use of the card without notice to the Customer. The customer howevermust ensure that the card and PIN are stored safely and not shared, the card is notdefaced, damaged, bent or modified, reverse engineered or decompiled.<br>The customer must also sign on the back of the card immediately upon receipt afterensuring all details such as name and/or account number are correct.<br>The Bank or other financial institutions may impose transaction limits on different types oftransactions that may be made using a card. The customer may contact the Bank formore information regarding any limits.<br>The Bank may refuse to authorize transactions made using a card if we believe or suspectthe transactions are illegal or fraudulent.<br>If the Customer reports an unauthorized transaction on the (credit) card, the Customermay withhold paying the disputed amount until The Bank completes investigations.Thereafter the Customer must pay the disputed amount if the report is proved to beunfounded. Late fees may be imposed on the disputed amount.<br><br>Exchange rate applied on the cards:<br>Transactions are converted to the card currency at a rate we reasonably considerappropriate. For example, if the card is a Visa or MasterCard card, conversion is doneusing US dollar as the basecurrency on the date the transaction is received by us or processed, at the exchange rateand at the time determined by Visa International or MasterCard International at itsabsolute discretion.<br>In any case, the exchange rate may differ from the rate in effect on the date of thetransaction due to market fluctuations. Any rate imposed is final and conclusive and the customer bears theexchange risks, loss, commission and other costs which may be incurred as a result.</p></div><div class="pfblock-header"> <h2 class="pfblock-title"> </h2> <div class="pfblock-subtitle"> Part E - Security procedures and liability </div></div><div> <p>The Customer must take all necessary steps to prevent unauthorized or fraudulent use oftheir security passwords, cards or cheque books.<br>Memorise a PIN/password and destroy password notifications as soon as possible afterreceiving or selecting the PIN/password; the Customer should not voluntarily tell anyonetheir PIN/password or let anyone find out their PIN/password – not even family or friends, ajoint accountholder(s), any of The Bank’s staff members, or anyone giving assistance on atechnical helpdesk in connection with anyservices;<br>The Customer should change PIN/passwords regularly or, at a minimum, whenever TheBank or its systems require the Customer or the authorized person to do so.<br><br>Liability for transactions:<br>If there is a disputed transaction involving a card, a card number or a cheque book andthe card or cheque was delivered to the Customer or an authorized person, the Customermust prove that the card or cheque was not used or issued by them or an authorizedperson at the time the disputed transaction was entered into or recorded.</p></div><div class="pfblock-header"> <h2 class="pfblock-title"> </h2> <div class="pfblock-subtitle"> Part F - Payments </div></div><div> <p>Interest, fees and costs:<br>i)&nbsp; Interest rates, fees and costs are revised periodically. The Customer can find out currentrates and fees and costs by contacting the Bank or by visiting any of our branches.<br>ii)&nbsp; Additional fees and costs may apply in the case of services provided in connection witha product. For example, mobile banking services, or for certain types of payments such astelegraphic transfers (including fees charged by third party service providers). Details ofsuch additional fees and costs shall be advised to you at the time of applying for thespecific product.<br>iii)&nbsp; Government charges: The Customer must also pay the Bank an amount equal to anygovernment charges and duties on or in connection with the banking agreement. Theseare payable whether or not the Customer is primarily liable for those charges and duties.<br>iv)&nbsp; Withholding tax on interest earned: - Interest earned by the Customer for a productmay be subject to withholding tax in accordance with applicable law.<br>v)&nbsp; Calculation:- Any interest or fee payable under our banking agreement accrues, and iscalculated in accordance with our usual practice. If default interest is charged The Bankmay add to the outstanding principal amount any interest under this clause which has notbeen paid. The Customer is then liable for interest under this clause on the total amount.</p></div><div class="pfblock-header"> <h2 class="pfblock-title"> </h2> <div class="pfblock-subtitle"> Part G - Information, statements and records </div></div><div> <p>i)&nbsp; The Customer must notify The Bank within 30 calendar days if they become aware thatany information they have given has changed, is incorrect or misleading. All informationor documents must be in the form The Bank requires and certified by the Customer to betrue.<br>ii)&nbsp; The customer consents to the bank sending them information about products/Serviceswhich the Bank thinks the Customer may want to use. However, if the Customer wishes notto receive this type of information, kindly notify The Bank in writing.<br><br>Information we disclose<br>The customer consents to each member of the Chase Bank, its officers, employees, agentsand advisers disclosing information relating to them (including details of our bankingagreements, the accounts, the products or any other arrangement with us) to:<br>i)&nbsp; professional advisers, service providers or independent contractors to, or agents of, thepermitted parties, such as debt collection agencies, data processing firms and correspondentswho are under a duty of confidentiality to the permitted parties<br>ii)&nbsp; any credit bureau or credit reference agency, rating agency, business alliance partner,insurer or insurance broker of, or direct or indirect provider of credit protection, or anypermitted parties<br>iii)&nbsp; any financial institution which you have or may have dealings for the purpose ofconducting credit checks (including in the form of bank references);<br>iv)&nbsp;any court, tribunal or authority (including an authority investigating an offence) withjurisdiction over the permitted parties;</p></div><div class="pfblock-header"> <h2 class="pfblock-title"> </h2> <div class="pfblock-subtitle"> Part H - Termination, suspension and enforcement </div></div><div> <p>Either the Customer or the Bank may end our banking agreement or use of a product bygiving the other party prior notice in writing in accordance with our banking agreement.Enforcement action:<br>The Bank may take any action we consider appropriate to enforce our bankingagreement or any security including:<br>i)&nbsp; employing any third party agent to collect any amount owing to us;<br>ii)&nbsp; attaching the balance owing for any account to your or a security provider’s assets;<br>iii)&nbsp; taking steps to enforce our rights against the customer or a security provider’s assetssuch as by lodging caveats;<br>iv)&nbsp; commencing legal proceedings against the customer or a security provider.Blocking accounts or withholding of funds:<br><br>The Bank may block any account (and later remove the block) at any time or withholdamounts in any account at any time if an authority requires the bank to do so or we areotherwise required by law or pursuant to agreements with any regulator or any authorityto do so, or if we need to comply with internal policies associated with any applicableorder or sanction of an authority.<br><br>Suspension:-<br>The Bank may suspend providing a product at any time for any reason (even if there is nodefault). We will notify the customer as soon as practicable. The bank agrees to suspendprovision of a product if the customer asks us to do so in writing.<br><br>Complaint Management:-<br>The Bank aims to provide excellent customer service. If the customer thinks we have failed,they should let the Bank know so that we can try and put things right. Also, by informing theBank on where the customer thinks we have failed, the Bank will be able to provide thecustomer with better service in the future.<br>The customer can obtain information on the Banks complaints handling process by visitingany of our branches, logging on to our website or getting in touch with our contact centre.</p></div></div></div></div></section>',
                    html: true
                } ); 
                
            });

        $( '.pdf-send' ).click( function() {
            
            var markup;
            var userName = $( "#enquiryModal .name input:text" ).val();
            var userEmail = $( "#enquiryModal .email input:text" ).val();
            var checkTerms =  $('.acceptTerms input').is(':checked'); 
            var validEmail;
            //alert("Hi "+userName+"! Please check your email to download your certificate." );
            
            
            //Email Validation
            var atpos = userEmail.indexOf("@");
            var dotpos = userEmail.lastIndexOf(".");
            if (atpos<1 || dotpos<atpos+2 || dotpos+2>=userEmail.length) {
                validEmail = false;
            } else {
                validEmail = true;
            }
            
            if(userName && userEmail && validEmail && checkTerms){

            $('.sweet-alert').height('auto').removeClass('theTerms');
            swal("Congratulations!", "Check your email for the Certificate !", "success");

            if (quickCert){
                markup = '<!DOCTYPE html><html><head> <style>.container{position: relative; width: 100%; max-width: 960px; margin: 0 auto; padding: 0 0px; box-sizing: border-box; width: 100%;}.container .row img{width: 100%; height: auto;}ul#advanced-evaluation-results-wrap li{color: #888; font-size: 9px; list-style-type: none !important; margin-bottom: 0px; margin-top: 0px; padding-bottom: 0px; padding-top: 0px;}.vehicle-valuation{font-weight: normal; font-size: 14px; color: #101010; text-align: left; text-transform: uppercase; margin-bottom: 0px; margin-top: 0px; margin-left: 10px; font-family: "Raleway", "HelveticaNeue", "Helvetica Neue", Helvetica, Arial, sans-serif;}p{color: #999 !important; font-size: 9px;}ul#advanced-evaluation-results-wrap li strong{color: #f0840d;}.vehicle-title{color: #26a6e6;}.price-title{color: #e12f85;}</style> <title></title></head><body> <div class="container" id="valuation-certificate-wrapper"> <table> <tbody> <tr style="width:100%; line-height: 0;"> <td class="tg-yw4l"> <div class="row"><img src="http://brand2d.com/nicbluebook/pdfcert/examples/images/certificate_header.jpg"> </div></td></tr></tbody> </table> <table> <tbody> <tr style="width:100%; line-height: -230%;"> <td class="tg-yw4l" style="width:88%;"> </td><td class="tg-yw4l" style="width:12%;"> <div class="row"> <p style="text-align:left; font-size: 11px; font-weight: bold; color: #fff;">No. '+$rootScope.sNumber+'</p></div></td></tr></tbody> </table> <table style="line-height:-20%;"> <tr> <td> </td></tr><tbody> <tr style="line-height: 2;"> <td class="tg-yw4l" style=" width: 2%;"> </td><td class="tg-yw4l" style=" width: 98%;"> <div class="row"> <h4 class="vehicle-valuation">YOUR <strong class="vehicle-title">'+$rootScope.theBrand.toUpperCase()+' '+$rootScope.theModel.toUpperCase()+'</strong> IS VALUED BETWEEN <strong class="price-title">'+$rootScope.carMinimum_price+' - '+$rootScope.carMaximum_price+'</strong></h4> </div></td></tr></tbody> </table> <table> <tbody> <tr> <td class="tg-yw4l" style=" width: 1%;"> </td><td class="tg-yw4l" style=" width: 45%;"> <div class="row"><img src="'+$rootScope.carImageQuick+'"> </div></td><td class="tg-yw4l" style=" width: 27%; line-height: -15px;"> <div class="row"> <ul id="advanced-evaluation-results-wrap" style="line-height: 1;"> <li>Brand: <strong>'+$rootScope.theBrand.toUpperCase()+'</strong></li><li>Model: <strong>'+$rootScope.theModel.toUpperCase()+'</strong></li><li>Sub-Model: <strong>'+$rootScope.the_subModel.toUpperCase()+'</strong></li><li>Engine Capacity: <strong>'+$rootScope.engineCap+' CC</strong></li><li>Year of Manufacture: <strong>'+$rootScope.theYear+'</strong></li><li>Mileage: <strong>'+$rootScope.theMilleage+' KM</strong></li></ul> </div></td><td class="tg-yw4l" style=" width: 27%; line-height: -15px;"> </td></tr></tbody> </table> <table style="line-height: 0;"> <tbody> <tr> <td class="tg-yw4l" style="width: 40%;border-top: 1px solid #fff; line-height: 1.5;"> <div class="row"> <div> <h6>NICBANK GROUP</h6> <p>Ground Floor, NIC House Masaba Rd. Upperhill.</p><p>P.O.Box 44599-00100, Nairobi Kenya.</p><p>Tel: +254 (20) 2888217</p><p>Mobile: +254 (711)041 111/ +254 (732)141 111</p><p>Email: <a href="mailto:customercare@nic-bank.com" target="_blank">customercare@nic-bank.com</a></p></div></div></td><td class="tg-yw4l" style="width: 10%;border-top: 1px solid #fff; line-height: 4.5;"> <div class="row"><img src="http://brand2d.com/valuation-certificate/images/nic-logo.jpg"> </div></td><td class="tg-yw4l" style="width: 5%;"> <div class="row"> <div> </div></div></td><td class="tg-yw4l" style="width: 35%;border-top: 1px solid #fff; line-height: 1.5;"> <div class="row"> <div> <h6>REGENT AUTO VALUERS</h6> <p>2nd Floor Wing 2B, TRV Plaza, Muthithi Rd, Westlands, Nairobi.</p><p>P.O Box 34365 - 00100 Nairobi, Kenya</p><p>Tel: 020 2632578</p><p>Email: <a href="mailto:info@regentautovaluers.co.ke" target="_blank">info@regentautovaluers.co.ke</a></p></div></div></td><td class="tg-yw4l" style="width: 10%;border-top: 1px solid #fff; line-height: 3.5;"> <div class="row"><img src="http://brand2d.com/valuation-certificate/images/regent-logo.jpg"> </div></td></tr></tbody> </table> <table> <tbody> <tr> <td class="tg-yw4l" style="width: 100%; line-height: 0;"> <div class="row" id="disclaimer"> <p style="margin: 0; line-height: 1.7;"><strong>Disclaimer:</strong> This results are based on the accuracy of the information given. For a more detailed valuation of your vehicle please contact Regent Autovaluers.</p></div></td></tr></tbody> </table> </div></body></html>';
                quickCert = false;                
            } else {
                
                loopExtras();
                
                markup = '<!DOCTYPE html><html><head> <style>.container{position: relative; width: 100%; max-width: 960px; margin: 0 auto; padding: 0 0px; box-sizing: border-box; width: 100%;}.container .row img{width: 100%; height: auto;}ul#advanced-evaluation-results-wrap li{color: #888; font-size: 9px; list-style-type: none !important; margin-bottom: 0px; margin-top: 0px; padding-bottom: 0px; padding-top: 0px;}.vehicle-valuation{font-weight: normal; font-size: 14px; color: #101010; text-align: left; text-transform: uppercase; margin-bottom: 0px; margin-top: 0px; margin-left: 10px; font-family: "Raleway", "HelveticaNeue", "Helvetica Neue", Helvetica, Arial, sans-serif;}p{color: #999 !important; font-size: 9px;}ul#advanced-evaluation-results-wrap li strong{color: #f0840d;}.vehicle-title{color: #26a6e6;}.price-title{color: #e12f85;}</style> <title></title></head><body> <div class="container" id="valuation-certificate-wrapper"> <table> <tbody> <tr style="width:100%; line-height: 0;"> <td class="tg-yw4l"> <div class="row"><img src="http://brand2d.com/nicbluebook/pdfcert/examples/images/certificate_header.jpg"> </div></td></tr></tbody> </table> <table> <tbody> <tr style="width:100%; line-height: -230%;"> <td class="tg-yw4l" style="width:88%;"> </td><td class="tg-yw4l" style="width:12%;"> <div class="row"> <p style="text-align:left; font-size: 11px; font-weight: bold; color: #fff;">No. '+$rootScope.sNumber+'</p></div></td></tr></tbody> </table> <table style="line-height:-20%;"> <tr> <td> </td></tr><tbody> <tr style="line-height: 2;"> <td class="tg-yw4l" style=" width: 2%;"> </td><td class="tg-yw4l" style=" width: 98%;"> <div class="row"> <h4 class="vehicle-valuation">YOUR <strong class="vehicle-title">'+$rootScope.dataa.brand+' '+$rootScope.dataa.model+'</strong> IS VALUED BETWEEN <strong class="price-title">'+$rootScope.carMinimum_price+' - '+$rootScope.carMaximum_price+'</strong></h4> </div></td></tr></tbody> </table> <table> <tbody> <tr> <td class="tg-yw4l" style=" width: 1%;"> </td><td class="tg-yw4l" style=" width: 45%;"> <div class="row"><img src="'+$rootScope.carImageQuick+'"> </div></td><td class="tg-yw4l" style=" width: 27%; line-height: -15px;"> <div class="row"> <ul id="advanced-evaluation-results-wrap" style="line-height: 1;"><li>Year of Manufacture: <strong>'+$rootScope.dataa.year+'</strong></li><li>Sub-Model: <strong>'+$rootScope.dataa.model+'</strong></li><li>Mileage: <strong>'+$rootScope.dataa.mileage+' KM</strong></li><li>Drive Train: <strong>'+$rootScope.dataa.drivetrain+'</strong></li><li>Transmission: <strong>'+$rootScope.dataa.transmission+'</strong></li><li>Country: <strong>'+$rootScope.dataa.country+'</strong></li>'+extrasMarkupColOne+' </ul> </div></td><td class="tg-yw4l" style=" width: 27%; line-height: -15px;"> <div class="row"> <ul id="advanced-evaluation-results-wrap" style="line-height: 1;"> '+extrasMarkupColTwo+' </ul> </div></td></tr></tbody> </table> <table style="line-height: 0;"> <tbody> <tr> <td class="tg-yw4l" style="width: 40%;border-top: 1px solid #fff; line-height: 1.2;"> <div class="row"> <div> <h6>NICBANK GROUP</h6> <p>Ground Floor, NIC House Masaba Rd. Upperhill.</p><p>P.O.Box 44599-00100, Nairobi Kenya.</p><p>Tel: +254 (20) 2888217</p><p>Mobile: +254 (711)041 111/ +254 (732)141 111</p><p>Email: <a href="mailto:customercare@nic-bank.com" target="_blank">customercare@nic-bank.com</a></p></div></div></td><td class="tg-yw4l" style="width: 10%;border-top: 1px solid #fff; line-height: 4.5;"> <div class="row"><img src="http://brand2d.com/valuation-certificate/images/nic-logo.jpg"> </div></td><td class="tg-yw4l" style="width: 5%;"> <div class="row"> <div> </div></div></td><td class="tg-yw4l" style="width: 35%;border-top: 1px solid #fff; line-height: 1.2;"> <div class="row"> <div> <h6>REGENT AUTO VALUERS</h6> <p>2nd Floor Wing 2B, TRV Plaza, Muthithi Rd, Westlands, Nairobi.</p><p>P.O Box 34365 - 00100 Nairobi, Kenya</p><p>Tel: 020 2632578</p><p>Email: <a href="mailto:info@regentautovaluers.co.ke" target="_blank">info@regentautovaluers.co.ke</a></p></div></div></td><td class="tg-yw4l" style="width: 10%;border-top: 1px solid #fff; line-height: 3.5;"> <div class="row"><img src="http://brand2d.com/valuation-certificate/images/regent-logo.jpg"> </div></td></tr></tbody> </table> <table> <tbody> <tr> <td class="tg-yw4l" style="width: 100%; line-height: 0;"> <div class="row" id="disclaimer"> <p style="margin: 0; line-height: 1.7;"><strong>Disclaimer:</strong> This results are based on the accuracy of the information given. For a more detailed valuation of your vehicle please contact Regent Autovaluers.</p></div></td></tr></tbody> </table> </div></body></html>';
            }

            $.ajax( {
                url: "http://brand2d.com/nicbluebook/pdfcert/examples/mail.php", //the page containing php script
                type: "post", //request type,
                dataType: 'json',
                data: {
                    registration: "success",
                    name: userName,
                    email: userEmail,
                    sNumber: $rootScope.sNumber,
                    cert: markup
                },
                success: function( result ) {
                    console.log( result.abc );
                }
            } );
            
            //Reset PopUp Message
            $scope.formMsg = "Congratulations!";
            $scope.formColor = "#50d322";
            //Clear Inputs

                $( "#enquiryModal .name input:text" ).val("");
                $( "#enquiryModal .email input:text" ).val("");
            
            //Close the Modal
            
            $('form#newsletter-pdf .modal-body .modal-header button.close').click();
            
            
        } else if (!userName && !userEmail) {
            $scope.formColor = "#d32222";
            $scope.formMsg = "Enter your name and email!";
        } else if (!userName) {
            $scope.formColor = "#d32222";
            $scope.formMsg = "Enter your name!";
        } else if (!userEmail) {
            $scope.formColor = "#d32222";
            $scope.formMsg = "Enter your email!";
        } else if(!validEmail) {
            $scope.formColor = "#d32222";
            $scope.formMsg = "Enter a valid email!";
        } else {
            $scope.formColor = "#d32222";
            $scope.formMsg = "Accept terms and conditions!";
        }
            
        } );

    } );

} ] );