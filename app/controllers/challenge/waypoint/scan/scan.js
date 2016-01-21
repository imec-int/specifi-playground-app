var header = Alloy.Globals.header.view;
header.showHeader();
header.changeTitle(L("Play_challenge"));


//Libs
var scanUtils = require("utils/scanutils");
var utils = require('utils');

//Properties
var args = arguments[0] || {};
var userChallenge = {};
var currentWaypoint;
var hintUsed = false;

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
*	Determine currentWaypoint
*/
function findCurrentWaypoint(data) {
	var waypoints = data.challenge.waypoints;
	var completedWP = data.completedWP ? data.completedWP : [];
	if(completedWP.length < waypoints.length) {
		return waypoints[completedWP.length];
	} else {
		return null;
	}
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
		currentWaypoint = findCurrentWaypoint(userChallenge);
	} else {
		completeUserChallenge(userChallenge);
		return;
	}
	
	resetView();
	
	$.challengeTitle.text = '" ' + userChallenge.challenge.name + ' "';
	
	if (utils.testPropertyExists(userChallenge, 'hintsUsed')) {
		var found = _.find(userChallenge.hintsUsed, function(hint){
			return hint == currentWaypoint._id;
		});
		hintUsed = found != undefined ? true : false;
	}

	if (utils.testPropertyExists(currentWaypoint, "name") )
		$.currentWaypoint.text = currentWaypoint.name;
		
	if (utils.testPropertyExists(currentWaypoint, "content.text"))
		$.waypointDescription.text = currentWaypoint.content.text;
		
	
	$.waypointNumber.text = String.format(L("playWaypointNumber"),userChallenge.completedWP.length + 1);
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
					id : args.id
				}
			});
			break;
		
		case "btnAccess":
			Alloy.Globals.pushPath({
				viewId : 'challenge/waypoint/availability/info',
				data : {
					id : args.id
				}
			});
			break;
	
		case "btnHint":
			Alloy.Globals.pushPath({
				viewId : "challenge/waypoint/hint/info",
				data : {
					id : args.id
				}
			});
			break;
	
		case "btnLocation":
			if (hintUsed || !currentWaypoint.locationHidden) {
				Alloy.Globals.pushPath({
					viewId : 'challenge/waypoint/map',
					data : {
						id : args.id
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
	
	var qrCode = scanUtils.parseQRCode(e.barcode);
	
	if(!qrCode) {
		alert(L('scan_unknown_type'));
		startScanning();
		return;
	}				
					
	if (currentWaypoint.type === 'ugc') {
		//We need to check the QR code here because the upload screen doesn't allow you to rescan the QR
		if (qrCode.id == currentWaypoint.qr) {
			Alloy.Globals.pushPath({
				viewId : 'challenge/waypoint/ugc/upload',
				data : {
					id : args.id,
					qr : qrCode
				}
			});
		} else {
			alert(L("waypoint_qr_error"));
			startScanning();
		}
	} else {
		var ajaxCompleteWaypoint = new AjaxCompleteWaypointQR({
			onSuccess : function(result) {
				if(result.complete) {
					completeUserChallenge(result);
				} else {
					Alloy.Globals.pushPath({
						viewId : "challenge/waypoint/info",
						data : {
							id : result.challenge._id
						}
					});
				}
			},
			onError : ajaxWaypointErrorHandler,
			params : {
				challengeid : args.id,
				qrcode : qrCode.id
			}
		});
		ajaxCompleteWaypoint.completeWaypoint();
	}
}

/*
	Handles a scan cancel event
*/
function scanCancelHandler(e) {
	//@TODO Can we even cancel?
}

