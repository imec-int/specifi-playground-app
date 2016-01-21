function AjaxGetImage(args) {
    this.params = args.params || {};
    this.url = args.image ? args.image.url : args.imageUrl;
    this.filename = args.image ? args.image.filename.toLowerCase() : null;
    this.thumb = args.thumb ? true : false;
    
    //avoiding class overriding
    if (!(this instanceof arguments.callee))
        throw new Error("Constructor called as a function");

    this.response = {};
    this.onSuccess = typeof args.onSuccess === 'function' ? args.onSuccess : function() {
          Ti.API.info('Get Image | no onSuccess handler defined');
    };
    this.onError = typeof args.onError === 'function' ? args.onError : function() {
          Ti.API.info('Get Image | no onError handler defined');
    };
    
}

AjaxGetImage.prototype.fetch = function() {
    var instance = this;
    var url = instance.url;
    var requestType = 'GET';
    
    if(!url || !instance.filename) {
    	return instance.onError(L("errorGetImage"));
    }
    	
	if (instance.thumb) {
		url = url.replace("browse", "browse-thumb");
	};
	
    var xhr = Ti.Network.createHTTPClient(Alloy.Globals.appConfig.xhrSecurityParams);
    
    xhr.onload = function() {
        var f = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory,instance.filename);
        f.write(this.responseData);
        instance.onSuccess(f.nativePath);
    };
    
	xhr.onerror = function() {
		var that = this;
		try {
			instance.response = JSON.parse(that.responseText);
		} catch(e) {
			Ti.API.info('Invalid JSON Get Image');
		}
		instance.onError(instance.response);
	}; 
	
    xhr.open(requestType, url);
    xhr.send();
};

module.exports = AjaxGetImage;