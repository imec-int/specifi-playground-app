var connection = Alloy.Globals.appConfig.connection;
var AjaxCall = require('../utils').creacityAjaxCall;

function AjaxScan(args) {
	this.params = args.params || {};
	
	//avoiding class overriding
	if (!(this instanceof arguments.callee))
		throw new Error("Constructor called as a function");
	this.response = {};
	this.onSuccess = typeof args.onSuccess === 'function' ? args.onSuccess : function() {
		Ti.API.info('Scan | no onSuccess handler defined');
	};
	this.onError = typeof args.onError === 'function' ? args.onError : function() {
		Ti.API.info('Scan | no onError handler defined');
	};
}

/*
	Scan a random Personal Marker
*/
AjaxScan.prototype.scanPersonalMarker = function(args) {
	if (!args) args={};
	args.instance = this;
	//adding connection settings to args
	args.connection = connection.endpoints.scan.scanPersonalMarker;
	AjaxCall(args);
};


/*
	Scan a random Waypoint
*/
AjaxScan.prototype.scanWaypoint = function(args) {
	if (!args) args={};
	args.instance = this;
	//adding connection settings to args
	args.connection = connection.endpoints.scan.scanWaypoint;
	AjaxCall(args);
};

module.exports = AjaxScan;