var header = Alloy.Globals.header.view;
header.showHeader();
header.changeTitle(L("Play_challenge"));

//Libs
var utils = require('utils');
var cloudinary = require('cloudinaryutils');

//Properties
var args = arguments[0] || {};
var ugc = null;

//Services
var AjaxUserGeneratedContent = require('/net/ajaxusergeneratedcontent');

/**
 * Handles successful fetch of last UGC
 */
var ajaxUGCSuccessHandler = function(result) {
    if(!result || !result.ugc) {
    	nextWaypoint(args.userChallenge);
    } else {
    	parseUGC(result.ugc);
    }
};

/**
 * Handles fetch of last UGC error
 */
var ajaxUGCErrorHandler = function(result) {
	nextWaypoint(args.userChallenge);
};

/**
 * Fetch last UGC if it exists
 */
var ajaxUserGeneratedContent = new AjaxUserGeneratedContent({
    onSuccess : ajaxUGCSuccessHandler,
    onError : ajaxUGCErrorHandler,
    params : {
        challenge_id : args.id,
        waypoint_id: args.waypointId
    }
});
ajaxUserGeneratedContent.getLast();


/**
 * Parse UGC content
 */
function parseUGC(content) {
	
	ugc = content;
	
	if (utils.testPropertyExists(ugc, 'user.username')) {
		$.ugcUser.text = String.format(L('PreviousUserContentLabel'),ugc.user.username);
	}
	
	//If UGC is a video, set video control
	if (ugc && ugc.contentVideo && ugc.contentVideo.secure_url !== '') {
		$.ugcVideo.videoUrl = cloudinary.formatUrl(ugc.contentVideo.secure_url, 500, 250, 'c_fill');
		$.ugcVideoPreview.setTop("10dp");
		$.ugcVideoPreview.setImage(cloudinary.getVideoThumbnail(ugc.contentVideo.public_id, 500, 250, 'c_fill'));
		$.ugcVideo.setWidth(Ti.UI.FILL);
		$.ugcVideo.setHeight(Ti.UI.SIZE);
		$.ugcVideoPreview.setWidth(Ti.UI.SIZE);
		$.ugcVideoPreview.setHeight(Ti.UI.SIZE);
		$.ugcImage.setWidth(0);
		$.ugcImage.setHeight(0);
		return;
	}
	
	
	//Show image if one exists
    if (ugc && ugc.contentImage && ugc.contentImage.url !== '') {
    	$.ugcImage.setImage(cloudinary.formatUrl(ugc.contentImage.secure_url, 500, 250,'c_fill'));
		$.ugcImage.setTop("10dp");
        $.ugcImage.setWidth(Ti.UI.SIZE);
        $.ugcImage.setHeight(Ti.UI.SIZE);
        $.ugcImageWrapper.setWidth(Ti.UI.FILL);
        $.ugcImageWrapper.setHeight(Ti.UI.SIZE);
        return;
    }
    
    
    if(ugc && ugc.contentText && ugc.contentText !==''){
    	$.ugcText.visible = true;
    	$.ugcText.setHeight(Titanium.UI.SIZE);
    	$.ugcText.setText(ugc.contentText);
    }
	
}

/**
 * Handles video click
 */
function videoClick(e) {
    var videoView = Alloy.createController('ui/videoplayer', {
        videoUrl : ugc.contentVideo.secure_url
    }).getView();
    if (OS_IOS)
        Alloy.Globals.index.add(videoView);
}

/**
 * Handles image click
 */
function imageClick(e) {
    var pictureViewer = Alloy.createController('ui/pictureviewer', {
        url : ugc.contentImage.secure_url
    }).getView();
    pictureViewer.open();
}

/**
 * General click handler
 */
function onClick(e) {
    var id = e.source.id;
    switch(id) {
 		case "btnNext":
	    	nextWaypoint(args.userChallenge);
 			break;
		case "btnRate":
			$.btnRate.setTouchEnabled(false);
			var rateParams = {
				onSuccess : ajaxRateUGCSuccessHandler,
			    onError : ajaxRateUGCErrorHandler,
			    params : {
			        	id : ugc._id,
			        	score: Alloy.Globals.appConfig.gameSettings.ratingPointsCreator
			    	}
			   };
			var rateAjax = new AjaxUserGeneratedContent({});
		    rateAjax.rate(rateParams);
		    break;
    }
}

/*
	Navigate to the result screen
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
 * Navigates to next waypoint
 */
function nextWaypoint(data) {
	if(data.complete)
		return completeUserChallenge(data);
		
	if(data.randomOrder) {
		Alloy.Globals.pushPath({
			viewId : 'challenge/waypoint/random',
			data : {
				id : args.id
			},
			resetPath: true
		});
	}
	else {
		Alloy.Globals.pushPath({
		viewId : 'challenge/waypoint/info',
		data : {
			id : args.id
		},
		resetPath: true
	});
	}
	
}


/**
 * Handles successful rating
 */
var ajaxRateUGCSuccessHandler = function(result) {
	if(result && result.success) {
		alert(L("rate_ugc_success"));
	} else {
		alert(L("rate_ugc_fail"));
		$.btnRate.setTouchEnabled(true);
	}
};

/**
 * Handles failed rating
 * @param {Object} err Returned error
 */
var ajaxRateUGCErrorHandler = function(err) {
	if(err && err.error === '1046') {
		alert(L("rate_ugc_twice"));
		$.btnRate.setTouchEnabled(false);
	} else {
		alert(L("rate_ugc_fail"));
		$.btnRate.setTouchEnabled(true);
	}
};
