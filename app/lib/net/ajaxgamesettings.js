var connection = Alloy.Globals.appConfig.connection;
var aCall = require('../utils').creacityAjaxCall;

function AjaxGameSettings(args) {
	Ti.API.info('Ajax game settings constructor args' + Ti.API.info(JSON.stringify(args)));
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

AjaxGameSettings.prototype.get = function(args) {
	Ti.API.info('get');
	args.instance = this;
	//adding connection settings to args
	args.connection = connection.endpoints.settings;
	aCall(args);
};

module.exports = AjaxGameSettings;
