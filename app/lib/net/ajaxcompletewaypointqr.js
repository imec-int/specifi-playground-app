var connection = Alloy.Globals.appConfig.connection;
var AjaxCall = require('../utils').creacityAjaxCall;

function AjaxCompleteWaypointQR(args) {
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

AjaxCompleteWaypointQR.prototype.completeWaypoint = function(args) {
	Ti.API.info('Complete waypoint');
	if (!args) args={};
	args.instance = this;
	//adding connection settings to args
	args.connection = connection.endpoints.userchallenge.completeWaypoint;
	AjaxCall(args);
};

module.exports = AjaxCompleteWaypointQR;