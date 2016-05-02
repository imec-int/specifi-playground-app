var header = Alloy.Globals.header.view;
header.showHeader();
header.changeTitle(L("Challenge_details"));

//Libs
var moment = require("alloy/moment");
var utils = require('utils');
var cloudinary = require('cloudinaryutils');

$.extraDifficulty.height = "0dp";

//Properties
var challenge = {};
var args = arguments[0] || {};
var started = false;
var userChallenge = null;
var currentUser = JSON.parse(Ti.App.Properties.getString('currentUser'));

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
		userChallenge = result;
		parseChallenge(result.challenge, result.start, result.randomOrder);
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
			parseChallenge(result.challenge, null, result.challenge.randomOrderAllowed);
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
	$.btnPlayChallenge.setBackgroundColor(Alloy.Globals.CustomColor5);
	$.btnPlayChallenge.setIconImage("/images/icons/resume-arrow.png");
}


/*
	Parse the result and fill the challenge object
*/
function parseChallenge(data, startTime, randomOrderAllowed) {
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
	}
	

	//checking what message for the extra challenge we show
	if (!started) {
		if(randomOrderAllowed) {
			$.randomOrderText.text = L("random_order_allowed");
		} else {
			$.randomOrderText.text =L("random_order_not_allowed");
		}
		if (challenge.extradifficulty) {
			$.extraTokenNumber.text = String.format(L("extra_difficulty_explanation_not_started"), challenge.extratokens, challenge.timelimit);
			$.extraDifficulty.height = Ti.UI.SIZE;
			$.extraTokenIcon.color = Alloy.Globals.CustomColor4;
			$.fa.add($.extraTokenIcon, 'fa-star');
		}
	} else {
		//If challenge was already started, check the randomOrder value of the userchallenge
		if(randomOrderAllowed) {
			$.randomOrderText.text = L("random_order_allowed");
		} else {
			$.randomOrderText.text =L("random_order_not_allowed");
		}
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
	if (utils.testPropertyExists(challenge, 'image.secure_url') && challenge.image.secure_url !== null && challenge.image.secure_url !== '') {
		$.challengeImage.setImage(cloudinary.formatUrl(challenge.image.secure_url, 480, 180, 'c_fill'));
		$.challengeImage.setWidth("480dp");
		$.challengeImage.setHeight("180dp");
	}
}

/*
	Opens a pictureViewer if the user taps an image
*/
function imageClick(e) {
	var pictureViewer = Alloy.createController('ui/pictureviewer', {
		url : cloudinary.formatUrl(challenge.image.secure_url, 480, 180, 'c_fill')
	}).getView();
	pictureViewer.open();
}

/*
	Handles the click events
*/
function onClick(e) {
	switch (e.source.id) {
		
		case "btnPlayChallenge":
			if (!started) {
				var AjaxStartChallenge = require('/net/ajaxstartchallenge');
				var ajaxStartChallenge = new AjaxStartChallenge({
					params : {
						challenge_id : challenge._id,
						extra : challenge.extradifficulty ? true : false
					},
					onSuccess : function(response) {
						var viewId = 'challenge/waypoint/info';
						if(challenge.randomOrderAllowed) {
							viewId = 'challenge/waypoint/random';
						}
						Alloy.Globals.pushPath({
							viewId : viewId,
							data : {
								id : challenge._id
							}
						});
					},
					onError : function(err) {
						if(err.error === '1028') {
							var cooldownTime = Alloy.Globals.appConfig.gameSettings.challengeCooldown || 0;
							alert(String.format(L('err' + err.error), moment(err.detail).add(cooldownTime, 's').format('DD/MM/YYYY hh:mm:ss')));
						} else {
							alert(L('err' + err.error));
						}
					}
				});
				ajaxStartChallenge.start();
			} else {
				var viewId = 'challenge/waypoint/info';
				if(userChallenge.randomOrder)
					viewId = 'challenge/waypoint/random';
				Alloy.Globals.pushPath({
					viewId : viewId,
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
