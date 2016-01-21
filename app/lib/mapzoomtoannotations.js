module.exports = function(geos) {
    var maxLat = _.max(geos, function(oneGeo) {
        return oneGeo.latitude;
    }).latitude;
    
    var minLat = _.min(geos, function(oneGeo) {
        return oneGeo.latitude;
    }).latitude;
    
    var minLong = _.min(geos, function(oneGeo) {
        return oneGeo.longitude;
    }).longitude;
    
    var maxLong = _.max(geos, function(oneGeo) {
        return oneGeo.longitude;
    }).longitude;

    var averageLat = _.reduce(geos, function(memo, num) {
        return memo + num.latitude;
    }, 0) / geos.length;

    var averageLong = _.reduce(geos, function(memo, num) {
        return memo + num.longitude;
    }, 0) / geos.length;

    var region = {
        latitude : averageLat,
        longitude : averageLong,
        latitudeDelta : 2*(maxLat - minLat)+0.001,
        longitudeDelta : 2*(maxLong - minLong)+0.001
    };
    if (isNaN(region.latitude) || isNaN(region.longitude)) {
            region.latitude = Alloy.Globals.currentCoords.latitude;
            region.longitude = Alloy.Globals.currentCoords.longitude;
            region.latitudeDelta = 0.02;
            region.longitudeDelta = 0.02;
        }
    return region;
};
