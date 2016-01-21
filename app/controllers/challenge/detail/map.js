var header = Alloy.Globals.header.view;
header.showHeader();
header.changeTitle(L("Challenge_details"));

//Sounds
var soundClickPrimary = Titanium.Media.createSound({
	url : '/sound/button_snap.mp3'
});

//Properties
var challenge = {};
var args = arguments[0] || {};
var started = false;
var mapmodule = require('ti.map');
var tiMap = mapmodule.createView({});
Alloy.Globals.mapViews.push(tiMap);
var overMapInfo = $.overMapInfo;
$.mapWrapper.removeAllChildren();

//Services
var AjaxUserChallenge = require('/net/ajaxuserchallenge');
var AjaxGetChallenge = require('/net/ajaxgetchallenge');


/*
	Get the userchallenge if it exists
*/
var ajaxUserChallenge = new AjaxUserChallenge({
	onSuccess : function(result) {
		Ti.API.info('Success getting UserChallenge: ' + JSON.stringify(result));
		showResumeButton();
		started = true;
		parseChallenge(result.challenge, result.start);
	},
	onError : function(result) {
		Ti.API.info('Error getting UserChallenge: ' + JSON.stringify(result));
		getChallenge();
	},
	params : {
		challenge_id : args.id
	}
});
ajaxUserChallenge.fetch();


/*
	Gets the challenge
*/
function getChallenge() {
	var ajaxGetChallenge = new AjaxGetChallenge({
		onSuccess : function(result) {
			Ti.API.info('Success getting challenge: ' + JSON.stringify(result));
			parseChallenge(result.challenge);
		},
		onError : function(result) {
			Ti.API.info('Error getting challenge: ' + JSON.stringify(result));
			alert(L('err' + result.error));
		},
		params : {
			challenge_id : args.id
		}
	});
	ajaxGetChallenge.fetch();
}


/*
	Show the resume button instead of the play button
*/
function showResumeButton() {
	$.btnPlayChallenge.setBackgroundColor("#F2C200");
	$.btnPlayChallenge.setIconImage("/images/icons/resume-arrow.png");
}


/*
	Parse the result and fill the challenge object
*/
function parseChallenge(data, startTime) {
	challenge = data;
	$.explanation.text = L("challengeDetailsMapExplanation");
	$.overMapInfo.height = "70dp";
	
	$.challengeTitle.text = '" ' + data.name + ' "';
	
	var geos = [];
	geos.push({
		latitude : data.location.geo[1],
		longitude : data.location.geo[0]
	});
	
	//Create annotations
	var annotationData = {
		latitude : parseFloat(data.location.geo[1]),
		longitude : parseFloat(data.location.geo[0]),
		title : L("Challenge_starts_here"),
		image : "images/icons/pin-play-flag.png",
		id : data._id,
		touchEnabled : true,
		showInfoWindow : false,
		canShowCallout : false
	};
	var annotation = mapmodule.createAnnotation(annotationData);
	tiMap.addAnnotation(annotation);
	
	//Set User's Location on Map
	geos.push({
		latitude : Alloy.Globals.currentCoords.latitude,
		longitude : Alloy.Globals.currentCoords.longitude
	});
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
	var userAnnotation = mapmodule.createAnnotation(userAnnotationData);
	tiMap.addAnnotation(userAnnotation);
	
	//calculating all challenges to fit them to the screen
	var MapZoomToAnnotations = require('mapzoomtoannotations');
	var region = new MapZoomToAnnotations(geos);
	tiMap.region = region;
	$.mapWrapper.add(tiMap);
	$.mapWrapper.add(overMapInfo);
}


/*
	Handles the click events
*/
function onClick(e) {
	switch (e.source.id) {
		
		case "btnPlayChallenge":
			soundClickPrimary.play();
			if (!started) {
				var AjaxStartChallenge = require('/net/ajaxstartchallenge');
				var ajaxStartChallenge = new AjaxStartChallenge({
					params : {
						challenge_id : challenge._id,
						extra : challenge.extradifficulty ? true : false
					},
					onSuccess : function(response) {
						Alloy.Globals.pushPath({
							viewId : 'challenge/waypoint/info',
							data : {
								id : challenge._id
							}
						});
					},
					onError : function(response) {
						alert(L('err' + response.error));
					},
				});
				ajaxStartChallenge.start();
			} else {
				Alloy.Globals.pushPath({
					viewId : 'challenge/waypoint/info',
					data : {
						id : challenge._id
					}
				});
			}
			break;
			
		case "btnDetails":
			Alloy.Globals.pushPath({
				viewId : "challenge/detail/start",
				data : {
					id : challenge._id
				}
			});
	
			break;
		}
}
