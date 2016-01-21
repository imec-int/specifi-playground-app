var args = arguments[0] || {};
var timeRemaining = args.timeRemaining;
var counterId;
var suffix = "";
var stopped = true;
if (args.suffix) suffix = args.suffix;
if (timeRemaining)
	$.countdownTime.setText(themeTime(timeRemaining));
	
if (args.text) $.countdownTime.setText(args.text);

//setting some properties from tss or args
if (args.font)
	$.countdownTime.setFont(args.font);
if ( typeof args.width == 'number' || args.width)
	$.countDownWrapper.width = args.width;
if ( typeof args.height == 'number' || args.height)
	$.countDownWrapper.height = args.height;
if ( typeof args.left == "number" || args.left)
	$.countDownWrapper.left = args.left;
if ( typeof args.right == 'number' || args.right)
	$.countDownWrapper.right = args.right;
if ( typeof args.top == 'number' || args.top)
	$.countDownWrapper.top = args.top;
if ( typeof args.bottom == 'number' || args.bottom)
	$.countDownWrapper.bottom = args.bottom;
if (args.color)
	$.countdownTime.color = args.color;

/**
 * will parse the time in the format: hh:mm:ss
 * @param {Object} time
 */
function themeTime(duration) {
	var days = parseInt(duration / 86400 / 1000);
	var hours = parseInt(duration / 3600 / 1000) % 24;
	var minutes = parseInt(duration / 60 / 1000) % 60;
	var seconds = Math.floor((duration / 1000) % 60);
	var themed = "";
	var themedDays = String("00" + days).slice(-2);
	if (parseInt(themedDays))
		themedDays = themedDays + ":";
	else
		themedDays = "";

	var themedHours = String("00" + hours).slice(-2);
	if (themedHours || themedDays)
		themedHours = themedHours + ":";
	else
		themedHours = "";

	var themedMinutes = String("00" + minutes).slice(-2);
	if (themedMinutes || themedHours)
		themedMinutes = themedMinutes + ":";
	else
		themedMinutes = "";

	var themedSeconds = String("00" + seconds).slice(-2);

	themed = themedDays + themedHours + themedMinutes + themedSeconds;
	return themed;
}

exports.update = function(remaining) {
	$.countdownTime.setText(themeTime(remaining)+(suffix?' '+suffix:''));
};

exports.start = function(remaining,handlers) {
	stopped = false;
	//properly handling time
	var currentTime = new Date().getTime();
	var endTime = remaining+currentTime;
	
	if (!handlers) handlers = {};
	var _stopHandler = handlers.onStop;
	var _tickHandler = handlers.onTick;
	var ticks = 0;
	timeRemaining = remaining;
	exports.update(timeRemaining);
	counterId = setInterval(function() {
		timeRemaining = endTime - new Date().getTime();	
		if (timeRemaining >= 0) {
			//properly updating remaining time
			exports.update(timeRemaining);
			if (typeof _tickHandler=="function") {
				_tickHandler();
				ticks++;
			}
		} else{
			exports.stop(_stopHandler);
		}
	}, 1000);
	//registering the counterId on globals so we can stop them 
	Alloy.Globals.counterIds.push(counterId);
};

exports.stop = function(_stopHandler) {
	stopped=true;
	clearInterval(counterId);
	if (typeof _stopHandler=="function") _stopHandler();
};

exports.counterId = function(){
	return counterId;
};

exports.setText = function(text, dontStop){
	if (!dontStop) exports.stop();
	$.countdownTime.setText(text);
};

exports.setHeight = function(height){
	$.countDownWrapper.height = height;
};
