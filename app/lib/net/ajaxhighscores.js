var connection = Alloy.Globals.appConfig.connection;
var AjaxCall = require('../utils').creacityAjaxCall;

function AjaxHighscores(args) {
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

}

//Get top x highscores
AjaxHighscores.prototype.getHighscores = function(args) {
	if (!args) args={};
	args.instance = this;
	//adding connection settings to args
	args.connection = connection.endpoints.highscores.top;
	AjaxCall(args);
};

//Get weekly highscores
AjaxHighscores.prototype.getWeeklyHighscores = function(args) {
	if (!args) args={};
	args.instance = this;
	//adding connection settings to args
	args.connection = connection.endpoints.highscores.weekly;
	AjaxCall(args);
};

//Get highscore relative to player
AjaxHighscores.prototype.getRelativeHighscores = function(args) {
	if (!args) args={};
	args.instance = this;
	//adding connection settings to args
	args.connection = connection.endpoints.highscores.personal;
	AjaxCall(args);
};

module.exports = AjaxHighscores;
