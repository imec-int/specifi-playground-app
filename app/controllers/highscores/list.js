var header = Alloy.Globals.header.view;
header.showHeader();
header.changeTitle(L("highscores_title"));
var AjaxHighscores = require("net/ajaxhighscores");

//Handle button clicks
function onClick(e) {
	var buttonId = e.source.id;
	switch (buttonId) {
		case 'btnHighscores':
			var call = new AjaxHighscores({
				params: {
					top: 10 
				},
				onSuccess: ajaxSuccessHandler,
				onError: ajaxErrorHandler
			});
			call.getHighscores();
			$.highscoresTable.setData([]);
			header.changeTitle(L("highscores_title"));
			updateButtons($.btnHighscores);
			break;
		case 'btnWeekly':
			var call = new AjaxHighscores({
				params: {
					top: 10 
				},
				onSuccess: ajaxSuccessHandler,
				onError: ajaxErrorHandler
			});
			call.getWeeklyHighscores();
			$.highscoresTable.setData([]);
			header.changeTitle(L("weekly_title"));
			updateButtons($.btnWeekly);
			break;
		case "btnRelative":
			var call = new AjaxHighscores({
				params: {
					top: 10 
				},
				onSuccess: ajaxSuccessHandler,
				onError: ajaxErrorHandler
			});
			call.getRelativeHighscores();
			$.highscoresTable.setData([]);
			header.changeTitle(L("relative_title"));
			updateButtons($.btnRelative);
			break;
	}
};

//Handles a successful ajax call to the endpoint
var ajaxSuccessHandler = function(response) {
	var data = response;
	
	if (data && data.length > 0){
		$.refreshWrapper.hide();
		$.refreshWrapper.height = "0dp";
		$.refreshWrapper.touchEnabled = false;
	} else {
		$.refreshWrapper.show();
		$.refreshWrapper.height = Ti.UI.FILL;
		$.refreshWrapper.touchEnabled = true;
	}

	var tableData =[];
	_.each(data, function(row, index) {
		var aRow = Alloy.createController('highscores/row', row).getView();
		tableData.push(aRow);
	});

	$.highscoresTable.setData(tableData);
};

//Handles an error during an ajax call to the endpoint
var ajaxErrorHandler = function(response) {
	$.highscoresTable.setData([]);
	alert(L('err'+response.error));
};


function updateButtons(selectedButton){
	$.btnHighscores.setSelected(false);
	$.btnWeekly.setSelected(false);
	$.btnRelative.setSelected(false);
	selectedButton.setSelected(true);
}


//************INIT**************//

//Initial fill of table
new AjaxHighscores({
	params: {
		top: 10 
	},
	onSuccess: ajaxSuccessHandler,
	onError: ajaxErrorHandler
}).getHighscores();
$.btnHighscores.setSelected(true);