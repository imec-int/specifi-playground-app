var args = arguments[0] || {};
var header = Alloy.Globals.header.view;
var resetPasswordKey, userEmail;

//Libs
var utils = require("utils");

if (utils.testPropertyExists(args, 'data.resetPasswordKey'))
    resetPasswordKey = args.data.resetPasswordKey;

if (utils.testPropertyExists(args, 'data.userEmail'))
    userEmail = args.data.email;
    
header.hideSliderButton();
header.showHeader();
header.changeTitle(L("Reset_password"));

var previousConnect = 0;
//focusing on the textfield
setTimeout(function() {
    $.TfPass.focus();
}, 250);

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
        case "BtnChangePassword":
            var tfTopText = $.TfPass.getValue();
            var tfConfirm = $.TfRepeatPass.getValue();
            //@TODO show the loading screen
            //we'll use alloy globals to keep the info and erase it on finish/cancel

            validatePassword(function(result) {
                if (!result.error) {
                    //trying to change on server
                    var AjaxChangePassword = require('/net/ajaxchangepassword');
                    var ajaxChangePassword = new AjaxChangePassword({
                        onSuccess : function(result) {
                            alert(L("password_change_success_alert"));
                            //we need to update the local user so it won't have to enter the new password again
                            var currentUser = JSON.parse(Ti.App.Properties.getString('currentUser'));
                            currentUser.password = $.TfNewPass.getValue();
                            currentUser.unhashedPassword = $.TfNewPass.getValue();
                            Ti.App.fireEvent('userUpdate', currentUser);
                        },
                        onError : function(result) {
                            Ti.API.info('Password change error: ' + JSON.stringify(result));
                            if (result && result.detail)
                                alert(result.detail);
                        },
                        params : {
                            oldPassword : $.TfPass.getValue(),
                            newPassword : $.TfNewPass.getValue(),
                            newPassword_confirm : $.TfRepeatPass.getValue()
                        }
                    });
                    ajaxChangePassword.change();
                } else
                    alert(result.message);
            });
            break;
        case "BtnCancel":
            Ti.App.fireEvent('appInit');
            header.hideHeader();
            break;
    }
}

function validatePassword(_handler) {
    //validating only strings more than 2 chars
    var password = $.TfPass.getValue();
    var newPassword = $.TfNewPass.getValue();
    var repeat = $.TfRepeatPass.getValue();
    if (!newPassword.length) {
        _handler({
            error : 102,
            message : L('password_empty_error'),
        });
        return;
    }
    //validating password length
    if (newPassword.length < 5) {
        _handler({
            error : 100,
            message : L('password_too_short'),
        });
        return;
    }
    if (newPassword !== repeat) {
        _handler({
            error : 101,
            message : L("password_dont_match"),
        });
        return;
    }
    if (newPassword === repeat) {
        _handler({
            success : 1
        });
        return;
    }
}
