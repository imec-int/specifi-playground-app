var connection = Alloy.Globals.appConfig.connection;
var AjaxCall = require('../utils').creacityAjaxCall;

function AjaxGameMarkerStartChallenge(args) {
	Ti.API.info('AjaxGameMarkerStartChallenge constructor args'+Ti.API.info(JSON.stringify(args)));
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

AjaxGameMarkerStartChallenge.prototype.start = function(args) {
	Ti.API.info('list');
	if (!args) args={};
	args.instance = this;
	//adding connection settings to args
	args.connection = connection.endpoints.userchallenge.startChallenge;
	AjaxCall(args);
};

module.exports = AjaxGameMarkerStartChallenge;