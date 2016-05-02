var header = Alloy.Globals.header.view;
header.changeTitle(L("Register_Last_step"));
header.setBackgroundColor(Alloy.Globals.CustomColor1);

//Properties
var args = arguments[0] || {};
var user = args.user;

//Libs
var PermissionsUtils = require('utils/permissionsutils');

if (!user)
	Alloy.Globals.pushPath({viewId:'login',resetPath:true});

function onClick(e) {
	var buttonId = e.source.id;
	switch (buttonId) {
		case "btnPhoto":
			Alloy.Globals.userImageFetch = true;
			var mediaParams = {
				success : function(event) {
					var imageBlob = event.media;
					//--> start processing the image
	
					//creating thumnail of default width/height
					var avatarFromSelection = imageBlob.imageAsThumbnail(Alloy.Globals.appConfig.userThumbDefaultSize);
	
					//--> end processing the image
					user.photo_upload = imageBlob;
	
					$.image.setImage(avatarFromSelection);
	
					//holding back the resume handler				
					setTimeout(function() {
						Alloy.Globals.userImageFetch = false;
					}, 1500); 
	
				},
				cancel : function() {
					//holding back the resume handler				
					setTimeout(function() {
						Alloy.Globals.userImageFetch = false;
					}, 1500); 
				},
				error : function() {
					//holding back the resume handler				
					setTimeout(function() {
						Alloy.Globals.userImageFetch = false;
					}, 1500); 
				}
			};
	
			var dialog = Ti.UI.createAlertDialog({
				buttonNames : [L('Choose_from_gallery'), L('Take_a_new_photo')],
				message : L('Register_photo_dialog_message'),
				title : L('Register_photo_dialog_title')
			});
	
			dialog.addEventListener('click', function(e) {
				switch (e.index) {
				case 0:
					Titanium.Media.openPhotoGallery(mediaParams);
					break;
				case 1:
					PermissionsUtils.getCameraPermissions(function(err){
						if(err) {
							alert(L(err));
						} 
						else {
							Titanium.Media.showCamera(mediaParams);
						}
					});
					break;
				}
	
			});
			
			dialog.show();
	
			break;
		case "btnSave":
			register();
			break;
		case "btnRegisterCancel":
			Alloy.Globals.pushPath({viewId: 'login', resetPath: true});
			header.hideHeader();
			break;
	}
}

function register() {
	var indicator = Alloy.createController('loadingscreen', {
		text : L("Registering")
	}).getView();
	Alloy.Globals.index.add(indicator);
	Alloy.Globals.indicator = indicator;
	var UserAjaxRegister = require('/net/userajaxregister');
	var userAjaxRegister = new UserAjaxRegister({
		params : user,
		onSuccess : function(response) {
			Alloy.Globals.index.remove(indicator);
			indicator = null;
			Alloy.Globals.indicator = null;
			
			//logging in automatically on success
			setTimeout(function() {
				Alloy.Globals.login({
					user : {
						email : user.email,
						unhashedPassword : user.password
					}
				});
				header.hideHeader();
			}, '500');
		},
		onError : function(err) {
			Alloy.Globals.index.remove(indicator);
			indicator = null;
			Alloy.Globals.indicator = null;
			$.registerHint.setText(L('err'+err.error));
			$.registerHint.setColor("#FF0000");
			Ti.API.info('There was an error registering || ' + JSON.stringify(err));
		}
	});
	userAjaxRegister.register();
}
