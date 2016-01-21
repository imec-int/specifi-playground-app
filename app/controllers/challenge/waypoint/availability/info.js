var header = Alloy.Globals.header.view;
header.showHeader();
header.changeTitle(L("Play_challenge"));

//Libs
var moment = require('alloy/moment');
var utils = require('utils');

//Properties
var args = arguments[0] || {};
var userChallenge = {};
var currentWaypoint;
var hintUsed = false;

//Services
var AjaxUserChallenge = require('/net/ajaxuserchallenge');


/*
	Get the userchallenge
*/
var ajaxUserChallenge = new AjaxUserChallenge({
	onSuccess : function(result) { 
		Ti.API.info('Success getting UserChallenge: ' + JSON.stringify(result));
		parseChallenge(result);
	},
	onError : function(result) { 
		Ti.API.info('Error getting UserChallenge: ' + JSON.stringify(result));
		alert(L("ajaxUserChallengeError"));
		goBackToDetail();
	},
	params : {
		challenge_id : args.id
	}
});
ajaxUserChallenge.fetch();


/*
	Navigates back to challenge detail
*/
var goBackToDetail = function() {
	Alloy.Globals.popPath();
	Alloy.Globals.pushPath({
		viewId : 'challenge/detail/start',
		data : {
			id : args.id
		},
		resetPath: true
	});
};


/*
	Determine currentWaypoint
*/
function findCurrentWaypoint(data) {
	var waypoints = data.challenge.waypoints;
	var completedWP = data.completedWP ? data.completedWP : [];
	if(completedWP.length < waypoints.length) {
		return waypoints[completedWP.length];
	} else {
		return null;
	}
};


/*
	Resets all fields that can change
*/
function resetView() {
	$.scheduleTable.setData(null);
	$.startDateLabel.setText("");
	$.endDateLabel.setText("");
	$.viewTitle.setText(L("Waypoint_avalilability"));
	$.viewExplanation.setText(L("Waypoint_availability_explanation"));
}


/*
	Parse the result and fill the userchallenge object
*/
function parseChallenge(data) {
	userChallenge = data;
	
	if(!userChallenge.complete) {
		currentWaypoint = findCurrentWaypoint(userChallenge);
	} else {
		completeUserChallenge(userChallenge);
		return;
	}
	
	resetView();
	
	$.challengeTitle.text = '" ' + userChallenge.challenge.name + ' "';
	
	if (utils.testPropertyExists(userChallenge, 'hintsUsed')) {
		var found = _.find(userChallenge.hintsUsed, function(hint){
			return hint == currentWaypoint._id;
		});
		hintUsed = found != undefined ? true : false;
	}

	if (utils.testPropertyExists(currentWaypoint, "name") )
		$.currentWaypoint.text = currentWaypoint.name;
		
	accessParse();
		
	$.footerWrapper.animate({
		bottom: "0dp",
		duration: 400
	});
};


/*
	Navigate to the result screen
*/
function completeUserChallenge(data) {
	Alloy.Globals.pushPath({
		viewId : "challenge/detail/result",
		data : {
			id : data.challenge._id,
			gained : data.score,
			name : data.challenge.name,
			user: data.user
		},
		resetPath:true
	});
}


/*
	Handles the click events
*/
function onClick(e) {
	switch(e.source.id) {
		
        case "btnDetails":
			Alloy.Globals.pushPath({
				viewId : "challenge/waypoint/info",
				data : {
					id : args.id
				}
			});
			break;
		
		case "btnHint":
			Alloy.Globals.pushPath({
				viewId : "challenge/waypoint/hint/info",
				data : {
					id : args.id
				}
			});
			break;
		
		case "btnLocation":
			if (hintUsed || !currentWaypoint.locationHidden) {
				Alloy.Globals.pushPath({
					viewId : 'challenge/waypoint/map',
					data : {
						id : args.id
					}
				});
			} else {
				alert(L("waypoint_location_hidden_error"));
			}
			break;
			
        case "btnScan":
			Ti.App.fireEvent('stopAudio');
			qrOrBeaconScanning();
			break;
    }
}

/**
 * Offer QR or beacon scanning if beacons are available
 */
function qrOrBeaconScanning() {
	if(currentWaypoint.beaconUUID && Alloy.Globals.iBeaconEnabled) {
		var dialog = Ti.UI.createAlertDialog({
			buttonNames : [L('scan_qr_btn'), L('scan_beacon_btn')],
			message : L('qr_or_beacon_question'),
			title : L('scanning_type_title')
		});
		dialog.addEventListener('click', function(e) {
			switch (e.index) {
				case 0:
					Alloy.Globals.pushPath({
						viewId : "challenge/waypoint/scan/scan",
						data : {
							id : args.id
						}
					});
					break;
				case 1:
					Alloy.Globals.pushPath({
						viewId : "challenge/waypoint/beacon/info",
						data : {
							id : args.id
						}
					});
					break;
				default:
					break;
			}
	
		});
		dialog.show();
	} else {
		Alloy.Globals.pushPath({
			viewId : "challenge/waypoint/scan/scan",
			data : {
				id : args.id
			}
		});
	}
}


/*
	Parses the access settings
*/
function accessParse() {
    var weekDaysEnglish = ['monday','tuesday','wednesday','thursday','friday','saturday','sunday'];
    
    if (utils.testPropertyExists(currentWaypoint, 'conditionsOn') && currentWaypoint.conditionsOn === true) {
    	
        if (utils.testPropertyExists(currentWaypoint, 'conditions.days')) {
            //week schedule
            var daysArray = currentWaypoint.conditions.days.split(';');
            if (daysArray[0] === "")
                daysArray = null;
            var daysStrings = [];
            var daysData={};
            _.each(weekDaysEnglish,function(day){
               daysData[day]={
                 available: false,
                 dayText:  L(day).charAt(0).toUpperCase() + L(day).slice(1),
                 scheduleText: L('Not_available'),
                 scheduleArray: []
               };
              
            });
            
            if (daysArray)
                _.each(daysArray, function(item, index) {
                    var day = {};
                    day.dayOfTheWeek = item.match(/[a-z]+/i)[0];
                    day.hourRanges = item.match(/([0-9]{2}\:[0-9]{2}\-[0-9]{2}\:[0-9]{2})+/g);
                    daysStrings[index] = L(day.dayOfTheWeek).charAt(0).toUpperCase() + L(day.dayOfTheWeek).slice(1) + " ";
                    daysData[day.dayOfTheWeek].available=true;
                    _.each(day.hourRanges, function(hours) {
                        daysStrings[index] += hours;
                        daysData[day.dayOfTheWeek].scheduleArray.push(hours);
                    });
                    if (!day.hourRanges){
                        daysStrings[index] += L("all_day");
                        daysData[day.dayOfTheWeek].scheduleText = L("all_day");
                        }
                    else {
                    	daysData[day.dayOfTheWeek].scheduleText = L('Available_from')+' '+daysData[day.dayOfTheWeek].scheduleArray.join(' '+L('and')+' ');
                    }
                        
                });
             var tableData = [];
             _.each(daysData,function(day){
                 var tableRow = Alloy.createController('challenge/waypoint/availability/row', day).getView();
                 tableData.push(tableRow);
             });
             $.scheduleTable.setData(tableData);
        }
        
        if (utils.testPropertyExists(currentWaypoint, 'conditions.start') && currentWaypoint.conditions.start !== null) {
            var fromDateObject = new Date(currentWaypoint.conditions.start);
            var fromDateString = L('Available_from') +": "+moment(fromDateObject).format("DD/MM/YYYY");
        	$.startDateLabel.setText(fromDateString);
        }

        if (utils.testPropertyExists(currentWaypoint, 'conditions.end') && currentWaypoint.conditions.end !== null) {
            var toDateObject = new Date(currentWaypoint.conditions.end);
            var toDateString = L('Available_until') +": "+moment(toDateObject).format("DD/MM/YYYY");
        	$.endDateLabel.setText(toDateString);
        }
    } else {
    	$.viewTitle.setText(L("WaypointAvailabilityAlways"));
    	$.viewExplanation.setText(L("WaypointAvailabilityAlwaysExplanation")); 
    }
}