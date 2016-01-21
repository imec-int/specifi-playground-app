var header = Alloy.Globals.header.view;
header.showHeader();
header.changeTitle(L("Play_challenge"));

//Libs
var utils = require('utils');

//Properties
var args = arguments[0] || {};
var ugc = null;

//Services
var AjaxUserGeneratedContent = require('/net/ajaxusergeneratedcontent');
var AjaxGetImage = require('/net/ajaxgetimage');

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
	if (ugc && ugc.content && ugc.content.videoPath !== '') {
        var ajaxGetVideo = new AjaxGetImage({
            onSuccess : function(localfilePath) {
                $.ugcVideo.videoUrl = ugc.content.videoPath;
                $.ugcVideo.filetype = ugc.content.filetype;
                $.ugcVideoPreview.setTop("10dp");
                $.ugcVideoPreview.setImage(ugc.content.url);
                $.ugcVideo.setWidth(Ti.UI.FILL);
                $.ugcVideo.setHeight(Ti.UI.SIZE);
                $.ugcVideoPreview.setWidth(Ti.UI.SIZE);
                $.ugcVideoPreview.setHeight(Ti.UI.SIZE);
                $.ugcImage.setWidth(0);
                $.ugcImage.setHeight(0);
            },
            onError : function(response) {
                alert(L('ugc_load_error'));
            },
            image : ugc.content
        });
        ajaxGetVideo.fetch();
        return;
    }
	
	//Show image if one exists
    if (ugc && ugc.content && ugc.content.url !== '') {
        var ajaxGetImage = new AjaxGetImage({
            onSuccess : function(localfilePath) {
                var blob = utils.resizeAndCrop({
                    localfilePath : localfilePath,
                    width : 500,
                    height : 250
                });
                $.ugcImage.setTop("10dp");
                $.ugcImage.setImage(blob);
                $.ugcImage.setWidth(Ti.UI.SIZE);
                $.ugcImage.setHeight(Ti.UI.SIZE);
                $.ugcImageWrapper.setWidth(Ti.UI.FILL);
                $.ugcImageWrapper.setHeight(Ti.UI.SIZE);
                $.ugcImage.localfilePath = localfilePath;
            },
            onError : function(response) {
                alert(L('ugc_load_error'));
            },
            image : ugc.content
        });
        ajaxGetImage.fetch();
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
function nextWaypoint(data){
	if(data.complete)
		return completeUserChallenge(data);
	Alloy.Globals.pushPath({
		viewId : 'challenge/waypoint/info',
		data : {
			id : args.id
		},
		resetPath: true
	});
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
