var header = Alloy.Globals.header.view;
header.changeTitle(L("Register_E_mail"));
$.LabelTop.setText(L("registerEmailHelp"));

var registerData;
try {
	registerData = JSON.parse(Ti.App.Properties.getString("registerData"));
} catch(e) {
	registerData = false;
}

if (registerData) {
	Alloy.Globals.registerData = registerData;
} else {
	Alloy.Globals.pushPath({viewId:'login',resetPath:true});
}

var previousConnect = 0;

//focusing on the textfield
setTimeout(function() {
    $.TfTop.focus();
}, 1000);

function onTfTopChange(e) {
    Ti.API.info('tfTop changed' + JSON.stringify(e));
    var currentTime = new Date().getTime();

    if (currentTime - previousConnect > 250) {
        validateEmail(e.source.value, function(result) {
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

            validateEmail(tfTopText, function(result) {
                if (!result.error && result.unique) {	

                    //saving value in the global registration container
                    Alloy.Globals.registerData.email = tfTopText;
                    
                    //storing this for resume 
                    Ti.App.Properties.setString("registerData",JSON.stringify(Alloy.Globals.registerData));

                    //going to next registration step
                    Alloy.Globals.pushPath({
                        viewId : 'register/year'
                    });
                } else {
                    if (result.message)
                        alert(result.message);
                    else
                        alert(L("Email_not_unique"));
                }
            });
            break;
        case "BtnCancel":
        	$.TfTop.blur();
        	Ti.App.Properties.setString("registerData",false);
            Ti.App.Properties.setString("currentRoute",false);
            Ti.App.fireEvent('appInit');
            header.hideHeader();
            break;
    }
}

function validateEmail(email, _handler) {
    //validating only strings more than 2 chars
    if (email.length > 2) {
        //we locally validate the format of the email
        var filter = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;
        if (filter.test(email)) {
            var EmailAjaxValidation = require('/net/emailajaxvalidation');
            var eav = new EmailAjaxValidation({
                params: {
                	email : email
                },
                onSuccess : _handler,
                onError : _handler
            });
            eav.validate();
        } else {
            _handler({
                error : 101,
                message : L("emailFormatError"),
            });
        }
    } else {
        _handler({
            error : 101,
            message : L("emailFormatError"),
        });
    }
}