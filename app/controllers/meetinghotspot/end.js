var header = Alloy.Globals.header.view;
header.showHeader();
header.changeTitle(L("Challenge_details"));

//Properties
var args = arguments[0] || {};
var currentUser = JSON.parse(Ti.App.Properties.getString('currentUser'));

//Services
var AjaxMeetingHotspot = require('net/ajaxmeetinghotspot');



/*
	AjaxMeetingHotspot success handler
*/
var ajaxMeetingHotspotSuccessHandler = function(result) {
	parseMeetingHotspot(result);
};

/*
	AjaxMeetingHotspot error handler
*/
var ajaxMeetingHotspotErrorHandler = function(err) {
	var dialog = Ti.UI.createAlertDialog({
		buttonNames : [L('Ok')],
		message : L("err" + err.error),
		title : L('Error')
	});
	dialog.show();
};

/*
	Fetch the meeting hotspot
*/
var ajaxMeetingHotspot = new AjaxMeetingHotspot({
	onSuccess : ajaxMeetingHotspotSuccessHandler,
	onError : ajaxMeetingHotspotErrorHandler,
	params : {
		meetinghotspot_id : args.id,
	}
});
ajaxMeetingHotspot.fetch();

function parseMeetingHotspot(result) {
	var meetingHotspot = result.meetinghotspot;
	var template = meetingHotspot.template;
	
	//showing bonus part if exists
	if (template.bonus || template.superBonus) {
		$.scoreWrapper.setWidth(Ti.UI.FILL);
		$.bonusWrapper.setWidth('50%');
		$.bonusWrapper.setHeight(Ti.UI.SIZE);
		$.tokensWrapper.setWidth('50%');
	} else {
		$.scoreWrapper.setWidth('50%');
		$.bonusWrapper.setWidth('0dp');
		$.bonusWrapper.setHeight('0dp');
		$.tokensWrapper.setWidth(Ti.UI.FILL);
	}
	
	$.challengeTitle.text = template.name;
	
	$.scannedNumber.text = result.playersScanned;
	$.tokensNumber.text = result.tokens;
	$.bonusNumber.text = result.bonusTokens;
};
