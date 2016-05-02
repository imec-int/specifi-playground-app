
/**
 * Request location permissions from Android users
 * @param {Object} cb Callback to call on success and error
 */
exports.getLocationPermissions = function (cb) {
	if (OS_ANDROID) {
		if(!Titanium.Geolocation.hasLocationPermissions(Titanium.Geolocation.AUTHORIZATION_ALWAYS)) {
			Titanium.Geolocation.requestLocationPermissions(Titanium.Geolocation.AUTHORIZATION_ALWAYS, function(result){
				if(!result.success) {
					cb('err1060');
				} else {
					cb();
				}
			});
		} else {
			cb();
		}
	} else {
		cb();
	}
};

/**
 * Request camera permissions from Android users
 * @param {Object} cb
 */
exports.getCameraPermissions = function (cb) {
	if (OS_ANDROID) {
		if(!Titanium.Media.hasCameraPermissions()) {
			Titanium.Media.requestCameraPermissions(function(result){
				if(!result.success) {
					cb('err1070');
				} else {
					cb();
				}
			});
		} else {
			cb();
		}
	} else {
		cb();
	}
};
