var header = Alloy.Globals.header.view;
header.changeTitle(L("Register_birth_year"));

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


//focusing on the textfield
setTimeout(function() {
    $.TfTop.focus();
}, 1000);

function onClick(e) {
    var buttonId = e.source.id;
    switch (buttonId) {
        case "BtnNext":
            var tfTopText = $.TfTop.getValue();
            validateYear(tfTopText, function(response) {
                //saving value in the global registration container
                if (!response.error) {
                	$.TfTop.blur();
                    Alloy.Globals.registerData.birthyear = tfTopText;
                    
                    //storing this for resume 
                    Ti.App.Properties.setString("registerData",JSON.stringify(Alloy.Globals.registerData));
                    
                    Alloy.Globals.pushPath({
                        viewId : 'register/gender'
                    });
                } else
                    alert(response.message);
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

function validateYear(year, _handler) {
    if ((year.length==4 && !isNaN(parseInt(year)) && isFinite(year)) || year.length==0) {
        _handler({
            error : false
        });
        return;
    } else {
        _handler({
            error : 1,
            message : L("yearFormatError"),
        });
        return;
    }
}
