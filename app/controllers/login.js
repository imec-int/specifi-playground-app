//hiding header in case of coming back from a register page
var header = Alloy.Globals.header.view;
header.hideHeader();

//Sounds
var soundClickPrimary = Titanium.Media.createSound({url:'/sound/button_snap.mp3'});
var soundClickSecondary = Titanium.Media.createSound({url:'/sound/button_high.mp3'});
var connection = require("connectiondefaults");
//adding default email and password for dev
/**
 * using onBlur to return the wrapper to its position when necessary
 * @param {Object} e
 */
function onBlur(e) {
	$.loginView.setTop(0);

	if (OS_IOS) {
		$.logoWrapper.show();
	}
}

function onFocus(e) {
	var tfId = e.source.id;

	if (OS_IOS) {
		$.logoWrapper.hide();
		var topShift = "-163dp";
		if (Alloy.Globals.iPhoneTall) {
			topShift = "-150dp";
		}
	}
	if (OS_ANDROID) {
		var topShift = "-150dp";
	}

	$.loginView.setTop(topShift);
}

function forgotPassword() {
	Alloy.Globals.pushPath({
		viewId : 'resetPassword',
	});
}

function onReturn(e) {
	var tfId = e.source.id;
	switch (tfId) {
	case 'TfUsername':
		$.TfPassword.focus();
		break;
	case 'TfPassword':
		if ($.TfPassword.getValue && $.TfUsername.getValue()) {
			loginHandler();
		} else {
			if (OS_ANDROID) {
				$.loginView.setTop(0);
				$.logoWrapper.show();
			}
		}
		break;
	}
}

function loginHandler() {
	Ti.App.fireEvent('doLogin', {
		user : {
			email : $.TfUsername.getValue().toLowerCase(),
			unhashedPassword : $.TfPassword.getValue()
		},
	});
}

function onClick(e) {
	var buttonId = e.source.id;
	Ti.API.info('login clickSource' + JSON.stringify(e));
	switch (buttonId) {
	case "btnLogin":
		soundClickPrimary.play()
		$.TfPassword.blur();
		loginHandler();
		break;
	case "btnCreateNew":
		soundClickSecondary.play();
		Alloy.Globals.pushPath({
			viewId : 'register/user'
		});
		break;
	case "forgotPasswordLink":
		Ti.Platform.openURL(connection.linkRoot+"/forgotpassword");
		break;
	}
}

