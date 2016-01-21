//Libs
var utils = require("utils");

//Services
var AjaxGetImage = require('/net/ajaxgetimage');
var UserLogin = require('net/userlogin');
var AjaxGameSettings = require('net/ajaxgamesettings');
var UserLogout = require('/net/userlogout');
var Ping = require("net/ping");

exports.pushPath = function(args) {
	//checking for currentUser
	var currentUser = Ti.App.Properties.getString('currentUser');
	if (currentUser){
		exports.userUpdateListener(JSON.parse(currentUser));
	}
	
	Alloy.Globals.clearAllCounters();
	//clearing all maps (garbage collector)
	Alloy.Globals.mapViewsClearAll();
	var toPush = {
		viewId : args.viewId,
		data : args.data,
		resetPath : args.resetPath
	};
	//removing old same views from path
	Alloy.Globals.appHistory = _.reject(Alloy.Globals.appHistory, function(element) {
		return element.viewId == args.viewId;
	});
	Alloy.Globals.appHistory.push(toPush);
	Ti.App.Properties.setString("currentRoute", JSON.stringify(toPush));

	//reseting path keeping only the current one
	if ("resetPath" in args && args.resetPath === true) {
		Alloy.Globals.appHistory = [_.last(Alloy.Globals.appHistory)];
		Ti.API.info('history ' + JSON.stringify(Alloy.Globals.appHistory));
	}
	Ti.API.info('pushing ' + JSON.stringify(toPush));
	Ti.App.fireEvent('pushPath', toPush);
	Ti.App.fireEvent('stopAudio');
};

exports.popPath = function(args) {
	Alloy.Globals.appHistory.pop();
	Ti.App.fireEvent('popPath', args);
	Ti.App.fireEvent('stopAudio');
};

exports.popPathListener = function(args) {
	var history = Alloy.Globals.appHistory;
	var mainContent = Alloy.Globals.mainContent;

	if (args.noRefresh) {
		mainContent.remove(Alloy.Globals.currentContent);
		return;
	}

	if (history.length == 0 && OS_ANDROID) {//exiting app after a dialog
		var dialog = Ti.UI.createAlertDialog({
			buttonNames : [L('Exit'), L('Cancel')],
			message : L('Exit_application_message'),
			title : L('Exit_application_questionmark')
		});

		dialog.addEventListener('click', function(e) {
			switch (e.index) {
			case 0:
				var activity = Titanium.Android.currentActivity;
				setTimeout(function() {
					Alloy.Globals.clearAllCounters();
					activity.finish();
				}, 200);
				break;
			}

		});

		dialog.show();

		return;
	}

	if (Alloy.Globals.currentContent)
		mainContent.remove(Alloy.Globals.currentContent);

	if (history[history.length - 1])
		Ti.App.fireEvent('pushPath', history[history.length - 1]);
	else {
		Alloy.Globals.currentContent = null;
		Ti.App.fireEvent('appInit');
	}
};

exports.pushPathListener = function(pushedView) {
	var viewId = pushedView.viewId;
	var viewData = pushedView.data;
	var viewToAdd;
	try {
		Ti.API.info('INSTANTIATING VIEW!');
		viewToAdd = Alloy.createController(viewId, viewData).getView();
		Ti.API.info('VIEW INSTANTIATED!');
	} catch(e) {
		Ti.API.error('Error while instantiating view: ' +JSON.stringify(e));
		//If view doesn't exist, navigate to challenges list
		viewToAdd = Alloy.createController('challenge/nearby/list', null).getView();
	}
		
	var mainContent = Alloy.Globals.mainContent;
	//checking the length of the path. if it is 1 we don't remove anything from main view
	if ((Alloy.Globals.appHistory.length > 1 && Alloy.Globals.currentContent) || (pushedView.resetPath && Alloy.Globals.currentContent)) {
		mainContent.remove(Alloy.Globals.currentContent);

		//forcing garbage collection
		Alloy.Globals.currentContent = null;
	}

	mainContent.add(viewToAdd);
	Alloy.Globals.currentContent = viewToAdd;
};

exports.appInit = function(params) {
	//checking if user was on register when app was paused or somehow dropped
	var registerData;
	try {
		registerData = JSON.parse(Ti.App.Properties.getString("registerData"));
	} catch(e) {
		registerData = false;
	}

	if (registerData) {
		var currentRoute;
		try {
			currentRoute = JSON.parse(Ti.App.Properties.getString('currentRoute'));
		} catch (e) {
			currentRoute = false;
		};

		if (currentRoute && currentRoute.viewId != 'login') {
			exports.pushPath(currentRoute);
			return;
		}
	}

	var viewId = Alloy.Globals.userIsLogged ? Alloy.Globals.appConfig.homeViewId : 'login';
	if (params) {
		viewId = params.viewId;
		data = params.data;
	}
	Alloy.Globals.appHistory = [];
	if (!_.isNull(Alloy.Globals.currentContent)) {
		Alloy.Globals.mainContent.remove(Alloy.Globals.currentContent);
	}
	Alloy.Globals.currentContent = null;
	var pushPath = exports.pushPath;
	pushPath({
		viewId : viewId,
		data : {},
	});
};

exports.appInitListener = function() {
	//checking if user was on register when app was paused or somehow dropped
	var registerData;
	try {
		registerData = JSON.parse(Ti.App.Properties.getString("registerData"));
	} catch(e) {
		registerData = false;
	}

	if (registerData) {
		var currentRoute;
		try {
			currentRoute = JSON.parse(Ti.App.Properties.getString('currentRoute'));
		} catch (e) {
			currentRoute = false;
		};

		if (currentRoute && currentRoute.viewId != 'login') {
			exports.pushPath(currentRoute);
			return;
		}
	}

	var mainContent = Alloy.Globals.mainContent;
	
	//checking the length of the path. if is 1 we don't remove anything from main view
	if (Alloy.Globals.appHistory.length > 0 || Alloy.Globals.currentContent) {
		//properly removing the current content from the main wrapper
		mainContent.remove(Alloy.Globals.currentContent);
	}

	//checking if user is logged in already
	var currentUserString = Ti.App.Properties.getString('currentUser');
	var currentUser = currentUserString ? JSON.parse(currentUserString) : '';
	if (currentUser) {
		Ti.App.fireEvent('doLogin', {
			user : currentUser,
		});
	} else {
		exports.appInit({
			viewId : 'login',
			data : {}
		});
	}
};

exports.loginListener = function(args) {
	var indicator = Alloy.createController('loadingscreen', {
		text : "Logging in"
	}).getView();
	Alloy.Globals.index.add(indicator);
	Alloy.Globals.indicator = indicator;
	var user = args.user;
	var password = user.unhashedPassword;

	var loginSuccessHandler = function() {
		//fetching game settings
		
		var agm = new AjaxGameSettings({
			onSuccess : function(gs) {
				//updating the default gameSettings
				_.each(gs.settings, function(gameSetting, index) {
					if(gameSetting.name === "ticketsEmail" || gameSetting.name === "randomHotspotTime") {
						Alloy.Globals.appConfig.gameSettings[gameSetting.name] = gameSetting.value;
					} else {
						Alloy.Globals.appConfig.gameSettings[gameSetting.name] = JSON.parse(gameSetting.value);
					}
				});
			},
			onError : function(gs) {
				Ti.API.info('game settings error ' + JSON.stringify(gs));
			}
		});
		agm.get({});
		

		//@TODO on backed we need to solve the unprotected password
		var currentUserData = userLogin.response.user;
		Alloy.Globals.user = currentUserData;
		var localUserAvatar = utils.getLocalUserAvatar(currentUserData.username);
		//looking up the user avatar locally
		if (localUserAvatar) {
			Ti.API.info("There's a local user avatar: "+localUserAvatar);
			Alloy.Globals.leftMenu.userImage.setImage(localUserAvatar);
		}

		//fetching the photo if exists on server
		if (utils.testPropertyExists(currentUserData, 'photo.url') && !localUserAvatar) {
			//getting the image file
			var ajaxGetImage = new AjaxGetImage({
				onSuccess : function(localfilePath) {
					Ti.API.info('Fetched the user avatar from the server: ' + localfilePath);
					Alloy.Globals.leftMenu.userImage.setImage(localfilePath);
					utils.setLocalUserAvatar(currentUserData.username, localfilePath);
				},
				onError : function(response) {
					//@TODO handle the error
					Ti.API.error('Avatar image fetch error');
				},
				image : currentUserData.photo,
				thumb: true
			});
			ajaxGetImage.fetch();
		}
		if (!currentUserData.unhashedPassword)
			currentUserData.unhashedPassword = password;

		exports.userUpdateListener(currentUserData);

		//saving userProfile locally so we have it always and user don't have to enter it all the times
		Ti.App.Properties.setString('currentUser', JSON.stringify(currentUserData));
		Alloy.Globals.userIsLogged = true;

		var mainContent = Alloy.Globals.mainContent;
		if (Alloy.Globals.currentContent)
			mainContent.remove(Alloy.Globals.currentContent);

		Alloy.Globals.sliderMenu.setAccesibility(true);
		if (currentUserData.username + "-" !== "-")
			Alloy.Globals.leftMenu.userNameLabel.setText(currentUserData.username);

		Alloy.Globals.header.view.showSliderButton();
		Alloy.Globals.index.remove(indicator);
		indicator = null;
		Alloy.Globals.indicator = null;

		//getting currentRoute
		var currentRoute;
		try {
			currentRoute = JSON.parse(Ti.App.Properties.getString('currentRoute'));
		} catch (e) {
			currentRoute = false;
		};
		
		//we're returning to the last saved route
		if (currentRoute && currentRoute.viewId != 'login') {
			exports.pushPath(currentRoute);
			return;
		} else {
			var loggedInBefore = Ti.App.Properties.getString('loggedInBefore');
			if(loggedInBefore){
				exports.pushPath({viewId: 'challenge/nearby/list', data: null, resetPath: true});
				return;
			}
		}
		Ti.App.Properties.setString('loggedInBefore', true);
		
		//calling on success handler
		exports.appInit();
	};

	var userLogin = new UserLogin({
		params :{
			email : user.email,
			password : user.unhashedPassword,	
		},
		onSuccess : loginSuccessHandler,
		onError : function() {
			Alloy.Globals.userIsLogged = false;
			Alloy.Globals.index.remove(indicator);
			Alloy.Globals.indicator = null;
			Ti.App.Properties.setString('currentUser', false);
			Ti.App.Properties.setString('currentRoute', false);
			Ti.App.Properties.setString("registerData",false);
			indicator = null;
			alert(L('err1005'));
			exports.appInit({
				viewId : 'login',
				data : {}
			});
		}
	});
	userLogin.tryLogin();
};

exports.logoutListener = function() {
	
	var userLogout = new UserLogout({
		onSuccess : function(result) {
			Alloy.Globals.userIsLogged = false;
			Ti.App.Properties.setString('currentUser', false);
			Ti.App.Properties.setString('currentRoute', false);
			var mainContent = Alloy.Globals.mainContent;
			if (Alloy.Globals.currentContent)
			mainContent.remove(Alloy.Globals.currentContent);
			Alloy.Globals.currentContent = null;
			if (Alloy.Globals.appHistory) Alloy.Globals.appHistory = [];

			//hiding menu and header
			Alloy.Globals.sliderMenu.setAccesibility(false);
			Alloy.Globals.leftMenu.userNameLabel.setText('');
			Alloy.Globals.sliderMenu.hidemenu();
			Alloy.Globals.header.view.hideHeader();
			//resetting user icon
			Alloy.Globals.leftMenu.userImage.setImage("/images/icons/user-#00aaad.png");
			Ti.App.fireEvent('appInit');
		},
		onError : function(result) {
			Ti.API.info('Logout error || ' + JSON.stringify(result));
		},
	});
	userLogout.tryLogout();
};

exports.userUpdateListener = function(user) {
	try {
		//updating global score
		var currentUser = JSON.parse(Ti.App.Properties.getString("currentUser"));
		currentUser.score = user.score;
		Ti.App.Properties.setString("currentUser", JSON.stringify(currentUser));
	} catch(e) {
		//probably after logout
	}

	//updating score on header
	Alloy.Globals.leftMenu.tokenNumberLabel.text = user.score;
};

exports.appResumeListener = function() {
	Ti.API.info("=====================APP RESUMED=====================");
	Alloy.Globals.sliderMenu.hidemenu();

	//trying to ping
	var ping = new Ping({
		onSuccess : function() {
			Alloy.Globals.index.remove(indicator);
			indicator = null;
			Alloy.Globals.indicator = null;
			Ti.App.fireEvent('appInit');
		},
		onError : function() {
			Ti.API.info('some error occured when pinging server');
			//@TODO what to do on connection error
			//Ti.App.fireEvent('appInit');
		}
	});
	var currentTime = (new Date().getTime()) / 1000;
	if (currentTime - Alloy.Globals.pauseMoment > 15 && !Alloy.Globals.userImageFetch) {
		var indicator = Alloy.createController('loadingscreen', {
			text : "checking connection"
		}).getView();
		Alloy.Globals.indicator = indicator;
		Alloy.Globals.index.add(indicator);
		indicator.show();
		Alloy.Globals.pauseMoment = currentTime;
		ping.tryPing();
	}
};