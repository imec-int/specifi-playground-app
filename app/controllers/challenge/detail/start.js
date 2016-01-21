var header = Alloy.Globals.header.view;
header.showHeader();
header.changeTitle(L("Challenge_details"));

//Libs
var moment = require("alloy/moment");
var utils = require('utils');

$.extraDifficulty.height = "0dp";

//Sounds
var soundClickPrimary = Titanium.Media.createSound({
	url : '/sound/button_snap.mp3'
});

//Properties
var challenge = {};
var args = arguments[0] || {};
var started = false;

//Libs
var Availability = require('/utils/availability');

//Services
var AjaxUserChallenge = require('/net/ajaxuserchallenge');
var AjaxGetChallenge = require('/net/ajaxgetchallenge');
var DistanceBetweenLocations = require('/distancebetweenlocations');

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
	$.challengeTitle.text = '" ' + challenge.name + ' "';
	$.tokensNumber.text = String.format(L("tokensToBeEarned"), challenge.tokens);
	$.description.text = challenge.description;
	
	var dbl = new DistanceBetweenLocations(challenge.location.geo[1], challenge.location.geo[0], Alloy.Globals.currentCoords.latitude, Alloy.Globals.currentCoords.longitude);
	var distance = (dbl.distance > 1000)? (dbl.distance/1000).toFixed(1)+"km" : dbl.distance.toFixed(0) + "m";
	$.distanceLabel.text = String.format(L("from_your_current_location"), distance);
	
	//checking availability
	var available = Availability.checkAvailability(challenge);
	
	if (!available) {
		$.availableLabel.setText(L("You_can_play_this_challenge_at_a_later_time"));
		$.availableLabel.setColor(Alloy.Globals.CustomColor7);
	} else {
		$.availableLabel.setText(L("You_can_play_this_challenge_right_now"));
		$.availableLabel.setColor(Alloy.Globals.CustomColor3);
	}

	if (challenge.expectedDuration) {
		$.expectedDuration.text = String.format(L("expected_duration"), challenge.expectedDuration);
		$.fa.add($.expectedDurationIcon, 'fa-clock-o');
	}
	

	//checking what message for the extra challenge we show
	if (!started) {
		if (challenge.extradifficulty) {
			$.extraTokenNumber.text = String.format(L("extra_difficulty_explanation_not_started"), challenge.extratokens, challenge.timelimit);
			$.extraDifficulty.height = Ti.UI.SIZE;
			$.extraTokenIcon.color = Alloy.Globals.CustomColor4;
			$.fa.add($.extraTokenIcon, 'fa-star');
		}

	} else {
		if (challenge.extradifficulty) {
			$.extraDifficulty.height = Ti.UI.SIZE;
			$.extraTokenIcon.height = "16dp";
			var wholeTime = challenge.timelimit * 60 * 1000;
			var startTime = new Date(startTime).getTime();

			var finishBy = new Date(wholeTime + startTime);
			$.extraTokenNumber.text = String.format(L("extra_difficulty_explanation_started"), challenge.extratokens, moment(finishBy).format("DD/MM HH:mm"));

			$.extraTokenIcon.color = Alloy.Globals.CustomColor4;
			$.fa.add($.extraTokenIcon, 'fa-star');
		}
	}
	
	$.footerWrapper.animate({
		bottom : "-1dp",
		duration : 400,
	});

	//Getting the image, if it exists
	if (utils.testPropertyExists(challenge, 'image.url') && challenge.image.url != null) {
		var AjaxGetImage = require('/net/ajaxgetimage');
		var ajaxGetImage = new AjaxGetImage({
			onSuccess : function(localfilePath) {
				var blob = utils.resizeAndCrop({
					localfilePath : localfilePath,
					width : 480,
					height : 180
				});
				$.challengeImage.setImage(blob);
				$.challengeImage.setWidth("480dp");
				$.challengeImage.setHeight("180dp");
				$.challengeImage.localfilePath = localfilePath;
			},
			onError : function(response) {
				//@TODO handle the error
			},
			image : challenge.image
		});
		ajaxGetImage.fetch();
	}
}

/*
	Opens a pictureViewer if the user taps an image
*/
function imageClick(e) {
	var url = e.source.localfilePath;
	var pictureViewer = Alloy.createController('ui/pictureviewer', {
		url : url
	}).getView();
	pictureViewer.open();
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
					}
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
			
		case "btnMap":
			Alloy.Globals.pushPath({
				viewId : "challenge/detail/map",
				data : {
					id : challenge._id
				}
			});
			break;
	}
}
