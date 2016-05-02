module.exports = {
	root : 'https://yourserver.com:30001/api',
	linkRoot: 'http://yourserver.com:3000',
	endpoints : {
		settings: {
			id : 'settings',
			requestType : "GET",
			contentType : "application/json",
			params : [],
			url : '/settings'
		},
		ping : {
			id : 'ping',
			requestType : "GET",
			contentType : "application/json",
			params : [],
			url : '/ping'
		},
		utils: {
			nearby:{
				id : 'fetch',
				requestType : "GET",
				contentType : "application/json",
				params : ["location","distance"],
				url : '/nearby/%location%/distance/%distance%'
			}
		},
		user : {
			changePassword : {
				id : 'changePassword',
				requestType : "POST",
				contentType : "application/json",
				url : '/user/changepassword',
				params : ["oldPassword", "newPassword", "newPassword_confirm"]
			},
			login : {
				id : 'userLogin',
				requestType : "POST",
				contentType : "application/json",
				url : '/user/login',
				params : ["email", "password"]
			},
			register : {
				id : 'userRegister',
				requestType : "POST",
				contentType : "multipart/form-data",
				url : '/user/register',
				params : ["firstname", "surname", "username", "email", "password", "photo_upload", "language", "privacyAndTerms", "contactProjects", "contactSurveys"]
			},
			logout : {
				id : 'userLogout',
				requestType : "POST",
				contentType : "application/json",
				url : '/user/logout',
				params : null
			},
			retrieveUser : {
				id : 'userRetrieveUser',
				requestType : "GET",
				contentType : "application/json",
				url : '/user/%user_id%',
				params : ["user_id"]
			},
			allUserChallenges : {
				id : "allUserChallenges",
				requestType : "GET",
				contentType : "application/json",
				url : '/user/%user_id%/challenges/%completed%',
				params : ["user_id","completed"]
			},
			uniqueUsername : {
				id : "userUniqueUsername",
				requestType : "GET",
				contentType : "application/json",
				url : '/user/%username%/username/unique',
				params : ["username"]
			},
			uniqueEmail : {
				id : "userUniqueEmail",
				requestType : "GET",
				contentType : "application/json",
				url : '/user/%email%/email/unique',
				params : ["email"]
			}
		},
		challenge : {
			fetch : {
				id : "fetch",
				requestType : "GET",
				contentType : "application/json",
				url : '/challenge/%challenge_id%',
				params : ["challenge_id"]
			}
		},
		userchallenge : {
			startChallenge : {
				id : "startChallenge",
				requestType : "GET",
				contentType : "application/json",
				url : '/userchallenge/%challenge_id%/start/%extra%',
				params : ["challenge_id","extra"]
			},
			stopChallenge : {
				id : "stopChallenge",
				requestType : "GET",
				contentType : "application/json",
				url : '/userchallenge/%challenge_id%/stop',
				params : ["challenge_id"]
			},
			completeWaypoint : {
				id : "completeWaypoint",
				requestType : "POST",
				contentType : "multipart/form-data",
				url : '/userchallenge/waypoint/qr',
				params : ["qrcode", "challengeid", "contentVideo_upload", "contentImage_upload", "contentText"]
			},
			completeWaypointBeacon : {
				id : "completeWaypointBeacon",
				requestType : "POST",
				contentType : "multipart/form-data",
				url : '/userchallenge/waypoint/beacon',
				params : ["challengeid", "beacon", "wpid", "contentVideo_upload", "contentImage_upload", "contentText"]
			},
			fetch : {
				id : "fetch",
				requestType : "GET",
				contentType : "application/json",
				url : '/userchallenge/%challenge_id%',
				params : ["challenge_id"]
			}
		},
		usergeneratedcontent:{
			getLast: {
				requestType : "GET",
				contentType : "application/json",
				url : '/ugc/challenge/%challenge_id%/waypoint/%waypoint_id%',
				params : ["challenge_id", "waypoint_id"]
			},
			rate: {
				requestType : "POST",
				contentType : "form-data",
				url : '/ugc/rate',
				params : ["id", "score"]
			}
		},
		privacy: {
			terms: {
				url : '/termsandconditions'
			}
		}
	}
};
