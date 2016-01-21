var header = Alloy.Globals.header.view;
header.showHeader();
header.changeTitle(L("Nearby_challenges"));

//Properties
var tableData = [];

//Services
var AjaxNearbyAll = require("net/ajaxnearbyall");

/*
 	Handles click events on list items
 */
function challengeListOnClick(e) {
	Alloy.Globals.pushPath({
		viewId : e.row.viewToPush,
		data : {
			id : e.row._id
		}
	});
};

/*
 	Handles general click events
 */
function onClick(e) {
	switch (e.source.id) {
		case 'btnMap':
			Alloy.Globals.pushPath({
				viewId : 'challenge/nearby/map'
			});
			break;
		case "btnRefresh":
			$.btnRefresh.setText(L("Refreshing"));
			ajaxNearbyAll.fetch();
			break;
		}
};

/*
	Parse the data
*/
var createList = function(data) {
	if (data.length && data.length > 0) {
		$.refreshWrapper.hide();
		$.refreshWrapper.height = "0dp";
		$.refreshWrapper.touchEnabled = false;
	} else {
		$.refreshWrapper.show();
		$.refreshWrapper.height = Ti.UI.FILL;
		$.refreshWrapper.touchEnabled = true;
	}

	_.each(data, function(row, index) {
		var aRow = Alloy.createController('challenge/nearby/row', row).getView();
		tableData.push(aRow);
	});
	
	//sorting data by distance
	tableData = _.sortBy(tableData, function(row) {
		return parseInt(row.itemDistance);
	});
	
	$.challengesTable.setData(tableData);
};

/*
	AjaxNearbyAll success handler
*/
var ajaxNearbyAllSuccessHandler = function(response) {
	$.btnRefresh.setText(L("btnRefresh"));
	var data = [];
	var challengesData = response.challenges;
	_.each(challengesData, function(row, index) {
		row.challengeType = L("Challenge");
		data.push(row);
	});

	var personalMarkers = response.personalmarkers;
	_.each(personalMarkers, function(row, index) {
		row.challengeType = L("Personal_marker");
		data.push(row);
	});

	var meetingHotspots = response.meetinghotspots;
	_.each(meetingHotspots, function(row, index) {
		var template = row.template;
		template.challengeType = L("Meeting_hotspot");
		template._id = row._id;
		data.push(template);
	});

	createList(data);
};

/*
	AjaxNearbyAll error handler
*/
var ajaxNearbyAllErrorHandler = function(err) {
	$.btnRefresh.setText(L("btnRefresh"));
	alert(L('err' + err.error));
};

/*
 	Get nearby challenges, personal markers, hotspots,...
 */
var ajaxNearbyAll = new AjaxNearbyAll({
	onSuccess : ajaxNearbyAllSuccessHandler,
	onError : ajaxNearbyAllErrorHandler,
	params : {
		location : Alloy.Globals.currentCoords.longitude + ',' + Alloy.Globals.currentCoords.latitude,
		distance : Alloy.Globals.appConfig.nearbyRadius
	}
});

/*
	Get current location and fetch nearby challenges, hotspots,...
*/
Ti.Geolocation.getCurrentPosition(function(e) {
	if (e.error) {
		Alloy.Globals.currentCoords = Alloy.Globals.appConfig.defaultCoords;
	} else {
		Alloy.Globals.currentCoords = e.coords;
	}
	ajaxNearbyAll.fetch();
});