var connection = Alloy.Globals.appConfig.connection;
var AjaxCall = require('../utils').creacityAjaxCall;

function AjaxCompleteWaypointBeacon(args) {
    this.params = args.params || {};
    //avoiding class overriding
    if (!(this instanceof arguments.callee))
        throw new Error("Constructor called as a function");

    this.response = {};
    this.onSuccess = typeof args.onSuccess === 'function' ? args.onSuccess : function() {
          Ti.API.info('AjaxCompleteWaypointBeacon || no onSuccess handler defined');
    };
    this.onError = typeof args.onError === 'function' ? args.onError : function() {
          Ti.API.info('AjaxCompleteWaypointBeacon || no onError handler defined');
    };
    this.onSendStream = typeof args.onSendStream === 'function' ? args.onSendStream : function(){
		Ti.API.info('AjaxCompleteWaypointBeacon || no onSendstream handler defined');
	};
}

AjaxCompleteWaypointBeacon.prototype.completeWaypoint = function(args) {
	if (!args) args={};
	args.instance = this;
	//adding connection settings to args
	args.connection = connection.endpoints.userchallenge.completeWaypointBeacon;
	AjaxCall(args);
};

module.exports = AjaxCompleteWaypointBeacon;