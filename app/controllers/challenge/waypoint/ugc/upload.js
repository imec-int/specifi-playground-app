var header = Alloy.Globals.header.view;
header.showHeader();
header.changeTitle(L("Play_challenge"));

//Libs
var utils = require('utils');
var CustomProgressBar = require('/ui/customprogressbar');

//Properties
var args = arguments[0] || {};
var userChallenge = {};
var currentWaypoint;
var media = null;
var pgbar = null;

//Services
var AjaxUserChallenge = require('/net/ajaxuserchallenge');
var AjaxCompleteWaypoint;

if(args.qr)
	AjaxCompleteWaypoint = require('/net/ajaxcompletewaypointqr');
	
if(args.beacon)
	AjaxCompleteWaypoint = require('/net/ajaxcompletewaypointbeacon');


/**
*	Navigates back to challenge detail
*/
var goBackToDetail = function() {
	Alloy.Globals.popPath();
	Alloy.Globals.pushPath({
		viewId : 'challenge/detail/start',
		data : {
			id : args.id
		},
		resetPath: true
	});
};


/**
*	Get the userchallenge
*/
var ajaxUserChallenge = new AjaxUserChallenge({
	onSuccess : function(result) { 
		Ti.API.info('Success getting UserChallenge: ' + JSON.stringify(result));
		parseChallenge(result);
	},
	onError : function(result) { 
		Ti.API.info('Error getting UserChallenge: ' + JSON.stringify(result));
		alert(L("ajaxUserChallengeError"));
		goBackToDetail();
	},
	params : {
		challenge_id : args.id
	}
});
ajaxUserChallenge.fetch();

/**
*	Determine currentWaypoint
*/
function findCurrentWaypoint(data) {
	var waypoints = data.challenge.waypoints;
	var completedWP = data.completedWP ? data.completedWP : [];
	if(completedWP.length < waypoints.length) {
		return waypoints[completedWP.length];
	} else {
		return null;
	}
};

/**
*	Resets all fields that can change
*/
function resetView() {
}


/**
*	Parse the result and fill the userchallenge object
*/
function parseChallenge(data) {
	userChallenge = data;
	
	if(!userChallenge.complete) {
		currentWaypoint = findCurrentWaypoint(userChallenge);
	} else {
		completeUserChallenge(userChallenge);
		return;
	}
	
	resetView();
	
	$.challengeTitle.text = '" ' + userChallenge.challenge.name + ' "';

	if (utils.testPropertyExists(currentWaypoint, "name"))
		$.currentWaypoint.text = currentWaypoint.name;
		
	if (utils.testPropertyExists(currentWaypoint, 'ugcDescription'))
    	$.waypointDescription.text = currentWaypoint.ugcDescription;
		
	
	$.waypointNumber.text = String.format(L("playWaypointNumber"),userChallenge.completedWP.length + 1);
	if (userChallenge.challenge.waypoints.length > 1) {
		$.waypointNumberOf.text = String.format(L("playWaypointNumberOf"),userChallenge.challenge.waypoints.length);
	} else {
		$.waypointNumberOf.text = L("playSingleWaypointOf");
	}
	
	if (utils.testPropertyExists(currentWaypoint, 'ugcType')) 
    	showControls(currentWaypoint.ugcType);
	
	updateButtons();
	
	$.footerWrapper.animate({
		bottom: "0dp",
		duration: 400
	});
};


/**
*	Navigate to the result screen
*/
function completeUserChallenge(data) {
	Alloy.Globals.pushPath({
		viewId : "challenge/detail/result",
		data : {
			id : data.challenge._id,
			gained : data.score,
			name : data.challenge.name,
			user: data.user
		},
		resetPath:true
	});
}




/**
 * Handles video click
 */
function videoClick(e) {
    var videoUrl = e.source.videoUrl;
    var filetype = e.source.filetype;
    var videoView = Alloy.createController('ui/videoplayer', {
        videoUrl : videoUrl
    }).getView();
    if (OS_IOS)
        Alloy.Globals.index.add(videoView);
}

/**
 * Handles image click
 */
function imageClick(e) {
    var url = e.source.localfilePath;
    var pictureViewer = Alloy.createController('ui/pictureviewer', {
        url : url
    }).getView();
    pictureViewer.open();
}

/**
 * General click event handler
 */
function onClick(e) {
	Alloy.Globals.stopScanning();
    switch(e.source.id) {
 		case "btnRecord":
 			captureMedia(currentWaypoint);
 			break;
		case "btnUpload":
			startUpload();
 			break;
		case "btnNext":
			submitText();
 			break;
    }
}

/*
	Determine which type of media needs to be captured
*/
function captureMedia(wp) {
	switch(wp.ugcType) {
		case 'picture':
			capturePhoto();
			break;
		case 'video':
			captureVideo();
			break;
		default:
			break;
	}
}


/**
 * Capture photo with device camera
 */
function capturePhoto() {
	if(Titanium.Media.isCameraSupported) {
		Alloy.Globals.userImageFetch = true;
		Titanium.Media.showCamera({
			success:function(event) {
				if(event.mediaType == Ti.Media.MEDIA_TYPE_PHOTO) {
					media = event.media;
					showPicture(event.media);
					updateButtons();
				} else {
					alert(L('waypoint_ugc_wrong_type'));
					updateButtons();
				}
			},
			cancel:function() {
				updateButtons();
			},
			error:function(error) {
				alert(L('waypoint_ugc_capture_photo_err'));
				updateButtons();
			},
			saveToPhotoGallery:true,
			allowEditing:false,
			mediaTypes:[Ti.Media.MEDIA_TYPE_PHOTO]
		});
	} else {
		alert(L('waypoint_ugc_no_camera'));
		updateButtons();
	}
}

/*
	Handle capturing videos
*/
function captureVideo() {
	if(Titanium.Media.isCameraSupported) {
		Alloy.Globals.userImageFetch = true;
		if(OS_ANDROID) {
			var intent = Titanium.Android.createIntent({ action: 'android.media.action.VIDEO_CAPTURE' });
			intent.putExtra("android.intent.extra.durationLimit", 60);
			var win = Titanium.UI.currentWindow;
		    win.activity.startActivityForResult(intent, function(e) {
		        if (e.resultCode == Ti.Android.RESULT_OK) {
		            if (e.intent.data != null) {
		            	var f = Titanium.Filesystem.getFile(e.intent.data);
						var copiedFile = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, f.name);                            
						f.copy(copiedFile.nativePath);                         
						var blob = copiedFile.read();
						media = blob;
		                showVideo(blob);
		                updateButtons();
		    	    }
		            else {
		                Ti.API.error('Could not retrieve media URL!');
		                updateButtons();
		            }
		            
		        }
		        else if (e.resultCode == Ti.Android.RESULT_CANCELED) {
		            updateButtons();
		        }
		        else {
		            alert(L('waypoint_ugc_capture_video_err'));
		            updateButtons();
		        }
		        
		    });
		} else if(OS_IOS) {
			Titanium.Media.showCamera({
				videoMaximumDuration: 60000,
				success:function(event) {
					if(event.mediaType == Ti.Media.MEDIA_TYPE_VIDEO) {
						media = event.media;
						showVideo(media);
						updateButtons();
					} else {
						alert(L('waypoint_ugc_wrong_type'));
						updateButtons();
					}
				},
				cancel:function() {
					updateButtons();
				},
				error:function(error) {
					alert(L('waypoint_ugc_capture_video_err'));
					updateButtons();
				},
				saveToPhotoGallery:true,
				allowEditing:false,
				mediaTypes:[Ti.Media.MEDIA_TYPE_VIDEO]
			});
		}
	} else {
		alert(L('waypoint_ugc_no_camera'));
		updateButtons();
	}
}

/*
	Handle submission of text content
*/
function submitText() {
	if($.ugcTextArea.getValue() === '') {
		alert(L('no_ugc_text'));
		return;
	}
	
	pgbar=null;
	
	var qrid;
	
	if(args.qr && args.qr.id)
		qrid = args.qr.id;
	
	var ajaxUserChallenge = new AjaxCompleteWaypoint({
	    onSuccess : ajaxCompleteWaypointSuccessHandler,
	    onError : ajaxCompleteWaypointErrorHandler,
	    params : {
	    	wpid: currentWaypoint._id,
	        qrcode : qrid,
	        beacon: args.beacon,
	        challengeid: args.id,
	        contentText: $.ugcTextArea.getValue()
	    }
	});
	ajaxUserChallenge.completeWaypoint();
}


/**
 * Handles upload of media
 */
function startUpload(){
	pgbar = new CustomProgressBar({
		min:0,
		max:1,
		left: 20,
		right: 20,
		top:10,
		borderRadius:5,
		width: Titanium.UI.FILL,
		height: '20dp',
		backgroundColor: '#333',
		foregroundColor: Alloy.Globals.CustomColor5
	});
	$.topWrapper.add(pgbar);
	$.ugcTitle.text = L('ugcUploading');
	$.ugcTypeImage.setVisible(false);
	$.ugcTypeImage.setHeight('0dp');
	$.btnUpload.setTouchEnabled(false);
	$.btnRecord.setTouchEnabled(false);
	
	var qrid;
	
	if(args.qr && args.qr.id)
		qrid = args.qr.id;
	
	var ajaxUserChallenge = new AjaxCompleteWaypoint({
	    onSuccess : ajaxCompleteWaypointSuccessHandler,
	    onError : ajaxCompleteWaypointErrorHandler,
	    onSendStream: ajaxCompleteWaypointProgressHandler,
	    params : {
	    	wpid: currentWaypoint._id,
	        qrcode : qrid,
	        beacon: args.beacon,
	        challengeid: args.id,
	        content_upload: media
	    }
	});
	ajaxUserChallenge.completeWaypoint();
}

/*
	Handle upload success
*/
function ajaxCompleteWaypointSuccessHandler(response) {
	Alloy.Globals.userImageFetch = false;
	if(pgbar)
		$.topWrapper.remove(pgbar);
	Alloy.Globals.pushPath({
		resetPath: true,
        viewId : 'challenge/waypoint/ugc/showlastcontent',
        data : {
        	id: args.id,
        	userChallenge: response,
        	waypointId: currentWaypoint._id
        }
    });
}

/*
	Handle an upload error
*/
function ajaxCompleteWaypointErrorHandler(response) {
	Alloy.Globals.userImageFetch = false;
	if(pgbar)
		$.topWrapper.remove(pgbar);
	$.ugcTitle.text = L('ugcUploadFailed');
	$.ugcTypeImage.setVisible(true);
	$.ugcTypeImage.setHeight('70dp');
	$.btnUpload.setTouchEnabled(true);
	$.btnRecord.setTouchEnabled(true);
}

/*
	Handle upload progress
*/
function ajaxCompleteWaypointProgressHandler(response) {
	pgbar.SetValue(response);
}

//*******************UTIL METHODS*************************//

/**
 * Show the correct controls and visuals based on required UGC type
 */
function showControls(type) {
	switch(type) {
		case 'picture':
			$.ugcTitle.text = L('ugcPicture');
			$.fa.add($.ugcTypeImage, 'fa-camera');
			$.btnRecord.setWidth('50%');
			$.btnRecord.setVisible(true);
			$.btnRecord.setTitle(L('btnRecord_picture'));
			$.btnUpload.setWidth('50%');
			$.btnUpload.setVisible(true);
			break;
		case 'text':
			$.ugcTitle.text = L('ugcText');
			$.fa.add($.ugcTypeImage, 'fa-pencil');
			$.ugcTextArea.visible = true;
			$.ugcTextArea.setHeight('100dp');
			$.btnNext.setWidth('100%');
			$.btnNext.setVisible(true);
			break;
		case 'video':
			$.ugcTitle.text = L('ugcVideo');
			$.fa.add($.ugcTypeImage, 'fa-video-camera');
			$.btnRecord.setWidth('50%');
			$.btnRecord.setVisible(true);
			$.btnRecord.setTitle(L('btnRecord'));
			$.btnUpload.setWidth('50%');
			$.btnUpload.setVisible(true);
			break;
	}
}

/**
 * Update buttons based on state of UGC
 */
function updateButtons() {
	if(media) {
		$.btnUpload.setTouchEnabled(true);
		$.btnRecord.setBackgroundColor(Alloy.Globals.CustomColor3Light);
		$.details.visible = false;
		$.details.setHeight('0dp');
		$.currentWaypoint.visible = false;
		$.currentWaypoint.setHeight('0dp');
		$.ugcTypeImage.visible = false;
		$.ugcTypeImage.setHeight('0dp');
		$.waypointDescription.visible = false;
		$.waypointDescription.setHeight('0dp');
		$.ugcTitle.text = L('ugcGoodJob');
		$.uploadMessage.visible = true;
		$.uploadMessage.setHeight('auto');
	} else {
		$.btnRecord.setBackgroundColor(Alloy.Globals.CustomColor3);
		$.btnUpload.setTouchEnabled(false);
		$.details.visible = true;
		$.details.setHeight('auto');
		$.currentWaypoint.visible = true;
		$.currentWaypoint.setHeight('auto');
		$.waypointDescription.visible = true;
		$.waypointDescription.setHeight('auto');
		$.ugcTypeImage.visible = true;
		$.ugcTypeImage.setHeight('70dp');
		$.uploadMessage.visible = false;
		$.uploadMessage.setHeight('0dp');
	}
}


/**
 * Shows the captured video
 * @param {Object} blob Video as blob
 */
function showVideo(blob) {
	var croppedThumbnail = null;
	if(OS_IOS) {
		var videoPlayer = Titanium.Media.createVideoPlayer({url:blob.getNativePath()});
		
		videoPlayer.requestThumbnailImagesAtTimes([0], Titanium.Media.VIDEO_TIME_OPTION_NEAREST_KEYFRAME, function(response){
			Ti.API.info("Thumbnail: "+ JSON.stringify(response));
			croppedThumbnail = utils.resizeAndCropFromBlob({
		        blob : response.image,
		        width : 500,
		        height : 250
		    });
		    $.ugcVideoPreview.setTop("10dp");
    		$.ugcVideoPreview.setImage(croppedThumbnail);
    		$.ugcVideoPreview.setWidth(Ti.UI.SIZE);
    		$.ugcVideoPreview.setHeight(Ti.UI.SIZE);
		});	
		
	} else {
		var androidMedia = require('com.mykingdom.media');
		var videoList = androidMedia.getItems(androidMedia.MEDIA_TYPE_VIDEO);
		var videoName = blob.nativePath.split("/");
		videoName = videoName[videoName.length-1];
		var videoFound = _.find(videoList.videos, function(video){
			return videoName === video.displayName;
		});
		croppedThumbnail = androidMedia.getVideoThumbnail(videoFound.id, androidMedia.THUMBANIL_MINI);
		$.ugcVideoPreview.setTop("10dp");
		$.ugcVideoPreview.setImage(croppedThumbnail);
		$.ugcVideoPreview.setWidth(Ti.UI.SIZE);
		$.ugcVideoPreview.setHeight(Ti.UI.SIZE);
	}
	$.ugcVideo.videoUrl = blob.getNativePath();
    $.ugcVideo.setWidth(Ti.UI.FILL);
    $.ugcVideo.setHeight(Ti.UI.SIZE);
}


/**
 * Shows the captured photo
 * @param {Object} blob Photo as blob
 */
function showPicture(blob) {
	$.ugcImage.localfilePath = blob.nativePath;
	var blob = utils.resizeAndCropFromBlob({
        blob : blob,
        width : 500,
        height : 250
    });
    $.ugcImage.setTop("10dp");
    $.ugcImage.setImage(blob);
    $.ugcImage.setWidth(Ti.UI.SIZE);
    $.ugcImage.setHeight(Ti.UI.SIZE);
    $.ugcImageWrapper.setWidth(Ti.UI.FILL);
    $.ugcImageWrapper.setHeight(Ti.UI.SIZE);
}
