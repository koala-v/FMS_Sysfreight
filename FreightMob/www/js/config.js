'use strict';
var appConfig = angular.module('MobileAPP.config', []);
appConfig.value('ENV', {
    'website':      'www.sysfreight.net/app/fms/sysfreight',
    // 'api':          'www.sysfreight.net/apis/fms/sysfreight',
   api:  'http://localhost:7040',
    'reset':  {
        'website':      'www.sysfreight.net/app/fms/sysfreight',
        'api':          'www.sysfreight.net/apis/fms/sysfreight',
        'port':         '8081',
        'mapProvider':  'google'
    },
    'ssl':          '0', // 0 : false, 1 : true
    // 'port':         '8081', // http port no
    'debug':        true,
    'mock':         false,
    'fromWeb':      true,
    'appId':        '9CBA0A78-7D1D-49D3-BA71-C72E93F9E48F',
    'apkName':      'AppFms',
    'updateFile':   'update.json',
    'rootPath':     'AppFms',
    'configFile':   'config.txt',
    'mapProvider':  'google',
    'version':      '1.0.28'
});

var onGetRegistradionID = function(data) {
    try {
        console.log("JPushPlugin:registrationID is " + data)
    } catch (exception) {
        console.log(exception);
    }
};

var appendProtocol = function(url, blnSSL, portNo) {
    if (url.length > 0 && url.toUpperCase().indexOf('HTTPS://') < 0 && url.toUpperCase().indexOf('HTTP://') < 0) {
        if(blnSSL){
            url = 'https://' + url;
        }else{
            var aURL = url.split('/');
            if(aURL[0].indexOf(':') < 0){
                url = 'http://' + aURL[0] + ':' + portNo;
            }else{
                url = 'http://' + aURL[0];
            }
            for(var i=1; i<aURL.length; i++){
                url = url + '/' + aURL[i];
            }
        }
    }
    return url;
};
var rmProtocol = function(url, portNo) {
    if (is.not.empty(url)) {
        var regex = /(https?:\/\/)?/gi;
        url = url.replace(regex, '');
        regex = /(http?:\/\/)?/gi;
        url = url.replace(regex, '');
    }
    if (is.not.empty(portNo)) {
        var regex = /\:(\d)+/;
        url = url.replace(regex, '');
    }
    return url;
};
