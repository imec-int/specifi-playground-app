$.sliderMenu.userNameLabel = $.userNameLabel;
$.sliderMenu.tokenNumberLabel = $.tokenNumberLabel;
$.sliderMenu.userImage = $.userPictureImage;
$.sliderMenu.tableView = $.menuTable;
function menuOnClick(e) {
	if(!e.row || !e.row.id) return;
	Alloy.Globals.stopScanning();
	Alloy.Globals.beaconUtils.stopRanging();
    switch (e.row.id) {
    	case 'scan':
			Alloy.Globals.pushPath({
				viewId : 'scan/scan',
				resetPath : true
			});
    		break;
    	case 'nearbyChallenges':
            Alloy.Globals.pushPath({
                viewId : 'challenge/nearby/list',
                resetPath : true
            });
            break;
        case 'myChallenges':
            Alloy.Globals.pushPath({
                viewId : 'challenge/playing/list',
                resetPath : true
            });
            break;
        case 'completedChallenges':
            Alloy.Globals.pushPath({
                viewId : 'challenge/completed/list',
                resetPath : true
            });
            break;
    	case 'highscores':
	    	Alloy.Globals.pushPath({
                viewId : 'highscores/list',
                resetPath : true
            });
    		break;
        case 'logout':
            Ti.App.fireEvent('doLogout');
            break;
        case 'experienceStore':
        	Alloy.Globals.pushPath({
                viewId : 'experience/list',
                resetPath : true
            });
        	break;
        case "myTickets":
        	Alloy.Globals.pushPath({
        		viewId: 'tickets/list',
        		resetPath: true
        	});
        	break;
    	case "about":
        	Alloy.Globals.pushPath({
        		viewId: 'about/about',
        		resetPath: true
        	});
        	break;
        default:
            break;
    }
    Alloy.Globals.sliderMenu.hidemenu();
}

Alloy.Globals.leftMenu = $.sliderMenu;