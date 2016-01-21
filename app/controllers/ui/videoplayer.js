var args = arguments[0] || {};
Ti.API.info(args.videoUrl);
var videoPlayerArgs = OS_IOS ? {
    url : args.videoUrl,
    autoplay : false,
    backgroundColor : 'black',
    fullscreen : false,
    scalingMode : Titanium.Media.VIDEO_SCALING_ASPECT_FIT,
    data : args.videoUrl
} : {
	visible: true,
	keepScreenOn: true,
    url : args.videoUrl,
    backgroundColor : 'black',
    mediaControlStyle : Titanium.Media.VIDEO_CONTROL_FULLSCREEN,
    scalingMode : Titanium.Media.VIDEO_SCALING_ASPECT_FIT,
    fullscreen : true,
    autoplay : true
};

var videoPlayer = Ti.Media.createVideoPlayer(videoPlayerArgs);	

Ti.API.info("Videoplayer: "+ JSON.stringify(videoPlayer));
videoPlayer.addEventListener("complete", onComplete);

var closeLabel = Ti.UI.createLabel({
    top : "10dp",
    left : "10dp",
    width : Ti.UI.SIZE,
    height : Ti.UI.SIZE,
    font : {
        fontSize : "14dp"
    },
    text : L("close"),
    color : "white"
});
closeLabel.addEventListener("click", onComplete);
if (OS_IOS) {
    $.videoWrapper.add(videoPlayer);
    $.videoWrapper.add(closeLabel);
} 

if (OS_ANDROID){
    videoPlayer.add(closeLabel);
}


function onComplete(e) {
    Ti.API.info('onComplete');
    if(videoPlayer) {
    	videoPlayer.stop();
	    videoPlayer.hide();
	    videoPlayer.release();
    }
    
    videoPlayer = null;
    if (OS_IOS)
        Alloy.Globals.index.remove($.videoWrapper);
};
