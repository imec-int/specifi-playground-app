var header = Alloy.Globals.header.view;
header.showHeader();
header.changeTitle(L("My_Tickets"));

//Libs
var moment = require("alloy/moment");
var utils = require('utils');
var DistanceBetweenLocations = require('/distancebetweenlocations');

//Properties
var args = arguments[0] || {};
var expId = args.id;
var experience;
var myTicketsNumber = 0;

//Services
var AjaxExperience = require('net/ajaxexperience');
var AjaxGetImage = require('/net/ajaxgetimage');
var AjaxExperienceTicket = require('/net/ajaxexperienceticket');

/*
	AjaxExperience success handler
*/
var ajaxExperienceSuccessHandler = function(result) {
	if (result.myTickets<=0){
		//redirecting to experience shop if you don't have any tickets for this experience 
		// (can happend when you use all of them)
		Alloy.Globals.pushPath({
			viewId:"experience/list",
			data:{},
			resetPath: true
		});		
	}
	experience = result.experience;
	$.experienceTitle.text = '" '+experience.name+' "';
	$.about.text = String.format(L("about"), String(L("Experience")).toLowerCase());
	
	var dbl = new DistanceBetweenLocations(experience.location.geo[1], experience.location.geo[0], Alloy.Globals.currentCoords.latitude, Alloy.Globals.currentCoords.longitude);
	var distance = (dbl.distance > 1000)? (dbl.distance/1000).toFixed(1)+"km" : dbl.distance.toFixed(0) + "m";
	$.distanceLabel.text = String.format(L("from_your_current_location"), distance);
	
	myTicketsNumber=result.myTickets;
	var myTickets = result.myTickets ? String.format(L('you_have_number_tickets'), result.myTickets) : '';
	$.ticketNumber.text = myTickets;
	
	var timeText = String.format(L('From_date_to_date'),moment(experience.start).format("DD/MM"),moment(experience.end).format("DD/MM"));
	$.scheduleText.text = timeText;
	$.description.text = experience.description;
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
	updateUseBtn();
};

/*
	Generic error handler
*/
var errorHandler = function(err) {
	alert(L("err" + err.error));
	updateUseBtn();
}; 

/*
	Handles click on an image
*/
function imageClick(e) {
	var url = e.source.localfilePath;
	var pictureViewer = Alloy.createController('ui/pictureviewer', {
		url : url
	}).getView();
	pictureViewer.open();
}

/*
	Use tickets
*/
function use(amount) {
	$.btnUse.setTouchEnabled(false);
	if (!amount) {
		amount = 1;
	}
	
	var ajaxExperienceTicket = new AjaxExperienceTicket({
		onSuccess : function(response) {
			alert(String.format(L('you_used_number_tickets'),amount));
			ajaxExperience.fetch();
		},
		onError : errorHandler,
		params : {
			id : expId,
			amount : amount
		}
	});
	ajaxExperienceTicket.use();
}


/*
	Handles clicks on ticket controls
*/
function onClick(e) {
	var ticketsToUse = parseInt($.bulkNumber.text);
	switch (e.source.id) {
		case "btnUse":
			btnUseClickHandler();
			break;
		case "btnSubstractFromUse":
			if (ticketsToUse-1>=0) $.bulkNumber.text = --ticketsToUse;
			updateUseBtn();
			break;
		case "btnAddToUse":
			if (ticketsToUse+1<=myTicketsNumber) $.bulkNumber.text = ++ticketsToUse;
			updateUseBtn();
			break;
	}

}

/*
	Shows a confirmation dialog to use tickets
*/
function btnUseClickHandler() {
	var ticketsToUse = parseInt($.bulkNumber.text);
	var dialogListener = function(e) {
		if (e.index === 0) {
			use(ticketsToUse);
		}
	};
	var opts = {
		cancel : 1,
		buttonNames : [L('Confirm'), L('Cancel')],
		message : String.format(L("Are_you_sure_you_want_to_use_number_tickets"), ticketsToUse),
		title : 'Confirm ticket use!'
	};
	var dialog = Ti.UI.createAlertDialog(opts);
	dialog.addEventListener('click', dialogListener);
	dialog.show();
}


/*
	Enables or disables ticket controls based on available tickets
*/
function updateUseBtn() {
	if (parseInt($.bulkNumber.text) < 0) {
		$.btnUse.setTouchEnabled(false);
		$.bulkNumber.text = 0;
	}
	if(parseInt($.bulkNumber.text) == 0) {
		$.btnUse.setTouchEnabled(false);
	}
	if(parseInt($.bulkNumber.text) > 0) {
		$.btnUse.setTouchEnabled(true);
	}
}

/*
	Fetch experience tickets
*/
var ajaxExperience = new AjaxExperience({
	onSuccess : ajaxExperienceSuccessHandler,
	onError : errorHandler,
	params : {
		id : expId
	}
});
ajaxExperience.fetch();
