var header = Alloy.Globals.header.view;
header.changeTitle(L("Register_password"));

//Properties
var args = arguments[0] || {};
var user = args.user;
if (!user)
	Alloy.Globals.pushPath({viewId:'login',resetPath:true});
	
if(user.password)
	$.TfPass.setValue(user.password);

header.showHeader();
header.changeTitle(L("Register_password"));

$.registerHint.setText(L("registerPasswordHelp"));

//focusing on the textfield
setTimeout(function() {
    $.TfPass.focus();
}, 1000);

//Shows error underneath the textfield
function showError(err){
	$.textFieldBackground.setBackgroundColor("#FF5C5C");
	$.TfPass.setBackgroundColor("#FF5C5C");
	$.registerHint.setText(L("err"+err.error));
	$.registerHint.setColor("#FF0000");
 };




function onValueChanged(e) {
    validatePassword(e.source.value, function() {
    	$.textFieldBackground.setBackgroundColor("#FFFFFF");
    	$.TfPass.setBackgroundColor("#FFFFFF");
    	$.registerHint.setText(L( "registerPasswordHelp"));
    	$.registerHint.setColor("#FFFFFF");
    }, function(err){
    	showError(err);
    });
};

function onClick(e) {
    var buttonId = e.source.id;
    switch (buttonId) {
        case "btnRegisterNext":
        	$.TfPass.blur();
            var tfTopText = $.TfPass.getValue();

            validatePassword(tfTopText,function() {
                //saving value in the global registration container
                user.password = tfTopText;
                
                //going to next registration step
                Alloy.Globals.pushPath({
                    viewId : 'register/email',
                    data: {
                    	user: user
                    }
                });
            }, function(err){
            	showError(err);
            });
            break;
        case "btnRegisterCancel":
       		$.TfPass.blur();
            Alloy.Globals.pushPath({viewId: 'login', resetPath: true});
            header.hideHeader();
            break;
    }
}

function validatePassword(password, _handler, _errorHandler) {
    if (!password.length) {
        return _errorHandler({error: '1012'});
    }
    //validating password length
    if (password.length < 5) {
        return _errorHandler({error: '1013'});
    }
    return _handler();
}
