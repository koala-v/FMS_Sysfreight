appControllers.controller( 'PaymentApprovalCtrl', [ '$scope', '$state',
    function( $scope, $state ) {
        $scope.PA = {
            VoucherNo: '',
            VendorName: ''
        };
        $scope.returnMain = function() {
            $state.go( 'index.main', {}, {} );
        };
        $scope.GoToList = function( TypeName ) {
            var FilterName = '';
            var FilterValue = '';
            if ( TypeName === 'Voucher No' ) {
                FilterValue = $scope.PA.VoucherNo;
                FilterName = 'VoucherNo'
            } else if ( TypeName === 'Vendor Name' ) {
                FilterValue = $scope.PA.VendorName;
                FilterName = 'VendorName'
            }
            $state.go( 'paymentApprovalList', {
                'FilterName': FilterName,
                'FilterValue': FilterValue
            }, {
                reload: true
            } );
        };
        $( '#iVoucherNo' ).on( 'keydown', function( e ) {
            if ( e.which === 9 || e.which === 13 ) {
                $scope.GoToList( 'Voucher No' );
            }
        } );
        $( '#iVendorName' ).on( 'keydown', function( e ) {
            if ( e.which === 9 || e.which === 13 ) {
                $scope.GoToList( 'Vendor Name' );
            }
        } );
    }
] );

appControllers.controller( 'PaymentApprovalListCtrl', [ '$scope', '$state', '$stateParams', '$ionicPopup', 'ApiService',
    function( $scope, $state, $stateParams, $ionicPopup, ApiService ) {
        var RecordCount = 0;
        var dataResults = new Array();
        $scope.Filter = {
            FilterName: $stateParams.FilterName,
            FilterValue: $stateParams.FilterValue,
            CanLoadedMoreData: true,
            IsSelectAll: false
        };
        $scope.plviStatus = {
            text: 'USE',
            checked: false
        };
        $scope.returnSearch = function() {
            $state.go( 'paymentApproval', {}, {} );
        };
        $scope.funcShowDate = function( utc ) {
            return moment( utc ).format( 'DD-MMM-YYYY' );
        };
        $scope.showApproval = function() {
            if ( $scope.plviStatus.text === 'USE' ) {
                var appPlvi1 = [];
                for ( var i = 0; i <= $scope.plvi1s.length - 1; i++ ) {
                    if ( $scope.plvi1s[ i ].StatusCode === 'APP' ) {
                        appPlvi1.push( $scope.plvi1s[ i ] );
                    }
                }

                if ( appPlvi1.length > 0 ) {
                  var appPlvi2={
                    TrxNo:1
                  };
                    var jsonData = {
                         'plvi1s': appPlvi2

                    };
                    var strUri = "/api/freight/plvi1/update";
                    ApiService.Post( strUri, jsonData, true ).then( function success( result ) {
                        var removeApp = function( plvi1s ) {
                            for ( var i = 0; i <= plvi1s.length - 1; i++ ) {
                                if ( plvi1s[ i ].StatusCode === 'APP' ) {
                                    $scope.plvi1s.splice( i, 1 );
                                    removeApp( $scope.plvi1s );
                                    break;
                                }
                            }
                        };
                        removeApp( $scope.plvi1s );
                        var alertPopup = $ionicPopup.alert( {
                            title: "Approval Successfully!",
                            okType: 'button-calm'
                        } );
                    }, function error( error ) {
                        var strError = '';
                        if ( error === null ) {
                            strError = 'Approval Failed! XHR Error 500.';
                        } else {
                            strError = 'Approval Failed! ' + error;
                        }
                        var alertPopup = $ionicPopup.alert( {
                            title: strError,
                            okType: 'button-assertive'
                        } );
                        alertPopup.then( function( res ) {
                            console.log( strError );
                        } );
                    } );
                }
            }
        };
        $scope.plviStatusChange = function() {
            if ( $scope.plviStatus.checked ) {
                $scope.plviStatus.text = "APP";
            } else {
                $scope.plviStatus.text = "USE";
            }
            RecordCount = 0;
            dataResults = new Array();
            $scope.Filter.CanLoadedMoreData = true;
            $scope.plvi1s = dataResults;
            $scope.loadMore();
        };
        $scope.ClickSelect = function( Plvi1 ) {
            if ( $scope.plviStatus.text != 'USE' ) {
                Plvi1.IsSelected = false;
            } else {
                if ( Plvi1.IsSelected ) {
                    Plvi1.StatusCode = 'APP';
                } else {
                    Plvi1.StatusCode = 'USE';
                }
            }
        };
        $scope.ClickSelectAll = function() {
            if ( $scope.plvi1s != null && $scope.plvi1s.length > 0 && $scope.plviStatus.text === 'USE' ) {
                $scope.Filter.IsSelectAll = !$scope.Filter.IsSelectAll;
                if ( $scope.Filter.IsSelectAll ) {
                    for ( var i = 0; i <= $scope.plvi1s.length - 1; i++ ) {
                        $scope.plvi1s[ i ].IsSelected = true;
                        $scope.plvi1s[ i ].StatusCode = 'APP';
                    }
                } else {
                    for ( var i = 0; i <= $scope.plvi1s.length - 1; i++ ) {
                        $scope.plvi1s[ i ].IsSelected = false;
                        $scope.plvi1s[ i ].StatusCode = 'USE';
                    }
                }
            }
        };
        $scope.loadMore = function() {
            var strUri = "/api/freight/plvi1/sps?RecordCount=" + RecordCount + "&StatusCode=" + $scope.plviStatus.text
            if ( $scope.Filter.FilterValue != null && $scope.Filter.FilterValue.length > 0 ) {
                if ( $scope.Filter.FilterName === "VoucherNo" ) {
                    strUri = strUri + "&VoucherNo=" + $scope.Filter.FilterValue;
                } else {
                    strUri = strUri + "&VendorName=" + $scope.Filter.FilterValue;
                }
            }
            ApiService.GetParam( strUri, false ).then( function success( result ) {
                if ( result.data.results.length > 0 ) {
                    dataResults = dataResults.concat( result.data.results );
                    $scope.plvi1s = dataResults;
                    $scope.Filter.CanLoadedMoreData = true;
                    RecordCount = RecordCount + 20;
                } else {
                    $scope.Filter.CanLoadedMoreData = false;
                    RecordCount = 0;
                }
                $scope.$broadcast( 'scroll.infiniteScrollComplete' );
            } );
        };
    }
] );

appControllers.controller( 'MemoCtrl', [ '$scope', '$state', '$stateParams', '$ionicPopup', 'ApiService',
    function( $scope, $state, $stateParams, $ionicPopup, ApiService ) {
        $scope.Saus1 = {
            UserID: sessionStorage.getItem( 'UserId' ),
            Memo: ''
        };
        if ( $scope.Saus1.UserID === null ) {
            $scope.Saus1.UserID = 's';
        }
        var alertPopup = null;
        $scope.returnMain = function() {
            $state.go( 'index.main', {}, {} );
        };
        $scope.returnUpdateMemo = function() {
            if ( alertPopup === null ) {
                var jsonData = {
                    'saus1': $scope.Saus1
                };
                var strUri = '/api/freight/saus1/memo';
                ApiService.Post( strUri, jsonData, true ).then( function success( result ) {
                    alertPopup = $ionicPopup.alert( {
                        title: 'Save Successfully!',
                        okType: 'button-calm'
                    } );
                } );
            } else {
                alertPopup.close();
                alertPopup = null;
            }
        };
        var GetSaus1 = function( uid ) {
            var strUri = '/api/freight/saus1/memo?userID=' + uid;
            ApiService.GetParam( strUri, true ).then( function success( result ) {
                $scope.Saus1.Memo = result.data.results;
            } );
        };
        GetSaus1( $scope.Saus1.UserID );
    }
] );

appControllers.controller( 'ReminderCtrl', [ '$scope', '$state', '$stateParams', 'ApiService',
    function( $scope, $state, $stateParams, ApiService ) {
        $scope.returnMain = function() {
            $state.go( 'index.main', {}, {} );
        };
        $scope.items = [ {
            id: 1,
            Subject: 'Payment Voucher need Approve',
            Message: 'Please help to approve the ref no : PV15031841',
            CreateBy: 'S',
            UserID: 'S',
            DueDate: 'Nov 14,2015',
            DueTime: '11:20'
        }, {
            id: 2,
            Subject: 'Email to Henry',
            Message: 'Need email to henry for the new request for the mobile at the monring.',
            CreateBy: 'S',
            UserID: 'S',
            DueDate: 'Nov 16,2015',
            DueTime: '09:20'
        } ];
    }
] );

appControllers.controller( 'DocumentScanCtrl', [ 'ENV', '$scope', '$state', '$stateParams', '$timeout', '$ionicPopup', '$ionicModal', '$ionicLoading', '$ionicActionSheet', '$cordovaCamera', '$cordovaBarcodeScanner', '$cordovaImagePicker', '$cordovaFile', '$cordovaFileTransfer', 'ApiService',
    function( ENV, $scope, $state, $stateParams, $timeout, $ionicPopup, $ionicModal, $ionicLoading, $ionicActionSheet, $cordovaCamera, $cordovaBarcodeScanner, $cordovaImagePicker, $cordovaFile, $cordovaFileTransfer, ApiService ) {
        var alertPopup = null, canvas = null, context = null;
        $scope.Doc = {
            JobNo: 'SE07731-03',
            Jmjm1s: {}
        };
        $scope.capture = null, $scope.modal_camera = null;
        var showPopup = function( title, type, callback ) {
            if ( alertPopup != null ) {
                alertPopup.close();
                alertPopup = null;
            }
            alertPopup = $ionicPopup.alert( {
                title: title,
                okType: 'button-' + type
            } );
            alertPopup.then( function( res ) {
                if(typeof(callback)=='function') callback(res);
            } );
        };
        var showCamera = function(type) {
            $ionicLoading.show();
            var sourceType = Camera.PictureSourceType.CAMERA;
            if(is.equal(type,1)){
                sourceType = Camera.PictureSourceType.SAVEDPHOTOALBUM;
            }
            var options = {
                quality: 100,
                destinationType: Camera.DestinationType.FILE_URI,
                sourceType: sourceType,
                allowEdit: false,
                encodingType: Camera.EncodingType.JPEG,
                //targetWidth: 768,
                //targetHeight: 1024,
                mediaType: Camera.MediaType.PICTURE,
                cameraDirection: Camera.Direction.BACK,
                //popoverOptions: new CameraPopoverOptions(300, 300, 100, 100, Camera.PopoverArrowDirection.ARROW_ANY),
                saveToPhotoAlbum: true
                //correctOrientation:true
            };
            try{
                //$cordovaCamera.cleanup().then( function(){
                    $cordovaCamera.getPicture( options ).then( function( imageUri ) {
                        var url = ENV.api + '/api/freight/upload/img?JobNo=' + $scope.Doc.JobNo;
                        var filePath = imageUri,
                            trustHosts = true,
                            options = { fileName: moment().format( 'YYYY-MM-DD-HH-mm-ss' ).toString() + '.jpg' };
                            //newFile = ENV.rootPath + '/' + moment().format( 'YYYY-MM-DD-HH-mm-ss' ).toString() + '.jpg';
                        //$cordovaFile.moveFile(cordova.file.externalRootDirectory, filePath, cordova.file.externalRootDirectory, newFile)
                        //    .then(function (success){
                        $cordovaFileTransfer.upload(url, filePath, options, trustHosts)
                            .then(function(result) {
                                $ionicLoading.hide();
                                showPopup( 'Upload Successfully', 'calm' );
                            }, function(err) {
                                $ionicLoading.hide();
                                console.error( err );
                                showPopup( err.message, 'assertive' );
                            }, function (progress) {
                            // constant progress updates
                            });
                            //}, function (error){
                            //    console.error( error );
                            //    showPopup( error.message, 'assertive' );
                            //});
                    }, function( err ) {
                        $ionicLoading.hide();
                        //console.error( err );
                        //showPopup( err.message, 'assertive' );
                    } );
                //} );
            }catch (e)
            {
                $ionicLoading.hide();
                console.error( e );
            }
        };
        $scope.myChannel = {
            // the fields below are all optional
            videoHeight: 480,
            videoWidth: 320,
            video: null // Will reference the video element on success
        };
        $ionicModal.fromTemplateUrl( 'camera.html', {
            scope: $scope,
            animation: 'slide-in-up'
        } ).then( function( modal ) {
            $scope.modal_camera = modal;
        } );
        $scope.$on( '$destroy', function() {
            if(is.not.null($scope.modal_camera)){
                $scope.modal_camera.remove();
            }
        } );
        $scope.returnMain = function() {
            $state.go( 'index.main', {}, {} );
        };
        $scope.takePhoto = function() {
            var video = document.getElementById( 'videoS' );
            context.drawImage( video, 0, 0, 320, 480 );
            $scope.capture = canvas.toDataURL();
        };
        $scope.reCapture = function() {
            context.clearRect( 0, 0, 320, 480 );
            $scope.capture = null;
        };
        $scope.uploadPhoto = function() {
            var jsonData = {
                'Base64': $scope.capture,
                'FileName': moment().format( 'YYYY-MM-DD-HH-mm-ss' ).toString() + '.jpg'
            };
            var strUri = '/api/freight/upload/img?JobNo=' + $scope.Doc.JobNo;
            ApiService.Post( strUri, jsonData, true ).then( function success( result ) {
                showPopup('Upload Successfully','calm', function(res){
                    $scope.closeModal();
                });
            } );
        };
        $scope.showActionSheet = function() {
            if ( is.not.empty( $scope.Doc.JobNo ) ) {
                var strUri = '/api/freight/jmjm1/doc?JobNo=' + $scope.Doc.JobNo;
                ApiService.GetParam( strUri, true ).then( function success( result ) {
                    $scope.Doc.Jmjm1s = result.data.results;
                    if ( is.array( $scope.Doc.Jmjm1s ) && is.not.empty( $scope.Doc.Jmjm1s ) ) {
                        var actionSheet = $ionicActionSheet.show( {
                            buttons: [
                                {
                                    text: 'Camera'
                                },
                                {
                                    text: 'From Gallery'
                                }
                            ],
                            //destructiveText: 'Delete',
                            titleText: 'Select Picture',
                            cancelText: 'Cancel',
                            cancel: function() {
                                // add cancel code..
                            },
                            buttonClicked: function( index ) {
                                if ( index === 0 ) {
                                    if ( !ENV.fromWeb ) {
                                        showCamera(0);
                                    }else{
                                        $scope.modal_camera.show();
                                        canvas = document.getElementById( 'canvas1' );
                                        context = canvas.getContext( '2d' );
                                        $scope.reCapture();
                                    }
                                } else if ( index === 1 ) {
                                    if( !ENV.fromWeb ){
                                        showCamera(1);
                                        /*
                                        var options = {
                                            maximumImagesCount: 1,
                                            width: 800,
                                            height: 800,
                                            quality: 80
                                        };
                                        $cordovaImagePicker.getPictures(options)
                                            .then(function (results) {
                                                 $scope.Detail.imageUri = results[0];
                                                 var url = ENV.api + '/api/freight/upload/img?JobNo=' + $scope.Doc.JobNo;
                                                 var filePath = results[0];
                                                 var trustHosts = true;
                                                 var options = {};
                                                 $cordovaFileTransfer.upload(url, filePath, options, trustHosts)
                                                     .then(function(result) {
                                                         showPopup( 'Upload Successfully', 'calm' );
                                                     }, function(err) {
                                                         console.error( err );
                                                         showPopup( err.message, 'assertive' );
                                                     }, function (progress) {
                                                     // constant progress updates
                                                     });
                                            }, function (error) {
                                                 console.log(error);
                                            });
                                        */
                                    } else {
                                        $state.go( 'upload', {
                                            'JobNo': $scope.Doc.JobNo
                                        }, {} );
                                    }
                                }
                                return true;
                            }
                        } );
                    } else {
                        alertPopup = $ionicPopup.alert( {
                            title: 'Wrong Job No',
                            okType: 'button-assertive'
                        } );
                    }
                } );
            } else {
                alertPopup = $ionicPopup.alert( {
                    title: 'Please Enter Job No',
                    okType: 'button-assertive'
                } );
            }
        };
        $scope.closeModal = function() {
            $scope.modal_camera.hide();
        };
        $scope.openCam = function() {
            $cordovaBarcodeScanner.scan().then( function( imageData ) {
                var qrcode = imageData.text;
                var qrcodes = qrcode.split('#');
                $scope.Doc.JobNo = qrcodes.length>1? qrcodes[1]: qrcodes[0];
                $scope.showActionSheet();
            }, function( error ) {
                $cordovaToast.showShortBottom( error );
            } );
        };
    } ] );

appControllers.controller( 'RetrieveDocCtrl', [ 'ENV', '$scope', '$state', '$stateParams', '$timeout', '$ionicPopup', '$ionicModal', '$ionicActionSheet', '$cordovaBarcodeScanner', 'ApiService',
    function( ENV, $scope, $state, $stateParams, $timeout, $ionicPopup, $ionicModal, $ionicActionSheet, $cordovaBarcodeScanner, ApiService ) {
        var alertPopup = null;
        $scope.Doc = {
            JobNo: '',
            Jmjm1s: []
        };
        $scope.Doc.JobNo = 'SE07731-03';
        var showPopup = function( title, type, callback ) {
            if ( alertPopup != null ) {
                alertPopup.close();
                alertPopup = null;
            }
            alertPopup = $ionicPopup.alert( {
                title: title,
                okType: 'button-' + type
            } );
            if( typeof(callback) == 'function') callback(alertPopup);
        };
        $scope.returnMain = function() {
            $state.go( 'index.main', {}, {} );
        };
        $scope.goToList = function() {
            if ( is.not.empty( $scope.Doc.JobNo ) ) {
                var strUri = '/api/freight/jmjm1/doc?JobNo=' + $scope.Doc.JobNo;
                ApiService.GetParam( strUri, true ).then( function success( result ) {
                    $scope.Doc.Jmjm1s = result.data.results;
                    if ( is.array( $scope.Doc.Jmjm1s ) && is.not.empty( $scope.Doc.Jmjm1s ) ) {
                        $state.go( 'retrieveDocList', {
                            'JobNo': $scope.Doc.JobNo
                        }, {} );
                    } else {
                        showPopup( 'Wrong Job No', 'assertive' );
                    }
                } );
            } else {
                showPopup( 'Please Enter Job No', 'assertive' );
            }
        };
        $scope.openCam = function() {
            $cordovaBarcodeScanner.scan().then( function( imageData ) {
                var qrcode = imageData.text;
                var qrcodes = qrcode.split('#');
                $scope.Doc.JobNo = qrcodes.length>1? qrcodes[1]: qrcodes[0];
                $scope.goToList();
            }, function( error ) {
                $cordovaToast.showShortBottom( error );
            } );
        };
        $( '#iJobNo' ).on( 'keydown', function( e ) {
            if ( e.which === 9 || e.which === 13 ) {
                if ( alertPopup === null ) {
                    $scope.goToList();
                } else {
                    alertPopup.close();
                    alertPopup = null;
                }
            }
        } );
    } ] );

appControllers.controller( 'RetrieveDocListCtrl', [ 'ENV', '$scope', '$state', '$stateParams', '$timeout', '$ionicPopup', '$ionicModal', '$ionicActionSheet', 'DownloadFileService', 'ApiService',
    function( ENV, $scope, $state, $stateParams, $timeout, $ionicPopup, $ionicModal, $ionicActionSheet, DownloadFileService, ApiService ) {
        var alertPopup = null, JobNo = $stateParams.JobNo;
        var onPlatformError = function( url ) {
            window.open( url );
        };
        var showPopup = function( title, type, callback ) {
            if ( alertPopup != null ) {
                alertPopup.close();
                alertPopup = null;
            }
            alertPopup = $ionicPopup.alert( {
                title: title,
                okType: 'button-' + type
            } );
            if( typeof(callback) == 'function') callback(alertPopup);
        };
        $scope.returnSearch = function() {
            $state.go( 'retrieveDoc', {}, {} );
        };
        $scope.ShowDate = function( utc ) {
            return moment( utc ).format( 'DD-MMM-YYYY' );
        };
        $scope.download = function( Jmjm1, File ) {
            if(is.not.undefined(File)){
                var strFileName = Jmjm1.JobNo + '-' + File.FileName,
                    strURL='',
                    type='';
                if(is.equal(File.Extension,'.pdf')){
                    type = 'application/pdf';
                    strURL = ENV.api + '/api/freight/view/file?eDoc=0&Type=pdf&FolderName=Jmjm1&Key=' + Jmjm1.JobNo + '&FileName=' + File.FileName + '&format=json';
                }else if(is.equal(File.Extension,'.txt')){
                    type = 'text/plan';
                    strURL = ENV.api + '/api/freight/view/file?eDoc=0&Type=txt&FolderName=Jmjm1&Key=' + Jmjm1.JobNo + '&FileName=' + File.FileName + '&format=json';
                }else if(is.equal(File.Extension,'.jpg')||is.equal(File.Extension,'.png')||is.equal(File.Extension,'.bmp')){
                    type = 'image/jpeg';
                    strURL = ENV.api + '/api/freight/view/file?eDoc=0&Type=img&FolderName=Jmjm1&Key=' + Jmjm1.JobNo + '&FileName=' + File.FileName + '&format=json';
                }else {
                    type = 'application/octet-stream';
                    strURL = ENV.api + '/api/freight/view/file?eDoc=0&Type=stream&FolderName=Jmjm1&Key=' + Jmjm1.JobNo + '&FileName=' + File.FileName + '&format=json';
                }
                DownloadFileService.Download( strURL, strFileName, type, onPlatformError, null, null );
            }
        };
        var GetJmjm1s = function( JobNo ) {
            var strUri = '/api/freight/jmjm1/attach?JobNo=' + JobNo;
            ApiService.GetParam( strUri, true ).then( function success( result ) {
                if ( result.data.results != null && result.data.results.length > 0 ) {
                    $scope.Jmjm1s = result.data.results;
                } else {
                    $scope.Jmjm1s = null;
                    alertPopup = $ionicPopup.alert( {
                        title: 'No Attachment Found',
                        okType: 'button-calm'
                    } );
                    alertPopup.then( function( res ) {
                        console.log( 'No Attachment Found' );
                        $scope.returnSearch();
                    } );
                }
            } );
        };
        GetJmjm1s( $stateParams.JobNo );
    } ] );

appControllers.controller( 'UploadCtrl', [ 'ENV', '$scope', '$state', '$stateParams', '$ionicPopup', 'FileUploader', 'ApiService',
    function( ENV, $scope, $state, $stateParams, $ionicPopup, FileUploader, ApiService ) {
        var alertPopup = null;
        $scope.Detail = {
            JobNo : $stateParams.JobNo
        };
        var showPopup = function( title, type, callback ) {
            if ( alertPopup != null ) {
                alertPopup.close();
                alertPopup = null;
            }
            alertPopup = $ionicPopup.alert( {
                title: title,
                okType: 'button-' + type
            } );
            alertPopup.then( function( res ) {
                if(typeof(callback)=='function') callback(res);
            } );
        };
        $scope.returnDoc = function() {
            $state.go( 'documentScan', {}, {} );
        };
        var uploader = $scope.uploader = new FileUploader( {
            url: ENV.api + '/api/freight/upload/img?JobNo=' + $scope.Detail.JobNo
        } );
        /*
        uploader.onWhenAddingFileFailed = function(item, filter, options) {
            console.info('onWhenAddingFileFailed', item, filter, options);
        };
        uploader.onAfterAddingFile = function(fileItem) {
            console.info('onAfterAddingFile', fileItem);
        };
        uploader.onAfterAddingAll = function(addedFileItems) {
            console.info('onAfterAddingAll', addedFileItems);
        };
        uploader.onBeforeUploadItem = function(item) {
            console.info('onBeforeUploadItem', item);
        };
        uploader.onProgressItem = function(fileItem, progress) {
            console.info('onProgressItem', fileItem, progress);
        };
        uploader.onProgressAll = function(progress) {
            console.info('onProgressAll', progress);
        };
        uploader.onErrorItem = function(fileItem, response, status, headers) {
            console.info('onErrorItem', fileItem, response, status, headers);
        };
        uploader.onCancelItem = function(fileItem, response, status, headers) {
            console.info('onCancelItem', fileItem, response, status, headers);
        };
        uploader.onCompleteItem = function(fileItem, response, status, headers) {
            console.info('onCompleteItem', fileItem, response, status, headers);
        };
        uploader.onCompleteAll = function() {
            console.info('onCompleteAll');
        };
        */
        uploader.onSuccessItem = function( fileItem, response, status, headers ) {
            console.info( 'onSuccessItem', fileItem, response, status, headers );
            showPopup('Upload Successfully','calm',function(res){
                $scope.returnDoc();
            });
        };
    }
] );
