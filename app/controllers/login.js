//hiding header in case of coming back from a register page
var header = Alloy.Globals.header.view;
header.hideHeader();

//Properties
var args = arguments[0] || {};

//Libs
var connection = require("connectiondefaults");


/**
 * using onBlur to return the wrapper to its position when necessary
 * @param {Object} e
 */

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
		if ($.TfPassword.getValue() && $.TfUsername.getValue()) {
			loginHandler();
		} else {
			if (OS_ANDROID) {
				$.logoWrapper.show();
			}
		}
		break;
	}
}

//Handles login button click
function loginHandler() {
	Alloy.Globals.login({
		user : {
			email : $.TfUsername.getValue().toLowerCase(),
			unhashedPassword : $.TfPassword.getValue()
		}
	});
}

function onClick(e) {
	var buttonId = e.source.id;
	switch (buttonId) {
		case "btnLogin":
			$.TfPassword.blur();
			loginHandler();
			break;
		case "btnRegister":
			Alloy.Globals.pushPath({
				viewId : 'register/name'
			});
			break;
		case "forgotPasswordLink":
			Ti.Platform.openURL(connection.linkRoot+"/forgotpassword");
			break;
	}
}