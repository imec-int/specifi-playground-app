var header = Alloy.Globals.header.view;
header.changeTitle(L("Register_E_mail"));
$.registerHint.setText(L("registerEmailHelp"));

//Properties
var args = arguments[0] || {};
var user = args.user;

if (!user)
	Alloy.Globals.pushPath({viewId:'login',resetPath:true});

if(user.email)
	$.TfTop.setValue(user.email);

//focusing on the textfield
setTimeout(function() {
    $.TfTop.focus();
}, 1000);


//Shows error underneath the textfield
function showError(err){
	$.textFieldBackground.setBackgroundColor("#FF5C5C");
	$.TfTop.setBackgroundColor("#FF5C5C");
	$.registerHint.setText(L("err"+err.error));
	$.registerHint.setColor("#FF0000");
 };

function onValueChanged(e) {
    validateEmail(e.source.value, function(result) {
    	$.textFieldBackground.setBackgroundColor("#FFFFFF");
    	$.TfTop.setBackgroundColor("#FFFFFF");
        $.registerHint.setText(L( "registerEmailHelp"));
    	$.registerHint.setColor("#FFFFFF");
    }, function(err){
    	showError(err);
    });
};

function onClick(e) {
    var buttonId = e.source.id;
    switch (buttonId) {
        case "btnRegisterNext":
            var tfTopText = $.TfTop.getValue();
            $.TfTop.blur();
            //@TODO show the loading screen

            validateEmail(tfTopText, function(result) {
                if (result.unique) {	

                    //saving value in the global registration container
                    user.email = tfTopText;
                    
                    //going to next registration step
                    Alloy.Globals.pushPath({
                        viewId : 'register/privacy',
                        data: {
                        	user: user
                    	}
                    });
                } else {
                    showError({error:"1002"});
                }
            }, function(err){
            	showError(err);
            });
            break;
        case "btnRegisterCancel":
        	$.TfTop.blur();
            Alloy.Globals.pushPath({viewId: 'login', resetPath: true});
            header.hideHeader();
            break;
    }
}

function validateEmail(email, _handler, _errorHandler) {
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
                onError : _errorHandler
            });
            eav.validate();
        } else {
            _errorHandler({error: '1019'});
        }
    } else {
        _errorHandler({error: '1019'});
    }
}