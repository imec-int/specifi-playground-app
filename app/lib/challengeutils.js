/**
	Find the waypoint's step number in the challenge
*/
exports.findStep = function(list, wpId) {
	var step = 0;
	_.find(list, function(wp) {
		step++;
		return wp._id === wpId;	
	});
	
	return step;
};

/**
*	Determine currentWaypoint if randomOrder is not allowed
*/
exports.findCurrentWaypoint = function(data, wpId) {
	if(wpId) {
		var wp = _.find(data.challenge.waypoints, function(wp) {
			return wp.id === wpId;
		});
		return wp;
	}
	
	var waypoints = data.challenge.waypoints;
	var completedWP = data.completedWP ? data.completedWP : [];
	if(completedWP.length < waypoints.length) {
		return waypoints[completedWP.length];
	}
	return null;
};