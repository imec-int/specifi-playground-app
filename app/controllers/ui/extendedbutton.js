var args = arguments[0] || {};
var selected = false;
var disabled = false;

var buttonLabel = $.buttonLabel;
buttonLabel.hideShadow = function() {
    buttonLabel.shadowColor = "transparent";
};

if (args.visible)
    $.buttonWrapper.visible = args.visible;
if (args.iconImage) {
    $.iconWrapper.top = 0;
    $.icon.top = "iconTop" in args ? args.iconTop : null;
    $.icon.bottom = "iconBottom" in args ? args.iconBottom : null;
    $.icon.height = "iconHeight" in args ? args.iconHeight : "25dp";
    $.icon.width = "iconWidth" in args ? args.iconWidth : "25dp";
    $.icon.backgroundImage = args.iconImage;
    $.icon.backgroundRepeat = false;
    $.iconWrapper.width = Ti.UI.SIZE;
    $.iconWrapper.height = Ti.UI.FILL;
} else {
    //removing icon wrapper and image from button
    $.layoutWrapper.remove($.iconWrapper);
}

if (args.opacity)
    $.layoutWrapper.setOpacity(args.opacity);

if (args.title)
    buttonLabel.setText(args.title);
if (args.text)
    buttonLabel.setText(args.text);
if (args.left)
    $.buttonWrapper.setLeft(args.left);
if (args.right)
    $.buttonWrapper.setRight(args.right);
if (args.bottom)
    $.buttonWrapper.setBottom(args.bottom);
if (args.top)
    $.buttonWrapper.setTop(args.top);
if (args.width)
    $.buttonWrapper.setWidth(args.width);

if (args.right && args.left)
    $.buttonWrapper.width = null;

if (args.height)
    $.buttonWrapper.setHeight(args.height);
if (args.top && args.bottom)
    $.buttonWrapper.height = null;

if (args.borderRadius)
    $.buttonWrapper.setBorderRadius(args.borderRadius);
if (args.borderWidth)
    $.buttonWrapper.setBorderWidth(args.borderWidth);
if (args.borderColor)
    $.buttonWrapper.setBorderColor(args.borderColor);
    
if (args.backgroundImage)
    $.buttonWrapper.backgroundImage = args.backgroundImage;
if (OS_ANDROID && args.backgroundSelectedImage)
    $.buttonWrapper.backgroundSelectedImage = args.backgroundSelectedImage;
if (args.backgroundColor)
    $.buttonWrapper.backgroundColor = args.backgroundColor;
if (args.backgroundSelectedColor)
	$.buttonWrapper.backgroundSelectedColor = args.backgroundSelectedColor;
if (args.backgroundDisabledColor) {
	$.buttonWrapper.backgroundDisabledColor = args.backgroundDisabledColor;
}

if(args.touchEnabled != undefined) {
	$.buttonWrapper.touchEnabled = args.touchEnabled;
}
	
if (args.titleColor)
    buttonLabel.setColor(args.titleColor);
if (args.titleShadowColor)
    buttonLabel.setShadowColor(args.titleShadowColor);
if (args.titleShadowDisabled)
    buttonLabel.hideShadow();
if (args.textAlign == Titanium.UI.TEXT_ALIGNMENT_LEFT)
    $.layoutWrapper.setLeft(args.titlePaddingLeft ? args.titlePaddingLeft : "20dp");
if (args.textPaddingLeft)
    buttonLabel.setLeft(args.textPaddingLeft);
if (args.font)
    buttonLabel.setFont(args.font);

if ("noTitle" in args && args.noTitle == true) {
    //removing text if noTitle is true
    $.layoutWrapper.remove($.textWrapper);
}

if (OS_IOS && args.backgroundSelectedColor) {
    //adding event listeners so it behaves the same
    $.buttonWrapper.addEventListener('touchstart', function() {
        $.buttonWrapper.backgroundColor = args.backgroundSelectedColor;
    });
    $.buttonWrapper.addEventListener('touchend', function() {
        $.buttonWrapper.backgroundColor = args.backgroundColor;
    });
    $.buttonWrapper.addEventListener('touchcancel', function() {
        $.buttonWrapper.backgroundColor = args.backgroundColor;
    });
}

if (OS_IOS && args.backgroundSelectedImage) {
    //adding event listeners so it behaves the same
    $.buttonWrapper.addEventListener('touchstart', function() {
        $.buttonWrapper.backgroundImage = args.backgroundSelectedImage;
    });
    $.buttonWrapper.addEventListener('touchend', function() {
        $.buttonWrapper.backgroundImage = args.backgroundImage;
    });
    $.buttonWrapper.addEventListener('touchcancel', function() {
        $.buttonWrapper.backgroundImage = args.backgroundImage;
    });
};

$.buttonWrapper.id = args.id || "buttonWrapper";

//exposing some methods
exports.show = $.buttonWrapper.show;
exports.hide = $.buttonWrapper.hide;
exports.setBackgroundColor = function(color) {
    $.buttonWrapper.setBackgroundColor(color);
};

exports.setTitle = function(title){
	buttonLabel.setText(title);
};

exports.setText = function (title){
	buttonLabel.setText(title);
};

exports.setIconImage = function(image) {
    $.icon.setBackgroundImage(image);
};

exports.setTouchEnabled = function(enabled) {
	$.buttonWrapper.setTouchEnabled(enabled);
}; 

//added for easier click handling
exports.on = function(name, cb) {
    return $.buttonWrapper.addEventListener(name, cb);
};
exports.off = function(name, cb) {
    return $.buttonWrapper.removeEventListener(name, cb);
};
exports._hasListenersForEventType = function(name, flag) {
    return $.buttonWrapper._hasListenersForEventType(name, flag);
};

//Set height
exports.setHeight = function(height) {
	 $.buttonWrapper.setHeight(height);
};

//Set width
exports.setWidth = function(width) {
	$.buttonWrapper.setWidth(width);
};

//Set visible
exports.setVisible = function(visible){
	$.buttonWrapper.setVisible(visible);
};

// Overwrite backbone aliasses:
exports.bind = $.buttonWrapper.bind;
exports.unbind = $.buttonWrapper.unbind;

// Support Titanium methods
exports.addEventListener = $.buttonWrapper.addEventListener;
exports.removeEventListener = $.buttonWrapper.removeEventListener;

// Overwrite Backbone trigger and Titanium fireEvent methods for convenience
exports.trigger = $.buttonWrapper.trigger;
exports.fireEvent = $.buttonWrapper.fireEvent;

//Set selected
var setSelected = function(value) {
	this.selected = value;
	if(value && args.backgroundSelectedColor) {
		$.buttonWrapper.setBackgroundColor(args.backgroundSelectedColor);
	} else {
		$.buttonWrapper.setBackgroundColor(args.backgroundColor);
	}
};

//Set disabled
var setDisabled = function(value) {
	this.disabled = value;
	setTouchEnabled(value);
	if(value && args.backgroundDisabledColor) {
		$.buttonWrapper.setBackgroundColor(args.backgroundDisabledColor);
	} else {
		$.buttonWrapper.setBackgroundColor(args.backgroundColor);
	}
};

if(args.selected != undefined)
	setSelected(args.selected);

if(args.disabled != undefined)
	setDisabled(args.disabled);

exports.setSelected = setSelected;
exports.setDisabled = setDisabled;
