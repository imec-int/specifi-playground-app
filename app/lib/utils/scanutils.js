//Parse a scanned QR code and return the id and type found
 function parseQRCode(qr) {
 	var root = Alloy.Globals.appConfig.connection.root;
	var url = root.slice(0, -3);
	var scanned = qr.substring(url.length);
	
	var id = scanned.slice(0, -3);
	var type = scanned.slice(-2);
	
	if(type && id)
		return {id: id, type: type};
	else
		return null;
};

/*
	Creates a QR code for use in-app
*/
function createQRCode(id) {
	var root = Alloy.Globals.appConfig.connection.root;
	var url = root.slice(0, -3);
	return url + id;
}

exports.parseQRCode = parseQRCode;
exports.createQRCode = createQRCode;