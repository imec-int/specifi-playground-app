var header = Alloy.Globals.header.view;
header.showHeader();
header.changeTitle(L("Challenge_details"));

//Properties
var args = arguments[0] || {};


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

/*
	Update data every ten seconds
*/
var refreshing = setInterval(function() {
	ajaxMeetingHotspot.fetch();
}, 10000);
Alloy.Globals.counterIds.push(refreshing);
ajaxMeetingHotspot.fetch(); 


/*
	Parse the meeting hotspot data
*/
function parseMeetingHotspot(result) {
	var meetingHotspot = result.meetinghotspot;
	var template = meetingHotspot.template;

	//Showing the bonus tokens earned if there are bonus tokens
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

	$.challengeTitle.text = '" '+template.name+' "';
	
	$.onRouteNumber.text = meetingHotspot.players.length-1;
	
	//adjusting the remaining time to take the server difference into account
	var remaining = new Date(meetingHotspot.end).getTime() - new Date().getTime() >= -Alloy.Globals.appConfig.clientServerDifference ? new Date(meetingHotspot.end).getTime() - new Date().getTime() + Alloy.Globals.appConfig.clientServerDifference : 0;
	$.timeRemainingCountDown.start(remaining, {
		onStop : function() {
			$.timeRemainingCountDown.setText(L("You_re_too_late_exclamation"));
			$.timeRemainingText.height = "0dp";
			$.timeRemainingText.setText("");

			Alloy.Globals.pushPath({
				viewId : "meetinghotspot/end",
				data : {
					id : args.id
				},
				resetPath : true,
			});
		}
	});

	$.scannedNumber.text = result.playersScanned;
	$.tokensNumber.text = result.tokens;
	$.bonusNumber.text = result.bonusTokens;
};


/*
	General click handler
*/
function onClick(e) {
	switch (e.source.id) {
		case "btnScan":
			var dialog = Ti.UI.createAlertDialog({
				buttonNames : [L('Scan'), L('Be_scanned')],
				message : L('Meeting_hotspot_scan_question'),
				title : L('Meeting_hotspot_scan')
			});
			dialog.addEventListener('click', function(e) {
				switch (e.index) {
					case 0:
						Alloy.Globals.pushPath({
							viewId : "meetinghotspot/scan",
							data : {
								id : args.id
							}
						});
						break;
					case 1:
						Alloy.Globals.pushPath({
							viewId : "meetinghotspot/qrcode",
							data : {
								id : args.id
							}
						});
						break;
					default:
						break;
				}
	
			});
			dialog.show();
			break;
		case "btnMap":
			Alloy.Globals.pushPath({
				viewId : "meetinghotspot/map",
				data : {
					id : args.id,
					playing: true
				}
			});
			break;
	}
}
