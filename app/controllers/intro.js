//hiding header in case of coming back from a register page
var header = Alloy.Globals.header.view;
header.hideHeader();

//Properties
var args = $.args;

var images =["/images/intro1.png","/images/intro2.png","/images/intro3.png"];
var index = 0;

function onClick(e) {
	var buttonId = e.source.id;
	switch (buttonId) {
		case "btnNextImage":
			if(index < images.length-1) {
				index++;
				$.introImages.setImage(images[index]);
				Ti.API.info("Set image: "+images[index]);
			}
			if(index == images.length-1) {
				Ti.API.info("Hide button!");
				$.btnNextImage.hide();
			}
			break;
		case "btnSkip":
			Alloy.Globals.pushPath({
				viewId : 'login', 
				resetPath: true
			});
			break;
	}
}
