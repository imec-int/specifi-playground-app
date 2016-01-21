var args = arguments[0] || {};
var user = args.user;
var score = args.totalScore || 0;
var currentUser = Alloy.Globals.user;

if(user && currentUser && user._id === currentUser._id) {
	$.row.setBackgroundColor(Alloy.Globals.CustomColor1Light);
}

$.positionLabel.text = ((args.position)?args.position:"0") + ".";

if(user && user.photo && user.photo.url) {
	$.userPictureImage.image = user.photo.url;
	$.userPictureImage.setLeft("-15dp");
	$.userPictureImage.setRight("-15dp");
	$.userPictureImage.setTop("-15dp");
	$.userPictureImage.setBottom("-15dp");
} else {
	$.userPictureImage.image = "/images/icons/user-#00aaad.png";
}

$.userLabel.text = (user)?user.username: L("unknown_user");
$.scoreLabel.text = score;

