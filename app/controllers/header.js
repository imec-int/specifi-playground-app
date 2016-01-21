$.header.buttonHidden = false;

$.header.changeTitle = function(title) {
	$.pageTitle.setText(title);
};

$.header.showHeader = function() {
	$.header.setHeight(Alloy.Globals.appConfig.headerHeight);
};

$.header.hideHeader = function() {
	$.header.setHeight(0);
};

$.header.hideSliderButton = function() {
	$.sliderButtonWrapper.setWidth(0);
	$.sliderButtonWrapper.setHeight(0);
	$.sliderButtonWrapper.hide();
	$.labelWrapper.setWidth("100%");
	$.labelWrapper.setLeft("0dp");
	$.header.buttonHidden = true;
};
$.header.showSliderButton = function() {
	$.sliderButtonWrapper.show();
	$.sliderButtonWrapper.setWidth(Ti.UI.SIZE);
	$.sliderButtonWrapper.setHeight(Ti.UI.SIZE);
	$.labelWrapper.setWidth("85%");
	$.labelWrapper.setLeft("14.99%");
	$.header.buttonHidden = false;
};

//setting the header in the globals so we can alter some of its states at any point
Alloy.Globals.header = {
	view : $.header
};
