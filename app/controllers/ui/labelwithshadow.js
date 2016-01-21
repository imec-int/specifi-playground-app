var args = arguments[0] || {};
var shadow = $.shadow;
// Ti.API.info('arguments'+JSON.stringify(args));
$.labelWrapper.left = args.left || null;
$.labelWrapper.top = args.top || null;
$.labelWrapper.right = args.right || null;
$.labelWrapper.bottom = args.bottom || null;
$.label.text = args.text || '';
$.shadow.text = args.text || '';
if (args.textColor)
    $.label.color = args.textColor;
if (args.shadowColor)
    $.shadow.color = args.shadowColor;
if (args.shadowColor)
    $.shadow.color = args.shadowColor;
if (args.shadowOpacity)
    $.shadow.opacity = args.shadowOpacity;
if (args.shadowOffset) {
    $.shadow.top = args.shadowOffset;
    $.shadow.left = args.shadowOffset;
}
    
    
if (args.font) {
    $.label.setFont(args.font);
    $.shadow.setFont(args.font);
}

exports.setColor = function(color) {
    $.label.setColor(color);
};

exports.setShadowColor = function(color) {
    shadow.setColor(color);
};

exports.hideShadow = function() {
    shadow.hide();
    shadow.setColor('transparent');
};

exports.showShadow = function() {
    shadow.show();
    shadow.setColor(args.shadowColor);
};

exports.setText = function(text) {
    shadow.setText(text);
    $.label.setText(text);
};
