var header = Alloy.Globals.header.view;
header.changeTitle(L("Register_Last_step"));
Alloy.Globals.registerData = Alloy.Globals.registerData || {};
header.setBackgroundColor(Alloy.Globals.CustomColor1);

var registerData;
try {
	registerData = JSON.parse(Ti.App.Properties.getString("registerData"));
} catch(e) {
	registerData = false;
}

if (registerData) {
	Alloy.Globals.registerData = registerData;
} else {
	//we have to reset to login
	Alloy.Globals.pushPath({viewId:'login',resetPath:true});
}

Alloy.Globals.registerData.photo_upload = '';

function onClick(e) {
	var buttonId = e.source.id;
	switch (buttonId) {
	case "BtnPhoto":
		Alloy.Globals.userImageFetch = true;
		var mediaParams = {
			success : function(event) {
				var imageBlob = event.media;
				//--> start processing the image

				//creating thumnail of default width/height
				var avatarFromSelection = imageBlob.imageAsThumbnail(Alloy.Globals.appConfig.userThumbDefaultSize);

				//--> end processing the image
				Alloy.Globals.registerData.photo_upload = imageBlob;

				$.image.setImage(avatarFromSelection);

				Ti.API.info('media response' + JSON.stringify(event.media));
				
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
				Titanium.Media.showCamera(mediaParams);
				break;
			}

		});
		
		dialog.show();

		break;
	case "BtnSave":
		register();
		break;
	case "BtnCancel":
		Ti.App.Properties.setString("registerData", false);
        Ti.App.Properties.setString("currentRoute",false);
		Ti.App.fireEvent('appInit');
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
		params : Alloy.Globals.registerData,
		onSuccess : function(response) {
			var currentUserAvatar = Alloy.Globals.registerData.photo_upload;
			//saving the user avatar locally so we are not fetching it all the time
			if (currentUserAvatar) {
				var f = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, Alloy.Globals.registerData.username + '-avatar.png');
				if (f.exists()) {
					//overwriting the existing file
					f.open(Ti.Filesystem.MODE_WRITE);
					f.write(currentUserAvatar);
				} else
					f.write(currentUserAvatar);
			}
			Alloy.Globals.index.remove(indicator);
			indicator = null;
			Alloy.Globals.indicator = null;
			
			//after successfull registration we empty the registerData from permanent storage
			Ti.App.Properties.setString("registerData", false);
			Ti.App.Properties.setString('currentRoute', false);
			
			//logging in automatically on success
			setTimeout(function() {
				Ti.App.fireEvent('doLogin', {
					user : {
						email : Alloy.Globals.registerData.email,
						unhashedPassword : Alloy.Globals.registerData.password
					}
				});
				header.hideHeader();
			}, '500');
		},
		onError : function(response) {
			Alloy.Globals.index.remove(indicator);
			indicator = null;
			Alloy.Globals.indicator = null;
			Ti.API.info('There was an error registering || ' + JSON.stringify(response));
		}
	});
	userAjaxRegister.register();
}
