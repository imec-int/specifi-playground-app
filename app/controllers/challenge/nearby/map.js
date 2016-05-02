var header = Alloy.Globals.header.view;
header.showHeader();
header.changeTitle(L("Nearby_challenges"));

//Properties
var currentId = '';
var currentUser = Ti.App.Properties.getString('currentUser');

//Libs
var Availability = require('/utils/availability');
var MapZoomToAnnotations = require('mapzoomtoannotations');
var AnnotationSpreader = require('/utils/annotationspreader');
var PermissionsUtils = require('/utils/permissionsutils');

//Services
var AjaxNearbyAll = require("net/ajaxnearbyall");

//Annotation dropdown
var openedAnnotationDetail = Ti.UI.createView({
	top : 0,
	width : 1,
	height : 1
});

//Map
var mapmodule = require('ti.map');
var tiMap = mapmodule.createView({});
Alloy.Globals.mapViews.push(tiMap);
tiMap.addEventListener('click', onMapClick);

/*
 Create markers on the map
 */
var createMarkers = function(geos) {

	//Spread annotations on same coordinates
	geos = AnnotationSpreader.spread(geos);

	_.each(geos, function(geo, index) {
		var icon;

		switch (geo.type) {
		case L("Challenge"):
			icon = (Availability.checkAvailability(geo.row)) ? "pin-wp-challenge.png" : "pin-wp-challenge-unavailable.png";
			break;
		default:
			break;
		}

		var annotationData = {
			latitude : geo.latitude,
			longitude : geo.longitude,
			available : (geo.type === L("Challenge")) ? Availability.checkAvailability(geo.row) : true,
			title : geo.row.name,
			subtitle : String.format(L("tokens"), geo.row.tokens),
			image : "images/icons/" + icon,
			id : geo.id ? geo.id : geo.row._id,
			challengeType : geo.type,
			viewToPush : geo.row.viewToPush,
			touchEnabled : true,
			showInfoWindow : false,
			canShowCallout : false
		};

		var annotation = mapmodule.createAnnotation(annotationData);
		tiMap.addAnnotation(annotation);
	});

	//Calculating distance between all challenges to fit them to the screen
	region = new MapZoomToAnnotations(geos);
	$.contentWrapper.add(tiMap);
	$.contentWrapper.add(openedAnnotationDetail);
	tiMap.region = region;

};

/*
 Ajax nearby all success handler
 */
var ajaxNearbyAllSuccessHandler = function(response) {
	var geos = [];

	//Challenges
	_.each(response.challenges, function(row, index) {
		row.viewToPush = 'challenge/detail/start';
		geos.push({
			row : row,
			type : L('Challenge'),
			latitude : parseFloat(row.location.geo[1]),
			longitude : parseFloat(row.location.geo[0])
		});
	});

	createMarkers(geos);
};

/*
 Fetch nearby challenges
 */
var ajaxNearbyAll = new AjaxNearbyAll({
	onSuccess : ajaxNearbyAllSuccessHandler,
	onError : function(err) {
		alert(L('err' + err.error));
	},
	params : {
		location : Alloy.Globals.currentCoords.longitude + ',' + Alloy.Globals.currentCoords.latitude,
		distance : Alloy.Globals.appConfig.nearbyRadius
	}
});

//Get current location and fetch the challenges
PermissionsUtils.getLocationPermissions(function(err) {
	if (err) {
		Alloy.Globals.currentCoords = Alloy.Globals.appConfig.defaultCoords;
		ajaxNearbyAll.params.location = Alloy.Globals.currentCoords.longitude + ',' + Alloy.Globals.currentCoords.latitude;
		ajaxNearbyAll.fetch();
	} else {
		Ti.Geolocation.getCurrentPosition(function(e) {
			if (e.error) {
				Alloy.Globals.currentCoords = Alloy.Globals.appConfig.defaultCoords;
			} else {
				Alloy.Globals.currentCoords = {
					latitude : e.coords.latitude,
					longitude : e.coords.longitude
				};
			}
			ajaxNearbyAll.params.location = Alloy.Globals.currentCoords.longitude + ',' + Alloy.Globals.currentCoords.latitude;
			ajaxNearbyAll.fetch();
		});
	}
});

/*
 Map click event handler
 */
function onMapClick(e) {
	if (e.annotation) {
		if (currentId != e.annotation.id) {
			var updatedAnnotationDetail = Alloy.createController('challenge/mapannotation', e.annotation).getView();
			$.contentWrapper.remove(openedAnnotationDetail);
			openedAnnotationDetail = updatedAnnotationDetail;
			$.contentWrapper.add(updatedAnnotationDetail);
			currentId = e.annotation.id;
			return;
		} else {
			$.contentWrapper.remove(openedAnnotationDetail);
			openedAnnotationDetail = Ti.UI.createView({
				top : 0,
				width : 1,
				height : 1
			});
			currentId = "";
			$.contentWrapper.add(openedAnnotationDetail);
			return;
		}
	}
};

/*
 General click event handler
 */
function onClick(e) {
	switch (e.source.id) {
	case "btnList":
		Alloy.Globals.pushPath({
			viewId : 'challenge/nearby/list'
		});
		break;
	}
};
