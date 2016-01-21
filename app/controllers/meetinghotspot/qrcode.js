var header = Alloy.Globals.header.view;
header.showHeader();
header.changeTitle(L("Challenge_details"));

//Properties
var args = arguments[0] || {};
var currentUser = JSON.parse(Ti.App.Properties.getString('currentUser'));

//Libs
var scanUtils = require("utils/scanutils");

//Services
var AjaxMeetingHotspot = require('net/ajaxmeetinghotspot');

$.userQr.height = "280dp";
$.userQr.image = Alloy.Globals.qrCodeImageUrl(scanUtils.createQRCode(currentUser._id+"/pl"));


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

/*
	Parse the meeting hotspot
*/
function parseMeetingHotspot(result) {
	$.challengeTitle.text = '" '+result.meetinghotspot.template.name+' "';
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
		case "btnDetails":
			Alloy.Globals.pushPath({
				viewId : "meetinghotspot/play",
				data : {
					id : args.id
				}
			});
			break;
	}
}
