var connection = Alloy.Globals.appConfig.connection;
var AjaxCall = require('../utils').creacityAjaxCall;

function UserAjaxRegister(args) {
	Ti.API.info('UserAjaxRegister constructor args'+Ti.API.info(JSON.stringify(args)));
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

UserAjaxRegister.prototype.register = function(args) {
	if (!args) args={};
	args.instance = this;
	//adding connection settings to args
	args.connection = connection.endpoints.user.register;
	AjaxCall(args);
};

module.exports = UserAjaxRegister;