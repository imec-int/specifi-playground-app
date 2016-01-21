module.exports = {
	root : 'https://yourserver.com/api',
	linkRoot: 'http://yourserver.com',
	fbRoot: 'http://yourserver.com/fb',
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
				params : ["username", "email", "password", "password_confirm", "gender", "birthyear", "photo_upload"]
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
				params : ["qrcode", "challengeid", "content_upload", "contentText"]
			},
			completeWaypointBeacon : {
				id : "completeWaypointBeacon",
				requestType : "POST",
				contentType : "multipart/form-data",
				url : '/userchallenge/waypoint/beacon',
				params : ["challengeid", "beacon", "wpid","content_upload", "contentText"]
			},
			fetch : {
				id : "fetch",
				requestType : "GET",
				contentType : "application/json",
				url : '/userchallenge/%challenge_id%',
				params : ["challenge_id"]
			},
			getHint : {
				id : "getHint",
				requestType : "GET",
				contentType : "application/json",
				url : '/userchallenge/%challenge_id%/waypoint/%waypoint_id%/hint',
				params : ["challenge_id", "waypoint_id"]
			}
		},
		personalMarker : {
			list : {
				id : "list",
				requestType : "GET",
				contentType : "application/json",
				url : '/personalmarker/list',
				params : []
			},
			fetch : {
				id : "fetch",
				requestType : "GET",
				contentType : "application/json",
				url : '/personalmarker/%personalmarker_id%',
				params : ['personalmarker_id']
			},
			nearby : {
				id : "nearby",
				requestType : "GET",
				contentType : "application/json",
				url : '/personalmarker/nearby/%location%/distance/%distance%',
				params : ['location', 'distance']
			}
		},
		meetingHotspot:{
			list: {
				id : "list",
				requestType : "GET",
				contentType : "application/json",
				url : '/meetinghotspot/list',
				params : []
			},
			fetch:{
				id : "fetch",
				requestType : "GET",
				contentType : "application/json",
				url : '/meetinghotspot/%meetinghotspot_id%',
				params : ['meetinghotspot_id']
			},
			nearby:{
				id:"nearby",
				requestType : "GET",
				contentType : "application/json",
				url : '/meetinghotspot/nearby/%location%/distance/%distance%',
				params : ['location','distance']
			},
			start:{
				id:"start",
				requestType : "GET",
				contentType : "application/json",
				url : '/meetinghotspot/%meetinghotspot_id%/start/%location%',
				params : ['meetinghotspot_id','location']
			},
			stop: {
				id: "stop",
				requestType : "GET",
				contentType : "application/json",
				url : '/meetinghotspot/%meetinghotspot_id%/stop',
				params : ['meetinghotspot_id']
			},
			scan:{
				id:"scan",
				requestType : "POST",
				contentType : "form-data",
				url : '/meetinghotspot/scan',
				params : ['id','qr','location']
			}
		},
		scan : {
			scanPersonalMarker: {
				requestType : "GET",
				contentType : "application/json",
				url : '/scan/personalmarker/%id%',
				params : ["id"]
			},
			scanWaypoint: {
				requestType : "GET",
				contentType : "application/json",
				url : '/scan/waypoint/%id%',
				params : ["id"]
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
		experience :{
			list: {
				id : "list",
				requestType : "GET",
				contentType : "application/json",
				url : '/experience/list',
				params : []
			},
			fetch:{
				id : "fetch",
				requestType : "GET",
				contentType : "application/json",
				url : '/experience/%id%',
				params : ['id']
			},
			buy: {
				id: "buy",
				requestType : "POST",
				contentType : "form-data",
				url : '/experience/buy',
				params : ["id", "amount"]
			}
		},
		experienceTicket :{
			list: {
				id : "list",
				requestType : "GET",
				contentType : "application/json",
				url : '/experienceticket/list',
				params : []
			},
			fetch:{
				id : "fetch",
				requestType : "GET",
				contentType : "application/json",
				url : '/experienceticket/%id%',
				params : ['id']
			},
			use: {
				id: "use",
				requestType : "POST",
				contentType : "form-data",
				url : '/experienceticket/use',
				params : ["id"]
			}
		},
		highscores :{
			top: {
				id : "top",
				requestType : "GET",
				contentType : "application/json",
				url : '/highscore/%top%',
				params : ['top']
			},
			weekly: {
				id : "weekly",
				requestType : "GET",
				contentType : "application/json",
				url : '/highscore/weekly/%top%',
				params : ['top']
			},
			personal: {
				id : "personal",
				requestType : "GET",
				contentType : "application/json",
				url : '/highscore/personal',
				params: []
			}
		}
	},
	facebook: {
		challenge: {
			complete: "/challenge/completed/"
		}
	}
};
