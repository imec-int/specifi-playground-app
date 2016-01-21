var connection = Alloy.Globals.appConfig.connection;
var AjaxCall = require('../utils').creacityAjaxCall;

function AjaxMeetingHotspot(args) {
	Ti.API.info('Ajax Meeting Hotspot constructor args'+Ti.API.info(JSON.stringify(args)));
	this.params = args.params || {};
	
	//avoiding class overriding
	if (!(this instanceof arguments.callee))
		throw new Error("Constructor called as a function");
	this.response = {};
	this.onSuccess = typeof args.onSuccess === 'function' ? args.onSuccess : function() {
		Ti.API.info('User register | no onSuccess handler defined');
	};
	this.onError = typeof args.onError === 'function' ? args.onError : function() {
		Ti.API.info('User register | no onError handler defined');
	};
}

AjaxMeetingHotspot.prototype.list = function(args) {
	if (!args) args={};
	args.instance = this;
	//adding connection settings to args
	args.connection = connection.endpoints.meetingHotspot.list;
	AjaxCall(args);
};

AjaxMeetingHotspot.prototype.fetch = function(args) {
	if (!args) args={};
	args.instance = this;
	//adding connection settings to args
	args.connection = connection.endpoints.meetingHotspot.fetch;
	AjaxCall(args);
};

AjaxMeetingHotspot.prototype.nearby = function(args) {
	if (!args) args={};
	args.instance = this;
	//adding connection settings to args
	args.connection = connection.endpoints.meetingHotspot.nearby;
	AjaxCall(args);
};

AjaxMeetingHotspot.prototype.start = function(args) {
	if (!args) args={};
	args.instance = this;
	//adding connection settings to args
	args.connection = connection.endpoints.meetingHotspot.start;
	AjaxCall(args);
};

AjaxMeetingHotspot.prototype.stop = function(args) {
	if (!args) args={};
	args.instance = this;
	//adding connection settings to args
	args.connection = connection.endpoints.meetingHotspot.stop;
	AjaxCall(args);
};

AjaxMeetingHotspot.prototype.scan = function(args) {
	if (!args) args={};
	args.instance = this;
	//adding connection settings to args
	args.connection = connection.endpoints.meetingHotspot.scan;
	AjaxCall(args);
};

module.exports = AjaxMeetingHotspot;
