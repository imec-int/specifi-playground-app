/**
 * Returns an URL containing the given options
 * @url {String} The url to format
 * @width {Number} The width in pixels
 * @height {Number} The height in pixels
 * @options {String} Extra options (see Cloudinary docs)
 */
exports.formatUrl = function(url, width, height, options) {
	var connection = require('connectiondefaults');
	if(!url || url ==="")
		return "";
	var index = url.indexOf("upload/");
	if(index == -1)
		return "";
		
	url = url.slice(0, index+7)+joinOptions(width, height, options)+url.slice(index+7, url.length);
	return url;
};

/**
 * Returns an URL for a thumbnail
 * @name {String} The public id of the video in Cloudinary
 * @width {Number} The width in pixels
 * @height {Number} The height in pixels
 * @options {String} Extra options (see Cloudinary docs)
 */
exports.getVideoThumbnail = function(url, name, width, height, options) {
	var index = url.indexOf("upload/");
	if(index == -1)
		return "";
		
	url = url.slice(0, index+7)+joinOptions(width, height, options)+name+'.jpg';
	return url;
};

/**
 * Joins the options into one string
 * @param {Number} width 
 * @param {Number} height
 * @param {String} options
 */
function joinOptions(width, height, options) {
	var optionString = '';
	if(width)
		width = 'w_'+width;
	else
		width = '';
		
	if(height)
		height = 'h_'+height;
	else
		height = '';
		
	if(!options)
		options = '';	
	
	optionString = [width, height, options].join();
	
	if(optionString)
		optionString+='/';
	
	return optionString;
}
