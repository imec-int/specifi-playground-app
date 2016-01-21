var header = Alloy.Globals.header.view;
header.showHeader();
header.changeTitle(L("completed_challenges"));


//Properties
var currentUser = JSON.parse(Ti.App.Properties.getString('currentUser'));

//Services
var AjaxAllUserChallenges = require("/net/ajaxalluserchallenges");

//All userchallenges success handler
var ajaxAllUserChallengesSuccessHandler = function(response) {
	
	var challengesData = response.challenges;
	var data = [];

	//Grouping by challenge
	challengesData = _.groupBy(challengesData, function(userChallengeData) {
		return userChallengeData.challenge._id;
	});
	
	//Mapping to count total score and number of completions
	challengesData = _.map(challengesData, function(userChallengeData) {
		var count = 0;
		var score = 0;
		_.each(userChallengeData, function(oneUserChallenge) {
			if (oneUserChallenge.complete) {
				count++;
				score+=oneUserChallenge.score;
			}
		});
		var goodData = userChallengeData[0].challenge;
		goodData.count = count;
		goodData.score = score;
		return goodData;
	});
	
	
	//If list is empty, show refresh button
	if (challengesData.length) {
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
		var aRow = Alloy.createController('challenge/completed/row', row).getView();
		data.push(aRow);
	});
	
	//Sorting data by distance
	data = _.sortBy(data, function(row) {
		return parseInt(row.itemDistance);
	});
	
	$.challengesTable.setData(data);
};

//Fetch all completed userchallenges
var ajaxAllUserChallenges = new AjaxAllUserChallenges({
	params : {
		user_id : currentUser._id,
		completed: true
	},
	onSuccess : ajaxAllUserChallengesSuccessHandler,
	onError : function(response) {
		alert(L('error_get_completed_challenges'));
	}
});
ajaxAllUserChallenges.fetch(); 

