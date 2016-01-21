//Initializing some globals
Alloy.Globals.user = null;
Alloy.Globals.userIsLogged = false;

Alloy.Globals.iPhoneTall = (OS_IOS && Ti.Platform.osname == "iphone" && Ti.Platform.displayCaps.platformHeight == 568);

var AppStates = require("appstates");
Alloy.Globals.appStatus = AppStates.APP_STATUS_STOPPED;
Alloy.Globals.counterIds = [];
Alloy.Globals.clearAllCounters = function() {
	_.each(Alloy.Globals.counterIds, function(id) {
		clearInterval(id);
	});
};
Alloy.Globals.mapViews = [];
Alloy.Globals.mapViewsDisableTouch = function() {
	_.each(Alloy.Globals.mapViews, function(mapView) {
		mapView.setTouchEnabled(false);
	});
};

Alloy.Globals.mapViewsEnableTouch = function() {
	_.each(Alloy.Globals.mapViews, function(mapView) {
		mapView.setTouchEnabled(true);
	});
};
Alloy.Globals.mapViewsClearAll = function() {
	_.each(Alloy.Globals.mapViews, function(mapView, index) {
		Alloy.Globals.mapViews[index] = null;
	});
	Alloy.Globals.mapViews = [];
};

//Styling Related Globals
//Primary Colors
Alloy.Globals.CustomColor1 = "#005380";
Alloy.Globals.CustomColor1Light = "#6698b3";
Alloy.Globals.CustomColor1Lighter = "#d9e5ec";
Alloy.Globals.CustomColor2 = "#007576";
Alloy.Globals.CustomColor2Light = "#66acad";
Alloy.Globals.CustomColor3 = "#51a026";
Alloy.Globals.CustomColor3Light = "#97c67d";
Alloy.Globals.CustomColor4 = "#edd200";
Alloy.Globals.CustomColor4Light = "#f4e466";
Alloy.Globals.CustomColor5 = "#007ba5";
Alloy.Globals.CustomColor5Light = "#66b0c9";
Alloy.Globals.CustomColor6 = "#E42119";
Alloy.Globals.CustomColor7 = "#6B055A";

Alloy.Globals.DisabledColor = "#C4C4C4";
//Basic black text
Alloy.Globals.BlackText = "#423f37";

//Allows us to check whether we are dealing with an iPhone5S or similar tall device
Alloy.Globals.iPhoneTall = (OS_IOS && Ti.Platform.osname == "iphone" && Ti.Platform.displayCaps.platformHeight == 568);

//we don't have how to check if app started on iOS so we assume that app is started when we reach this point
if (OS_IOS)
	Alloy.Globals.appStatus = AppStates.APP_STATUS_STARTED;

//defining some general settings
var fullScreenHeight = Ti.Platform.displayCaps.platformHeight;
var statusBarHeight;
if (OS_IOS) {
	var appArgs = Ti.App.getArguments();
	fullScreenHeight -= 20;
	statusBarHeight = 20;
}

if (OS_ANDROID) {
	var activity = Ti.Android.currentActivity;
	switch ( Ti.Platform.displayCaps.density ) {
	case 160:
		statusBarHeight = 25;
		break;
	case 120:
		statusBarHeight = 19;
		break;
	case 240:
		statusBarHeight = 38;
		break;
	case 320:
		statusBarHeight = 50;
		break;
	default:
		statusBarHeight = 25;
		break;
	}

	fullScreenHeight -= statusBarHeight;

}
var headerCalculated = fullScreenHeight * 8 / 100;
var baseIconHeight = headerCalculated / 1.5;
var deviceWidth = Ti.Platform.displayCaps.platformWidth;
var footerExtendedHeight = headerCalculated + headerCalculated / 3 + 1;
//we need to know the size of footer buttons in case of two buttons and a big one
var footerTwoButtonsPlusCenterWidth = Math.floor((deviceWidth - 20 / 100 * deviceWidth) / 2);

Alloy.Globals.qrCodeImageUrl = function(text) {
	return "https://chart.googleapis.com/chart?cht=qr&chs=400x400&chl=" + text;
};

Alloy.Globals.appConfig = {
	gameSettings : require('gamesettingsdefaults'),
	statusBarHeight : statusBarHeight,
	fullScreenHeight : fullScreenHeight,
	fullScreenWidth : deviceWidth,
	nearbyRadius : 15000000,
	personalNearbyRadius : 100,
	minUsernameLength : 5,
	maxUsernameLength : 12,
	contentHeight : fullScreenHeight - 2 * headerCalculated,
	headerHeight : headerCalculated + 1,
	footerExtendedHeight : footerExtendedHeight,
	footerTwoButtonsPlusCenterWidth : footerTwoButtonsPlusCenterWidth,
	userThumbDefaultSize : 144,
	baseIconHeight : baseIconHeight,
	halfIconHeight : baseIconHeight / 2,
	twoThirdsIconHeight : baseIconHeight * 2 / 3,
	homeViewId : "about/about",
	defaultCoords : {
		latitude : 37.9667,
		longitude : 23.7167
	},
	xhrSecurityParams : (OS_IOS) ? {
		// We bypass the certificate issue over at IBM
		validatesSecureCertificate : false,
		// The line below as per : https://jira.appcelerator.org/browse/TIMOB-2801
		tlsVersion : Titanium.Network.TLS_VERSION_1_0
	} : {
		// We bypass the certificate issue over at IBM
		validatesSecureCertificate : false,
		// The line below as per : https://jira.appcelerator.org/browse/TIMOB-2801
		tlsVersion : Titanium.Network.TLS_VERSION_1_0
	},
	connection : require("connectiondefaults"),
	userImageFetch : false //to know when we fetch image from gallery (so resume is not kicking in)
};
//adding the history and the routing handlers to the global scope
Alloy.Globals.appHistory = [];
Alloy.Globals.pushPath = require('navigationhandlers').pushPath;
Alloy.Globals.popPath = require('navigationhandlers').popPath;

//Set default coordinates
Alloy.Globals.currentCoords = Alloy.Globals.appConfig.defaultCoords;

var NavigationHandlers = require('navigationhandlers');

var pushPathListener = NavigationHandlers.pushPathListener;
var popPathListener = NavigationHandlers.popPathListener;
var appInitListener = NavigationHandlers.appInitListener;
var loginListener = NavigationHandlers.loginListener;
var logoutListener = NavigationHandlers.logoutListener;
var userUpdateListener = NavigationHandlers.userUpdateListener;
var appResumeListener = NavigationHandlers.appResumeListener;

//defining global event listeners
Ti.App.addEventListener('pushPath', pushPathListener);
Ti.App.addEventListener('popPath', popPathListener);
Ti.App.addEventListener('appInit', appInitListener);
Ti.App.addEventListener('doLogin', loginListener);
Ti.App.addEventListener('doLogout', logoutListener);
Ti.App.addEventListener('userUpdate', userUpdateListener);
Ti.App.addEventListener('stopAudio', function() {
	if (Alloy.Globals.audioPlayer) {
		Alloy.Globals.audioPlayer.stop();
		//releasing resources
		if (OS_ANDROID)
			Alloy.Globals.audioPlayer.release();
		Alloy.Globals.audioPlayer = null;
	}
});
Ti.App.addEventListener('appResumed', appResumeListener);

if (OS_IOS) {

	Ti.App.addEventListener('resumed', function() {
		Ti.App.fireEvent('appResumed');
		Alloy.Globals.appStatus = AppStates.APP_STATUS_RESUMED;
	});

	Ti.App.addEventListener('pause', function() {
		//saving the pause moment in seconds
		Alloy.Globals.pauseMoment = (new Date().getTime()) / 1000;
		Alloy.Globals.sliderMenu.hidemenu();
		Alloy.Globals.appStatus = AppStates.APP_STATUS_PAUSED;
	});
}

if (OS_ANDROID) {

	activity.onPause = function() {
		Ti.API.info('*** Pause Event Called ***');
		Alloy.Globals.appStatus = AppStates.APP_STATUS_PAUSED;
	};

	activity.onResume = function() {
		Ti.API.info('*** Resume Event Called ***');
		Alloy.Globals.appStatus = AppStates.APP_STATUS_RESUMED;
	};

	activity.onStop = function() {
		//we know that here we have the app loaded into memory and its running
		Ti.API.info('*** Stop Event Called ***');
		Alloy.Globals.appStatus = AppStates.APP_STATUS_STARTED;
	};

	activity.onDestroy = function() {
		Ti.API.info('*** Destroy Event Called ***');
		Alloy.Globals.stopScanning();
		Alloy.Globals.beaconUtils.stopRanging();
		Alloy.Globals.scanner = null;
		Alloy.Globals.appStatus = AppStates.APP_STATUS_STOPPED;
	};

}

//adding global underscore for Android
if (OS_ANDROID) {
	_ = require("alloy/underscore")._;
}

//setting the geolocation stuff
if (OS_IOS) {
	//This is needed for iBeacons. WHEN_IN_USE doesn't work.
	Ti.Geolocation.setLocationServicesAuthorization(Titanium.Geolocation.AUTHORIZATION_ALWAYS);
}
Ti.Geolocation.accuracy = Ti.Geolocation.ACCURACY_NEAREST_TEN_METERS;
Ti.Geolocation.purpose = 'Determine Current User Location';
Ti.Geolocation.distanceFilter = 10;

Alloy.Globals.getLocationHandler = function() {
	//getting current location
	Ti.Geolocation.getCurrentPosition(function() {
		Ti.API.info('trying to get location');
	});
};
Alloy.Globals.getLocationHandler();

Ti.Geolocation.addEventListener('location', function(e) {
	if (e.error) {
		Ti.API.error('Error: ' + e.error);
		Alloy.Globals.currentCoords = Alloy.Globals.appConfig.defaultCoords;
	} else if (e.success && !e.error) {
		Alloy.Globals.currentCoords = {
			latitude : e.coords.latitude,
			longitude : e.coords.longitude
		};
	}
});

//Scanner
var scanditsdk = require("com.mirasense.scanditsdk");
if (OS_ANDROID)
	Alloy.Globals.scanner = scanditsdk.createView({
		width : "80%",
		height : "80%"
	});

if (OS_IOS) {
	Alloy.Globals.scanner = scanditsdk.createView({
		width : "100%",
		height : "100%"
	});
	Alloy.Globals.scanner.restrictActiveScanningArea(true);
}

/*
 Start scanning and add callbacks to scanner object
 */
Alloy.Globals.startScanning = function(view, successCallback, cancelCallback) {
	Alloy.Globals.stopScanning();
	Alloy.Globals.scanner.init("scandit key goes here", 0);
	Alloy.Globals.scanner.setSuccessCallback(successCallback);
	Alloy.Globals.scanner.setCancelCallback(cancelCallback);
	Alloy.Globals.scanView = view;
	Alloy.Globals.scanView.add(Alloy.Globals.scanner);
	if (OS_IOS) {
		Alloy.Globals.scanner.setLeft('0dp');
		Alloy.Globals.scanner.setScanningHotSpot(0.5, 0.24);
	}

	Alloy.Globals.scanner.startScanning();
};

/*
 Stops scanning and clears all callbacks
 */
Alloy.Globals.stopScanning = function() {
	if (Alloy.Globals.scanView) {
		Alloy.Globals.scanner.stopScanning();
		Alloy.Globals.clearScannerCallbacks();
		Alloy.Globals.scanView.remove(Alloy.Globals.scanner);
	}
};

/*
 Clears scanner callbacks
 */
Alloy.Globals.clearScannerCallbacks = function() {
	Alloy.Globals.scanner.setSuccessCallback(null);
	Alloy.Globals.scanner.setCancelCallback(null);
};

//iBeacons
var BeaconUtils = require('utils/beaconutils');
Alloy.Globals.beaconUtils = new BeaconUtils('Playground', true);
Alloy.Globals.iBeaconEnabled = false;

/*
 Handles bluetooth status
 */
var bluetoothListener = function(response) {
	if (OS_IOS) {
		if (response && response.status && response.status === "on")
			response = true;
		else
			response = false;
	}
	Ti.API.info("=======> iBEACON ENABLED DEVICE: " + JSON.stringify(response));
	Alloy.Globals.iBeaconEnabled = response;
};

//Check availability of Bluetooth for iBeacon scanning
Alloy.Globals.beaconUtils.checkAvailability(bluetoothListener);

/*
 Handles permission changes
 */
var permissionListener = function(e) {
	Ti.API.info("BLE authorization status changed: " + JSON.stringify(e));
	if (e.status === "unauthorized")
		Alloy.Globals.iBeaconEnabled = false;
	else
		Alloy.Globals.iBeaconEnabled = true;
};

//Check permission changes
if (OS_IOS) {
	Alloy.Globals.beaconUtils.addEventListener("changeAuthorizationStatus", permissionListener);
}

