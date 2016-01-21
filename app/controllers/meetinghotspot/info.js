var header = Alloy.Globals.header.view;
header.showHeader();
header.changeTitle(L("Challenge_details"));

//Properties
var args = arguments[0] || {};
var started = false;
var currentUser = JSON.parse(Ti.App.Properties.getString('currentUser'));

//Libs
var DistanceBetweenLocations = require('/distancebetweenlocations');

//Services
var AjaxMeetingHotspot = require('net/ajaxmeetinghotspot');


$.about.text = String.format(L("about"), L("Meeting_hotspot"));

/*
	AjaxMeetingHotspot success handler
*/
var ajaxMeetingHotspotSuccessHandler = function(result) {
	parseMeetingHotspot(result.meetinghotspot);
};

/*
	AjaxMeetingHotspot error handler
*/
var ajaxMeetingHotspotErrorHandler = function(mherror) {
	var dialog = Ti.UI.createAlertDialog({
		buttonNames : [L('Ok')],
		message : L("err" + mherror.error),
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

/*
	Refresh every ten seconds
*/
var refreshing = setInterval(function() {
	ajaxMeetingHotspot.fetch();
}, 10000);
Alloy.Globals.counterIds.push(refreshing);
ajaxMeetingHotspot.fetch(); 


/*
	Parse the meeting hotspot
*/
function parseMeetingHotspot(result) {
	if (result.players.indexOf(currentUser._id) !== -1) {
		started = true;
	} else {
		started = false;
	}
	showProperStartButton(started);
	
	var template = result.template;
	$.challengeTitle.text = '" ' + template.name + ' "';
	
	//calculating distance
	var dbl = new DistanceBetweenLocations(template.location.geo[1], template.location.geo[0], Alloy.Globals.currentCoords.latitude, Alloy.Globals.currentCoords.longitude);
	var distance = (dbl.distance > 1000)? (dbl.distance/1000).toFixed(1)+"km" : dbl.distance.toFixed(0) + "m";
	$.distanceLabel.text = String.format(L("from_your_current_location"), distance);
	
	$.description.text = template.message;
	$.onRouteNumber.text = started ? result.players.length-1 : result.players.length;
	
	if (new Date().getTime() - Alloy.Globals.appConfig.clientServerDifference > new Date(result.start).getTime()) {
		$.activeMessage.text = L("Active_right_now_exclamation");
		$.activeMessage.setColor(Alloy.Globals.CustomColor3);
		//adjusting the remaining time to take the server difference into account
		var remaining = new Date(result.end).getTime() - new Date().getTime() >= -Alloy.Globals.appConfig.clientServerDifference ? new Date(result.end).getTime() - new Date().getTime() + Alloy.Globals.appConfig.clientServerDifference : 0;
		$.timeRemainingCountDown.start(remaining, {
			onStop : function() {
				$.timeRemainingCountDown.setText(L("You_re_too_late_exclamation"));
				$.timeRemainingText.height = "0dp";
				$.timeRemainingText.setText("");
				$.activeMessage.text = L("You_re_too_late_exclamation");
				$.activeMessage.setColor(Alloy.Globals.CustomColor7);
				Alloy.Globals.pushPath({
					viewId : "meetinghotspot/end",
					data : {
						id : args.id
					},
					resetPath : true,
				});
			}
		});
		$.timeRemainingText.text = L("Time_remaining");
	} else {
		$.timeRemainingText.text = L("Meeting_hotspot_not_available_yet");
		$.activeMessage.text = L("Meeting_hotspot_not_available_yet");
	}
};

/*
	Shows the resume or the play button
*/
function showProperStartButton(started) {
	if (!started) {
		$.btnPlayHotspot.setBackgroundColor(Alloy.Globals.CustomColor1);
		$.btnPlayHotspot.setIconImage("/images/icons/play-arrow.png");
	} else {
		$.btnPlayHotspot.setBackgroundColor("#F2C200");
		$.btnPlayHotspot.setIconImage("/images/icons/resume-arrow.png");
	}
}


/*
	General click handler
*/
function onClick(e) {
	switch (e.source.id) {
		case "btnPlayHotspot":
			if (!started) {
				var joinMeetingHotspot = new AjaxMeetingHotspot({
					onSuccess : function(result) {
						Alloy.Globals.pushPath({
							viewId : 'meetinghotspot/play',
							data : {
								id : args.id
							}
						});
					},
					onError : function(err) {
						var dialog = Ti.UI.createAlertDialog({
							buttonNames : [L('Ok')],
							message : L("err" + err.error),
							title : L('Error')
						});
						dialog.show();
					},
					params : {
						meetinghotspot_id : args.id,
						location : Alloy.Globals.currentCoords.longitude + "," + Alloy.Globals.currentCoords.latitude
					}
				});
				joinMeetingHotspot.start();
	
			} else {
				Alloy.Globals.pushPath({
					viewId : 'meetinghotspot/play',
					data : {
						id : args.id
					}
				});
			}
			break;
		case "btnMap":
			Alloy.Globals.pushPath({
				viewId : "meetinghotspot/map",
				data : {
					id : args.id
				}
			});
			break;
	}
}
