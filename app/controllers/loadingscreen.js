var args = arguments[0] || {};
var imagesArray = args.images || [];
var text = args.text;
if (imagesArray.length ==0)
    for (var i = 1; i < 13; i++) {
        imagesArray.push('/images/ui/loader-' + i + '.png');
    }

$.loadingTextLabel.setText(text);
var loadingTextLabel = $.loadingTextLabel;
$.flipBook.images = imagesArray;
$.flipBook.start();


$.loadingWrapper.changeText = function(text){
	$.loadingTextLabel.setText(text);
};
// exports.changeText = loadingTextLabel.setText;