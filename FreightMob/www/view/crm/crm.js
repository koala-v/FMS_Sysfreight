appControllers.controller( 'SalesmanActivityCtrl', [ '$scope', '$state', '$ionicPopup', 'ApiService', 'SALESMANACTIVITY_ORM',
    function( $scope, $state, $ionicPopup, ApiService, SALESMANACTIVITY_ORM ) {
        $scope.Rcsm1 = {
            SalesmanNameLike: SALESMANACTIVITY_ORM.SEARCH.SalesmanNameLike
        };
        var alertPopup = null;
        $scope.Rcsm1.SalesmanNameLike = 'ning';
        $scope.returnMain = function() {
            $state.go( 'index.main', {}, {
                relaod: true
            } );
        };
        $scope.GoToList = function() {
            if ( SALESMANACTIVITY_ORM.SEARCH.SalesmanNameLike != $scope.Rcsm1.SalesmanNameLike ) {
                SALESMANACTIVITY_ORM.init();
                SALESMANACTIVITY_ORM.SEARCH._setKey( $scope.Rcsm1.SalesmanNameLike );
                var strUri = '/api/freight/smsa1/count?SalesmanName=' + $scope.Rcsm1.SalesmanNameLike;
                ApiService.GetParam( strUri, true ).then( function success( result ) {
                    if ( result.data.results > 0 ) {
                        $state.go( 'salesmanActivityList', {
                            'SalesmanNameLike': $scope.Rcsm1.SalesmanNameLike
                        }, {
                            reload: true
                        } );
                    } else {
                        alertPopup = $ionicPopup.alert( {
                            title: 'No Records Found.',
                            okType: 'button-assertive'
                        } );
                    }
                } );
            } else {
                if ( SALESMANACTIVITY_ORM.LIST.Smsa1s.length > 0 ) {
                    $state.go( 'salesmanActivityList', {
                        'SalesmanNameLike': $scope.Rcsm1.SalesmanNameLike
                    }, {
                        reload: true
                    } );
                } else {
                    alertPopup = $ionicPopup.alert( {
                        title: 'No Records Found.',
                        okType: 'button-assertive'
                    } );
                }
            }
        };
        $( '#iSalesmanName' ).on( 'keydown', function( e ) {
            if ( e.which === 9 || e.which === 13 ) {
                if ( alertPopup === null ) {
                    if ( $scope.Rcsm1.SalesmanNameLike.length > 0 ) {
                        $scope.GoToList();
                    } else {
                        alertPopup = $ionicPopup.alert( {
                            title: 'Please Enter Salesman Name.',
                            okType: 'button-calm'
                        } );
                    }
                } else {
                    alertPopup.close();
                    alertPopup = null;
                }
            }
        } );
        //$('#iSalesmanName').focus();
    }
] );

appControllers.controller( 'SalesmanActivityListCtrl', [ '$scope', '$state', '$stateParams', 'ApiService', 'SALESMANACTIVITY_ORM',
    function( $scope, $state, $stateParams, ApiService, SALESMANACTIVITY_ORM ) {
        var RecordCount = 0;
        var dataResults = new Array();
        $scope.List = {
            SalesmanNameLike: SALESMANACTIVITY_ORM.SEARCH.SalesmanNameLike,
            CanLoadedMoreData: true
        };
        if ( $scope.List.SalesmanNameLike === '' ) {
            $scope.List.SalesmanNameLike = $stateParams.SalesmanNameLike;
        }
        $scope.returnSearch = function() {
            $state.go( 'salesmanActivity', {}, {} );
        };
        $scope.GoToDetail = function( Smsa1 ) {
            SALESMANACTIVITY_ORM.DETAIL._setKey( Smsa1.TrxNo );
            $state.go( 'salesmanActivityDetail', {
                'TrxNo': Smsa1.TrxNo,
                'SalesmanNameLike': $scope.List.SalesmanNameLike
            }, {
                reload: true
            } );
        };
        $scope.loadMore = function() {
            var strUri = '/api/freight/smsa1/sps?RecordCount=' + RecordCount;
            if ( $scope.List.SalesmanNameLike != null && $scope.List.SalesmanNameLike.length > 0 ) {
                strUri = strUri + '&SalesmanName=' + $scope.List.SalesmanNameLike;
            }
            ApiService.GetParam( strUri, false ).then( function success( result ) {
                if ( result.data.results.length > 0 ) {
                    dataResults = dataResults.concat( result.data.results );
                    $scope.Smsa1s = dataResults;
                    $scope.List.CanLoadedMoreData = true;
                    RecordCount = RecordCount + 20;
                    SALESMANACTIVITY_ORM.LIST._setObj( $scope.Smsa1s );
                } else {
                    $scope.List.CanLoadedMoreData = false;
                    RecordCount = 0;
                }
                $scope.$broadcast( 'scroll.infiniteScrollComplete' );
            } );
        };
    }
] );

appControllers.controller( 'SalesmanActivityDetailCtrl', [ '$scope', '$state', '$stateParams', 'ApiService', 'SALESMANACTIVITY_ORM',
    function( $scope, $state, $stateParams, ApiService, SALESMANACTIVITY_ORM ) {
        $scope.Detail = {
            TrxNo: SALESMANACTIVITY_ORM.DETAIL.TrxNo
        };
        if ( $scope.Detail.TrxNo === '' ) {
            $scope.Detail.TrxNo = $stateParams.TrxNo;
        }
        $scope.returnList = function() {
            $state.go( 'salesmanActivityList', {
                'SalesmanNameLike': SALESMANACTIVITY_ORM.SEARCH.SalesmanNameLike
            }, {
                reload: true
            } );
        };
        $scope.GoToAdd = function() {
            $state.go( 'salesmanActivityDetailAdd', {
                'TrxNo': $scope.Detail.TrxNo,
                'LineItemNo': $scope.Smsa2s.length + 1
            }, {
                reload: true
            } );
        };
        $scope.GoToEdit = function( Smsa2 ) {
            if ( Smsa2 != SALESMANACTIVITY_ORM.SUBDETAIL.Smsa2 ) {
                SALESMANACTIVITY_ORM.SUBDETAIL._setObj( Smsa2 );
            }
            $state.go( 'salesmanActivityDetailEdit', {
                'TrxNo': $scope.Detail.TrxNo,
                'LineItemNo': Smsa2.LineItemNo
            }, {
                reload: true
            } );
        };
        $scope.GoToDel = function() {
            //
        };
        $scope.ShowDate = function( utc ) {
            return moment( utc ).format( 'DD-MMM-YYYY' );
        };
        var GetSmsa2Detail = function( TrxNo ) {
            //if ( SALESMANACTIVITY_ORM.DETAIL.Smsa2s != null && SALESMANACTIVITY_ORM.DETAIL.Smsa2s.length > 0 && SALESMANACTIVITY_ORM.DETAIL.TrxNo === parseInt( TrxNo ) ) {
            //    $scope.Smsa2s = SALESMANACTIVITY_ORM.DETAIL.Smsa2s;
            //} else {
                var strUri = "/api/freight/smsa2/read?TrxNo=" + TrxNo;
                ApiService.GetParam( strUri, true ).then( function success( result ) {
                    $scope.Smsa2s = result.data.results;
                    SALESMANACTIVITY_ORM.DETAIL._setKey( TrxNo );
                    SALESMANACTIVITY_ORM.DETAIL._setObj( $scope.Smsa2s );
                } );
            //}
        };
        GetSmsa2Detail( $scope.Detail.TrxNo );
    }
] );

appControllers.controller( 'SalesmanActivityDetailEditCtrl', [ '$scope', '$state', '$stateParams', 'ApiService', 'SALESMANACTIVITY_ORM',
    function( $scope, $state, $stateParams, ApiService, SALESMANACTIVITY_ORM ) {
        $scope.Smsa2 = SALESMANACTIVITY_ORM.SUBDETAIL.Smsa2;
        $scope.returnDetail = function() {
            $state.go( 'salesmanActivityDetail', {
                'TrxNo': $scope.Smsa2.TrxNo,
                'SalesmanNameLike': SALESMANACTIVITY_ORM.SEARCH.SalesmanNameLike
            }, {
                reload: true
            } );
        };
        $scope.ShowDate = function( utc ) {
            return moment( utc ).format( 'DD-MMM-YYYY' );
        };
        $scope.returnUpdateSmsa2 = function() {
            var jsonData = {
                "smsa2": $scope.Smsa2
            };
            var strUri = "/api/freight/smsa2/update";
            ApiService.Post( strUri, jsonData, true ).then( function success( result ) {
                $scope.returnDetail();
            } );
        };
    }
] );

appControllers.controller( 'SalesmanActivityDetailAddCtrl', [ '$scope', '$state', '$stateParams', 'ApiService', 'SALESMANACTIVITY_ORM',
    function( $scope, $state, $stateParams, ApiService, SALESMANACTIVITY_ORM ) {
        var currentDate = new Date();
        $scope.Smsa2 = {
            TrxNo: $stateParams.TrxNo,
            LineItemNo: $stateParams.LineItemNo,
            Action: '',
            Conclusion: '',
            CustomerCode: '',
            CustomerName: '',
            DateTime: currentDate,
            Description: '',
            Discussion: '',
            QuotationNo: '',
            Reference: '',
            Remark: '',
            Status: ''
        };
        $scope.returnDetail = function() {
            $state.go( 'salesmanActivityDetail', {
                'TrxNo': $scope.Smsa2.TrxNo,
                'SalesmanNameLike': SALESMANACTIVITY_ORM.SEARCH.SalesmanNameLike
            }, {
                reload: true
            } );
        };
        $scope.ShowDate = function( utc ) {
            return moment( utc ).format( 'DD-MMM-YYYY' );
        };
        $scope.returnInsertSmsa2 = function() {
            var jsonData = {
                "smsa2": $scope.Smsa2
            };
            var strUri = "/api/freight/smsa2/create";
            ApiService.Post( strUri, jsonData, true ).then( function success( result ) {
                if ( SALESMANACTIVITY_ORM.DETAIL.Smsa2s != null && SALESMANACTIVITY_ORM.DETAIL.Smsa2s.length > 0 ) {
                    SALESMANACTIVITY_ORM.DETAIL.Smsa2s.push( $scope.Smsa2 );
                } else {
                    var arrSmsa2s = [];
                    arrSmsa2s.push( $scope.Smsa2 );
                    SALESMANACTIVITY_ORM.DETAIL._setObj( arrSmsa2s );
                }
                $scope.returnDetail();
            } );
        };
    }
] );

appControllers.controller( 'ContactsCtrl', [ '$scope', '$state', '$stateParams', 'CONTACTS_ORM',
    function( $scope, $state, $stateParams, CONTACTS_ORM ) {
        $scope.Rcbp = {
            BusinessPartyNameLike: CONTACTS_ORM.CONTACTS_SEARCH.BusinessPartyNameLike
        };
        $scope.returnMain = function() {
            $state.go( 'index.main', {}, {} );
        };
        $scope.GoToList = function() {
            if ( CONTACTS_ORM.CONTACTS_SEARCH.BusinessPartyNameLike != $scope.Rcbp.BusinessPartyNameLike ) {
                CONTACTS_ORM.init();
                CONTACTS_ORM.CONTACTS_SEARCH._set( $scope.Rcbp.BusinessPartyNameLike );
            }
            $state.go( 'contactsList', {
                'BusinessPartyNameLike': $scope.Rcbp.BusinessPartyNameLike
            }, {
                reload: true
            } );
        };
        $( '#iBusinessPartyName' ).on( 'keydown', function( e ) {
            if ( e.which === 9 || e.which === 13 ) {
                $scope.GoToList();
            }
        } );
        //$('#iBusinessPartyName').focus();
    }
] );

appControllers.controller( 'ContactsListCtrl', [ '$scope', '$state', '$stateParams', '$location', '$ionicScrollDelegate', 'ApiService', 'CONTACTS_ORM',
    function( $scope, $state, $stateParams, $location, $ionicScrollDelegate, ApiService, CONTACTS_ORM ) {
        var RecordCount = 0;
        var dataResults = new Array();
        $scope.ContactsList = {
            BusinessPartyNameLike: CONTACTS_ORM.CONTACTS_SEARCH.BusinessPartyNameLike,
            CanLoadedMoreData: true
        };
        if ( $scope.ContactsList.BusinessPartyNameLike === '' ) {
            $scope.ContactsList.BusinessPartyNameLike = $stateParams.BusinessPartyNameLike;
        }
        $scope.returnSearch = function() {
            $state.go( 'contacts', {}, {} );
        };
        $scope.GoToDetail = function( Rcbp1 ) {
            CONTACTS_ORM.CONTACTS_DETAIL._setId( Rcbp1.TrxNo );
            $state.go( 'contactsDetail', {
                'TrxNo': Rcbp1.TrxNo,
                'BusinessPartyNameLike': $scope.ContactsList.BusinessPartyNameLike
            }, {
                reload: true
            } );
        };
        $scope.loadMore = function() {
            var strUri = "/api/freight/rcbp1/sps?RecordCount=" + RecordCount;
            if ( $scope.ContactsList.BusinessPartyNameLike != null && $scope.ContactsList.BusinessPartyNameLike.length > 0 ) {
                strUri = strUri + "&BusinessPartyName=" + $scope.ContactsList.BusinessPartyNameLike;
            }
            ApiService.GetParam( strUri, false ).then( function success( result ) {
                if ( result.data.results.length > 0 ) {
                    dataResults = dataResults.concat( result.data.results );
                    $scope.Rcbp1s = dataResults;
                    $scope.ContactsList.CanLoadedMoreData = true;
                    RecordCount = RecordCount + 20;
                    CONTACTS_ORM.CONTACTS_LIST._set( $scope.Rcbp1s );
                } else {
                    $scope.ContactsList.CanLoadedMoreData = false;
                    RecordCount = 0;
                }
                $scope.$broadcast( 'scroll.infiniteScrollComplete' );
            } );
        };
    }
] );

appControllers.controller( 'ContactsDetailCtrl', [ 'ENV', '$rootScope', '$scope', '$stateParams', '$state', '$ionicTabsDelegate', '$ionicPopup', '$ionicModal',
    '$cordovaActionSheet', '$cordovaToast', '$cordovaSms', 'ApiService', 'GeoService',
    'OpenUrlService', 'CONTACTS_ORM', 'GEO_CONSTANT',
    function( ENV, $rootScope, $scope, $stateParams, $state, $ionicTabsDelegate, $ionicPopup, $ionicModal,
        $cordovaActionSheet, $cordovaToast, $cordovaSms, ApiService, GeoService,
        OpenUrlService, CONTACTS_ORM, GEO_CONSTANT ) {
        var strmarkerLabel = '';
        $scope.ContactsDetail = {
            TrxNo: CONTACTS_ORM.CONTACTS_DETAIL.TrxNo,
            TabIndex: CONTACTS_ORM.CONTACTS_DETAIL.TabIndex
        };
        if ( $scope.ContactsDetail.TrxNo === '' ) {
            $scope.ContactsDetail.TrxNo = $stateParams.TrxNo;
        }
        $ionicModal.fromTemplateUrl( 'map.html', {
            scope: $scope,
            animation: 'slide-in-up'
        } ).then( function( modal ) {
            $scope.modal = modal;
        } );
        $scope.$on( '$destroy', function() {
            $scope.modal.remove();
        } );
        $scope.returnList = function() {
            $state.go( 'contactsList', {
                'BusinessPartyNameLike': CONTACTS_ORM.CONTACTS_SEARCH.BusinessPartyNameLike
            }, {} );
        };
        $scope.closeMap = function() {
            $scope.modal.hide();
        };
        $scope.showMap = function() {
            $scope.modal.show();
            var height = document.body.scrollHeight - 44 - 44;
            document.getElementById( 'map' ).style.height = height + 'px';
            if ( is.not.empty( $scope.rcbp1.Address1 ) ) {
                strmarkerLabel = $scope.rcbp1.Address1;
            }
            if ( is.not.empty( $scope.rcbp1.Address2 ) ) {
                strmarkerLabel = strmarkerLabel + '<br/>' + $scope.rcbp1.Address2;
            }
            if ( is.not.empty( $scope.rcbp1.Address3 ) ) {
                strmarkerLabel = strmarkerLabel + '<br/>' + $scope.rcbp1.Address3;
            }
            if ( is.not.empty( $scope.rcbp1.Address4 ) ) {
                strmarkerLabel = strmarkerLabel + '<br/>' + $scope.rcbp1.Address4;
            }
            if ( is.equal( ENV.mapProvider, 'baidu' ) && is.not.empty( GEO_CONSTANT.Baidu.point ) ) {
                loadBaidu();
            } else if ( is.equal( ENV.mapProvider, 'google' ) && is.not.empty( GEO_CONSTANT.Google.point ) ) {
                loadGoogle();
            }
        };
        $scope.TabClick = function( index ) {
            $scope.ContactsDetail.TabIndex = index;
            CONTACTS_ORM.CONTACTS_DETAIL._setTab( index );
        };
        $scope.ClickWebUrl = function( url ) {
            OpenUrlService.Open( url );
        };
        $scope.ClickSendSMS = function( num ) {
            /*
            var options = {
                title: num,
                buttonLabels: ['Call', 'Send SMS'],
                addCancelButtonWithLabel: 'Cancel',
                androidEnableCancelButton : true,
                winphoneEnableCancelButton : true
            };
            $cordovaActionSheet.show(options)
            .then(function(btnIndex) {
                var index = btnIndex;
                if(index === 2){
                    var options = {
                        replaceLineBreaks: false, // true to replace \n by a new line, false by default
                        android: {
                            intent: 'INTENT'  // send SMS with the native android SMS messaging
                            //intent: '' // send SMS without open any other app
                        }
                    };
                    $cordovaSms.send(num, '', options)
                    .then(function() {
                        $cordovaToast.showShortBottom('Message sent successfully');
                    }, function(error) {
                        $cordovaToast.showShortBottom('Message Failed:' + error);
                    });
                }else{
                    //$window.location.href = "tel:" + num;
                }
            });
            */
            var options = {
                replaceLineBreaks: false, // true to replace \n by a new line, false by default
                android: {
                    intent: 'INTENT' // send SMS with the native android SMS messaging
                        //intent: '' // send SMS without open any other app
                }
            };
            $cordovaSms.send( num, '', options )
                .then( function() {
                    //$cordovaToast.showShortBottom('Message sent successfully');
                }, function( error ) {
                    //$cordovaToast.showShortBottom('Message Failed:' + error);
                } );
        };
        $scope.GoToCustomerEdit = function() {
            $state.go( 'contactsDetailEdit', {}, {
                reload: true
            } );
        };
        $scope.GoToContactInfo = function( rcbp3 ) {
            if ( rcbp3 != CONTACTS_ORM.CONTACTS_SUBDETAIL.Rcbp3 ) {
                CONTACTS_ORM.CONTACTS_SUBDETAIL._setObj( rcbp3 );
            }
            $state.go( 'contactsInfo', {
                'BusinessPartyCode': rcbp3.BusinessPartyCode,
                'LineItemNo': rcbp3.LineItemNo
            }, {
                reload: true
            } );
        };
        $scope.GoToContactDel = function( index, rcbp3 ) {
            var confirmPopup = $ionicPopup.confirm( {
                title: '',
                template: 'Are you sure to DELETE this contact?'
            } );
            confirmPopup.then( function( res ) {
                if ( res ) {
                    var strUri = "/api/freight/rcbp3/delete?BusinessPartyCode=" + rcbp3.BusinessPartyCode + "&LineItemNo=" + rcbp3.LineItemNo;
                    ApiService.GetParam( strUri, true ).then( function success( result ) {
                        if ( result.data.results > 0 ) {
                            $scope.rcbp3s.splice( index, 1 );
                        }
                    } );
                    console.log( 'Del Rcbp3 ' + rcbp3.BusinessPartyCode + ' at ' + rcbp3.LineItemNo );
                }
            } );
        };
        $scope.GoToContactAdd = function( rcbp3s ) {
            var len = 0;
            if(!is.empty(rcbp3s)){
                len = rcbp3s.length;
            }
            $state.go( 'contactsInfoAdd', {
                'BusinessPartyCode': $scope.rcbp1.BusinessPartyCode,
                'LineItemNo': len + 1
            }, {
                reload: true
            } );
        };
        $scope.ShowDate = function( utc ) {
            return moment( utc ).format( 'DD-MMM-YYYY' );
        };
        var GetRcbp3s = function( BusinessPartyCode ) {
            if ( CONTACTS_ORM.CONTACTS_SUBLIST.Rcbp3s != null && CONTACTS_ORM.CONTACTS_SUBLIST.Rcbp3s.length > 0 && CONTACTS_ORM.CONTACTS_SUBLIST.BusinessPartyCode === BusinessPartyCode ) {
                $scope.rcbp3s = CONTACTS_ORM.CONTACTS_SUBLIST.Rcbp3s;
            } else {
                var strUri = '/api/freight/rcbp3/read?BusinessPartyCode=' + BusinessPartyCode;
                ApiService.GetParam( strUri, false ).then( function success( result ) {
                    $scope.rcbp3s = result.data.results;
                    CONTACTS_ORM.CONTACTS_SUBLIST._setId( BusinessPartyCode );
                    CONTACTS_ORM.CONTACTS_SUBLIST._setArr( $scope.rcbp3s );
                } );
            }
        };
        var GetRcbp1 = function( TrxNo ) {
            if ( CONTACTS_ORM.CONTACTS_DETAIL.Rcbp1 != null && CONTACTS_ORM.CONTACTS_DETAIL.Rcbp1.TrxNo === parseInt( TrxNo ) ) {
                $scope.rcbp1 = CONTACTS_ORM.CONTACTS_DETAIL.Rcbp1;
                GetRcbp3s( $scope.rcbp1.BusinessPartyCode );
            } else {
                var strUri = '/api/freight/rcbp1/read?TrxNo=' + TrxNo;
                ApiService.GetParam( strUri, true ).then( function success( result ) {
                    if ( is.not.undefined( result ) ) {
                        $scope.rcbp1 = result.data.results[ 0 ];
                        CONTACTS_ORM.CONTACTS_DETAIL._setId( TrxNo );
                        CONTACTS_ORM.CONTACTS_DETAIL._setObj( $scope.rcbp1 );
                        GetRcbp3s( $scope.rcbp1.BusinessPartyCode );
                    }
                } );
            }
        };
        GetRcbp1( $scope.ContactsDetail.TrxNo );
        $rootScope.$on('AddRcbp3', function() {
            $scope.rcbp3s = CONTACTS_ORM.CONTACTS_SUBLIST.Rcbp3s;
        });
        //
        function loadBaidu() {
            var map = new BMap.Map( 'map', {
                minZoom: 8,
                maxZoom: 20
            } );
            var point = new BMap.Point( GEO_CONSTANT.Baidu.point.lat, GEO_CONSTANT.Baidu.point.lng );
            map.centerAndZoom( point, 16 );
            var mk = new BMap.Marker( point );
            if ( is.not.empty( strmarkerLabel ) ) {
                var opts = {
                    position: point,
                    offset: new BMap.Size( 20, -20 )
                }
                var label = new BMap.Label( strmarkerLabel, opts );
                mk.setLabel( label );
            }
            map.addOverlay( mk );
            map.panTo( point );
            map.enableScrollWheelZoom( true );
        }

        function loadGoogle() {
            var pos = {
                lat: GEO_CONSTANT.Google.point.lat,
                lng: GEO_CONSTANT.Google.point.lng
            };
            var mapOptions = {
                zoom: 14,
                mapTypeId: google.maps.MapTypeId.ROADMAP
            };
            var map = new google.maps.Map( document.getElementById( 'map' ), mapOptions );
            var infoWindow = new google.maps.InfoWindow( {
                map: map
            } );
            infoWindow.setPosition( pos );
            infoWindow.setContent( strmarkerLabel );
            map.setCenter( pos );
        }
    }
] );

appControllers.controller( 'ContactsDetailEditCtrl', [ '$scope', '$stateParams', '$state', 'ApiService', 'CONTACTS_ORM',
    function( $scope, $stateParams, $state, ApiService, CONTACTS_ORM ) {
        $scope.rcbp1 = CONTACTS_ORM.CONTACTS_DETAIL.Rcbp1;
        $scope.returnDetail = function() {
            $state.go( 'contactsDetail', {
                'TrxNo': $scope.rcbp1.TrxNo
            }, {
                reload: true
            } );
        };
        $scope.returnUpdateRcbp1 = function() {
            var jsonData = {
                "rcbp1": $scope.rcbp1
            };
            var strUri = "/api/freight/rcbp1/update";
            ApiService.Post( strUri, jsonData, true ).then( function success( result ) {
                $scope.returnDetail();
            } );
        };
    }
] );

appControllers.controller( 'ContactsInfoCtrl', [ '$scope', '$state', '$stateParams', 'CONTACTS_ORM',
    function( $scope, $state, $stateParams, CONTACTS_ORM ) {
        $scope.rcbp3 = CONTACTS_ORM.CONTACTS_SUBDETAIL.Rcbp3;
        $scope.returnDetail = function() {
            $state.go( 'contactsDetail', {
                'TrxNo': CONTACTS_ORM.CONTACTS_DETAIL.TrxNo
            }, {
                reload: true
            } );
        };
        $scope.GoToContactEdit = function() {
            $state.go( 'contactsInfoEdit', {}, {
                reload: true
            } );
        };
        $scope.blnContainNameCard = function( rcbp3 ) {
            if ( typeof( rcbp3 ) == "undefined" ) return false;
            if ( typeof( rcbp3.NameCard ) == "undefined" ) return false;
            if ( rcbp3.NameCard.length > 0 ) {
                return true;
            } else {
                return false;
            }
        };
    }
] );

appControllers.controller( 'ContactsInfoAddCtrl', [ '$rootScope', '$scope', '$state', '$stateParams', 'ApiService', 'CONTACTS_ORM',
    function( $rootScope, $scope, $state, $stateParams, ApiService, CONTACTS_ORM ) {
        $scope.rcbp3 = {
            BusinessPartyCode: $stateParams.BusinessPartyCode,
            LineItemNo: $stateParams.LineItemNo,
            ContactName: '',
            Department: '',
            Dislike: '',
            Email: '',
            Facebook: '',
            Fax: '',
            Handphone: '',
            Like: '',
            MSN: '',
            Others: '',
            QQ: '',
            Skype: '',
            Telephone: '',
            Title: '',
            Twitter: ''
        };
        $scope.returnDetail = function() {
            $state.go( 'contactsDetail', {
                'TrxNo': CONTACTS_ORM.CONTACTS_DETAIL.TrxNo
            }, {
                reload: true
            } );
        };
        $scope.returnInsertRcbp3 = function() {
            /*
            if ( CONTACTS_ORM.CONTACTS_SUBLIST.Rcbp3s != null && CONTACTS_ORM.CONTACTS_SUBLIST.Rcbp3s.length > 0 ) {
                CONTACTS_ORM.CONTACTS_SUBLIST.Rcbp3s.push( $scope.rcbp3 );
            } else {
                var arrRcbp3s = [];
                arrRcbp3s.push( $scope.rcbp3 );
                CONTACTS_ORM.CONTACTS_SUBLIST._setArr( arrRcbp3s );
            }
            */
            var jsonData = {
                "rcbp3": $scope.rcbp3
            };
            var strUri = "/api/freight/rcbp3/create";
            ApiService.Post( strUri, jsonData, true ).then( function success( result ) {
                if ( CONTACTS_ORM.CONTACTS_SUBLIST.Rcbp3s != null && CONTACTS_ORM.CONTACTS_SUBLIST.Rcbp3s.length > 0 ) {
                    CONTACTS_ORM.CONTACTS_SUBLIST.Rcbp3s.push( $scope.rcbp3 );
                } else {
                    var arrRcbp3s = [];
                    arrRcbp3s.push( $scope.rcbp3 );
                    CONTACTS_ORM.CONTACTS_SUBLIST._setArr( arrRcbp3s );
                }
                $rootScope.$broadcast('AddRcbp3');
                $scope.returnDetail();
            } );
            //$scope.returnDetail();
        };
    }
] );

appControllers.controller( 'ContactsInfoEditCtrl', [ '$scope', '$state', '$stateParams', 'ApiService', 'CONTACTS_ORM',
    function( $scope, $state, $stateParams, ApiService, CONTACTS_ORM ) {
        var weekDaysList = [ "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat" ];
        $scope.datepickerObject = {};
        $scope.datepickerObject.inputDate = new Date();
        $scope.datepickerObjectModal = {
            modalHeaderColor: 'bar-positive',
            modalFooterColor: 'bar-positive',
            templateType: 'modal',
            inputDate: $scope.datepickerObject.inputDate,
            mondayFirst: true,
            weekDaysList: weekDaysList,
            from: new Date( 1916, 1, 1 ),
            to: new Date(),
            callback: function( val ) { //Optional
                datePickerCallbackModal( val );
            }
        };
        var datePickerCallbackModal = function( val ) {
            if ( typeof( val ) === 'undefined' ) {
                console.log( 'No date selected' );
            } else {
                $scope.datepickerObjectModal.inputDate = val;
                console.log( 'Selected date is : ', val )
            }
        };
        $scope.rcbp3 = CONTACTS_ORM.CONTACTS_SUBDETAIL.Rcbp3;
        $scope.returnInfo = function() {
            $state.go( 'contactsInfo', {}, {
                reload: true
            } );
        };
        $scope.returnUpdateRcbp3 = function() {
            var jsonData = {
                "rcbp3": $scope.rcbp3
            };
            var strUri = "/api/freight/rcbp3/update";
            ApiService.Post( strUri, jsonData, true ).then( function success( result ) {
                $scope.returnInfo();
            } );
        };
    }
] );

appControllers.controller( 'SalesCostCtrl', [ '$scope', '$state', '$stateParams', '$ionicPopup', 'ApiService', 'SALES_ORM',
    function( $scope, $state, $stateParams, $ionicPopup, ApiService, SALES_ORM ) {
        var alertPopup = null;
        $scope.Search = {
            Type: SALES_ORM.SEARCH.Type,
            PartyName: SALES_ORM.SEARCH.Smct.PartyName,
            PartyNameSales: SALES_ORM.SEARCH.Smct.PartyName,
            PartyNameCost: SALES_ORM.SEARCH.Smct.PartyName,
            PortOfLoadingCode: SALES_ORM.SEARCH.Smct.PortOfLoadingCode,
            PortOfDischargeCode: SALES_ORM.SEARCH.Smct.PortOfDischargeCode,
            EffectiveDate: SALES_ORM.SEARCH.Smct.EffectiveDate,
            ExpiryDate: SALES_ORM.SEARCH.Smct.ExpiryDate,
            ModuleCode: SALES_ORM.SEARCH.Smct.ModuleCode,
            JobType: SALES_ORM.SEARCH.Smct.JobType
        };
        $scope.returnMain = function() {
            $state.go( 'index.main', {}, {
                relaod: true
            } );
        };
        $scope.GoToList = function() {
            if(is.equal($scope.Search.Type,'Sales')){
                $scope.Search.PartyName = $scope.Search.PartyNameSales;
            }else{
                $scope.Search.PartyName = $scope.Search.PartyNameCost;
            }
            if ( is.undefined( $scope.Search.PartyName ) ) {
                $scope.Search.PartyName = '';
            }
            if ( is.undefined( $scope.Search.PortOfLoadingCode ) ) {
                $scope.Search.PortOfLoadingCode = '';
            }
            if ( is.undefined( $scope.Search.PortOfDischargeCode ) ) {
                $scope.Search.PortOfDischargeCode = '';
            }
            if ( is.undefined( $scope.Search.EffectiveDate ) ) {
                $scope.Search.EffectiveDate = '';
            }
            if ( is.undefined( $scope.Search.ExpiryDate ) ) {
                $scope.Search.ExpiryDate = '';
            }
            if ( is.undefined( $scope.Search.ModuleCode ) ) {
                $scope.Search.ModuleCode = '';
            }
            if ( is.undefined( $scope.Search.JobType ) ) {
                $scope.Search.JobType = '';
            }
            if (
                is.not.equal( $scope.Search.PartyName, SALES_ORM.SEARCH.Smct.PartyName ) ||
                is.not.equal( $scope.Search.PortOfLoadingCode, SALES_ORM.SEARCH.Smct.PortOfLoadingCode ) ||
                is.not.equal( $scope.Search.PortOfDischargeCode, SALES_ORM.SEARCH.Smct.PortOfDischargeCode ) ||
                is.not.equal( $scope.Search.EffectiveDate, SALES_ORM.SEARCH.Smct.EffectiveDate ) ||
                is.not.equal( $scope.Search.ExpiryDate, SALES_ORM.SEARCH.Smct.ExpiryDate ) ||
                is.not.equal( $scope.Search.ModuleCode, SALES_ORM.SEARCH.Smct.ModuleCode ) ||
                is.not.equal( $scope.Search.JobType, SALES_ORM.SEARCH.Smct.JobType )
            ) {
                SALES_ORM.SEARCH.setSmct( $scope.Search );
                $state.go( 'salesCostList', {}, {
                    reload: true
                } );
            } else {
                if ( is.not.empty( SALES_ORM.LIST.Smct1s ) ) {
                    $state.go( 'salesCostList', {}, {
                        reload: true
                    } );
                } else {
                    alertPopup = $ionicPopup.alert( {
                        title: 'No Records Found.',
                        okType: 'button-assertive'
                    } );
                }
            }
        };
        $( '#iPNS' ).on( 'keydown', function( e ) {
            if ( e.which === 9 || e.which === 13 ) {
                if ( alertPopup === null ) {
                    $scope.GoToList();
                } else {
                    alertPopup.close();
                    alertPopup = null;
                }
            }
        } );
        $( '#iPNC' ).on( 'keydown', function( e ) {
            if ( e.which === 9 || e.which === 13 ) {
                if ( alertPopup === null ) {
                    $scope.GoToList();
                } else {
                    alertPopup.close();
                    alertPopup = null;
                }
            }
        } );
        $( '#iPOL' ).on( 'keydown', function( e ) {
            if ( e.which === 9 || e.which === 13 ) {
                if ( alertPopup === null ) {
                    $scope.GoToList();
                } else {
                    alertPopup.close();
                    alertPopup = null;
                }
            }
        } );
        $( '#iPOD' ).on( 'keydown', function( e ) {
            if ( e.which === 9 || e.which === 13 ) {
                if ( alertPopup === null ) {
                    $scope.GoToList();
                } else {
                    alertPopup.close();
                    alertPopup = null;
                }
            }
        } );
        $( '#iEffectiveDate' ).on( 'keydown', function( e ) {
            if ( e.which === 9 || e.which === 13 ) {
                if ( alertPopup === null ) {
                    $scope.GoToList();
                } else {
                    alertPopup.close();
                    alertPopup = null;
                }
            }
        } );
        $( '#iExpiryDate' ).on( 'keydown', function( e ) {
            if ( e.which === 9 || e.which === 13 ) {
                if ( alertPopup === null ) {
                    $scope.GoToList();
                } else {
                    alertPopup.close();
                    alertPopup = null;
                }
            }
        } );
        $( '#iModule' ).on( 'keydown', function( e ) {
            if ( e.which === 9 || e.which === 13 ) {
                if ( alertPopup === null ) {
                    $scope.GoToList();
                } else {
                    alertPopup.close();
                    alertPopup = null;
                }
            }
        } );
        $( '#iJobType' ).on( 'keydown', function( e ) {
            if ( e.which === 9 || e.which === 13 ) {
                if ( alertPopup === null ) {
                    $scope.GoToList();
                } else {
                    alertPopup.close();
                    alertPopup = null;
                }
            }
        } );
    }
] );

appControllers.controller( 'SalesCostListCtrl', [ '$scope', '$state', '$stateParams', 'ApiService', 'SALES_ORM',
    function( $scope, $state, $stateParams, ApiService, SALES_ORM ) {
        var RecordCount = 0;
        var dataResults = new Array();
        $scope.Search = {
            Type: SALES_ORM.SEARCH.Type,
            PartyName: SALES_ORM.SEARCH.Smct.PartyName,
            PortOfLoadingCode: SALES_ORM.SEARCH.Smct.PortOfLoadingCode,
            PortOfDischargeCode: SALES_ORM.SEARCH.Smct.PortOfDischargeCode,
            EffectiveDate: SALES_ORM.SEARCH.Smct.EffectiveDate,
            ExpiryDate: SALES_ORM.SEARCH.Smct.ExpiryDate,
            ModuleCode: SALES_ORM.SEARCH.Smct.ModuleCode,
            JobType: SALES_ORM.SEARCH.Smct.JobType
        };
        $scope.List = {
            CanLoadedMoreData: true
        };
        $scope.ShowDate = function( utc ) {
            return moment( utc ).format( 'DD-MMM-YYYY' );
        };
        $scope.returnSearch = function() {
            $state.go( 'salesCost', {}, {
                reload: true
            } );
        };
        $scope.GoToDetail = function( Smct1 ) {
            SALES_ORM.DETAIL._setKey( Smct1.TrxNo );
            SALES_ORM.DETAIL._setObj( Smct1 );
            $state.go( 'salesCostDetail', {}, {
                reload: true
            } );
        };
        $scope.loadMore = function() {
            var strUri = "/api/freight/smct1/sps?RecordCount=" + RecordCount;
            if ( is.not.empty( $scope.Search.Type ) ) {
                if ( is.equal( $scope.Search.Type, 'Sales' ) ) {
                    strUri = strUri + "&TableType=S";
                }else if ( is.equal( $scope.Search.Type, 'Cost' ) ) {
                    strUri = strUri + "&TableType=C";
                }
            }
            if ( is.not.empty( $scope.Search.PartyName ) ) {
                strUri = strUri + "&PartyName=" + $scope.Search.PartyName;
            }
            if ( is.not.empty( $scope.Search.PortOfLoadingCode ) ) {
                strUri = strUri + "&PortOfLoadingCode=" + $scope.Search.PortOfLoadingCode;
            }
            if ( is.not.empty( $scope.Search.PortOfDischargeCode ) ) {
                strUri = strUri + "&PortOfDischargeCode=" + $scope.Search.PortOfDischargeCode;
            }
            if ( is.not.empty( $scope.Search.EffectiveDate ) ) {
                strUri = strUri + "&EffectiveDate=" + $scope.Search.EffectiveDate;
            }
            if ( is.not.empty( $scope.Search.ExpiryDate ) ) {
                strUri = strUri + "&ExpiryDate=" + $scope.Search.ExpiryDate;
            }
            if ( is.not.empty( $scope.Search.ModuleCode ) ) {
                strUri = strUri + "&ModuleCode=" + $scope.Search.ModuleCode;
            }
            if ( is.not.empty( $scope.Search.JobType ) ) {
                strUri = strUri + "&JobType=" + $scope.Search.JobType;
            }
            ApiService.GetParam( strUri, false ).then( function success( result ) {
                if ( result.data.results.length > 0 ) {
                    dataResults = dataResults.concat( result.data.results );
                    $scope.Smct1s = dataResults;
                    $scope.List.CanLoadedMoreData = true;
                    RecordCount = RecordCount + 20;
                    SALES_ORM.LIST._set( $scope.Smct1s );
                } else {
                    $scope.List.CanLoadedMoreData = false;
                    RecordCount = 0;
                }
                $scope.$broadcast( 'scroll.infiniteScrollComplete' );
            } );
        };
    }
] );

appControllers.controller( 'SalesCostDetailCtrl', [ '$scope', '$state', '$stateParams', '$ionicPopup', 'ApiService', 'SALES_ORM',
    function( $scope, $state, $stateParams, $ionicPopup, ApiService, SALES_ORM ) {
        var alertPopup = null;
        $scope.Smct1 = SALES_ORM.DETAIL.Smct1;
        $scope.Detail = {
            TrxNo: SALES_ORM.DETAIL.TrxNo
        };
        $scope.returnList = function() {
            $state.go( 'salesCostList', {}, {
                reload: true
            } );
        };
        $scope.ShowDate = function( utc ) {
            return moment( utc ).format( 'DD-MMM-YYYY' );
        };
        var GetSmct2Detail = function( TrxNo ) {
            //if ( is.not.empty( SALES_ORM.DETAIL.Smct2s ) && SALES_ORM.DETAIL.TrxNo === parseInt( TrxNo ) ) {
            //    $scope.Smct2s = SALES_ORM.DETAIL.Smct2s;
            //} else {
                var strUri = "/api/freight/smct2?TrxNo=" + TrxNo;
                ApiService.GetParam( strUri, true ).then( function success( result ) {
                    $scope.Smct2s = result.data.results;
                    if ( is.empty( $scope.Smct2s ) ) {
                        alertPopup = $ionicPopup.alert( {
                            title: 'No Records Found.',
                            okType: 'button-calm'
                        } );
                        alertPopup.then( function( res ) {
                            console.log( 'No Records Found.' );
                            $scope.returnList();
                        } );
                    } else {
                        SALES_ORM.DETAIL._setObjs( $scope.Smct2s );
                    }
                } );
            //}
        };
        GetSmct2Detail( $scope.Detail.TrxNo );
    }
] );
