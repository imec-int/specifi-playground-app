var connection = Alloy.Globals.appConfig.connection;
var AjaxCall = require('../utils').creacityAjaxCall;

function AjaxUserGeneratedContent(args) {
	this.params = args.params || {};
	//avoiding class overriding
	if (!(this instanceof arguments.callee))
		throw new Error("Constructor called as a function");

	this.response = {};
	this.onSuccess = typeof args.onSuccess === 'function' ? args.onSuccess : function() {
		Ti.API.info('no onSuccess handler defined');
	};
	this.onError = typeof args.onError === 'function' ? args.onError : function() {
		Ti.API.info('no onError handler defined');
	};
	this.onSendStream = typeof args.onSendStream === 'function' ? args.onSendStream : function(){
		Ti.API.info('no onSendstream handler defined');
	};

}

AjaxUserGeneratedContent.prototype.getLast = function(args) {
	Ti.API.info('Get last UGC');
	if (!args) args={};
	args.instance = this;
	//adding connection settings to args
	args.connection = connection.endpoints.usergeneratedcontent.getLast;
	AjaxCall(args);
};

AjaxUserGeneratedContent.prototype.rate = function(args) {
	Ti.API.info('Rate UGC');
	if (!args) args={};
	args.instance = this;
	//adding connection settings to args
	args.connection = connection.endpoints.usergeneratedcontent.rate;
	AjaxCall(args);
};

module.exports = AjaxUserGeneratedContent;
