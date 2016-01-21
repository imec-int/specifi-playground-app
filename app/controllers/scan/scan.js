var header = Alloy.Globals.header.view;
header.showHeader();
header.changeTitle(L("scan_title"));

//Libs
var scanUtils = require("utils/scanutils");
var moment = require("alloy/moment");

//Properties
var args = arguments[0] || {};

//Services
var AjaxScan = require('/net/ajaxscan');


/*
	Handles a successful scan
*/
function scanSuccessHandler(e) {
	var qrCode = scanUtils.parseQRCode(e.barcode);
	
	if(!qrCode) {
		$.scanningInstructions.text = L("scan_unknown_type");
		return;
	}
	
	var ajaxScan = new AjaxScan({
		onSuccess : ajaxScanSuccessHandler,
		onError : ajaxScanErrorHandler,
		params : {
			id : qrCode.id
		}
	});
	
	switch(qrCode.type) {
		case "pm":
			ajaxScan.scanPersonalMarker();
			break;
		case "wp":
			ajaxScan.scanWaypoint();
			break;
		default:
			$.scanningInstructions.text = L("scan_unknown_type");
			break;
	}
	
}


/*
	Handles scanning cancel event
*/
function scanCancelHandler(e) {
	showScanner(false);
}


/*
	Creates a scanner view and adds it to the view
*/
function startScan() {
	showError(false, "");
	showScanner(true);
	showTokens(false);
}


/*
	AjaxScan success handler
*/
function ajaxScanSuccessHandler(result) {
	Ti.App.fireEvent('userUpdate', result.scanner);
	var type = "";
	switch(result.type) {
		case "personalmarker":
			type = L("scan_type_pm");
			break;
		case "waypoint":
			type = L("scan_type_wp");
			break;
	}
	var cooldownOver = moment(result.createdAt).add(Alloy.Globals.appConfig.gameSettings.scanCooldown,'seconds');
	$.scanningInstructions.text = String.format(L("scan_success"), type, result.score, cooldownOver.format('DD/MM/YYYY hh:mm:ss'));
	showScanner(false);
	showTokens(true);
	$.tokenNumber.text = result.score;
}


/*
	AjaxScan error handler
*/
function ajaxScanErrorHandler(err) {
	showScanner(false);
	showTokens(false);
	showError(true, L("err"+err.error));
}


/*
	Show or hides scanner/tokens
*/
function showScanner(show) {
	if(show) {
		Alloy.Globals.startScanning($.scannerWrapper, scanSuccessHandler, scanCancelHandler);
		$.scannerWrapper.setHeight('60%');
		$.footerWrapper.setHeight('0dp');
	} else {
		Alloy.Globals.stopScanning();
		$.scannerWrapper.setHeight('0dp');
		$.footerWrapper.setHeight(Alloy.Globals.appConfig.headerHeight);
	}
}

/*
	Show or hide tokens
*/
function showTokens(show) {
	if(show) {
		$.tokenRow.setHeight(Titanium.UI.SIZE);
		$.tokenIcon.setHeight('40dp');
		$.tokenIcon.setVisible(true);
		$.completedIcon.setHeight('80dp');
		$.completedIcon.setVisible(true);
	} else {
		$.tokenRow.setHeight('0dp');
		$.tokenIcon.setHeight('0dp');
		$.tokenIcon.setVisible(false);
		$.completedIcon.setHeight('0dp');
		$.completedIcon.setVisible(false);
		$.tokenNumber.text = '';
	}
}

/*
	Show or hide tokens
*/
function showError(show, error) {
	if(show) {
		$.scanningInstructions.text = error;
	} else {
		$.scanningInstructions.text = String.format(L("scanning_instructions"), L("app_name"));
	}
}


/*
	Handles a click an the try again button
*/
function btnTryAgainClick(e) {
	showTokens(false);
	showError(false, "");
	showScanner(true);
}

startScan();
