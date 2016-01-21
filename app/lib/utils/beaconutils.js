var region = 'Playground';
var autoRange = false;
var beacons = null;
var proximityCallback;

/**
 * A generic class for handling beacons on IOS and Android
 * @param {String} region Which region to listener to
 * @param {Boolean} autoRange Whether to range beacons automagically or not
 */
function BeaconUtils(region, autoRange){
	var self = this;
	self.region = region;
	self.autoRange = autoRange;
	if (OS_ANDROID) {
	    self.beacons = require("com.liferay.beacons");
	    self.beacons.setAutoRange(autoRange);
	} else if(OS_IOS) {
		self.beacons = require('org.beuckman.tibeacons');
	}
	
	/**
	 * Handles a beacon proximity events. Immediate (0m-0,5m), near (0,5m-3m), far (3m-70m), unknown (beacon not detected) are possible values
	 */
    self.beacons.addEventListener("beaconProximity", function(e){
    	Ti.API.info("Beacon proximity: "+ JSON.stringify(e));
    	self.proximityCallback(e);
    });
    self.beacons.addEventListener("exitedRegion" , function(e) {
    	Ti.API.info("Exited region: "+JSON.stringify(e));
		self.proximityCallback({proximity: 'unknown'});
    });
    self.beacons.addEventListener("determinedRegionState", function(e) {
    	Ti.API.info("Region state: "+JSON.stringify(e));
    	if(e.regionState ==='outside') {
    		self.proximityCallback({proximity: 'unknown'});
    	}
    });

	
}

/*
	Returns availability of Bluetooth LE on the device
*/
BeaconUtils.prototype.checkAvailability = function(callback) {
	if (OS_ANDROID) {
		callback(this.beacons.checkAvailability());
	} else if(OS_IOS) {
		this.statusCallBack = callback;
		this.beacons.addEventListener('bluetoothStatus', callback);
		this.beacons.requestBluetoothStatus();
	}
};


/*
	Add event listener to beacons object
*/
BeaconUtils.prototype.addEventListener = function(event, callback) {
	this.beacons.addEventListener(event, callback);
};

/*
	Remove event listener from beacons object
*/
BeaconUtils.prototype.removeEventListener = function(event, callback) {
	this.beacons.removeEventListener(event, callback);
};


/*
	Start ranging for a certain beacon
*/
BeaconUtils.prototype.startRanging = function(beacon, cb) {
	this.proximityCallback = cb;
	beacon.identifier = this.region;
	
	this.beacons.startMonitoringForRegion(beacon);
	if(OS_IOS)
		this.beacons.startRangingForBeacons(beacon);
};

/*
	Stop ranging for a everything
*/
BeaconUtils.prototype.stopRanging = function() {
	this.proximityCallBack = null;
	Ti.API.info("Stop ranging!");
	this.beacons.stopRangingForAllBeacons();
	this.beacons.stopMonitoringAllRegions();
};

module.exports = BeaconUtils;