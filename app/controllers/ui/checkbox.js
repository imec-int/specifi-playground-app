var args = arguments[0] || {};
Ti.API.info('chkb arguments' + JSON.stringify(args));

//setting some defaults
var checked = args.value ? 'checked' : 'unchecked';
var type = args.type ? args.type : 'checkbox';
var imagePrefix = type == 'radio' ? 'radiobutton' : 'checkbox';
var imageUrl = '/images/ui/';
var checkboxImage = imageUrl + imagePrefix + '-' + checked + '.png';
var currentValue = args.value;
Ti.API.info(checkboxImage);

$.checkboxWrapper.top = args.top;
$.checkboxWrapper.height = args.height;
$.checkboxWrapper.bottom = args.bottom;
$.checkboxWrapper.left = args.left;
$.checkboxWrapper.right = args.right;
$.checkboxWrapper.width = args.width;

function checkboxStatus() {
    return checked == 'checked' ? true : false;
}

var hasLabel = args.title ? true : false;
if (hasLabel)
    $.checkboxLabel.setText(args.title);
if (args.shadowColor)
    $.checkboxLabel.setShadowColor(args.shadowColor);
if (args.titleShadowDisabled)
    $.checkboxLabel.hideShadow();
if (args.color)
    $.checkboxLabel.setColor(args.color);

var hasShadow = args.titleShadow ? true : false;

$.checkboxImage.setBackgroundImage(checkboxImage);

$.checkboxWrapper.id = args.id || "checkboxWrapper";

var check = function() {
    checked = 'checked';
    checkboxImage = imageUrl + imagePrefix + '-' + checked + '.png';
    $.checkboxImage.setBackgroundImage(checkboxImage);
    $.checkboxWrapper.value = true;
    currentValue = true;
};

exports.check = check;

var uncheck = function() {
    checked = 'unchecked';
    checkboxImage = imageUrl + imagePrefix + '-' + checked + '.png';
    $.checkboxImage.setBackgroundImage(checkboxImage);
    $.checkboxWrapper.value = false;
    currentValue = true;
};

exports.uncheck = uncheck;

var toggle = function() {
    if (checkboxStatus())
        uncheck();
    else
        check();
};

var getValue = function() {
    return checkboxStatus();
};

exports.getValue = getValue;

exports.value = currentValue;

//added for easier click handling

exports.on = function(name, cb) {
    return $.checkboxWrapper.addEventListener(name, cb);
};
exports.off = function(name, cb) {
    return $.checkboxWrapper.removeEventListener(name, cb);
};
exports._hasListenersForEventType = function(name, flag) {
    return $.checkboxWrapper._hasListenersForEventType(name, flag);
};

$.checkboxWrapper.addEventListener('click', function() {
    toggle();
    $.checkboxWrapper.fireEvent('change');
});

exports.toggle = toggle;

// Overwrite backbone aliasses:
exports.bind = $.checkboxWrapper.addEventListener;
exports.unbind = $.checkboxWrapper.removeEventListener;

// Support Titanium methods
exports.addEventListener = $.checkboxWrapper.addEventListener;
exports.removeEventListener = $.checkboxWrapper.removeEventListener;

// Overwrite Backbone trigger and Titanium fireEvent methods for convenience
exports.trigger = $.checkboxWrapper.fireEvent;
exports.fireEvent = $.checkboxWrapper.fireEvent;
