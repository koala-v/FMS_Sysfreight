appControllers.controller( 'VesselScheduleCtrl', [ '$scope', '$state', '$stateParams', '$timeout', '$ionicFilterBar', 'ApiService',
    function( $scope, $state, $stateParams, $timeout, $ionicFilterBar, ApiService ) {
        var filterBarInstance;
        $scope.rcvy = {
            PortOfDischargeName: ''
        };
        $scope.returnMain = function() {
            $state.go( 'index.main', {}, {} );
        };
        $scope.GoToDetail = function( PortOfDischargeName ) {
            $state.go( 'vesselScheduleDetail', {
                'PortOfDischargeName': PortOfDischargeName
            }, {
                reload: true
            } );
        };
        $( '#txt-PortOfDischargeName' ).on( 'keydown', function( e ) {
            if ( e.which === 9 || e.which === 13 ) {
                getRcvy1( $scope.rcvy.PortOfDischargeName );
            }
        } );
        var getRcvy1 = function( PortOfDischargeName ) {
            var strUri = "/api/freight/rcvy1";
            if ( PortOfDischargeName != null && PortOfDischargeName.length > 0 ) {
                strUri = strUri + "?PortOfDischargeName=" + PortOfDischargeName;
                ApiService.GetParam( strUri, true ).then( function success( result ) {
                    $scope.PortOfDischargeNames = result.data.results;
                } );
            } else {
                ApiService.Get( strUri, true ).then( function success( result ) {
                    $scope.PortOfDischargeNames = result.data.results;
                } );
            }
        };
        getRcvy1( null );
        $scope.showFilterBar = function() {
            filterBarInstance = $ionicFilterBar.show( {
                items: $scope.PortOfDischargeNames,
                update: function( filteredItems, filterText ) {
                    $scope.PortOfDischargeNames = filteredItems;
                    if ( filterText ) {
                        console.log( filterText );
                    }
                }
            } );
        };
        $scope.refreshItems = function() {
            if ( filterBarInstance ) {
                filterBarInstance();
                filterBarInstance = null;
            }
            $timeout( function() {
                getRcvy1( null );
                $scope.$broadcast( 'scroll.refreshComplete' );
            }, 1000 );
        };
    }
] );

appControllers.controller( 'VesselScheduleDetailCtrl', [ '$scope', '$state', '$stateParams', 'ApiService',
    function( $scope, $state, $stateParams, ApiService ) {
        $scope.Rcvy1Detail = {
            PortOfDischargeName: $stateParams.PortOfDischargeName
        };
        $scope.returnList = function() {
            $state.go( 'vesselSchedule', {}, {} );
        };
        $scope.ShowDate = function( utc ) {
            return moment( utc ).format( 'DD-MMM-YYYY' );
        };
        $scope.ShowDatetime = function( utc ) {
            return moment( utc ).format( 'DD-MMM-YYYY HH:mm' );
        };
        var getRcvy1 = function( PortOfDischargeName ) {
            var strUri = "/api/freight/rcvy1/sps?PortOfDischargeName=" + PortOfDischargeName;
            ApiService.GetParam( strUri, true ).then( function success( result ) {
                $scope.Rcvy1s = result.data.results;
            } );
        };
        getRcvy1( $scope.Rcvy1Detail.PortOfDischargeName );
    }
] );

appControllers.controller( 'ShipmentStatusCtrl', [ '$scope', '$state', '$ionicPopup', 'ApiService', 'TRACKING_ORM',
    function( $scope, $state, $ionicPopup, ApiService, TRACKING_ORM ) {
        $scope.Tracking = {
            ContainerNo: '',
            JobNo: '',
            BLNo: '',
            AWBNo: '',
            OrderNo: '',
            ReferenceNo: ''
        };
        $scope.Tracking.JobNo = 'SE07731-03';
        switch ( TRACKING_ORM.TRACKING_SEARCH.FilterName ) {
            case 'ContainerNo':
                $scope.Tracking.ContainerNo = TRACKING_ORM.TRACKING_SEARCH.FilterValue;
                break;
            case 'JobNo':
                $scope.Tracking.JobNo = TRACKING_ORM.TRACKING_SEARCH.FilterValue;
                break;
            case 'BLNo':
                $scope.Tracking.BLNo = TRACKING_ORM.TRACKING_SEARCH.FilterValue;
                break;
            case 'AWBNo':
                $scope.Tracking.AWBNo = TRACKING_ORM.TRACKING_SEARCH.FilterValue;
                break;
            case 'OrderNo':
                $scope.Tracking.OrderNo = TRACKING_ORM.TRACKING_SEARCH.FilterValue;
                break;
            case 'ReferenceNo':
                $scope.Tracking.ReferenceNo = TRACKING_ORM.TRACKING_SEARCH.FilterValue;
                break;
            default:
        }
        var alertPopup = null;
        $scope.returnMain = function() {
            $state.go( 'index.main', {}, {} );
        };
        var getSearchResult = function( FilterName, FilterValue ) {
            var strUri = '/api/freight/tracking/count?FilterName=' + FilterName + '&FilterValue=' + FilterValue;
            ApiService.GetParam( strUri, true ).then( function chkCount( result ) {
                if ( result.data.results > 1 ) {
                    $state.go( 'shipmentStatusList', {
                        'FilterName': FilterName,
                        'FilterValue': FilterValue
                    }, {
                        reload: true
                    } );
                } else if ( result.data.results === 1 ) {
                    return FilterName;
                } else {
                    alertPopup = $ionicPopup.alert( {
                        title: 'No Records Found.',
                        okType: 'button-assertive'
                    } );
                }
            } ).then( function chkFilter( FilterName ) {
                if ( typeof( FilterName ) != 'undefined' ) {
                    if ( FilterName === 'OrderNo' ) {
                        TRACKING_ORM.TRACKING_DETAIL._set( FilterValue, '4' );
                        $state.go( 'shipmentStatusDetail', {
                            'FilterName': FilterName,
                            'Key': FilterValue,
                            'ModuleCode': '4'
                        }, {
                            reload: true
                        } );
                    } else {
                        strUri = '/api/freight/tracking/sps?FilterName=' + FilterName + '&RecordCount=0&FilterValue=' + FilterValue;
                        ApiService.GetParam( strUri, false ).then( function success( result ) {
                            if ( result.data.results.length > 0 ) {
                                TRACKING_ORM.TRACKING_DETAIL._set( result.data.results[ 0 ].JobNo, result.data.results[ 0 ].ModuleCode );
                                $state.go( 'shipmentStatusDetail', {
                                    'FilterName': FilterName,
                                    'Key': result.data.results[ 0 ].JobNo,
                                    'ModuleCode': result.data.results[ 0 ].ModuleCode
                                }, {
                                    reload: true
                                } );
                            }
                        } );
                    }
                }
            } );
        };
        $scope.GoToDetail = function( TypeName ) {
            if ( alertPopup === null ) {
                var FilterName = '';
                var FilterValue = '';
                if ( TypeName === 'Container No' ) {
                    FilterValue = $scope.Tracking.ContainerNo;
                    FilterName = 'ContainerNo'
                } else if ( TypeName === 'Job No' ) {
                    FilterValue = $scope.Tracking.JobNo;
                    FilterName = 'JobNo'
                } else if ( TypeName === 'BL No' ) {
                    FilterValue = $scope.Tracking.BLNo;
                    FilterName = 'BlNo'
                } else if ( TypeName === 'AWB No' ) {
                    FilterValue = $scope.Tracking.AWBNo;
                    FilterName = 'AwbNo'
                } else if ( TypeName === 'Order No' ) {
                    FilterValue = $scope.Tracking.OrderNo;
                    FilterName = 'OrderNo'
                } else if ( TypeName === 'Reference No' ) {
                    FilterValue = $scope.Tracking.ReferenceNo;
                    FilterName = 'CustomerRefNo'
                }
                if ( FilterValue.length > 0 ) {
                    if ( TRACKING_ORM.TRACKING_SEARCH.FilterName != FilterName || TRACKING_ORM.TRACKING_SEARCH.FilterValue != FilterValue ) {
                        TRACKING_ORM.init();
                        TRACKING_ORM.TRACKING_SEARCH._set( FilterName, FilterValue );
                    }
                    getSearchResult( FilterName, FilterValue );
                } else {
                    alertPopup = $ionicPopup.alert( {
                        title: TypeName + ' is Empty.',
                        okType: 'button-assertive'
                    } );
                }
            } else {
                alertPopup.close();
                alertPopup = null;
            }
        };
        $( '#iContainerNo' ).on( 'keydown', function( e ) {
            if ( e.which === 9 || e.which === 13 ) {
                $scope.GoToDetail( 'Container No' );
            }
        } );
        $( '#iJobNo' ).on( 'keydown', function( e ) {
            if ( e.which === 9 || e.which === 13 ) {
                $scope.GoToDetail( 'Job No' );
            }
        } );
        $( '#iBLNo' ).on( 'keydown', function( e ) {
            if ( e.which === 9 || e.which === 13 ) {
                $scope.GoToDetail( 'BL No' );
            }
        } );
        $( '#iAWBNo' ).on( 'keydown', function( e ) {
            if ( e.which === 9 || e.which === 13 ) {
                $scope.GoToDetail( 'AWB No' );
            }
        } );
        $( '#iOrderNo' ).on( 'keydown', function( e ) {
            if ( e.which === 9 || e.which === 13 ) {
                $scope.GoToDetail( 'Order No' );
            }
        } );
        $( '#iReferenceNo' ).on( 'keydown', function( e ) {
            if ( e.which === 9 || e.which === 13 ) {
                $scope.GoToDetail( 'Reference No' );
            }
        } );
    }
] );

appControllers.controller( 'ShipmentStatusListCtrl', [ '$scope', '$state', '$stateParams', 'ApiService', 'TRACKING_ORM',
    function( $scope, $state, $stateParams, ApiService, TRACKING_ORM ) {
        var RecordCount = 0;
        var dataResults = new Array();
        $scope.TrackingList = {
            FilterName: TRACKING_ORM.TRACKING_SEARCH.FilterName,
            FilterValue: TRACKING_ORM.TRACKING_SEARCH.FilterValue,
            CanLoadedMoreData: true
        };
        if ( $scope.TrackingList.FilterName === '' ) {
            $scope.TrackingList.FilterName = $stateParams.FilterName;
            $scope.TrackingList.FilterValue = $stateParams.FilterValue;
        }
        $scope.returnShipmentStatus = function() {
            $state.go( 'shipmentStatus', {}, {} );
        };
        $scope.GoToDetail = function( Jmjm1 ) {
            TRACKING_ORM.TRACKING_DETAIL._set( Jmjm1.JobNo, Jmjm1.ModuleCode );
            $state.go( 'shipmentStatusDetail', {
                'FilterName': $scope.TrackingList.FilterName,
                'Key': Jmjm1.JobNo,
                'ModuleCode': Jmjm1.ModuleCode
            }, {
                reload: true
            } );
        };
        $scope.ShowDate = function( utc ) {
            return moment( utc ).format( 'DD-MMM-YYYY' );
        };
        $scope.ShowDatetime = function( utc ) {
            return moment( utc ).format( 'DD-MMM-YYYY HH:mm' );
        };
        $scope.funcShowLabel = function( FilterName ) {
            if ( FilterName === $scope.TrackingList.FilterName ) {
                return true;
            } else {
                return false;
            }
        };
        $scope.funcLoadMore = function() {
            if ( TRACKING_ORM.TRACKING_LIST.Jmjm1s != null && TRACKING_ORM.TRACKING_LIST.Jmjm1s.length > 0 ) {
                $scope.Jmjm1s = TRACKING_ORM.TRACKING_LIST.Jmjm1s;
                $scope.TrackingList.CanLoadedMoreData = false;
            } else {
                var strUri = '/api/freight/tracking/sps?FilterName=' + $scope.TrackingList.FilterName + '&RecordCount=' + RecordCount + '&FilterValue=' + $scope.TrackingList.FilterValue;
                ApiService.GetParam( strUri, false ).then( function success( result ) {
                    if ( result.data.results.length > 0 ) {
                        dataResults = dataResults.concat( result.data.results );
                        $scope.Jmjm1s = dataResults;
                        $scope.TrackingList.CanLoadedMoreData = true;
                        RecordCount = RecordCount + 20;
                        TRACKING_ORM.TRACKING_LIST._setJmjm( $scope.Jmjm1s );
                    } else {
                        $scope.TrackingList.CanLoadedMoreData = false;
                        RecordCount = 0;
                    }
                    $scope.$broadcast( 'scroll.infiniteScrollComplete' );
                } );
            }
        };
    }
] );

appControllers.controller( 'ShipmentStatusDetailCtrl', [ '$scope', '$state', '$stateParams', '$ionicPopup', 'ApiService', 'TRACKING_ORM',
    function( $scope, $state, $stateParams, $ionicPopup, ApiService, TRACKING_ORM ) {
        $scope.Detail = {
            FilterName: TRACKING_ORM.TRACKING_SEARCH.FilterName,
            Key: TRACKING_ORM.TRACKING_DETAIL.Key,
            ModuleCode: TRACKING_ORM.TRACKING_DETAIL.ModuleCode
        };
        if ( $scope.Detail.FilterName === '' ) {
            $scope.Detail.FilterName = $stateParams.FilterName;
            $scope.Detail.Key = $stateParams.Key;
            $scope.Detail.ModuleCode = $stateParams.ModuleCode;
        }
        $scope.return = function() {
            if ( is.equal( $scope.Detail.FilterName, 'ContainerNo' ) ) {
                $state.go( 'shipmentStatusList', {
                    'FilterName': TRACKING_ORM.TRACKING_SEARCH.FilterName,
                    'FilterValue': TRACKING_ORM.TRACKING_SEARCH.FilterValue
                }, {
                    reload: true
                } );
            } else {
                $state.go( 'shipmentStatus', {}, {} );
            }
        };
        $scope.ShowDate = function( utc ) {
            return moment( utc ).format( 'DD-MMM-YYYY' );
        };
        $scope.ShowDatetime = function( utc ) {
            return moment( utc ).format( 'DD-MMM-YYYY HH:mm' );
        };
        if ( $scope.Detail.FilterName === 'OrderNo' ) {
            if ( TRACKING_ORM.TRACKING_DETAIL.Omtx1 != null && TRACKING_ORM.TRACKING_DETAIL.Omtx1.OrderNo === $scope.Detail.Key ) {
                $scope.Omtx1s = TRACKING_ORM.TRACKING_DETAIL.Omtx1;
            } else {
                var getOmtx1 = function( FilterName, FilterValue ) {
                    var strUri = '/api/freight/tracking?FilterName=' + FilterName + '&FilterValue=' + FilterValue;
                    ApiService.GetParam( strUri, true ).then( function success( result ) {
                        $scope.Omtx1s = result.data.results;
                        TRACKING_ORM.TRACKING_DETAIL._setOmtx( $scope.Omtx1s );
                    } );
                };
                getOmtx1( $scope.Detail.FilterName, $scope.Detail.Key );
            }
        } else {
            if ( TRACKING_ORM.TRACKING_DETAIL.Jmjm1 != null && TRACKING_ORM.TRACKING_DETAIL.Jmjm1.JobNo === $scope.Detail.Key ) {
                $scope.jmjm1 = TRACKING_ORM.TRACKING_DETAIL.Jmjm1;
            } else {
                var getJmjm1 = function( FilterName, FilterValue, ModuleCode ) {
                    var strUri = '/api/freight/tracking?FilterName=' + FilterName + '&ModuleCode=' + ModuleCode + '&FilterValue=' + FilterValue;
                    ApiService.GetParam( strUri, true ).then( function success( result ) {
                        $scope.jmjm1 = result.data.results[ 0 ];
                        TRACKING_ORM.TRACKING_DETAIL._setJmjm( $scope.jmjm1 );
                    } );
                };
                getJmjm1( $scope.Detail.FilterName, $scope.Detail.Key, $scope.Detail.ModuleCode );
            }
        }
    }
] );

appControllers.controller( 'InvoiceCtrl', [ 'ENV', '$scope', '$state', '$ionicPopup', 'DownloadFileService', 'ApiService',
    function( ENV, $scope, $state, $ionicPopup, DownloadFileService, ApiService ) {
        var alertPopup = null;
        $scope.returnMain = function() {
            $state.go( 'index.main', {}, {} );
        };
        $scope.ShowDate = function( utc ) {
            return moment( utc ).format( 'DD-MMM-YYYY' );
        };
        var onPlatformError = function( url ) {
            window.open( url );
        };
        $scope.download = function( Ivcr1, File ) {
            if(is.not.undefined(File)){
                var strFileName = Ivcr1.TrxNo + '-' + File.FileName,
                    strURL='',
                    type='';
                if(is.equal(File.Extension,'.pdf')){
                    type = 'application/pdf';
                    strURL = ENV.api + '/api/freight/view/file?eDoc=1&Type=pdf&FolderName=ivcr1&Key=' + Ivcr1.TrxNo + '&FileName=' + File.FileName + '&format=json';
                }else if(is.equal(File.Extension,'.txt')){
                    type = 'text/plan';
                    strURL = ENV.api + '/api/freight/view/file?eDoc=1&Type=txt&FolderName=ivcr1&Key=' + Ivcr1.TrxNo + '&FileName=' + File.FileName + '&format=json';
                }else if(is.equal(File.Extension,'.jpg')||is.equal(File.Extension,'.png')||is.equal(File.Extension,'.bmp')){
                    type = 'image/jpeg';
                    strURL = ENV.api + '/api/freight/view/file?eDoc=1&Type=img&FolderName=ivcr1&Key=' + Ivcr1.TrxNo + '&FileName=' + File.FileName + '&format=json';
                }else {
                    type = 'application/octet-stream';
                    strURL = ENV.api + '/api/freight/view/file?eDoc=1&Type=stream&FolderName=ivcr1&Key=' + Ivcr1.TrxNo + '&FileName=' + File.FileName + '&format=json';
                }
                DownloadFileService.Download( strURL, strFileName, type, onPlatformError, null, null );
            }
        };
        var GetIvcr1s = function() {
            var strUri = "/api/freight/view/file/list?FolderName=ivcr1";
            ApiService.GetParam( strUri, true ).then( function success( result ) {
                if ( result.data.results != null && result.data.results.length > 0 ) {
                    $scope.Ivcr1s = result.data.results;
                } else {
                    $scope.Ivcr1s = null;
                    alertPopup = $ionicPopup.alert( {
                        title: 'No Invoice Report Found.',
                        okType: 'button-calm'
                    } );
                    alertPopup.then( function( res ) {
                        console.log( 'No Invoice Report Found.' );
                        $scope.returnMain();
                    } );
                }
            } );
        };
        GetIvcr1s();
    }
] );

appControllers.controller( 'BlCtrl', [ 'ENV', '$scope', '$state', '$ionicPopup', 'DownloadFileService', 'ApiService',
    function( ENV, $scope, $state, $ionicPopup, DownloadFileService, ApiService ) {
        var alertPopup = null;
        $scope.returnMain = function() {
            $state.go( 'index.main', {}, {} );
        };
        $scope.ShowDate = function( utc ) {
            return moment( utc ).format( 'DD-MMM-YYYY' );
        };
        var onPlatformError = function( url ) {
            window.open( url );
        };
        $scope.download = function( Jmjm1, File ) {
            if(is.not.undefined(File)){
                var strFileName = Jmjm1.JobNo + '-' + File.FileName,
                    strURL='',
                    type='';
                if(is.equal(File.Extension,'.pdf')){
                    type = 'application/pdf';
                    strURL = ENV.api + '/api/freight/view/file?eDoc=1&Type=pdf&FolderName=jmjm1&Key=' + Jmjm1.JobNo + '&FileName=' + File.FileName + '&format=json';
                }else if(is.equal(File.Extension,'.txt')){
                    type = 'text/plan';
                    strURL = ENV.api + '/api/freight/view/file?eDoc=1&Type=txt&FolderName=jmjm1&Key=' + Jmjm1.JobNo + '&FileName=' + File.FileName + '&format=json';
                }else if(is.equal(File.Extension,'.jpg')||is.equal(File.Extension,'.png')||is.equal(File.Extension,'.bmp')){
                    type = 'image/jpeg';
                    strURL = ENV.api + '/api/freight/view/file?eDoc=1&Type=img&FolderName=jmjm1&Key=' + Jmjm1.JobNo + '&FileName=' + File.FileName + '&format=json';
                }else {
                    type = 'application/octet-stream';
                    strURL = ENV.api + '/api/freight/view/file?eDoc=1&Type=stream&FolderName=jmjm1&Key=' + Jmjm1.JobNo + '&FileName=' + File.FileName + '&format=json';
                }
                DownloadFileService.Download( strURL, strFileName, type, onPlatformError, null, null );
            }
        };
        var GetJmjm1s = function() {
            var strUri = '/api/freight/view/file/list?FolderName=jmjm1';
            ApiService.GetParam( strUri, true ).then( function success( result ) {
                if ( result.data.results != null && result.data.results.length > 0 ) {
                    $scope.Jmjm1s = result.data.results;
                } else {
                    $scope.Jmjm1s = null;
                    alertPopup = $ionicPopup.alert( {
                        title: 'No BL Report Found.',
                        okType: 'button-calm'
                    } );
                    alertPopup.then( function( res ) {
                        console.log( 'No BL Report Found.' );
                        $scope.returnMain();
                    } );
                }
            } );
        };
        GetJmjm1s();
    }
] );

appControllers.controller( 'AwbCtrl', [ 'ENV', '$scope', '$state', '$ionicPopup', 'DownloadFileService', 'ApiService',
    function( ENV, $scope, $state, $ionicPopup, DownloadFileService, ApiService ) {
        var alertPopup = null;
        $scope.returnMain = function() {
            $state.go( 'index.main', {}, {} );
        };
        $scope.ShowDate = function( utc ) {
            return moment( utc ).format( 'DD-MMM-YYYY' );
        };
        var onPlatformError = function( url ) {
            window.open( url );
        };
        $scope.download = function( Jmjm1, File ) {
            if(is.not.undefined(File)){
                var strFileName = Jmjm1.JobNo + '-' + File.FileName,
                    strURL='',
                    type='';
                if(is.equal(File.Extension,'.pdf')){
                    type = 'application/pdf';
                    strURL = ENV.api + '/api/freight/view/file?eDoc=1&Type=pdf&FolderName=jmjm1&Key=' + Jmjm1.JobNo + '&FileName=' + File.FileName + '&format=json';
                }else if(is.equal(File.Extension,'.txt')){
                    type = 'text/plan';
                    strURL = ENV.api + '/api/freight/view/file?eDoc=1&Type=txt&FolderName=jmjm1&Key=' + Jmjm1.JobNo + '&FileName=' + File.FileName + '&format=json';
                }else if(is.equal(File.Extension,'.jpg')||is.equal(File.Extension,'.png')||is.equal(File.Extension,'.bmp')){
                    type = 'image/jpeg';
                    strURL = ENV.api + '/api/freight/view/file?eDoc=1&Type=img&FolderName=jmjm1&Key=' + Jmjm1.JobNo + '&FileName=' + File.FileName + '&format=json';
                }else {
                    type = 'application/octet-stream';
                    strURL = ENV.api + '/api/freight/view/file?eDoc=1&Type=stream&FolderName=jmjm1&Key=' + Jmjm1.JobNo + '&FileName=' + File.FileName + '&format=json';
                }
                DownloadFileService.Download( strURL, strFileName, type, onPlatformError, null, null );
            }
        };
        var GetJmjm1s = function() {
            var strUri = "/api/freight/view/file/list?FolderName=jmjm1";
            ApiService.GetParam( strUri, true ).then( function success( result ) {
                if ( result.data.results != null && result.data.results.length > 0 ) {
                    $scope.Jmjm1s = result.data.results;
                } else {
                    $scope.Jmjm1s = null;
                    alertPopup = $ionicPopup.alert( {
                        title: 'No AWB Report Found.',
                        okType: 'button-calm'
                    } );
                    alertPopup.then( function( res ) {
                        console.log( 'No AWB Report Found.' );
                        $scope.returnMain();
                    } );
                }
            } );
        };
        GetJmjm1s();
    }
] );

appControllers.controller( 'SOACtrl', [ 'ENV', '$scope', '$state', '$ionicPopup', 'DownloadFileService', 'ApiService',
    function( ENV, $scope, $state, $ionicPopup, DownloadFileService, ApiService ) {
        var alertPopup = null;
        $scope.returnMain = function() {
            $state.go( 'index.main', {}, {} );
        };
        $scope.ShowDate = function( utc ) {
            return moment( utc ).format( 'DD-MMM-YYYY' );
        };
        var onPlatformError = function( url ) {
            window.open( url );
        };
        $scope.download = function( Slcu1, File ) {
            if(is.not.undefined(File)){
                var strFileName = Slcu1.TrxNo + '-' + File.FileName,
                    strURL='',
                    type='';
                if(is.equal(File.Extension,'.pdf')){
                    type = 'application/pdf';
                    strURL = ENV.api + '/api/freight/view/file?eDoc=1&Type=pdf&FolderName=slcu1&Key=' + Slcu1.TrxNo + '&FileName=' + File.FileName + '&format=json';
                }else if(is.equal(File.Extension,'.txt')){
                    type = 'text/plan';
                    strURL = ENV.api + '/api/freight/view/file?eDoc=1&Type=txt&FolderName=slcu1&Key=' + Slcu1.TrxNo + '&FileName=' + File.FileName + '&format=json';
                }else if(is.equal(File.Extension,'.jpg')||is.equal(File.Extension,'.png')||is.equal(File.Extension,'.bmp')){
                    type = 'image/jpeg';
                    strURL = ENV.api + '/api/freight/view/file?eDoc=1&Type=img&FolderName=slcu1&Key=' + Slcu1.TrxNo + '&FileName=' + File.FileName + '&format=json';
                }else {
                    type = 'application/octet-stream';
                    strURL = ENV.api + '/api/freight/view/file?eDoc=1&Type=stream&FolderName=slcu1&Key=' + Slcu1.TrxNo + '&FileName=' + File.FileName + '&format=json';
                }
                DownloadFileService.Download( strURL, strFileName, type, onPlatformError, null, null );
            }
        };
        var GetJmjm1s = function() {
            var strUri = "/api/freight/view/file/list?FolderName=slcu1";
            ApiService.GetParam( strUri, true ).then( function success( result ) {
                if ( result.data.results != null && result.data.results.length > 0 ) {
                    $scope.Slcu1s = result.data.results;
                } else {
                    $scope.Slcu1s = null;
                    alertPopup = $ionicPopup.alert( {
                        title: 'No SOA Report Found.',
                        okType: 'button-calm'
                    } );
                    alertPopup.then( function( res ) {
                        console.log( 'No SOA Report Found.' );
                        $scope.returnMain();
                    } );
                }
            } );
        };
        GetJmjm1s();
    }
] );
