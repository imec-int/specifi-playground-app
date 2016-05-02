var header = Alloy.Globals.header.view;
header.changeTitle(L("Register_Privacy"));

//Libs
var connection = require('connectiondefaults');

//Properties
var args = arguments[0] || {};
var user = args.user;
var data=[];

	
if (!user)
	Alloy.Globals.pushPath({viewId:'login',resetPath:true});

//Shows error underneath the textfield
function showError(err){
	if(!$.privacySwitch.getValue()){
		if(OS_IOS){
			$.privacyLabel.setColor("#FF0000");
		}
		$.privacySwitch.setColor("#FF0000");
		$.registerHint.setText(L("err"+err));
		$.registerHint.setColor("#FF0000");
	}
 };


//Handles clicks
function onClick(e) {
    var buttonId = e.source.id;
    switch (buttonId) {
        case "btnRegisterNext":
            validateInput("nl-NL", $.privacySwitch.getValue(), function() {
                user.language = "nl-NL";
               
            	user.privacyAndTerms = $.privacySwitch.getValue();
                user.contactProjects = $.projectSwitch.getValue();
                user.contactSurveys = $.surveySwitch.getValue();

                //going to next registration step
                Alloy.Globals.pushPath({
                    viewId : 'register/photo',
                    data: {
                    	user: user
                	}
                });
            });
            break;
        case "btnRegisterCancel":
            Alloy.Globals.pushPath({viewId: 'login', resetPath: true});
            header.hideHeader();
            break;
        case "readPrivacyLabel":
			Ti.Platform.openURL(connection.root+connection.endpoints.privacy.terms.url);
            break;
    }
}

//Validates the required input
function validateInput(language, privacy, _handler) {
    if(!language || !privacy)
    	return showError("1020");
	else
		return _handler();
}