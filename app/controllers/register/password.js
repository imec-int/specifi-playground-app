var header = Alloy.Globals.header.view;
header.changeTitle(L("Register_password"));

var registerData;
try {
	registerData = JSON.parse(Ti.App.Properties.getString("registerData"));
} catch(e) {
	registerData = false;
}

if (registerData) {
	Alloy.Globals.registerData = registerData;
} else {
	//we have to reset to login
	Alloy.Globals.pushPath({viewId:'login',resetPath:true});
}

header.showHeader();
header.changeTitle(L("Register_password"));


var previousConnect = 0;
//focusing on the textfield

setTimeout(function() {
    Ti.API.info('focusing on textfield');
    $.TfPass.focus();
}, 1000);

function onTfTopChange(e) {
    Ti.API.info('tfTop changed' + JSON.stringify(e));
    var currentTime = new Date().getTime();

    if (currentTime - previousConnect > 250) {
        validatePassword(function(result) {
            Ti.API.info(result);
        });
        previousConnect = currentTime;
    }
};

function onClick(e) {
    var buttonId = e.source.id;
    switch (buttonId) {
        case "BtnNext":
        	$.TfPass.blur();
            var tfTopText = $.TfPass.getValue();
            var tfConfirm = $.TfRepeatPass.getValue();
            //@TODO show the loading screen
            //we'll use alloy globals to keep the info and erase it on finish/cancel

            validatePassword(function(result) {
                if (!result.error) {
                    //saving value in the global registration container
                    Alloy.Globals.registerData.password = tfTopText;
                    Alloy.Globals.registerData.password_confirm = tfConfirm;
                    
                     //storing this for resume 
                    Ti.App.Properties.setString("registerData",JSON.stringify(Alloy.Globals.registerData));
                     var testBack = Ti.App.Properties.getString("registerData");
                	 Ti.API.info('we saved '+testBack);

                    //going to next registration step
                    Alloy.Globals.pushPath({
                        viewId : 'register/email'
                    });
                } else {
                	$.TfPass.focus();
                	alert(result.message);
                }
            });
            break;
        case "BtnCancel":
       		$.TfPass.blur();
    	 	Ti.App.Properties.setString("registerData",false);
            Ti.App.Properties.setString("currentRoute",false);
            Ti.App.fireEvent('appInit');
            header.hideHeader();
            break;
    }
}

function validatePassword(_handler) {
    //validating only strings more than 2 chars
    var password = $.TfPass.getValue();
    var repeat = $.TfRepeatPass.getValue();
    if (!password.length) {
         _handler({
            error : 102,
            message : L('password_empty_error'),
        });
        return;
    }
    //validating password length
    if (password.length < 5) {
        _handler({
            error : 100,
            message : L('password_too_short'),
        });
        return;
    }
    if (password !== repeat) {
        _handler({
            error : 101,
            message : L("password_dont_match"),
        });
        return;
    }
    if (password === repeat) {
        _handler({
            success : 1
        });
        return;
    }
}
