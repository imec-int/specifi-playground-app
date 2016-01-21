var connection = Alloy.Globals.appConfig.connection;
var AjaxCall = require('../utils').creacityAjaxCall;

function AjaxGetHint(args) {
	this.params = args.params || {};
	
	//avoiding class overriding
	if (!(this instanceof arguments.callee))
		throw new Error("Constructor called as a function");
	this.response = {};
	this.onSuccess = typeof args.onSuccess === 'function' ? args.onSuccess : function() {
		Ti.API.info('Get hint | no onSuccess handler defined');
	};
	this.onError = typeof args.onError === 'function' ? args.onError : function() {
		Ti.API.info('Get hint | no onError handler defined');
	};
}

AjaxGetHint.prototype.fetch = function(args) {
	if (!args) args={};
	args.instance = this;
	//adding connection settings to args
	args.connection = connection.endpoints.userchallenge.getHint;
	AjaxCall(args);
};

module.exports = AjaxGetHint;