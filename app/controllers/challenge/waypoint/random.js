var header = Alloy.Globals.header.view;
header.showHeader();
header.changeTitle(L("Play_challenge"));

//Properties
var args = arguments[0] || {};
var userChallenge = {};

//Services
var AjaxUserChallenge = require('/net/ajaxuserchallenge');

//Libs
var RandomButton = require('randombutton');


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
	$.waypointWrapper.removeAllChildren();
}


/**
*	Parse the result and fill the userchallenge object
*/
function parseChallenge(data) {
	userChallenge = data;
	
	resetView();
	
	$.challengeTitle.text = '" ' + userChallenge.challenge.name + ' "';
	
	createWPButtons(userChallenge.challenge.waypoints);
}


/**
 * 	Creates buttons for waypoints list
 */
function createWPButtons(list) {
	var count = 0;
	_.each(list, function(wp){
		var completedWP = userChallenge.completedWP ? userChallenge.completedWP : [];
		var completed = _.contains(completedWP, wp.id);
		
		var data = {
			text: wp.name,
			wpId: wp.id,
			completed: completed,
			backgroundColor: Alloy.Globals.CustomColor1Light,
			backgroundDisabledColor: Alloy.Globals.DisabledColor
		};
		var button = new RandomButton();
		var view = button.createRandomButton(data, $);
		button.addEventListener("click", openWaypointDetail);
		$.waypointWrapper.add(view);
	});
}


/**
 * 	Navigates to Waypoint detail
 */
function openWaypointDetail(event) {
	Ti.API.info("Waypoint Clicked!: "+JSON.stringify(event.source));
	if(event.source.wpId !== undefined && !event.source.completed) {
		Alloy.Globals.pushPath({
			viewId : 'challenge/waypoint/info',
			data : {
				wpId : event.source.wpId,
				id: userChallenge.challenge._id
			},
			resetPath: false
		});
	}
}
