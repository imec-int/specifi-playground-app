//Check availability of challenge
 function checkAvailability(challenge) {
 	var available = true;
	if(challenge) {
		_.each(challenge.waypoints, function(waypoint){
			if (waypoint.available==false) return available = false;
		});
	}
	return available;
};

exports.checkAvailability = checkAvailability;