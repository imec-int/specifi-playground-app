var header = Alloy.Globals.header.view;
header.showHeader();
header.changeTitle(L("Play_challenge"));

//Libs
var utils = require('utils');

//Properties
var args = arguments[0] || {};
var userChallenge = {};
var currentWaypoint;
var hintUsed = false;

//Services
var AjaxUserChallenge = require('/net/ajaxuserchallenge');
var AjaxGetHint = require('/net/ajaxgethint');
var AjaxGetImage = require('/net/ajaxgetimage');


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
	$.challengeTitle.text = "";
	$.currentWaypoint.text = "";
    $.hintNeedHelp.text = "";
    $.hintExplanation.text = "";
    clearHint();
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
	
	if(hintUsed) {
        $.hintNeedHelp.text = L("Hint_unlocked_exclamation");
        $.hintExplanation.text = L("Hint_unlocked_explanation");
        $.btnGetHint.setHeight("0dp");
		$.btnGetHint.visible = false;
		if (utils.testPropertyExists(currentWaypoint, 'hintText')) {
	        $.hintText.setText(currentWaypoint.hintText);
	    }
	    
	    if (utils.testPropertyExists(currentWaypoint, 'hintImage.url')) {
	        var agi = new AjaxGetImage({
	            onSuccess : function(localfilePath) {
	                var blob = utils.resizeAndCrop({
	                    localfilePath : localfilePath,
	                    width : 500,
	                    height : 250
	                });
	                $.hintImage.setTop("20dp");
	                $.hintImage.setImage(blob);
	                $.hintImage.setWidth(Ti.UI.FILL);
	                $.hintImage.setHeight(Ti.UI.SIZE);
	                $.hintImage.localfilePath = localfilePath;
	            },
	            onError : function(response) {
	            	alert(response.error);
	            },
	            image : currentWaypoint.hintImage
	        });
	        agi.fetch();
	    }
	} else {
		$.hintNeedHelp.text = L("Need_some_help_question");
		$.hintExplanation.text = L( "Need_some_help_explanation");
		clearHint();
		$.btnGetHint.setHeight("40dp");
		$.btnGetHint.visible = true;
	}
		
	$.footerWrapper.animate({
		bottom: "0dp",
		duration: 400
	});
};

/*
	Clears all hint information from the screen
*/
function clearHint() {
	$.hintText.text = "";
	$.hintImage.setImage(null);
    $.hintImage.setWidth("0dp");
    $.hintImage.setHeight("0dp");
    $.hintImage.localfilePath = "";
    $.btnGetHint.visible = false;
	$.btnGetHint.height = "0dp";
}


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
	Opens a pictureViewer if the user taps an image
*/
function imageClick(e) {
	var url = e.source.localfilePath;
	var pictureViewer = Alloy.createController('ui/pictureviewer', {
		url : url
	}).getView();
	pictureViewer.open();
}


/*
	Handles the click events
*/
function onClick(e) {
	switch(e.source.id) {
		
        case "btnGetHint":
            buyHintDialog.show();
			break;
		
		case "btnDetails":
			Alloy.Globals.pushPath({
				viewId : "challenge/waypoint/info",
				data : {
					id : args.id
				}
			});
			break;
		
		case "btnAccess":
			Alloy.Globals.pushPath({
				viewId : 'challenge/waypoint/availability/info',
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
	Opens a buy hint dialog
*/
var buyHintDialog = Ti.UI.createAlertDialog({
    cancel : 0,
    buttonNames : [L('Cancel'), L('Confirm')],
    message : L("sure_to_spend_to_unlock_hint"),
    title : L("Unlock_hint_question")
});
buyHintDialog.addEventListener('click', buyHint);


/*
	Handle hint buying
*/
function buyHint(e) {
    if (e.index !== e.source.cancel) {
        var ajaxGetHint = new AjaxGetHint({
            onSuccess : function(result) {
                parseChallenge(result);
            },
            onError : function(err) {
            	alert(L("err"+err.error));
            },
            params : {
                challenge_id : args.id,
                waypoint_id : currentWaypoint._id
            }
        });
        ajaxGetHint.fetch();
    } 
    buyHintDialog.removeEventListener('click', buyHint);
}
