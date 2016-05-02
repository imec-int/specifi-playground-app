var header = Alloy.Globals.header.view;
header.hideSliderButton();

//Properties
var args = arguments[0] || {};
var user = args.user || {};
//Services
var UsernameAjaxValidation = require('/net/usernameajaxvalidation');

//initializing to empty on every attempt
header.showHeader();
header.changeTitle(L("Register_as_a_new_player"));
$.TfTop.show();

if(user.username)
	$.TfTop.setValue(user.username);

//focusing on the textfield

setTimeout(function() {
    $.TfTop.focus();
}, 1000);

$.registerHint.setText(L("registerUsernameHelp"));

//Shows error underneath the textfield
function showError(err){
	$.textFieldBackground.setBackgroundColor("#FF5C5C");
	$.TfTop.setBackgroundColor("#FF5C5C");
	$.registerHint.setText(L("err"+err.error));
	$.registerHint.setColor("#FF0000");
 };

//On username change
function onValueChanged(e) {
    validateUser(e.source.value, function(result){
    	$.textFieldBackground.setBackgroundColor("#FFFFFF");
    	$.TfTop.setBackgroundColor("#FFFFFF");
    	$.registerHint.setText(L( "registerUsernameHelp"));
    	$.registerHint.setColor("#FFFFFF");
    }, function(err){
    	showError(err);
    });
};



function onClick(e) {
    var buttonId = e.source.id;
    switch (buttonId) {
        case "btnRegisterNext":
            var username = $.TfTop.getValue();
            $.TfTop.blur();
            validateUser(username, function(result) {
                user.username = username;
                
                if (result.unique) {
                    //going to next registration step
                    Alloy.Globals.pushPath({
                        viewId : 'register/password',
                        data: {
                        	user: user
                        }
                    });
                } else {
                   showError({error:"1007"}); 
                }
            }, function(err){
            	showError(err);
            });

            break;
        case "btnRegisterCancel":
            //going back to initial state (not logged)
            $.TfTop.blur();
            $.registerHint.fireEvent('blur');
            Alloy.Globals.pushPath({viewId: 'login', resetPath: true});
            header.hideHeader();
            break;
    }
}

//Validate Username
function validateUser(username, _handler, _errorHandler) {
    if (username.length <= Alloy.Globals.appConfig.maxUsernameLength && username.length >= Alloy.Globals.appConfig.minUsernameLength) {
        var uav = new UsernameAjaxValidation({
            params: {
            	username : username,
            },
            onSuccess : _handler,
            onError : _errorHandler,
        });
        uav.validate();
    } else {
        _errorHandler({error: '1018'});
    }
}
