var header = Alloy.Globals.header.view;
header.showHeader();
header.changeTitle(L("Play_challenge"));

//Libs
var scanUtils = require("utils/scanutils");
var utils = require('utils');
var challengeUtils = require('challengeutils');

//Properties
var args = arguments[0] || {};
var userChallenge = {};
var currentWaypoint;
var wpId = args.wpId;
var currentUser = JSON.parse(Ti.App.Properties.getString('currentUser'));

//Services
var AjaxUserChallenge = require('/net/ajaxuserchallenge');
var AjaxCompleteWaypointQR = require('/net/ajaxcompletewaypointqr');


/**
*	Get the userchallenge
*/
var ajaxUserChallenge = new AjaxUserChallenge({
	onSuccess : function(result) { 
		Ti.API.info('Success getting UserChallenge: ' + JSON.stringify(result));
		parseChallenge(result);
	},
	onError : function(result) { 
		Ti.API.info('Error getting UserChallenge: ' + JSON.stringify(result));
		alert(L("ajaxUserChallengeError"));
		goBackToDetail();
	},
	params : {
		challenge_id : args.id
	}
});
ajaxUserChallenge.fetch();


/**
*	Handle complete waypoint error
*/
var ajaxWaypointErrorHandler = function(result) {
	Ti.API.info("Error:"+JSON.stringify(result));
	startScanning();
	alert(L("waypoint_qr_error"));
};


/**
*	Navigates back to challenge detail
*/
var goBackToDetail = function() {
	Alloy.Globals.popPath();
	Alloy.Globals.pushPath({
		viewId : 'challenge/detail/start',
		data : {
			id : args.id
		},
		resetPath: true
	});
};


/**
*	Resets all fields that can change
*/
function resetView() {
}


/**
*	Parse the result and fill the userchallenge object
*/
function parseChallenge(data) {
	userChallenge = data;
	
	if(!userChallenge.complete) {
		currentWaypoint = challengeUtils.findCurrentWaypoint(userChallenge, wpId);
	} else {
		completeUserChallenge(userChallenge);
		return;
	}
	
	resetView();
	
	$.challengeTitle.text = '" ' + userChallenge.challenge.name + ' "';

	if (utils.testPropertyExists(currentWaypoint, "name") )
		$.currentWaypoint.text = currentWaypoint.name;
		
	if (utils.testPropertyExists(currentWaypoint, "content.text"))
		$.waypointDescription.text = currentWaypoint.content.text;
		
	
	$.waypointNumber.text = String.format(L("playWaypointNumber"),challengeUtils.findStep(userChallenge.challenge.waypoints, currentWaypoint._id));
	if (userChallenge.challenge.waypoints.length > 1) {
		$.waypointNumberOf.text = String.format(L("playWaypointNumberOf"),userChallenge.challenge.waypoints.length);
	} else {
		$.waypointNumberOf.text = L("playSingleWaypointOf");
	}
	
	startScanning();
	
	$.footerWrapper.animate({
		bottom: "0dp",
		duration: 400
	});
};


/**
*	Navigate to the result screen
*/
function completeUserChallenge(data) {
	Alloy.Globals.pushPath({
		viewId : "challenge/detail/result",
		data : {
			id : data.challenge._id,
			gained : data.score,
			name : data.challenge.name,
			user: data.user
		},
		resetPath:true
	});
}

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

/**
*	Handles the click events
*/
function onClick(e) {
	stopScanning();
	switch(e.source.id) {
		
		case "btnDetails":
			Alloy.Globals.pushPath({
				viewId : "challenge/waypoint/info",
				data : {
					id : args.id,
					wpId: args.wpId
				}
			});
			break;
		
		case "btnAccess":
			Alloy.Globals.pushPath({
				viewId : 'challenge/waypoint/availability/info',
				data : {
					id : args.id,
					wpId: args.wpId
				}
			});
			break;
		case 'btnBack':
			if(userChallenge.randomOrder) {
				Alloy.Globals.pushPath({
					viewId : 'challenge/waypoint/random',
					data : {
						id : args.id
					},
					resetPath: true
				});
			} else {
				goBackToDetail();
			}
			break;
		case "btnLocation":
			if (!currentWaypoint.locationHidden) {
				Alloy.Globals.pushPath({
					viewId : 'challenge/waypoint/map',
					data : {
						id : args.id,
						wpId: args.wpId
					}
				});
			} else {
				alert(L("waypoint_location_hidden_error"));
			}
			break;
	
		case "btnScan":
			startScanning();
			break;
	}
}

/*
	Handles a successful scan
*/
function scanSuccessHandler(e) {
	stopScanning();
	Ti.API.info("Parse QR started!");
	var qrCode = scanUtils.parseQRCode(e.barcode);
	Ti.API.info("QR parsed: "+JSON.stringify(qrCode));
	if(!qrCode) {
		alert(L('scan_unknown_type'));
		startScanning();
		return;
	}
	
	if (currentWaypoint.type === 'ugc') {
		//We need to check the QR code here because the upload screen doesn't allow you to rescan the QR
		if (qrCode.id == currentWaypoint.qr) {
			setTimeout(function(){
			Alloy.Globals.pushPath({
				viewId : 'challenge/waypoint/ugc/upload',
				data : {
					id : args.id,
					qr : qrCode,
					wpId: currentWaypoint._id
				}
			});},0);
		} else {
			alert(L("waypoint_qr_error"));
			startScanning();
		}
	} else {
		//Bug as reported her https://github.com/Pushwoosh/pushwoosh-appcelerator-titanium/issues/6
		Ti.API.info("Scan successful!");
		setTimeout(function(){completeWaypoint(qrCode);},0);
	}
}

/*
	Handles completing a waypoint
*/
function completeWaypoint(qrCode) {
	var ajaxCompleteWaypoint = new AjaxCompleteWaypointQR({
		onSuccess : function(result) {
			
			Ti.API.info("Call successful: "+JSON.stringify(result));
			if(result.complete) {
				completeUserChallenge(result);
			} else {
				if(userChallenge.randomOrder) {
					Alloy.Globals.pushPath({
						viewId : "challenge/waypoint/random",
						data : {
							id : result.challenge._id
						}
					});
				} else {
					Alloy.Globals.pushPath({
						viewId : "challenge/waypoint/info",
						data : {
							id : result.challenge._id
						}
					});
				}
			}
		},
		onError : ajaxWaypointErrorHandler,
		params : {
			challengeid : args.id,
			qrcode : qrCode.id
		}
	});
	Ti.API.info("Completewaypoint started!");
	ajaxCompleteWaypoint.completeWaypoint();
}

/*
	Handles a scan cancel event
*/
function scanCancelHandler(e) {
	//@TODO Can we even cancel?
	Ti.API.info("Scanning cancelled");
}

