var header = Alloy.Globals.header.view;
header.showHeader();
header.changeTitle(L("Experience_store"));

//Libs
var utils = require('utils');
var moment = require("alloy/moment");
var DistanceBetweenLocations = require('/distancebetweenlocations');

//Properties
var args = arguments[0] || {};
var expId = args.id;
var ticketsToBuy = 0,
	ticketsAvailable = 0,
	yourTickets = 0;
var experience = {
	_id : expId
};

//Services
var AjaxExperience = require('net/ajaxexperience');
var AjaxGetImage = require('/net/ajaxgetimage');
var AjaxUser = require('/net/ajaxuser');

/*
	Handles AjaxExperience fetch success
*/
var ajaxExperienceSuccessHandler = function(response) {
	experience = response.experience;
	ticketsAvailable = parseInt(experience.tickets)-parseInt(response.ticketsSold);
	yourTickets = parseInt(response.myTickets);
	$.experienceTitle.text = '" '+experience.name+' "';
	$.about.text = String.format(L("about"), String(L("Experience")).toLowerCase());
	
	var dbl = new DistanceBetweenLocations(experience.location.geo[1], experience.location.geo[0], Alloy.Globals.currentCoords.latitude, Alloy.Globals.currentCoords.longitude);
	var distance = (dbl.distance > 1000)? (dbl.distance/1000).toFixed(1)+"km" : dbl.distance.toFixed(0) + "m";
	$.distanceLabel.text = String.format(L("from_your_current_location"), distance);
	
	$.tokensNumber.text = String.format(L('Costs_number_tokens'), experience.cost);
	
	var timeText = String.format(L('From_date_to_date'), moment(experience.start).format("DD/MM"), moment(experience.end).format("DD/MM"));
	$.scheduleText.text = timeText;
	
	$.description.text = experience.description;
	$.ticketsAvailable.text = String.format(L('tickets_available'),ticketsAvailable);
	$.yourTickets.text = String.format(L('you_have_number_tickets'),yourTickets);
	$.bulkNumber.text = 0;

	//Get image
	if (experience.picture && experience.picture.url!=null) {
		var ajaxGetImage = new AjaxGetImage({
			onSuccess : function(localfilePath) {
				var blob = utils.resizeAndCrop({
					localfilePath : localfilePath,
					width : 500,
					height : 250
				});
				$.experienceImage.setImage(blob);
				$.experienceImage.setWidth(Ti.UI.FILL);
				$.experienceImage.setHeight(Ti.UI.SIZE);
				$.experienceImage.localfilePath = localfilePath;
			},
			onError : function(response) {
				//@TODO handle the error
			},
			image : experience.picture
		});
		ajaxGetImage.fetch();
	}
	
	$.footerWrapper.animate({
			bottom: "0dp",
			duration: 400,
	});
	updateBuyBtn();
};

/*
	Image click handler
*/
function imageClick(e) {
	var url = e.source.localfilePath;
	var pictureViewer = Alloy.createController('ui/pictureviewer', {
		url : url
	}).getView();
	pictureViewer.open();
}


/*
	Buy the tickets
*/
function buy(amount) {
	$.btnBuy.setTouchEnabled(false);
	var ajaxExperienceBuy = new AjaxExperience({
		onSuccess : ajaxExperienceBuySuccessHandler,
		onError : errorHandler,
		params : {
			id : expId,
			amount : amount
		}
	});
	ajaxExperienceBuy.buy();
}

/**
 * Handles a successful buy
 */
function ajaxExperienceBuySuccessHandler(response) {
	//we need to update the user
	ajaxExperience.fetch();
	var ajaxUser = new AjaxUser({
		onSuccess: function(res){
			Ti.App.fireEvent('userUpdate', res.user);
		},
		onError: errorHandler,
		params:{
			user_id: response.tickets[0].user
		}
	});
	ajaxUser.fetch();
	alert(L('experience_tickets_bought'));
};

/*
	Enables or disables the buy controls based on available tickets
*/
function updateBuyBtn() {
	if (parseInt($.bulkNumber.text) < 0) {
		$.btnBuy.setTouchEnabled(false);
		$.bulkNumber.text = 0;
	}
	if(parseInt($.bulkNumber.text) == 0) {
		$.btnBuy.setTouchEnabled(false);
	}
	if(parseInt($.bulkNumber.text) > 0) {
		$.btnBuy.setTouchEnabled(true);
	}
}

/*
	General click handler
*/
function onClick(e) {
	switch (e.source.id) {
		case "btnBuy":
			buyHandler();
			break;
		case "btnSubstractFromBuy":
			if (ticketsToBuy - 1 >= 0) {
				$.bulkNumber.text = --ticketsToBuy;
			}
			updateBuyBtn();
			break;
		case "btnAddToBuy":
			if (ticketsToBuy+1 <= ticketsAvailable) 
				$.bulkNumber.text = ++ticketsToBuy;
			updateBuyBtn();
			break;
	}
}

/*
	Show buy tickets confirmation dialog
*/
function buyHandler() {
	ticketsToBuy = parseInt($.bulkNumber.text);
	if (ticketsToBuy > 0) {
		var dialogListener = function(e) {
			if (e.index === 0) {
				buy(ticketsToBuy);
			}
		};
		var opts = {
			cancel : 1,
			buttonNames : [L('Confirm'), L('Cancel')],
			message : String.format(L("Are_you_sure_you_want_to_buy_number_tickets"), ticketsToBuy),
			title : L('Confirm_tickets_buy_dialog_title')
		};
		var dialog = Ti.UI.createAlertDialog(opts);
		dialog.addEventListener('click', dialogListener);
		dialog.show();
	}
};

/*
	Generic error handler
*/
var errorHandler = function(err){
	alert(L("err" + err.error));
	updateBuyBtn();
};

/*
	Fetch experience
*/
var ajaxExperience = new AjaxExperience({
	onSuccess : ajaxExperienceSuccessHandler,
	onError : errorHandler,
	params : {
		id : expId
	}
});
ajaxExperience.fetch();
