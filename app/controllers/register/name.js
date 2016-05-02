var header = Alloy.Globals.header.view;
header.hideSliderButton();

//Properties
var args = arguments[0] || {};
var user = args.user || {};

if (!user)
	Alloy.Globals.pushPath({viewId:'login',resetPath:true});
	
if(user.firstname)
	$.firstName.setValue(user.firstname);
if(user.surname)
	$.surName.setValue(user.surname);

header.showHeader();
header.changeTitle(L("Register_Name"));
$.firstName.show();
$.surName.show();

setTimeout(function() {
    $.firstName.focus();
}, 1000);

$.registerHint.setText(L("registerNameHelp"));

//Marks the field as wrong
function showError(textfield, background){
	background.setBackgroundColor("#FF5C5C");
	textfield.setBackgroundColor("#FF5C5C");
	$.registerHint.setText(L("err1020"));
	$.registerHint.setColor("#FF0000");
 };

//On username change
function onValueChanged(e) {
    if($.firstName.getValue() && $.surName.getValue()) {
    	$.firstNameBackground.setBackgroundColor("#FFFFFF");
    	$.surNameBackground.setBackgroundColor("#FFFFFF");
    	$.firstName.setBackgroundColor("#FFFFFF");
    	$.surName.setBackgroundColor("#FFFFFF");
    	$.registerHint.setText(L( "registerNameHelp"));
    	$.registerHint.setColor("#FFFFFF");
    }
};


function onClick(e) {
    var buttonId = e.source.id;
    switch (buttonId) {
        case "btnRegisterNext":
            var firstName = $.firstName.getValue();
            var surName = $.surName.getValue();
            $.firstName.blur();
            $.surName.blur();
            validateName(firstName, surName, function() {
                user.firstname = firstName;
                user.surname = surName;
                
                //going to next registration step
                Alloy.Globals.pushPath({
                    viewId : 'register/user',
                    data: {
                    	user: user
                    }
                });
            });

            break;
        case "btnRegisterCancel":
            $.firstName.blur();
            $.surName.blur();
            $.registerHint.fireEvent('blur');
           	Alloy.Globals.pushPath({viewId: 'login', resetPath: true});
            header.hideHeader();
            break;
    }
}

//Validate Username
function validateName(first, last, _handler) {
    if (first.length > 0 && last.length > 0) {
    	_handler();
    } else {
        if(first.length <=0)
        	showError($.firstName, $.firstNameBackground);
    	if(last.length <=0)
    		showError($.surName, $.surNameBackground);
    }
}
