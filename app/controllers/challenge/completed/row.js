var args = arguments[0] || {};

//Libs
var DistanceBetweenLocations = require('/distancebetweenlocations');

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
};

//Calculating distance
var dbl = new DistanceBetweenLocations(args.location.geo[1],args.location.geo[0],Alloy.Globals.currentCoords.latitude,Alloy.Globals.currentCoords.longitude);
var distance = (dbl.distance > 1000)? (dbl.distance/1000).toFixed(1)+"km" : dbl.distance.toFixed(0) + "m";
$.distanceLabel.text = String.format(L("from_your_current_location"), distance);
$.row.itemDistance = dbl.distance.toFixed(0);

//Tokens
$.tokenLabel.text = String.format(L("earned"),args.score);
if (args.count){
    $.completedCounterLabel.setText(String.format(L("completed_x_times"),args.count));
}

//Show correct icon
if (args.challengeType) {
    switch(args.challengeType) {
       case L("Challenge"):
			$.fa.add($.leftIcon,'fa-map-marker');
			break;
    }
}
