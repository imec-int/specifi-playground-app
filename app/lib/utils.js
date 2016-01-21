/**
 * Test if a property exists on an object, regardless of depth
 * usage test(someObject, 'member.member.member.value');
 * @param {Object} obj
 * @param String prop
 */
exports.testPropertyExists = function(obj, prop) {
	var parts = prop.split('.');
	for (var i = 0, l = parts.length; i < l; i++) {
		var part = parts[i];
		if (obj !== null && typeof obj === "object" && part in obj) {
			obj = obj[part];
		} else {
			return false;
		}
	}
	return true;
};

/**
 * Converts the Mediahaven url to one that gets the thumbnail
 */
exports.thumbFromMediaHaven = function(url) {
	var newUrl = String(url).replace("browse", "browse-thumb");
	return newUrl;
};

/**
 * Resizes an image to a given size and returns a blob
 */
exports.resizeAndCrop = function(args) {
	var width = args.width ? args.width : 297;
	var height = args.height ? args.height : 146;
	var f = Ti.Filesystem.getFile(args.localfilePath);
	var blob = f.read();
	if(blob) {
		blob = blob.imageAsResized(width + 1, Math.floor(blob.height * (width + 1) / blob.width));
		blob = blob.imageAsCropped({
			width : width,
			height : blob.height <= height ? blob.height - 1 : height,
			x : 1,
			y : blob.height <= height ? 1 : Math.floor((blob.height - height) / 2)
		});
	}
	
	return blob;
};

exports.resizeAndCropFromBlob = function(args) {
	var blob = args.blob;
	var width = args.width ? args.width : 297;
	var height = args.height ? args.height : 146;
	if(blob) {
		blob = blob.imageAsResized(width + 1, Math.floor(blob.height * (width + 1) / blob.width));
		blob = blob.imageAsCropped({
			width : width,
			height : blob.height <= height ? blob.height - 1 : height,
			x : 1,
			y : blob.height <= height ? 1 : Math.floor((blob.height - height) / 2)
		});
	}
	
	return blob;
};

exports.noCoverageAlert = function(args) {
	var instance = args.instance;
	var error = args.error;
	instance.onError = typeof args.onError === 'function' ? args.onError : instance.onError;
	var dialog = Ti.UI.createAlertDialog({
		cancel : 1,
		buttonNames : [L('Retry'), L('Cancel')],
		message : L('There_is_no_data_coverage'),
		title : L('Internet_connection_is_lost')
	});
	var clickListener = function(e) {
		if (e.index === e.source.cancel) {
			if (typeof instance.onError === "function") instance.onError(error);
			return;
		}
		if (e.index===0){
			exports.creacityAjaxCall(args);
			return;
		}
	};
	dialog.addEventListener('click', clickListener);
	dialog.show();
}; 

exports.creacityAjaxCall = function(args) {
	var connection = Alloy.Globals.appConfig.connection;
	var instance = args.instance;
	if (args.onSuccess)
		instance.onSuccess = typeof args.onSuccess === 'function' ? args.onSuccess : instance.onSuccess;
	if (args.onError)
		instance.onError = typeof args.onError === 'function' ? args.onError : instance.onError;
	if (args.onSendStream)
		instance.onSendStream == typeof args.onSendStream === 'function' ? args.onSendStream : instance.onSendStream;
	var toSend = args.params ? args.params : instance.params;
	var callConnection = args.connection;
	var root = connection.root;
	var url = callConnection.url;
	var requestType = callConnection.requestType;
	var contentType = callConnection.contentType;
	var params = callConnection.params;
	for (var p in params) {
		url = url.toString().replace("%" + params[p] + "%", toSend[params[p]], url);
	}
	var xhr = Ti.Network.createHTTPClient(Alloy.Globals.appConfig.xhrSecurityParams);
	xhr.onload = function() {
		var that = this;
		Ti.API.info(that.responseText);
		if (!that.responseText) {
			Ti.API.info('No response error');
		} else {
			instance.response = JSON.parse(that.responseText);
			if ( typeof instance.onSuccess == "function")
				instance.onSuccess(instance.response);
			else
				Ti.API.info(instance.response);
		}
	};
	xhr.onerror = function(error) {
		var that = this;
		Ti.API.info(that.status);

		if (that.status === 0) {
			args.error = error;
			exports.noCoverageAlert(args);
		} else {
			try {
				instance.response = JSON.parse(that.responseText);
			} catch(e) {
				Ti.API.info(e);
				instance.response = error;
			}
			var serverReset = false;
			serverReset = exports.serverResetError(instance.response);
			if ( typeof instance.onError == "function" && !serverReset) {
				instance.onError(instance.response);
			}
		}

	}; 

	xhr.onsendstream = function(e) {
		//Ti.API.info('ajax call onSendStream');
		if ( typeof instance.onSendStream == "function")
			instance.onSendStream(e.progress);
	};
	Ti.API.info('Trying to connect to ' + root + url);

	xhr.open(requestType, root + url);
	if (requestType == 'GET') {
		xhr.setRequestHeader('content-type', contentType);
		toSend = null;
	}
	
	xhr.send(toSend);
};

exports.getLocalUserAvatar = function(username) {
	var userAvatarFile = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, username + '-avatar.png');
	if (userAvatarFile.exists()) {
		return userAvatarFile.resolve();
	}
	return false;
};

exports.setLocalUserAvatar = function(username, image) {
	var oldPhoto = Ti.Filesystem.getFile(image);
	var newPhoto = Ti.Filesystem.getFile(Ti.Filesystem.applicationDirectory, username + "-avatar.png");
	if (newPhoto.exists()) {
		newPhoto.open(Ti.Filesystem.MODE_WRITE);
		if (newPhoto.write(oldPhoto.resolve()))
			return true;
	} else {
		if (newPhoto.write(oldPhoto.resolve()))
			return true;
	}
	return false;
};

/*
	Login user again if the server was restarted
*/
exports.serverResetError = function(response) {
	var currentUser = JSON.parse(Ti.App.Properties.getString('currentUser'));
	if (response && response.error && response.error == '1010' && currentUser) {
		alert(L("no_connection"));
		Ti.App.fireEvent('doLogin', {
			user : currentUser
		});
		return true;
	}
	return false;
};