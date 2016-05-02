var header = Alloy.Globals.header.view;
header.showHeader();
header.changeTitle(L("Play_challenge"));
$.noAccessWrapper.setHeight("0dp");

//Libs
var utils = require('utils');
var challengeUtils = require('challengeutils');
var cloudinary = require('cloudinaryutils');

//Properties
var args = arguments[0] || {};
var userChallenge = {};
var currentWaypoint;
var audioPlayer;
var wpId = args.wpId;
var connection = require('connectiondefaults');

//Services
var AjaxUserChallenge = require('/net/ajaxuserchallenge');

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
	$.noAccessWrapper.setHeight("0dp");
	$.noAccessDetails.setText("");
	
	$.waypointImage.setImage(null);
	$.waypointImage.setWidth("0dp");
	$.waypointImage.setHeight("0dp");
	
	$.waypointVideo.videoUrl = "";
	$.waypointVideoPreview.setTop("0dp");
	$.waypointVideoPreview.setImage(null);
	$.waypointVideo.setWidth("0dp");
	$.waypointVideo.setHeight("0dp");
	$.waypointVideoPreview.setWidth("0dp");
	$.waypointVideoPreview.setHeight("0dp");
	$.playButton.setWidth("0dp");
	$.playButton.setHeight("0dp");
	
	$.waypointAudio.height = "0dp";
	$.waypointAudio.url = "";
	$.waypointAudio.top = "0dp";
	$.audioLabel.setText("");
	$.audioLabel.setLeft("0dp");
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

	//check if the waypoint is available
	if (utils.testPropertyExists(currentWaypoint, 'available') && currentWaypoint.available === false) {
		$.noAccessWrapper.setHeight(Ti.UI.SIZE);
		$.noAccessDetails.setText(L("noAccessDetails"));
	}

	//adding image if exists
	if (utils.testPropertyExists(currentWaypoint, 'content.image.secure_url') && currentWaypoint.content.image.secure_url!==null && currentWaypoint.content.image.secure_url !== '') {
		$.waypointImage.setImage(cloudinary.formatUrl(currentWaypoint.content.image.secure_url, 480, 180, 'c_fill'));
		$.waypointImage.setWidth("480dp");
		$.waypointImage.setHeight("180dp");
	}

	//adding video preview if exists
	if (utils.testPropertyExists(currentWaypoint, 'content.video.secure_url') && currentWaypoint.content.video.secure_url!==null && currentWaypoint.content.video.secure_url!=='') {
		$.waypointVideo.videoUrl = cloudinary.formatUrl(currentWaypoint.content.video.secure_url, 500, 250, 'c_fill');
		$.waypointVideoPreview.setTop("20dp");
		$.waypointVideoPreview.setImage(cloudinary.getVideoThumbnail(currentWaypoint.content.video.secure_url, currentWaypoint.content.video.public_id, 500, 250, 'c_fill'));
		$.waypointVideo.setWidth(Ti.UI.FILL);
		$.waypointVideo.setHeight(Ti.UI.SIZE);
		$.waypointVideoPreview.setWidth(Ti.UI.FILL);
		$.waypointVideoPreview.setHeight(Ti.UI.SIZE);
		$.playButton.setWidth("50dp");
		$.playButton.setHeight("50dp");
	}
	

	//adding the audio if exists
	if (utils.testPropertyExists(currentWaypoint, "content.audio.url") && currentWaypoint.content.audio.url!==null && currentWaypoint.content.audio.url!=='') {
		$.waypointAudio.height = Ti.UI.SIZE;
		$.waypointAudio.top = "10dp";
		$.audioLabel.setText(L("press_and_listen"));
		$.audioLabel.setLeft("10dp");
	}

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
*	Opens a pictureViewer if the user taps an image
*/
function imageClick(e) {
	var pictureViewer = Alloy.createController('ui/pictureviewer', {
		url : cloudinary.formatUrl(currentWaypoint.content.image.secure_url, 480, 180, 'c_fill')
	}).getView();
	pictureViewer.open();
}

/**
*	Opens a videoPlayer if the user taps a video
*/
function videoClick(e) {
	var videoUrl = e.source.videoUrl;
	var videoView = Alloy.createController('ui/videoplayer', {
		videoUrl : videoUrl
	}).getView();
	if (OS_IOS)
		Alloy.Globals.index.add(videoView);
}


/**
*	Handles click on no access wrapper
*/
function accessClick() {
	Alloy.Globals.pushPath({
		viewId : 'challenge/waypoint/availability/info',
		data : {
			id : args.id,
			wpId: args.wpId
		}
	});
}


/**
*	Handles the click events
*/
function onClick(e) {
	switch(e.source.id) {
		
		case "btnAccess":
			accessClick();
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

/******************AUDIO************************/

/**
*	Remove audio player event listeners
*/
function removeAudioListeners() {
	audioPlayer.removeEventListener('complete', audioCompleteHandler);
	audioPlayer.removeEventListener('change', audioChangeHandler);
}

/**
*	Handle the audio player complete event
*/
function audioCompleteHandler() {
	restoreAudioInfo();
	removeAudioListeners();
}

/**
*	Handle the audio player change event
*/
function audioChangeHandler(e) {
	if (audioPlayer) {
		if (e.state == audioPlayer.STATE_STOPPED)
			Ti.API.info('audio stopped ' + JSON.stringify(e.state));
		if (e.state == audioPlayer.STATE_STOPPING)
			Ti.API.info('audio stopping ' + JSON.stringify(e.state));
		if (e.state === 0 && OS_IOS)
			audioPlayer.fireEvent('complete');
	}
}

/**
*	Handles a click event on the audio player
*/
function audioClick(e) {
	audioPlayer = Ti.Media.createAudioPlayer({
		url : currentWaypoint.content.audio.secure_url
	});
	audioPlayer.addEventListener('complete', audioCompleteHandler);
	audioPlayer.addEventListener('change', audioChangeHandler);
	//adding this so we can stop it when user uses menu to go away from this screen
	Alloy.Globals.audioPlayer = audioPlayer;
	audioPlayer.start();
	showAudioButtons();
}

/**
*	Show audio control buttons, hides audio info
*/
function showAudioButtons() {
	$.audioLabel.setWidth("0dp");
	$.audioLabel.setHeight("0dp");
	$.audioLabel.setLeft("0dp");
	$.audioPlay.setWidth("0dp");
	$.audioPlay.setHeight("0dp");
	$.audioPlay.touchEnabled = true;
	$.audioPause.setWidth("50dp");
	$.audioPause.setHeight("50dp");
	$.audioPause.touchEnabled = true;
	$.audioStop.setWidth("50dp");
	$.audioStop.setHeight("50dp");
	$.audioStop.touchEnabled = true;
}


/**
*	Show audio info, hides audio controls
*/
function restoreAudioInfo() {
	$.waypointAudio.setTouchEnabled(true);
	$.audioLabel.setWidth(Ti.UI.SIZE);
	$.audioLabel.setHeight(Ti.UI.SIZE);
	$.audioLabel.setLeft("10dp");
	$.audioPlay.setWidth("50dp");
	$.audioPlay.setHeight("50dp");
	$.audioPlay.setTouchEnabled(false);
	$.audioPause.setWidth("0dp");
	$.audioPause.setHeight("0dp");
	$.audioPause.setTouchEnabled(false);
	$.audioStop.setWidth("0dp");
	$.audioStop.setHeight("0dp");
	$.audioStop.setTouchEnabled(false);
}

/**
*	Handles a click on the audio stop button
*/
function audioPlayerStopClick() {
	audioPlayer.stop();
	Ti.App.fireEvent("audioStop");
	restoreAudioInfo();
}

/**
*	Handles a click on the audio pause button
*/
function audioPlayerPauseClick() {
	if (!audioPlayer.playing) {
		audioPlayer.start();
		$.audioPlay.setWidth("0dp");
		$.audioPlay.setHeight("0dp");
		$.audioPause.setWidth("50dp");
		$.audioPause.setHeight("50dp");
	} else {
		$.audioPlay.setWidth("50dp");
		$.audioPlay.setHeight("50dp");
		$.audioPause.setWidth("0dp");
		$.audioPause.setHeight("0dp");
		audioPlayer.pause();
	}
}
