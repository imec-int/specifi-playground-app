var connection = Alloy.Globals.appConfig.connection;
var AjaxCall = require('../utils').creacityAjaxCall;

function AjaxGetChallenge(args) {
	this.params = args.params || {};
	
	//avoiding class overriding
	if (!(this instanceof arguments.callee))
		throw new Error("Constructor called as a function");
	this.response = {};
	this.onSuccess = typeof args.onSuccess === 'function' ? args.onSuccess : function() {
		Ti.API.info('Get Challenge | no onSuccess handler defined');
	};
	this.onError = typeof args.onError === 'function' ? args.onError : function() {
		Ti.API.info('Get Challenge | no onError handler defined');
	};
}

AjaxGetChallenge.prototype.fetch = function(args) {
	if (!args) args={};
	args.instance = this;
	//adding connection settings to args
	args.connection = connection.endpoints.challenge.fetch;
	AjaxCall(args);
};

module.exports = AjaxGetChallenge;