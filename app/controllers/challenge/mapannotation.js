var args = arguments[0] || {};


//Libs
var DistanceBetweenLocations = require('/distancebetweenlocations');

//Properties
$.titleLabel.text = args.title;
var challengeType = args.challengeType || L("Challenge");
$.typeLabel.text = challengeType;

//Check availability
if(challengeType === L('Challenge')) {
	if (!args.available) {
		$.availabilityLabel.setHeight(Ti.UI.SIZE);
		$.availabilityLabel.setVisible(true);
		$.availabilityLabel.setText(L("You_can_play_this_challenge_at_a_later_time"));
		$.availabilityLabel.setColor(Alloy.Globals.CustomColor7);
	} else {
		$.availabilityLabel.setHeight(Ti.UI.SIZE);
		$.availabilityLabel.setVisible(true);
		$.availabilityLabel.setText(L("You_can_play_this_challenge_right_now"));
		$.availabilityLabel.setColor(Alloy.Globals.CustomColor3);
	}
}


//Calculating distance
var dbl = new DistanceBetweenLocations(args.latitude, args.longitude, Alloy.Globals.currentCoords.latitude, Alloy.Globals.currentCoords.longitude);
var distance = (dbl.distance > 1000)? (dbl.distance/1000).toFixed(1)+"km" : dbl.distance.toFixed(0) + "m";
$.distanceLabel.text = String.format(L("from_your_current_location"), distance);


//Set icon
switch (challengeType){
	case L("Challenge"):
		$.leftIcon.setColor((!args.available)?Alloy.Globals.CustomColor6:Alloy.Globals.CustomColor7);
		$.fa.add($.leftIcon,'fa-map-marker');
		break;
	case L("Personal_marker"):
		$.leftIcon.setColor(Alloy.Globals.CustomColor7);
		$.fa.add($.leftIcon,'fa-smile-o');
		break;
	case L("Meeting_hotspot"):
		$.leftIcon.setColor(Alloy.Globals.CustomColor7);
		$.fa.add($.leftIcon,'fa-users');
		break;
}


//Click event handler
function onClick(e) {
    Alloy.Globals.pushPath({
        viewId : args.viewToPush,
        data : {
            id : args.id
        }
    });
}