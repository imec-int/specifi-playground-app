var connection = Alloy.Globals.appConfig.connection;
var AjaxCall = require('../utils').creacityAjaxCall;

function AjaxExperienceTicket(args) {
	Ti.API.info('Ajax Experience Ticket constructor args'+Ti.API.info(JSON.stringify(args)));
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

AjaxExperienceTicket.prototype.list = function(args) {
	Ti.API.info('list');
	if (!args) args={};
	args.instance = this;
	//adding connection settings to args
	args.connection = connection.endpoints.experienceTicket.list;
	AjaxCall(args);
};

AjaxExperienceTicket.prototype.fetch = function(args) {
	Ti.API.info('list');
	if (!args) args={};
	args.instance = this;
	//adding connection settings to args
	args.connection = connection.endpoints.experienceTicket.fetch;
	AjaxCall(args);
};

AjaxExperienceTicket.prototype.use = function(args) {
	Ti.API.info('list');
	if (!args) args={};
	args.instance = this;
	//adding connection settings to args
	args.connection = connection.endpoints.experienceTicket.use;
	AjaxCall(args);
};


module.exports = AjaxExperienceTicket;
