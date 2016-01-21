var header = Alloy.Globals.header.view;
header.showHeader();
header.changeTitle(L("My_Tickets"));

//Properties
var tableData = [];

//Services
var AjaxExperienceTicket = require('net/ajaxexperienceticket');

/*
	AjaxExperienceTicket success handler
*/
var ajaxExperienceTicketSuccessHandler = function(result) {
	if (result.tickets) {
		var tickets = result.tickets;
		
		if (tickets.length && tickets.length > 0) {
			$.refreshWrapper.hide();
			$.refreshWrapper.height = "0dp";
			$.refreshWrapper.touchEnabled = false;
		} else {
			$.refreshWrapper.show();
			$.refreshWrapper.height = Ti.UI.FILL;
			$.refreshWrapper.touchEnabled = true;
		}
		var index = 0;
		_.each(tickets, function(exitem, index) {
			exitem.even = !(index % 2);
			if (exitem.myTickets>0) {
				var row = Alloy.createController('tickets/row', exitem).getView();
				tableData.push(row);
				index++;
			}
		});
		$.experienceticketTable.setData(tableData);
	}
}; 

/*
	AjaxExperienceTicket error handler
*/
var ajaxExperienceTicketErrorHandler = function(err) {
	alert(L("err" + err.error));
}; 

/*
	Fetch experience tickets
*/
var ajaxExperienceTicket = new AjaxExperienceTicket({
	onSuccess: ajaxExperienceTicketSuccessHandler,
	onError: ajaxExperienceTicketErrorHandler,
	params :{
		
	}
});
ajaxExperienceTicket.list();

/*
	List click handler
*/
function listClickHandler(e){
	Alloy.Globals.pushPath({
		viewId: "tickets/detail",
		data: {
			id: e.row.id
		}
	});
}