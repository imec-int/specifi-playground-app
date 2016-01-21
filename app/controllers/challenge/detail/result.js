var header = Alloy.Globals.header.view;
header.showHeader();
header.changeTitle(L("Challenge_ended"));

//Properties
var args = arguments[0] || {};

//Libs
var connection = require('connectiondefaults');


$.challengeTitle.text = '" '+args.name+' "';
$.tokensNumber.text = args.gained;

Ti.App.fireEvent('userUpdate', args.user);


/*
	General click handler
*/
function onClick(e) {
    switch (e.source.id) {
        case "btnMoreChallenges":
            Alloy.Globals.pushPath({
                viewId : "challenge/nearby/list",
                resetPath: true
            });
            break;
    }
}
