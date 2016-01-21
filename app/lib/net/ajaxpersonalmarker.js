var connection = Alloy.Globals.appConfig.connection;
var AjaxCall = require('../utils').creacityAjaxCall;

function AjaxPersonalMarker(args) {
	this.params = args.params || {};
	//avoiding class overriding
	if (!(this instanceof arguments.callee))
		throw new Error("Constructor called as a function");

	this.response = {};
	this.onSuccess = typeof args.onSuccess === 'function' ? args.onSuccess : function() {
		Ti.API.info('Personal Marker | no onSuccess handler defined');
	};
	this.onError = typeof args.onError === 'function' ? args.onError : function() {
		Ti.API.info('Personal Marker | no onError handler defined');
	};

}

AjaxPersonalMarker.prototype.nearby = function(args) {
	Ti.API.info('nearby');
	if (!args) args={};
	args.instance = this;
	//adding connection settings to args
	args.connection = connection.endpoints.personalMarker.nearby;
	AjaxCall(args);
};

AjaxPersonalMarker.prototype.list = function(args) {
	Ti.API.info('AjaxPersonalMarker list');
	var instance = this;
	if (!args) args={};
	args.instance = instance;
	//adding connection settings to args
	args.connection = connection.endpoints.personalMarker.list;
	AjaxCall(args);
};

AjaxPersonalMarker.prototype.fetch = function(args) {
	var instance = this;
	args.instance = instance;
	if (!args) args={};
	//adding connection settings to args
	args.connection = connection.endpoints.personalMarker.fetch;
	AjaxCall(args);
};

module.exports = AjaxPersonalMarker;
