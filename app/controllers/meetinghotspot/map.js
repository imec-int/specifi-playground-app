var header = Alloy.Globals.header.view;
header.showHeader();
header.changeTitle(L("Challenge_details"));

//Libs
var MapZoomToAnnotations = require('mapzoomtoannotations');

//Properties
var args = arguments[0] || {};
var currentUser = JSON.parse(Ti.App.Properties.getString('currentUser'));
var started = false;
var playing = args.playing || false;

//Services
var AjaxMeetingHotspot = require('net/ajaxmeetinghotspot');

//Map
var mapmodule = require('ti.map');
var tiMap = mapmodule.createView({});
Alloy.Globals.mapViews.push(tiMap);
var overMapInfo = $.overMapInfo;
$.mapWrapper.removeAllChildren();


/*
	Ajax Meeting hotspot success handler
*/
var ajaxMeetingHotspotSuccessHandler = function(result) {
	var meetingHotspot = result.meetinghotspot;
	parseMeetingHotspot(meetingHotspot);
};

/*
	Ajax Meeting hotspot error handler
*/
var ajaxMeetingHotspotErrorHandler = function(err) {
	var dialog = Ti.UI.createAlertDialog({
		buttonNames : [L('Ok')],
		message : L("err" + err.error),
		title : L('Error')
	});
	dialog.show();
}; 

/*
	Fetch Meeting Hotspot
*/
var ajaxMeetingHotspot = new AjaxMeetingHotspot({
	onSuccess : ajaxMeetingHotspotSuccessHandler,
	onError : ajaxMeetingHotspotErrorHandler,
	params : {
		meetinghotspot_id : args.id,
	}
});
ajaxMeetingHotspot.fetch();


/*
	Shows the start or resume button
*/
function showProperStartButton(started) {
	if(!playing) {
		$.btnPlayHotspot.setWidth('20%');
		$.btnScan.setWidth('0dp');
		if (!started) {
			$.btnPlayHotspot.setBackgroundColor(Alloy.Globals.CustomColor1);
			$.btnPlayHotspot.setIconImage("/images/icons/play-arrow.png");
		} else {
			$.btnPlayHotspot.setBackgroundColor("#F2C200");
			$.btnPlayHotspot.setIconImage("/images/icons/resume-arrow.png");
		}
	} else {
		$.btnPlayHotspot.setWidth('0dp');
		$.btnScan.setWidth('20%');
	}
	
}


/*
	Parses the meeting hotspot
*/
function parseMeetingHotspot(result) {
	
	started = result.players.indexOf(currentUser._id) !== -1 ? true: false;
	showProperStartButton(started);
	
	var template = result.template;
	$.challengeTitle.text = '" ' + template.name + ' "';

	var geos = [];
	geos.push({
		latitude : template.location.geo[1],
		longitude : template.location.geo[0]
	});
	
	var annotationData = {
		latitude : parseFloat(template.location.geo[1]),
		longitude : parseFloat(template.location.geo[0]),
		title : L("Challenge_starts_here"),
		image : "images/icons/pin-meeting-hotspot.png",
		id : result._id,
		touchEnabled : true,
		showInfoWindow : false,
		canShowCallout : false
	};
	var annotation = mapmodule.createAnnotation(annotationData);
	tiMap.addAnnotation(annotation);
	geos.push({
		latitude : Alloy.Globals.currentCoords.latitude,
		longitude : Alloy.Globals.currentCoords.longitude
	});
	var userAnnotationData = {
		latitude : Alloy.Globals.currentCoords.latitude,
		longitude : Alloy.Globals.currentCoords.longitude,
		title : L("You_are_here"),
		image : "images/icons/pin-current-location.png",
		id : "user",
		touchEnabled : true,
		showInfoWindow : false,
		canShowCallout : false
	};

	var userAnnotation = mapmodule.createAnnotation(userAnnotationData);
	tiMap.addAnnotation(userAnnotation);
	var region = new MapZoomToAnnotations(geos);
	tiMap.region = region;
	$.mapWrapper.add(tiMap);
	$.mapWrapper.add(overMapInfo);

};


/*
	General click handler
*/
function onClick(e) {
	switch (e.source.id) {
		
		case "btnPlayHotspot":
			if (!started) {
				var playAjaxMeetingHotspot = new AjaxMeetingHotspot({
					onSuccess : function(result) {
						Alloy.Globals.pushPath({
							viewId : 'meetinghotspot/play',
							data : {
								id : args.id
							}
						});
					},
					onError : function(err) {
						var dialog = Ti.UI.createAlertDialog({
							buttonNames : [L('Ok')],
							message : L("err" + err.error),
							title : L('Error')
						});
						dialog.show();
					},
					params : {
						meetinghotspot_id : args.id,
						location : Alloy.Globals.currentCoords.longitude + "," + Alloy.Globals.currentCoords.latitude
					}
				});
				playAjaxMeetingHotspot.start();
	
			} else {
				Alloy.Globals.pushPath({
					viewId : 'meetinghotspot/play',
					data : {
						id : args.id,
					}
				});
			}
			break;
			
		case "btnDetails":
			var view = playing ? "meetinghotspot/play":"meetinghotspot/info";
			Alloy.Globals.pushPath({
				viewId : view,
				data : {
					id : args.id,
				}
			});
			break;
			
		case "btnScan":
			var dialog = Ti.UI.createAlertDialog({
				buttonNames : [L('Scan'), L('Be_scanned')],
				message : L('Meeting_hotspot_scan_question'),
				title : L('Meeting_hotspot_scan')
			});
			dialog.addEventListener('click', function(e) {
				switch (e.index) {
					case 0:
						Alloy.Globals.pushPath({
							viewId : "meetinghotspot/scan",
							data : {
								id : args.id
							}
						});
						break;
					case 1:
						Alloy.Globals.pushPath({
							viewId : "meetinghotspot/qrcode",
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
			break;
	}
}
