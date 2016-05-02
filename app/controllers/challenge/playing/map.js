var header = Alloy.Globals.header.view;
header.showHeader();
header.changeTitle(L("My_challenges"));

//Libs
var Availability = require('/utils/availability');
var MapZoomToAnnotations = require('mapzoomtoannotations');
var AnnotationSpreader = require('/utils/annotationspreader');

//Properties
var currentUser = JSON.parse(Ti.App.Properties.getString('currentUser'));
var currentId = '';

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

//Services
var AjaxAllUserChallenges = require("/net/ajaxalluserchallenges");


/*
	Creates markers on the map
*/
var createMarkers = function(geos) {
	
	//Spread annotations on same coordinates
	geos = AnnotationSpreader.spread(geos);
	
	_.each(geos, function(geo, index) {
		var icon;
		switch (geo.type) {
			case L("Challenge"):
				icon = (Availability.checkAvailability(geo.row))?"pin-wp-challenge.png":"pin-wp-challenge-unavailable.png";
				break;
			default:
				break;
		}
		Ti.API.info("Geo latitude: "+ geo.latitude+ " Geo longitude: "+ geo.longitude);
		var annotationData = {
			latitude : geo.latitude,
			longitude : geo.longitude,
			available: (geo.type === L("Challenge")) ? Availability.checkAvailability(geo.row) : true,
			title : geo.row.name,
			subtitle : String.format(L("tokens"), geo.row.tokens),
			image : "images/icons/" + icon,
			id : geo.row._id,
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
	Ajax All Userchallenges success handler
*/
var ajaxAllUserChallengesSuccessHandler = function(response) {
		
	var challengesData = response.challenges;
	//parsing data
	var data = [];
	
	//mapping to challenge
	challengesData = _.groupBy(challengesData, function(userChallengeData) {
		return userChallengeData.challenge._id;
	});
	// getting the counter for each challenge
	challengesData = _.map(challengesData, function(userChallengeData) {
		return userChallengeData[0].challenge;
	});
	
	var geos = [];
	
	_.each(challengesData, function(row, index) {
		row.viewToPush = 'challenge/detail/start';
		geos.push({
			row : row,
			type : L('Challenge'),
			latitude: parseFloat(row.location.geo[1]),
			longitude: parseFloat(row.location.geo[0])
		});
	});
	
	createMarkers(geos);
};

/*
	Fetch all in progress userchallenges
*/
var ajaxAllUserChallenges = new AjaxAllUserChallenges({
	params : {
		user_id : currentUser._id,
		completed: false
	},
	onSuccess : ajaxAllUserChallengesSuccessHandler,
	onError : function(response) {
		alert(L('error_get_challenges'));
	}
});
ajaxAllUserChallenges.fetch();

/*
	Map click event handler
*/
function onMapClick(e) {
	if (e.annotation) {
		if(currentId != e.annotation.id) {
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
				viewId : 'challenge/playing/list'
			});
			break;
	}
}