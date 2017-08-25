var appControllers = angular.module( 'MobileAPP.controllers', [
    'ionic',
    'ionic.ion.headerShrink',
    'jett.ionic.filter.bar',
    'ionMdInput',
    'angularFileUpload',
    'ngCordova',
    'MobileAPP.config',
    'MobileAPP.directives',
    'MobileAPP.services',
    'MobileAPP.factories'
] );

appControllers.controller( 'IndexCtrl', [
    'ENV', '$scope', '$state', '$rootScope', '$ionicPlatform',
    '$http', '$ionicLoading', '$ionicPopup',
    '$ionicSideMenuDelegate', '$cordovaAppVersion',
    '$cordovaFile', '$cordovaSQLite',
    function( ENV, $scope, $state, $rootScope, $ionicPlatform, $http, $ionicLoading,
        $ionicPopup, $ionicSideMenuDelegate, $cordovaAppVersion,
        $cordovaFile, $cordovaSQLite ) {
        var alertPopup = null,
            alertPopupTitle = '';
        $scope.Status = {
            Login: false
        };
        var showQRcode = function(){
            var qrcode = new QRCode(document.getElementById('qrcode'), {
                text: ENV.website + '/' + ENV.apkName + '.apk',
                width: 174,
                height: 174,
                colorDark : '#000000',
                colorLight : '#ffffff',
                correctLevel : QRCode.CorrectLevel.H
            });
        };
        var deleteLogin = function(){
            if ( !ENV.fromWeb ) {
                $cordovaSQLite.execute( db, 'DELETE FROM Users' )
                    .then(
                        function( res ) {
                            console.log('Delete LoginInfo');
                            $rootScope.$broadcast( 'logout' );
                            $state.go( 'index.login', {}, {} );
                        },
                        function( error ) {
                        }
                    );
            }else{
                $state.go( 'index.login', {}, {} );
                $rootScope.$broadcast( 'logout' );
            }
        };
        $scope.logout = function() {
            var confirmPopup = $ionicPopup.confirm({
                title: 'Log Out',
                template: 'Are you sure to log out?'
            });
            confirmPopup.then(function(res) {
                if(res) {
                    deleteLogin();
                }
            });
        };
        $scope.gotoSetting = function() {
            $state.go( 'index.setting', {}, {
                reload: true
            } );
        };
        $scope.gotoUpdate = function() {
            if ( !ENV.fromWeb ) {
                var url = ENV.website + '/' + ENV.updateFile;
                $http.get( url )
                    .success( function( res ) {
                        var serverAppVersion = res.version;
                        $cordovaAppVersion.getVersionNumber().then( function( version ) {
                            if ( version != serverAppVersion ) {
                                $ionicSideMenuDelegate.toggleLeft();
                                $state.go( 'index.update', {
                                    'Version': serverAppVersion
                                } );
                            } else {
                                alertPopupTitle = 'Already the Latest Version!';
                                alertPopup = $ionicPopup.alert( {
                                    title: alertPopupTitle,
                                    okType: 'button-assertive'
                                } );
                            }
                        } );
                    } )
                    .error( function( res ) {
                        alertPopupTitle = 'Connect Update Server Error!';
                        alertPopup = $ionicPopup.alert( {
                            title: alertPopupTitle,
                            okType: 'button-assertive'
                        } );
                    } );
            } else {
                alertPopupTitle = 'No Updates!';
                alertPopup = $ionicPopup.alert( {
                    title: alertPopupTitle,
                    okType: 'button-calm'
                } );
            }
        }
        $rootScope.$on( 'logout', function() {
            $scope.Status.Login = false;
            $ionicSideMenuDelegate.toggleLeft();
        } );
        $rootScope.$on( 'login', function() {
            $scope.Status.Login = true;
        } );
        //
        var writeFile = function( path, file, data ) {
            $cordovaFile.writeFile( path, file, data, true )
                .then( function( success ) {
                    var blnSSL = ENV.ssl === 0 ? false : true;
                    ENV.website = appendProtocol( ENV.website, blnSSL, ENV.port );
                    ENV.api = appendProtocol( ENV.api, blnSSL, ENV.port );
                    showQRcode();
                }, function( error ) {
                    $cordovaToast.showShortBottom( error );
                    console.error( error );
                } );
        };
        $ionicPlatform.ready( function() {
            console.log('ionicPlatform.ready');
            if ( !ENV.fromWeb ) {
                var data = 'website=' + ENV.website + '##' +
                    'api=' + ENV.api + '##' +
                    'port=' + ENV.port + '##' +
                    'map=' + ENV.mapProvider;
                var path = cordova.file.externalRootDirectory,
                    directory = ENV.rootPath,
                    file = ENV.rootPath + '/' + ENV.configFile;
                $cordovaFile.createDir( path, directory, false )
                    .then( function( success ) {
                        writeFile( path, file, data );
                    }, function( error ) {
                        // If an existing directory exists
                        $cordovaFile.checkFile( path, file )
                            .then( function( success ) {
                                $cordovaFile.readAsText( path, file )
                                    .then( function( success ) {
                                        var arConf = success.split( '##' );
                                        if ( arConf.length == 4 ) {
                                            var arWebServiceURL = arConf[ 0 ].split( '=' );
                                            if ( is.not.empty( arWebServiceURL[ 1 ] ) ) {
                                                ENV.website = arWebServiceURL[ 1 ];
                                            }
                                            var arWebSiteURL = arConf[ 1 ].split( '=' );
                                            if ( is.not.empty( arWebSiteURL[ 1 ] ) ) {
                                                ENV.api = arWebSiteURL[ 1 ];
                                            }
                                            var arWebPort = arConf[ 2 ].split( '=' );
                                            if ( is.not.empty( arWebPort[ 1 ] ) ) {
                                                ENV.port = arWebPort[ 1 ];
                                            }
                                            var arMapProvider = arConf[ 3 ].split( '=' );
                                            if ( is.not.empty( arMapProvider[ 1 ] ) ) {
                                                ENV.mapProvider = arMapProvider[ 1 ];
                                            }
                                            var blnSSL = ENV.ssl === 0 ? false : true;
                                            ENV.website = appendProtocol( ENV.website, blnSSL, ENV.port );
                                            ENV.api = appendProtocol( ENV.api, blnSSL, ENV.port );
                                            showQRcode();
                                        } else {
                                            $cordovaFile.removeFile( path, file )
                                                .then( function( success ) {
                                                    writeFile( path, file, data );
                                                }, function( error ) {
                                                    $cordovaToast.showShortBottom( error );
                                                } );
                                        }
                                    }, function( error ) {
                                        $cordovaToast.showShortBottom( error );
                                        console.error( error );
                                    } );
                            }, function( error ) {
                                // If file not exists
                                writeFile( path, file, data );
                            } );
                    } );
            } else {
                var blnSSL = 'https:' === document.location.protocol ? true : false;
                ENV.ssl = blnSSL ? '1' : '0';
                ENV.website = appendProtocol( ENV.website, blnSSL, ENV.port );
                ENV.api = appendProtocol( ENV.api, blnSSL, ENV.port );
                showQRcode();
            }
        } );
    }
] );

appControllers.controller( 'LoadingCtrl', [ 'ENV', '$scope', '$rootScope', '$state', '$ionicPlatform', '$timeout', '$cordovaSQLite', 'SALES_ORM',
    function( ENV, $scope, $rootScope, $state, $ionicPlatform, $timeout, $cordovaSQLite, SALES_ORM) {
        var gotoLogin = function(blnLogin){
            if(blnLogin){
                $timeout(function () {
                    $state.go( 'index.main', {}, {
                        reload: true
                    } );
                }, 2500);
            }else{
                $timeout(function () {
                    $state.go( 'index.login', {}, {
                        reload: true
                    } );
                }, 2500);
            }
        };
        $ionicPlatform.ready( function() {
            if ( !ENV.fromWeb ) {
                $cordovaSQLite.execute( db, 'SELECT * FROM Users ORDER BY id DESC' )
                    .then(
                        function( res ) {
                            if ( res.rows.length > 0 && is.not.undefined( res.rows.item( 0 ).uid ) ) {
                                console.log('Found LoginInfo');
                                var value = res.rows.item( 0 ).uid;
                                $rootScope.$broadcast( 'login' );
                                sessionStorage.clear();
                                sessionStorage.setItem( 'UserId', value );
                                //Add JPush RegistradionID
                                //if (!ENV.fromWeb) {
                                //    window.plugins.jPushPlugin.getRegistrationID(onGetRegistradionID);
                                //}
                                SALES_ORM.init();
                                gotoLogin(true);
                            }else{
                                gotoLogin(false);
                            }
                        },
                        function( error ) {
                            gotoLogin(false);
                        }
                    );
            }else{
                gotoLogin(false);
            }
        });
    }
] );

appControllers.controller( 'LoginCtrl', [ 'ENV', '$scope', '$rootScope', '$http', '$state', '$stateParams', '$ionicPopup', '$cordovaToast',
    '$cordovaAppVersion', '$cordovaSQLite', 'ApiService', 'SALES_ORM',
    function( ENV, $scope, $rootScope, $http, $state, $stateParams, $ionicPopup, $cordovaToast,
        $cordovaAppVersion, $cordovaSQLite, ApiService, SALES_ORM ) {
        var alertPopup = null,
            alertTitle = '';
        $scope.logininfo = {
            strUserName: '',
            strPassword: ''
        };
        $scope.login = function() {
            if ( window.cordova && window.cordova.plugins.Keyboard ) {
                cordova.plugins.Keyboard.close();
            }
            if ( is.empty( $scope.logininfo.strUserName ) ) {
                alertTitle = 'Please Enter User Name.';
                alertPopup = $ionicPopup.alert( {
                    title: alertTitle,
                    okType: 'button-assertive'
                } );
                alertPopup.then( function( res ) {
                    console.log( alertTitle );
                } );
            } else {
                var strUri = '/api/freight/login/check?UserId=' + $scope.logininfo.strUserName + '&Md5Stamp=' + hex_md5( $scope.logininfo.strPassword );
                ApiService.GetParam( strUri, true ).then( function success( result ) {
                    if ( result.data.results > 0 ) {
                        var value = $scope.logininfo.strUserName;
                        sessionStorage.clear();
                        sessionStorage.setItem( 'UserId', value );
                        //Add JPush RegistradionID
                        //if (!ENV.fromWeb) {
                        //    window.plugins.jPushPlugin.getRegistrationID(onGetRegistradionID);
                        //}
                        SALES_ORM.init();
                        if ( !ENV.fromWeb ) {
                            $cordovaSQLite.execute( db, 'INSERT INTO Users (uid) VALUES (?)', [ value ] )
                                .then( function( result ) {
                                }, function( error ) {
                                } )
                        }
                        $state.go( 'index.main', {}, {
                            reload: true
                        } );
                        $rootScope.$broadcast( 'login' );
                    } else {
                        alertTitle = 'Invaild User';
                        alertPopup = $ionicPopup.alert( {
                            title: alertTitle,
                            okType: 'button-assertive'
                        } );
                        alertPopup.then( function( res ) {
                            console.log( alertTitle );
                        } );
                    }
                } );
            }
        };
        $( '#iUserName' ).on( 'keydown', function( e ) {
            if ( e.which === 9 || e.which === 13 ) {
                $( '#iPassword' ).focus();
            }
        } );
        $( '#iPassword' ).on( 'keydown', function( e ) {
            if ( e.which === 9 || e.which === 13 ) {
                if ( alertPopup === null ) {
                    $scope.login();
                } else {
                    alertPopup.close();
                    alertPopup = null;
                }
            }
        } );
    }
] );

appControllers.controller( 'SettingCtrl', [ 'ENV', '$scope', '$state', '$ionicHistory', '$ionicPopup', '$cordovaToast', '$cordovaFile',
    function( ENV, $scope, $state, $ionicHistory, $ionicPopup, $cordovaToast, $cordovaFile ) {
        $scope.Setting = {
            Version: ENV.version,
            WebApiURL: rmProtocol( ENV.api, ENV.port ),
            WebSiteUrl: rmProtocol( ENV.website, ENV.port ),
            WebPort: ENV.port,
            SSL: {
                checked: ENV.ssl === '0' ? false : true
            },
            MapProvider: ENV.mapProvider,
            blnWeb: ENV.fromWeb
        };
        var writeFile = function( path, file, data ) {
            $cordovaFile.writeFile( path, file, data, true )
                .then( function( success ) {
                    var blnSSL = ENV.ssl === 0 ? false : true;
                    ENV.website = appendProtocol( ENV.website, blnSSL, ENV.port );
                    ENV.api = appendProtocol( ENV.api, blnSSL, ENV.port );
                    $scope.return();
                }, function( error ) {
                    $cordovaToast.showShortBottom( error );
                    console.error( error );
                } );
        };
        $scope.return = function() {
            if ( $ionicHistory.backView() ) {
                $ionicHistory.goBack();
            } else {
                $state.go( 'index.login', {}, {
                    reload: true
                } );
            }
        };
        $scope.save = function() {
            ENV.ssl = $scope.Setting.SSL.checked ? '1' : '0';
            var blnSSL = $scope.Setting.SSL.checked ? true : false;
            if ( is.not.empty( $scope.Setting.WebPort ) ) {
                ENV.port = $scope.Setting.WebPort;
            } else {
                $scope.Setting.WebPort = ENV.port;
            }
            if ( is.not.empty( $scope.Setting.WebApiURL ) ) {
                ENV.api = $scope.Setting.WebApiURL;
            } else {
                $scope.Setting.WebApiURL = rmProtocol( ENV.api, ENV.port );
            }
            if ( is.not.empty( $scope.Setting.WebSiteUrl ) ) {
                ENV.website = $scope.Setting.WebSiteUrl;
            } else {
                $scope.Setting.WebSiteUrl = rmProtocol( ENV.website, ENV.port );
            }
            if ( is.not.empty( $scope.Setting.MapProvider ) ) {
                ENV.mapProvider = $scope.Setting.MapProvider;
            } else {
                $scope.Setting.MapProvider = ENV.mapProvider;
            }
            if ( !ENV.fromWeb ) {
                var data =  'website=' + ENV.website +
                            '##api=' + ENV.api +
                            '##port=' + ENV.port +
                            '##map=' + ENV.mapProvider;
                var path = cordova.file.externalRootDirectory;
                var file = ENV.rootPath + '/' + ENV.configFile;
                writeFile(path, file, data);
            } else {
                ENV.website = appendProtocol( ENV.website, blnSSL, ENV.port );
                ENV.api = appendProtocol( ENV.api, blnSSL, ENV.port );
                $scope.return();
            }
        };
        $scope.reset = function() {
            $scope.Setting.WebApiURL = ENV.reset.api;
            $scope.Setting.WebSiteUrl = ENV.reset.website;
            $scope.Setting.WebPort = ENV.reset.port;
            $scope.Setting.MapProvider = ENV.reset.mapProvider;
            if ( !ENV.fromWeb ) {
                var path = cordova.file.externalRootDirectory;
                var file = ENV.rootPath + '/' + ENV.configFile;
                $cordovaFile.removeFile( path, file )
                    .then( function( success ) {
                        $scope.save();
                    }, function( error ) {
                        $cordovaToast.showShortBottom( error );
                    } );
            }
        };
    }
] );

appControllers.controller( 'UpdateCtrl', [ 'ENV', '$scope', '$state', '$stateParams', '$ionicPopup', 'DownloadFileService',
    function( ENV, $scope, $state, $stateParams, $ionicPopup, DownloadFileService ) {
        var alertPopup = null,
            alertPopupTitle = '';
        $scope.strVersion = $stateParams.Version;
        $scope.return = function() {
            $state.go( 'index.login', {}, {
                reload: true
            } );
        };
        var onDownloadError = function() {
            alertPopupTitle = 'Dowload Failed';
            alertPopup = $ionicPopup.alert( {
                title: alertPopupTitle,
                okType: 'button-assertive'
            } );
            alertPopup.then( function( res ) {
                $scope.return();
            } );
        };
        $scope.upgrade = function() {
            DownloadFileService.Download( ENV.website + '/' + ENV.apkName + '.apk', ENV.apkName + '.apk', 'application/vnd.android.package-archive', null, null, onDownloadError );
        };
    }
] );

appControllers.controller( 'MainCtrl', [ 'ENV', '$scope', '$state', '$timeout', 'SALES_ORM', 'GeoService', 'GEO_CONSTANT',
    function( ENV, $scope, $state, $timeout, SALES_ORM, GeoService, GEO_CONSTANT ) {
        $scope.GoToSalesCost = function( Type ) {
            SALES_ORM.SEARCH.setType( Type );
            $state.go( 'salesCost', {}, {
                reload: true
            } );
        };
        $scope.GoToSA = function() {
            $state.go( 'salesmanActivity', {}, {
                reload: true
            } );
        };
        $scope.GoToRcbp = function() {
            $state.go( 'contacts', {}, {
                reload: true
            } );
        };
        $scope.GoToPa = function() {
            $state.go( 'paymentApproval', {}, {
                reload: true
            } );
        };
        $scope.GoToVS = function() {
            $state.go( 'vesselSchedule', {}, {
                reload: true
            } );
        };
        $scope.GoToSS = function() {
            $state.go( 'shipmentStatus', {}, {
                reload: true
            } );
        };
        $scope.GoToInv = function() {
            $state.go( 'invoice', {}, {
                reload: true
            } );
        };
        $scope.GoToBL = function() {
            $state.go( 'bl', {}, {
                reload: true
            } );
        };
        $scope.GoToAWB = function() {
            $state.go( 'awb', {}, {
                reload: true
            } );
        };
        $scope.GoToSOA = function() {
            $state.go( 'soa', {}, {
                reload: true
            } );
        };
        $scope.GoToMemo = function() {
            $state.go( 'memo', {}, {
                reload: true
            } );
        };
        $scope.GoToReminder = function() {
            $state.go( 'reminder', {}, {
                reload: true
            } );
        };
        $scope.GoToDocScan = function() {
            $state.go( 'documentScan', {}, {
                reload: true
            } );
        };
        $scope.GoToRetrieveDoc = function() {
            $state.go( 'retrieveDoc', {}, {
                reload: true
            } );
        };
        function loadJScript() {
            var script = null;
            if ( is.equal( ENV.mapProvider.toLowerCase(), 'baidu' ) ) {
                script = document.getElementById('bmap');
                if(is.null(script)){
                    script = document.createElement( 'script' );
                    script.type = 'text/javascript';
                    script.id = 'bmap';
                    script.src = 'http://api.map.baidu.com/getscript?v=2.0&ak=94415618dfaa9ff5987dd07983f25159';
                    //script.src = 'js/maps/bmap.js';
                    document.body.appendChild( script );
                }
            } else if ( is.equal( ENV.mapProvider.toLowerCase(), 'google' ) ) {
                script = document.getElementById('gmap');
                if(is.null(script)){
                    script = document.createElement( 'script' );
                    script.type = 'text/javascript';
                    script.id = 'gmap';
                    script.src = 'https://maps.googleapis.com/maps/api/js?key=AIzaSyAxtVdmOCYy4UWz8eW4z4Eo-DF3cjRoMUM';
                    //script.src = 'js/maps/gmap.js';
                    document.body.appendChild( script );
                }
            }
        }
        $scope.$watch( '$viewContentLoaded', function() {
            loadJScript();
            $timeout(function(){
                if ( is.equal( ENV.mapProvider.toLowerCase(), 'baidu' ) ) {
                    GeoService.BaiduGetCurrentPosition().then( function onSuccess( point ) {
                        var pos = {
                            lat: point.lat,
                            lng: point.lng
                        };
                        GEO_CONSTANT.Baidu.set( pos );
                    }, function onError( msg ) {} );
                } else if ( is.equal( ENV.mapProvider.toLowerCase(), 'google' ) ) {
                    GeoService.GoogleGetCurrentPosition().then( function onSuccess( point ) {
                        var pos = {
                            lat: point.coords.latitude,
                            lng: point.coords.longitude
                        };
                        GEO_CONSTANT.Google.set( pos );
                    }, function onError( msg ) {} );
                }
            }, 2000);
        } );
    }
] );
