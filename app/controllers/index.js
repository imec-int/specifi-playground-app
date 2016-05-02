//adding the index to the global alloy object so we have it at all times
Alloy.Globals.index = $.index;
Alloy.Globals.leftMenu = {};

var menu = Alloy.createController('menu').getView();
var mainView = Alloy.createController('mainview').getView();
Alloy.Globals.sliderMenu = $.sliderMenu;

var AppStates = require("appstates");

$.sliderMenu.init({
	menuview : menu,
	mainview : mainView,
	duration : 200,
	parent : $.wholeWrapper
});

//adding map touch enabling disabling based on menu opened/closed
Alloy.Globals.sliderMenu.addEventListener('closed',function(){
	Alloy.Globals.mapViewsEnableTouch();
});
Alloy.Globals.sliderMenu.addEventListener('opened',function(){
	Alloy.Globals.mapViewsDisableTouch();
});

Alloy.Globals.sliderMenu.setAccesibility(false);
Alloy.Globals.mainContent = mainView;
Alloy.Globals.currentContent = null;

$.index.fullscreen = false;

if (OS_ANDROID) {
	$.index.navBarHidden = true;
	$.index.orientationModes = [Ti.UI.PORTRAIT];
	$.index.exitOnClose = true;
	//adding the back button functionality
	$.index.addEventListener('android:back', function() {
		if (Alloy.Globals.indicator) {
			Alloy.Globals.index.remove(Alloy.Globals.indicator);
			Alloy.Globals.indicator = null;
			if (Alloy.Globals.appHistory.length == 0) {
				var activity = Titanium.Android.currentActivity;
				setTimeout(function() {
					activity.finish();
				}, 200);
				return;
			}
			return;
		}
		//we have to check if menu is open and we close it
		if (Alloy.Globals.sliderMenu.menuIsOpen()) {
			Alloy.Globals.sliderMenu.hidemenu();
			return;
		}
		Alloy.Globals.popPath();
	});
	$.index.addEventListener('focus', function(e) {

		Alloy.Globals.sliderMenu.hidemenu();

		if (Alloy.Globals.appStatus != AppStates.APP_STATUS_STARTED) {
			Alloy.Globals.appResume();
			Alloy.Globals.appStatus = AppStates.APP_STATUS_RESUMED;
		}
	});
	$.index.addEventListener('blur', function(e) {
		Alloy.Globals.appStatus = AppStates.APP_STATUS_PAUSED;
		Alloy.Globals.sliderMenu.hidemenu();
	});

}

$.index.addEventListener('open', function(e) {
	if (OS_ANDROID) $.index.activity.actionBar.hide();
	$.index.show();
});

$.index.hide();
$.index.open();
Alloy.Globals.appInit();
