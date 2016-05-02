var header = Alloy.Globals.header.view;
header.showHeader();
header.changeTitle(L("Play_challenge"));

//Libs
var utils = require("utils");
var challengeUtils = require('challengeutils');

//Properties
var args = arguments[0] || {};
var userChallenge = {};
var currentWaypoint;
var wpId = args.wpId;

//Map
var MapModule = require('ti.map');
var mapView = MapModule.createView({});
mapView.setUserLocation(true);
var overMapInfo = $.overMapInfo;
$.mapWrapper.removeAllChildren();
Alloy.Globals.mapViews.push(mapView);

//Services
var AjaxUserChallenge = require('/net/ajaxuserchallenge');


/*
	Get the userchallenge
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


/*
	Navigates back to challenge detail
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

/*
	Resets all fields that can change
*/
function resetView() {
	mapView.removeAllAnnotations();
}


/*
	Parse the result and fill the userchallenge object
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
	$.currentWaypoint.text = currentWaypoint.name;
	
	var geos = [];
	geos.push({
		latitude : currentWaypoint.location.geo[1],
		longitude : currentWaypoint.location.geo[0]
	});
	var annotationData = {
		latitude : parseFloat(currentWaypoint.location.geo[1]),
		longitude : parseFloat(currentWaypoint.location.geo[0]),
		title : L("Challenge_starts_here"),
		image : "images/icons/pin-plain-flag.png",
		id : currentWaypoint._id,
		touchEnabled : true,
		showInfoWindow : false,
		canShowCallout : false
	};
	var annotation = MapModule.createAnnotation(annotationData);
	
	geos.push({
		latitude : Alloy.Globals.currentCoords.latitude,
		longitude : Alloy.Globals.currentCoords.longitude
	});
	
	mapView.addAnnotation(annotation);
	
	var userAnnotationData = {
		latitude : Alloy.Globals.currentCoords.latitude,
		longitude : Alloy.Globals.currentCoords.longitude,
		title : L("You_are_here"),
		image : "images/icons/pin-current-location.png",
		id : "user",
		touchEnabled : true,
		showInfoWindow : false,
		canShowCallout : false
	};

	var userAnnotation = MapModule.createAnnotation(userAnnotationData);
	mapView.addAnnotation(userAnnotation);
	
	//calculating all challenges to fit them to the screen
	var MapZoomToAnnotations = require('mapzoomtoannotations');
	var region = new MapZoomToAnnotations(geos);
	$.mapWrapper.add(mapView);
	$.mapWrapper.add(overMapInfo);
	Alloy.Globals.mapViews.push(mapView);
	mapView.region = region;

	$.footerWrapper.animate({
		bottom: "0dp",
		duration: 400
	});
};

/*
	Navigate to the result screen
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


/*
	Handles the click events
*/
function onClick(e) {
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
		case "btnScan":
			Ti.App.fireEvent('stopAudio');
			qrOrBeaconScanning();
			break;
	}
}

/**
 * Offer QR or beacon scanning if beacons are available
 */
function qrOrBeaconScanning() {
	if(currentWaypoint.beaconUUID && Alloy.Globals.iBeaconEnabled) {
		var dialog = Ti.UI.createAlertDialog({
			buttonNames : [L('scan_qr_btn'), L('scan_beacon_btn')],
			message : L('qr_or_beacon_question'),
			title : L('scanning_type_title')
		});
		dialog.addEventListener('click', function(e) {
			switch (e.index) {
				case 0:
					Alloy.Globals.pushPath({
						viewId : "challenge/waypoint/scan/scan",
						data : {
							id : args.id,
							wpId: args.wpId
						}
					});
					break;
				case 1:
					Alloy.Globals.pushPath({
						viewId : "challenge/waypoint/beacon/info",
						data : {
							id : args.id,
							wpId: args.wpId
						}
					});
					break;
				default:
					break;
			}
	
		});
		dialog.show();
	} else {
		Alloy.Globals.pushPath({
			viewId : "challenge/waypoint/scan/scan",
			data : {
				id : args.id,
				wpId: args.wpId
			}
		});
	}
}