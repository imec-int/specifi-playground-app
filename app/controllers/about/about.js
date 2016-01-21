var header = Alloy.Globals.header.view;
header.showHeader();
header.changeTitle(L("welcome_user_menu"));

var args = arguments[0] || {};
var user = Alloy.Globals.user;
if(user)
	$.helloLabel.text = String.format(L('welcome_user_title'), user.username);
	
$.description.value= L('welcome_user_text');

$.versionLabel.text = String.format(L('version_label'), Titanium.App.version);

function onClick(e) {
	var buttonId = e.source.id;
	switch (buttonId) {
		case "btnChallenges":
			Alloy.Globals.pushPath({
				viewId : 'challenge/nearby/list'
			});
			break;
	}
}
