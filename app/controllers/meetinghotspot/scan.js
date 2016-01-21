var header = Alloy.Globals.header.view;
header.showHeader();
header.changeTitle(L("Challenge_details"));

//Properties
var args = arguments[0] || {};

//Libs
var scanUtils = require("utils/scanutils");

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


/*
	Parse the meeting hotspot data
*/
function parseMeetingHotspot(result) {
	var meetingHotspot = result.meetinghotspot;
	var template = meetingHotspot.template;

	$.challengeTitle.text = '" '+template.name+' "';
	startScanning();
};

/**
*	Starts scanner
*/
function startScanning(){
	Alloy.Globals.startScanning($.scannerWrapper, scanSuccessHandler, scanCancelHandler);
}


/**
*	Stops scanner
*/
function stopScanning() {
	Alloy.Globals.stopScanning();
}


/*
	Handles a successful scan
*/
function scanSuccessHandler(e) {
	
	stopScanning();
	
	var qrCode = scanUtils.parseQRCode(e.barcode);
	
	var ajaxScanMeetingHotspot = new AjaxMeetingHotspot({
		onSuccess : ajaxScanMeetingHotspotSuccessHandler,
		onError : ajaxScanMeetingHotspotErrorhandler,
		params : {
			id : args.id,
			qr : qrCode.id,
			type: qrCode.type,
			location : Alloy.Globals.currentCoords.longitude + "," + Alloy.Globals.currentCoords.latitude
		}
	});
	ajaxScanMeetingHotspot.scan();
}

/*
	Handles a scan cancel event
*/
function scanCancelHandler(e) {
	//@TODO Can we even cancel?
}


/*
	Handle successful scan event
*/
var ajaxScanMeetingHotspotSuccessHandler = function(result) {
	Ti.App.fireEvent('userUpdate', result.user);
	Alloy.Globals.pushPath({
		viewId : "meetinghotspot/play",
		data : {
			id : args.id,
		}
	});
};

/*
	Handle scan error
*/
var ajaxScanMeetingHotspotErrorhandler = function(err) {
	stopScanning();
	var dialog = Ti.UI.createAlertDialog({
		buttonNames : [L('Ok')],
		message : L("err" + err.error),
		title : L('Error')
	});
	dialog.show();
	startScanning();
};


/*
	General click handler
*/
function onClick(e) {
	stopScanning();
	switch (e.source.id) {
		case "btnScan":
			var dialog = Ti.UI.createAlertDialog({
				buttonNames : [L('Scan'), L('Be_scanned')],
				message : L('Meeting_hotspot_scan_question'),
				title : L('Meeting_hotspot_scan')
			});
			dialog.addEventListener('click', function(e) {
				switch (e.index) {
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
		case "btnDetails":
			Alloy.Globals.pushPath({
				viewId : "meetinghotspot/play",
				data : {
					id : args.id,
				}
			});
			break;
	}
}