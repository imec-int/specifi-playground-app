//Properties
var args = arguments[0] || {};

//Libs
var moment = require("alloy/moment");
var utils = require("utils");

if (args.experience) {
	var experience = args.experience;
	$.row.id = experience._id || null;
	$.tokensNumber.text = experience.cost;
	$.title.text = experience.name;
	$.offeredBy.text = String.format(L('Offered_by'), experience.offeredBy);
	var myTickets = args.myTickets ? "("+String.format(L('you_have_number_tickets'),args.myTickets)+")":'';
	$.ticketsText.text = String.format(L('tickets_available'), experience.tickets-args.ticketsSold) + ' ' + myTickets;
	var startDate = new Date(experience.start);
	var endDate = new Date(experience.end);
	var timeText = String.format(L('From_date_to_date'),moment(startDate).format("DD/MM"),moment(endDate).format("DD/MM"));
	$.scheduleText.text = timeText; 
	
	if (experience.picture && experience.picture.url!=null) {
		$.expImageThumb.setImage(utils.thumbFromMediaHaven(experience.picture.url));
	} else {
		$.expImageThumb.setImage('/images/default_experience_background.png');
	}
}

