var connection = Alloy.Globals.appConfig.connection;
var AjaxCall = require('../utils').creacityAjaxCall;

function AjaxUserChallenge(args) {
	this.params = args.params || {};
	
	//avoiding class overriding
	if (!(this instanceof arguments.callee))
		throw new Error("Constructor called as a function");
	this.response = {};
	this.onSuccess = typeof args.onSuccess === 'function' ? args.onSuccess : function() {
		Ti.API.info('User challenge | no onSuccess handler defined');
	};
	this.onError = typeof args.onError === 'function' ? args.onError : function() {
		Ti.API.info('User challenge | no onError handler defined');
	};
}

AjaxUserChallenge.prototype.fetch = function(args) {
	if (!args) args={};
	args.instance = this;
	//adding connection settings to args
	args.connection = connection.endpoints.userchallenge.fetch;
	AjaxCall(args);
};

module.exports = AjaxUserChallenge;