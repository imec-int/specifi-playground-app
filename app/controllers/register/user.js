var header = Alloy.Globals.header.view;
header.hideSliderButton();


var registerData;
try {
	registerData = JSON.parse(Ti.App.Properties.getString("registerData"));
} catch(e) {
	registerData = false;
}
Ti.API.info('register data'+registerData);
if (registerData && registerData!==false) {
	Alloy.Globals.registerData = registerData;
} else Alloy.Globals.registerData = {};

//initializing to empty on every attempt
header.showHeader();
header.changeTitle(L("Register_as_a_new_player"));
var previousConnect = 0;
$.TfTop.show();

//focusing on the textfield

setTimeout(function() {
    Ti.API.info('focusing on textfield');
    $.TfTop.focus();
}, 1000);

$.LabelTop.setText(L("registerUsernameHelp"));

function onTfTopChange(e) {
    Ti.API.info('tfTop changed' + JSON.stringify(e));
    var currentTime = new Date().getTime();

    if (currentTime - previousConnect > 250) {
        validateUser(e.source.value, function(result) {
            Ti.API.info(result);
        });
        previousConnect = currentTime;
    }
};

function onClick(e) {
    var buttonId = e.source.id;
    switch (buttonId) {
        case "BtnNext":
            var tfTopText = $.TfTop.getValue();
            $.TfTop.blur();
            //@TODO show the loading screen
            //we'll use alloy globals to keep the info and erase it on finish/cancel
            validateUser(tfTopText, function(result) {
                //@TODO check the result and act accordingly
                //there should be a wrapper for messages for this text field

                //saving value in the global registration container
                Alloy.Globals.registerData.username = tfTopText;
                
                 //storing this for resume 
                 Ti.App.Properties.setString("registerData", JSON.stringify(Alloy.Globals.registerData));
                 var testBack = Ti.App.Properties.getString("registerData");
                 Ti.API.info('we saved '+testBack);
                if (!result.error && result.unique) {
                    //going to next registration step
                    Alloy.Globals.pushPath({
                        viewId : 'register/password'
                    });
                } else {
                    if (result.message) alert(result.message);
                    else alert(L("Username_not_unique"));
                }
            });

            break;
        case "BtnCancel":
            //going back to initial state (not logged)
            $.TfTop.blur();
            Ti.App.Properties.setString("registerData",false);
            Ti.App.Properties.setString("currentRoute",false);
            $.LabelTop.fireEvent('blur');
            Ti.App.fireEvent('appInit');
            header.hideHeader();
            break;
    }
}

function validateUser(username, _handler) {
    //there is no reason of doing username validation for strings that don't
    //comply with basic requirements
    if (username.length <= Alloy.Globals.appConfig.maxUsernameLength && username.length >= Alloy.Globals.appConfig.minUsernameLength) {
        var UsernameAjaxValidation = require('/net/usernameajaxvalidation');
        var uav = new UsernameAjaxValidation({
            params: {
            	username : username,
            },
            onSuccess : _handler,
            onError : _handler,
        });
        uav.validate();
    } else {
        _handler({
            error : 1,
            message : L('username_length_errror'),
        });
    }
}
