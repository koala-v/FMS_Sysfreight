var appService = angular.module( 'MobileAPP.services', [
    'ionic',
    'ngCordova',
    'MobileAPP.config'
] );

appService.service( 'ApiService', [ '$q', 'ENV', '$http', '$ionicLoading', '$ionicPopup', '$timeout',
    function( $q, ENV, $http, $ionicLoading, $ionicPopup, $timeout ) {
        this.Post = function( requestUrl, requestData, blnShowLoad ) {
            if ( blnShowLoad ) {
                $ionicLoading.show();
            }
            var deferred = $q.defer();
            var strSignature = hex_md5( requestUrl + ENV.appId.replace( /-/ig, "" ) );
            var url = ENV.api + requestUrl;
            console.log( url );
            var config = {
                'Content-Type': 'application/x-www-form-urlencoded'
            };
            $http.post( url, requestData, config ).success( function( data, status, headers, config, statusText ) {
                if ( blnShowLoad ) {
                    $ionicLoading.hide();
                }
                deferred.resolve( data );
            } ).error( function( data, status, headers, config, statusText ) {
                if ( blnShowLoad ) {
                    $ionicLoading.hide();
                }
                deferred.reject( data );
                console.error( data );
            } );
            return deferred.promise;
        };
        this.Get = function( requestUrl, blnShowLoad ) {
            if ( blnShowLoad ) {
                $ionicLoading.show();
            }
            var deferred = $q.defer();
            var strSignature = hex_md5( requestUrl + '?format=json' + ENV.appId.replace( /-/ig, '') );
            var url = ENV.api + requestUrl + '?format=json';
            console.log( url );
            $http.get( url ).success( function( data, status, headers, config, statusText ) {
                if ( blnShowLoad ) {
                    $ionicLoading.hide();
                }
                deferred.resolve( data );
            } ).error( function( data, status, headers, config, statusText ) {
                if ( blnShowLoad ) {
                    $ionicLoading.hide();
                }
                deferred.reject( data );
                console.error( data );
            } );
            return deferred.promise;
        };
        this.GetParam = function( requestUrl, blnShowLoad ) {
            if ( blnShowLoad ) {
                $ionicLoading.show();
            }
            var deferred = $q.defer();
            var strSignature = hex_md5( requestUrl + '&format=json' + ENV.appId.replace( /-/ig, '' ) );
            var url = ENV.api + requestUrl + '&format=json';
            console.log( url );
            $http.get( url ).success( function( data, status, headers, config, statusText ) {
                if ( blnShowLoad ) {
                    $ionicLoading.hide();
                }
                deferred.resolve( data );
            } ).error( function( data, status, headers, config, statusText ) {
                if ( blnShowLoad ) {
                    $ionicLoading.hide();
                }
                deferred.reject( data );
                console.error( data );
            } );
            return deferred.promise;
        };
    }
] );

appService.service( 'DownloadFileService', [ 'ENV', '$timeout', '$ionicLoading', '$cordovaToast', '$cordovaFile', '$cordovaFileTransfer', '$cordovaFileOpener2',
    function( ENV, $timeout, $ionicLoading, $cordovaToast, $cordovaFile, $cordovaFileTransfer, $cordovaFileOpener2 ) {
        this.Download = function( url, fileName, fileType, onPlatformError, onCheckError, onDownloadError ) {
            $ionicLoading.show( {
                template: 'Download  0%'
            } );
            if ( !ENV.fromWeb ) {
                var targetPath = cordova.file.externalRootDirectory + '/' + ENV.rootPath + '/' + fileName;
                var trustHosts = true;
                var options = {};
                //$cordovaFile.checkFile(cordova.file.externalRootDirectory, ENV.rootPath + '/' + fileName)
                //    .then(function(success) {
                $cordovaFileTransfer.download( url, targetPath, trustHosts, options ).then( function( result ) {
                    $ionicLoading.hide();
                    $cordovaFileOpener2.open( targetPath, fileType ).then( function() {
                        // success
                    }, function( err ) {
                        console.error( err );
                    } ).catch( function( ex ) {
                        console.error( ex );
                    } );
                }, function( err ) {
                    $ionicLoading.hide();
                    console.error( err );
                    $cordovaToast.showShortCenter( 'Download faild' );
                    if ( typeof( onDownloadError ) == 'function' ) onDownloadError();
                }, function( progress ) {
                    $timeout( function() {
                        var downloadProgress = ( progress.loaded / progress.total ) * 100;
                        $ionicLoading.show( {
                            template: 'Download  ' + Math.floor( downloadProgress ) + '%'
                        } );
                        if ( downloadProgress > 99 ) {
                            $ionicLoading.hide();
                        }
                    } )
                } ).catch( function( ex ) {
                    $ionicLoading.hide();
                    console.error( ex );
                } );
                //    }, function(error) {
                //        console.error(error);
                //        $ionicLoading.hide();
                //        $cordovaToast.showShortCenter('Check file faild.');
                //        if( typeof(onDownloadError) == 'function') onDownloadError();
                //    }).catch(function(ex) {
                //        console.log(ex);
                //    });
            } else {
                $ionicLoading.hide();
                if ( typeof( onPlatformError ) == 'function' ) onPlatformError( url );
            }
        };
    }
] );

appService.service( 'OpenUrlService', [ 'ENV', '$cordovaInAppBrowser',
    function( ENV, $cordovaInAppBrowser ) {
        this.Open = function( url ) {
            if ( !ENV.fromWeb ) {
                var options = {
                    location: 'yes',
                    clearcache: 'yes',
                    toolbar: 'no'
                };
                $cordovaInAppBrowser.open( url, '_system', options )
                    .then( function( event ) {
                        // success
                    } )
                    .catch( function( event ) {
                        // error
                        $cordovaInAppBrowser.close();
                    } );
            } else {
                window.open( url );
            }
        };
    }
] );

appService.service( 'GeoService', [ '$q', '$cordovaGeolocation',
    function( $q, $cordovaGeolocation ) {
        this.BaiduGetCurrentPosition = function() {
            var deferred = $q.defer();
            if(typeof(BMap) != 'undefined'){
                var geolocation = new BMap.Geolocation();
                geolocation.getCurrentPosition( function( r ) {
                    if ( this.getStatus() == BMAP_STATUS_SUCCESS ) {
                        deferred.resolve( r.point );
                        var pos = {
                            type: 'Baidu',
                            lat: r.point.lat,
                            lng: r.point.lng
                        };
                        console.log( pos.type + '-lat:' + pos.lat + '-ing:' + pos.lng );
                    } else {
                        deferred.reject( this.getStatus() );
                        console.error( this.getStatus() );
                    }
                }, {
                    maximumAge: 60000,
                    timeout: 5000,
                    enableHighAccuracy: true
                } )
            }else{
                deferred.reject( 'BMap undefined' );
                console.log( 'BMap undefined' );
            }
            return deferred.promise;
        };
        this.GoogleGetCurrentPosition = function() {
            var deferred = $q.defer();
            var options = {
                maximumAge: 60000,
                timeout: 10000,
                enableHighAccuracy: true
            };
            $cordovaGeolocation.getCurrentPosition( options ).then( function( position ) {
                deferred.resolve( position );
                var pos = {
                    type: 'Google',
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };
                console.log(  pos.type + '-lat:' + pos.lat + '-ing:' + pos.lng );
            }, function( error ) {
                deferred.reject( error );
                console.error( error );
            } );
            /*
            // Try HTML5 geolocation.
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(function(position) {
                    deferred.resolve(position);
                    var pos = {
                        type: 'Google',
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    };
                    console.log(pos);
                }, function() {
                    deferred.reject('The Geolocation service failed.');
                    console.log('The Geolocation service failed.');
                }, {
                    maximumAge: 60000,
                    timeout: 5000,
                    enableHighAccuracy: true
                });
            } else {
                deferred.reject('Browser does not support Geolocation');
                console.log('Browser does not support Geolocation');
            }
            */
            return deferred.promise;
        };
    }
] );

appService.service( 'SqlService', [ 'ENV', '$q', '$cordovaSQLite', '$ionicPlatform', '$cordovaDevice',
    function( ENV, $q, $cordovaSQLite, $ionicPlatform, $cordovaDevice ){
        var dbName = 'freightapp.db', dbLocation = 'default', db = null, dbSql = '';
        var dbInfo = {
            dbName: 'freightapp.db',
            dbVersion: '1.0',
            dbDisplayName: 'FreightApp Database',
            dbEstimatedSize: 1024 * 1024 * 100
        };
        this.init = function(){
            $ionicPlatform.ready(function () {
                if(ENV.fromWeb){
                    //db = window.openDatabase(dbInfo.dbName, dbInfo.dbVersion, dbInfo.dbDisplayName, dbInfo.dbEstimatedSize);
                }else{
                    db = $cordovaSQLite.openDB({name: dbName, location: 'default', androidLockWorkaround: 1})
                }
                if(db){
                    db.transaction(function(tx) {
                        $cordovaSQLite.execute(db, 'CREATE TABLE IF NOT EXISTS User(id INTEGER PRIMARY KEY AUTOINCREMENT, password TEXT)');
                    }, function(err) {
                        console.error(err);
                    });
                }
            });
        };
        this.select = function(){
            if(db){
                var query2 = 'SELECT top 1 id, password FROM User';
    		    $cordovaSQLite.execute(db, query2, []).then(function(res) {
    		        if(res.rows.length > 0) {
		            	console.error(res.rows.item(0).id + ' # ' + res.rows.item(0).password);
                        var objUser = {
                            id: res.rows.item(0).id,
                            password: res.rows.item(0).password
                        };
                        return objUser;
    		        }
    		    }, function (err) {
    		        console.error(err);
    		    });
            }else{
                return null;
            }
        };
        this.insert = function(){
            if(db){
                var query = 'INSERT INTO User (id, password) VALUES (?,?)';
    	        $cordovaSQLite.execute(db, query, ['s', 'sysh20']).then(function(res) {
    	            console.error(res.insertId);
    	        }, function (err) {
    	            console.error(err);
    	        });
            }
        };
    }
] );
