var header = Alloy.Globals.header.view;
header.showHeader();
header.changeTitle(L("Play_challenge"));

//Libs
var utils = require('utils');

//Properties
var args = arguments[0] || {};
var userChallenge = {};
var currentWaypoint;
var hintUsed = false;
var previousRange = 'unknown';
var animation = Ti.UI.createAnimation({
	opacity: 1,
	duration : 1000, 
	autoreverse : true, 
	repeat : 1,
	curve: Titanium.UI.ANIMATION_CURVE_EASE_IN_OUT
});

//Services
var AjaxUserChallenge = require('/net/ajaxuserchallenge');
var AjaxCompleteWaypointBeacon = require('/net/ajaxcompletewaypointbeacon');

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
	stopRanging();
	startRanging();
	alert(L("waypoint_qr_error"));
};


/**
*	Navigates back to challenge detail
*/
var goBackToDetail = function() {
	stopRanging();
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
		
	
	startRanging();
	
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
*	Handles the click events
*/
function onClick(e) {
	stopRanging();
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
			//startRanging();
			break;
	}
}

/*
	Handles a beacon proximity event
*/
var beaconProximityHandler = function(e) {
	var proximity = currentWaypoint.beaconProximity;
	if(!proximity){
		proximity = 'near';
	}
	if(e && e.proximity === proximity) {
		stopRanging();
		if (currentWaypoint.type === 'ugc') {
			//Since we were monitoring for the correct UUID already, we don't have to check it
			Alloy.Globals.pushPath({
				viewId : 'challenge/waypoint/ugc/upload',
				data : {
					id : args.id,
					beacon : currentWaypoint.beaconUUID
				}
			});
		} else {
			var ajaxCompleteWaypoint = new AjaxCompleteWaypointBeacon({
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
					wpid: currentWaypoint._id,
					challengeid : args.id,
					beacon : currentWaypoint.beaconUUID
				}
			});
			ajaxCompleteWaypoint.completeWaypoint();
		}
	} else {
		showRange(e.proximity);
	}
};

/**
*	Starts beacon ranging
*/
function startRanging(){
	var beacon = { uuid: currentWaypoint.beaconUUID };
	if(currentWaypoint.beaconMajor)
		beacon.major = currentWaypoint.beaconMajor;
	if(currentWaypoint.beaconMinor)
		beacon.minor = currentWaypoint.beaconMinor;
	Alloy.Globals.beaconUtils.startRanging(beacon, beaconProximityHandler);
	showRange('unknown');
}


/**
*	Stops beacon ranging
*/
function stopRanging() {
	Alloy.Globals.beaconUtils.stopRanging();
	showRange('stop');
}

/**
 * Show and animate the correct range box
 * @param {String} range Returned by beacon proximity ranging. Values are unknown, far, near, immediate
 */
function showRange(range) {
	if(previousRange === range)
		return;
	else
		previousRange = range;
}

/**
 * Keep animation going until told to stop
 */
function loopAnimation() {
	switch(previousRange) {
		case 'unknown':
			$.beaconNotFound.animate(animation, loopAnimation);
			break;
		case 'far':
			$.beaconFar.animate(animation, loopAnimation);
			break;
		case 'near':
		case 'immediate':
			$.beaconNear.animate(animation, loopAnimation);
			break;
	}
}

loopAnimation();