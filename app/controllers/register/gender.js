var header = Alloy.Globals.header.view;
header.changeTitle(L("Register_gender"));
$.labelTop.setText(L("registerGenderHelp"));

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

function maleBoxOutput() {
    //Ti.API.info('male Switch value: ' + $.maleRadio.getValue());
    $.femaleRadio.uncheck();
}

function femaleBoxOutput() {
    //Ti.API.info('female Switch value: ' + $.femaleRadio.getValue());
    $.maleRadio.uncheck();
}

function onClick(e) {
    var buttonId = e.source.id;
    switch (buttonId) {
        case "BtnNext":
            //saving gender in the global registration container
            Alloy.Globals.registerData.gender = $.femaleRadio.getValue() ? 'Female' : $.maleRadio.getValue() ? 'Male' : '';
            
            //storing this for resume 
            Ti.App.Properties.setString("registerData",JSON.stringify(Alloy.Globals.registerData));
            
            Alloy.Globals.pushPath({
                viewId : 'register/photo'
            });
            break;
        case "BtnCancel":
        	Ti.App.Properties.setString("registerData",false);
            Ti.App.Properties.setString("currentRoute",false);
            Ti.App.fireEvent('appInit');
            header.hideHeader();
            break;
    }
}