$.sliderMenu.userNameLabel = $.userNameLabel;
$.sliderMenu.tokenNumberLabel = $.tokenNumberLabel;
$.sliderMenu.userImage = $.userPictureImage;
$.sliderMenu.tableView = $.menuTable;
function menuOnClick(e) {
	if(!e.row || !e.row.id) return;
	Alloy.Globals.stopScanning();
	Alloy.Globals.stopRanging();
    switch (e.row.id) {
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
        case 'logout':
            Alloy.Globals.logout();
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