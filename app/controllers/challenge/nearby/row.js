var args = arguments[0] || {};

//Libs
var DistanceBetweenLocations = require('/distancebetweenlocations');
var Availability = require('/utils/availability');

//Properties
var challengeType = args.challengeType || 'type';
$.titleLabel.text = args.name;
$.typeLabel.text = challengeType;
$.row._id = args._id;

//Type of view to navigate to on click
switch (args.challengeType) {
	case L("Challenge"):
		$.row.viewToPush = 'challenge/detail/start';
		break;
	case L("Personal_marker"):
		$.row.viewToPush = 'scan/scan';
		break;
	case L("Meeting_hotspot"):
		$.row.viewToPush = 'meetinghotspot/info';
		break;	
};

//Calculating distance
var dbl = new DistanceBetweenLocations(args.location.geo[1], args.location.geo[0], Alloy.Globals.currentCoords.latitude, Alloy.Globals.currentCoords.longitude);
var distance = (dbl.distance > 1000)? (dbl.distance/1000).toFixed(1)+"km" : dbl.distance.toFixed(0) + "m";
$.distanceLabel.text = String.format(L("from_your_current_location"), distance);
$.row.itemDistance = dbl.distance.toFixed(0);

//Checking availability
if (args.challengeType==L("Challenge")){
	
	var available = Availability.checkAvailability(args);
	
	if (!available) {
		$.leftIcon.setColor(Alloy.Globals.CustomColor6);
		$.availableLabel.setHeight(Ti.UI.SIZE);
		$.availableLabel.setVisible(true);
		$.availableLabel.setText(L("You_can_play_this_challenge_at_a_later_time"));
		$.availableLabel.setColor(Alloy.Globals.CustomColor7);
	} else {
		$.leftIcon.setColor(Alloy.Globals.CustomColor7);
		$.availableLabel.setHeight(Ti.UI.SIZE);
		$.availableLabel.setVisible(true);
		$.availableLabel.setText(L("You_can_play_this_challenge_right_now"));
		$.availableLabel.setColor(Alloy.Globals.CustomColor3);
	}
} else {
	$.leftIcon.setColor(Alloy.Globals.CustomColor7);
}

//Show correct icon
if (args.challengeType) {
	switch(args.challengeType) {
		case L("Challenge"):
			$.fa.add($.leftIcon,'fa-map-marker');
			break;
		case L("Personal_marker"):
			$.fa.add($.leftIcon,'fa-smile-o');
			break;
		case L("Meeting_hotspot"):
			$.fa.add($.leftIcon,'fa-users');
			break;
	}
}