//Libs
var utils = require("utils");
var cloudinary = require('cloudinaryutils');
var connection = require("connectiondefaults");

//Services
var UserLogin = require('net/userlogin');
var AjaxGameSettings = require('net/ajaxgamesettings');
var UserLogout = require('/net/userlogout');
var Ping = require("net/ping");

/**
 * Show a new screen and push it on top of the history stack
 * @param {Object} args
 */
function pushPath(args) {
	Ti.API.info("=====================PUSH PATH=====================");
	Alloy.Globals.stopRanging();

	//checking for currentUser
	var currentUser = Ti.App.Properties.getString('currentUser');

	//@TODO Is this needed on every path push
	if (currentUser) {
		userUpdate(JSON.parse(currentUser));
	}

	//clearing all maps (garbage collector)
	Alloy.Globals.mapViewsClearAll();

	var pushedView = {
		viewId : args.viewId,
		data : args.data,
		resetPath : args.resetPath
	};

	//reseting path keeping only the current one
	if ("resetPath" in args && args.resetPath === true) {
		Alloy.Globals.appHistory = [pushedView];
	} else {
		Alloy.Globals.appHistory.push(pushedView);
	}

	var viewToAdd;
	try {
		Ti.API.info('INSTANTIATING VIEW: ' + JSON.stringify(pushedView.viewId));
		viewToAdd = Alloy.createController(pushedView.viewId, pushedView.data).getView();
		Ti.API.info('VIEW INSTANTIATED!');
	} catch(e) {
		Ti.API.error('Error while instantiating view error: ' + JSON.stringify(e));
		//If view doesn't exist, reinit the app
		return appInit();
	}

	var mainContent = Alloy.Globals.mainContent;
	if (!_.isNull(Alloy.Globals.currentContent)) {
		mainContent.remove(Alloy.Globals.currentContent);
	}

	//forcing garbage collection
	Alloy.Globals.currentContent = null;

	mainContent.add(viewToAdd);
	Alloy.Globals.currentContent = viewToAdd;
	Ti.App.fireEvent('stopAudio');
};

/**
 * Go one view back on the history stack
 * @param {Object} args
 */
function popPath(args) {
	Alloy.Globals.stopRanging();

	//View to pop
	var toPop = Alloy.Globals.appHistory.pop();

	var history = Alloy.Globals.appHistory;
	var mainContent = Alloy.Globals.mainContent;

	if (history.length > 0) {
		mainContent.remove(Alloy.Globals.currentContent);
		Alloy.Globals.currentContent = null;
		pushPath(_.last(history));
	}

	Ti.App.fireEvent('stopAudio');
};

/**
 * Handles application initialization
 * @param {Object} args
 */
function appInit() {
	Ti.API.info("=====================APP INIT=====================");

	if (!_.isNull(Alloy.Globals.currentContent)) {
		Alloy.Globals.mainContent.remove(Alloy.Globals.currentContent);
	}
	Alloy.Globals.appHistory = [];
	Alloy.Globals.currentContent = null;

	//if there is a user, try a login
	var currentUserString = Ti.App.Properties.getString('currentUser');
	var currentUser = currentUserString ? JSON.parse(currentUserString) : '';
	if (currentUser) {
		return login({
			user : currentUser
		});
	} else {
		var loggedInBefore = Ti.App.Properties.getString('loggedInBefore');
		if (!loggedInBefore) {
			pushPath({
				viewId : 'intro',
				resetPath : true
			});
		} else {
			pushPath({
				viewId : 'login',
				resetPath : true
			});
		}
	}

};

/**
 * Handles a login event
 * @param {Object} args
 */
function login(args) {
	//Create loading indicator
	var indicator = Alloy.createController('loadingscreen', {
		text : "Logging in"
	}).getView();
	Alloy.Globals.index.add(indicator);
	Alloy.Globals.indicator = indicator;

	var loginSuccessHandler = function(response) {
		//fetching game settings
		var agm = new AjaxGameSettings({
			onSuccess : function(gs) {
				//updating the default gameSettings
				_.each(gs.settings, function(gameSetting, index) {
					Alloy.Globals.appConfig.gameSettings[gameSetting.name] = JSON.parse(gameSetting.value);
				});
			},
			onError : function(gs) {
				Ti.API.info('Get game settings error ' + JSON.stringify(gs));
			}
		});
		agm.get({});

		var currentUserData = response.user;
		Alloy.Globals.user = currentUserData;

		//Set language
		var language = (Alloy.Globals.user.language) ? Alloy.Globals.user.language.substring(0, 2) : 'nl';
		Ti.Locale.setLanguage(language);

		if (!currentUserData.unhashedPassword)
			currentUserData.unhashedPassword = password;

		userUpdate(currentUserData);

		Alloy.Globals.sliderMenu.setAccesibility(true);
		Alloy.Globals.header.view.showSliderButton();

		Alloy.Globals.index.remove(indicator);
		indicator = null;
		Alloy.Globals.indicator = null;

		var loggedInBefore = Ti.App.Properties.getString('loggedInBefore');
		if (!loggedInBefore) {
			Ti.App.Properties.setString('loggedInBefore', true);
			return pushPath({
				viewId : 'about/about',
				resetPath : true
			});
		} else {
			return pushPath({
				viewId : Alloy.Globals.appConfig.homeViewId,
				resetPath : true
			});
		}
	};

	//Login params
	var user = args.user;
	var password = (user) ? user.unhashedPassword : '';

	//Login with email + password
	var userLogin = new UserLogin({
		params : {
			email : user.email,
			password : user.unhashedPassword
		},
		onSuccess : loginSuccessHandler,
		onError : function(err) {
			Alloy.Globals.index.remove(indicator);
			Alloy.Globals.indicator = null;
			Ti.App.Properties.setString('currentUser', false);
			indicator = null;
			//User is unknown, redirect to registration screen
			if (err.error === '1004') {
				Alloy.Globals.pushPath({
					viewId : 'register/name',
					data : {
						user : {
							email : user.email,
							password : user.unhashedPassword
						}
					}
				});
			} else {
				//Wrong password and email combination, redirect to login screen
				alert(L('err1005'));
				pushPath({
					viewId : 'login',
					resetPath : true
				});
			}
		}
	});
	userLogin.login();

};

/**
 * Logout from the app
 */
function logout() {

	var userLogout = new UserLogout({
		onSuccess : function(result) {
			Ti.App.Properties.setString('currentUser', false);
			if (Alloy.Globals.currentContent)
				Alloy.Globals.mainContent.remove(Alloy.Globals.currentContent);
			Alloy.Globals.currentContent = null;
			if (Alloy.Globals.appHistory)
				Alloy.Globals.appHistory = [];

			//hiding menu and header
			Alloy.Globals.sliderMenu.setAccesibility(false);
			Alloy.Globals.leftMenu.userNameLabel.setText('');
			Alloy.Globals.sliderMenu.hidemenu();
			Alloy.Globals.header.view.hideHeader();
			//resetting user icon
			Alloy.Globals.leftMenu.userImage.setImage("/images/icons/user-#00aaad.png");
			appInit();
		},
		onError : function(result) {
			Ti.API.info('Logout error || ' + JSON.stringify(result));
		}
	});
	userLogout.tryLogout();
};

/**
 * Update and save the user
 * @param {Object} user The updated User object
 */
function userUpdate(user) {
	try {
		//updating global score
		var currentUser = JSON.parse(Ti.App.Properties.getString("currentUser"));
		if (currentUser) {
			currentUser.score = user.score;
		} else {
			currentUser = user;
		}
		Ti.App.Properties.setString("currentUser", JSON.stringify(currentUser));
	} catch(e) {
		//probably after logout
	}
	//Setting the user avatar
	if (currentUser) {
		if (currentUser.photo)
			Alloy.Globals.leftMenu.userImage.setImage(cloudinary.formatUrl(currentUser.photo.secure_url, 44, 44, "c_thumb,g_face,r_max"));
		//Update username
		Alloy.Globals.leftMenu.userNameLabel.setText(currentUser.username);
		//updating score on header
		Alloy.Globals.leftMenu.tokenNumberLabel.setText(currentUser.score);
	}

};

/**
 * Handles an app resume event
 */
function appResume() {
	Ti.API.info("=====================APP RESUMED=====================");
	Alloy.Globals.sliderMenu.hidemenu();
};

exports.appResume = appResume;
exports.userUpdate = userUpdate;
exports.logout = logout;
exports.login = login;
exports.appInit = appInit;
exports.pushPath = pushPath;
exports.popPath = popPath; 