var header = Alloy.Globals.header.view;
header.showHeader();
header.changeTitle(L("My_challenges"));

//Properties
var currentUser = JSON.parse(Ti.App.Properties.getString('currentUser'));

//Services
var AjaxAllUserChallenges = require("/net/ajaxalluserchallenges");

/*
	Handles a click event on the challenge list
*/
function challengeListOnClick(e) {
	Alloy.Globals.pushPath({
		viewId : 'challenge/detail/start',
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
				viewId : 'challenge/playing/map',
				resetPath : true
			});
			break;
		case "btnRefresh":
			$.btnRefresh.setText(L("Refreshing"));
			ajaxAllUserChallenges.fetch();
			break;
	}
}


/*
	Create the list of Userchallenges
*/
var createList = function(response) {
	$.btnRefresh.setText(L("btnRefresh"));
	
	var challengesData = response.challenges;
	
	challengesData = _.groupBy(challengesData, function(userChallengeData) {
		return userChallengeData.challenge._id;
	});
	
	challengesData = _.map(challengesData, function(userChallengeData) {
		var goodData = userChallengeData[0].challenge;
		return goodData;
	});
	
	if (challengesData.length && challengesData.length > 0) {
		$.refreshWrapper.hide();
		$.refreshWrapper.height = "0dp";
		$.refreshWrapper.touchEnabled = false;
	} else {
		$.refreshWrapper.show();
		$.refreshWrapper.height = Ti.UI.FILL;
		$.refreshWrapper.touchEnabled = true;
	}

	var data = [];

	//Create rows
	_.each(challengesData, function(row, index) {
		row.challengeType = L("Challenge");
		var aRow = Alloy.createController('challenge/nearby/row', row).getView();
		data.push(aRow);
	});
	
	//sorting data by distance
	data = _.sortBy(data, function(row) {
		return parseInt(row.itemDistance);
	});
	
	$.challengesTable.setData(data);
};

/*
	Get all non-completed userchallenges for user
*/
var ajaxAllUserChallenges = new AjaxAllUserChallenges({
	params : {
		user_id : currentUser._id,
		completed: false
	},
	onSuccess : createList,
	onError : function(response) {
		$.btnRefresh.setText(L("btnRefresh"));
		alert(L('err'+response.error));
	}
});

ajaxAllUserChallenges.fetch(); 