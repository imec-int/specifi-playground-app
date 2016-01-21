var menuOpen = false;
var duration = 400;
var parent;
var handlers = {};
var accesible = true;

// Assign empty function to avoid calling undefined functions.
handlers.open = function() {
	Ti.API.info('menu opening from'+ JSON.stringify(menuOpen));
};
handlers.close = function() {
	Ti.API.info('menu closing from'+ JSON.stringify(menuOpen));
};
handlers.closed = function() {
	Ti.API.info('menu closed '+ JSON.stringify(menuOpen));
};
handlers.opened = function(){
	Ti.API.info('menu opened '+ JSON.stringify(menuOpen));
};


var init = function(opts) {
    $.drawermainview.add(opts.mainview);
    $.drawermenuview.add(opts.menuview);
    duration = opts.duration;
    parent = opts.parent;
    console.log('initialized');
    setSwipe();
};

var setSwipe = function() {
    parent.addEventListener('swipe', function(e) {
        if (menuOpen == false && e.direction == 'right') {
            showhidemenu();
            menuOpen = true;
        }

        if (menuOpen == true && e.direction == 'left') {
            showhidemenu();
            menuOpen = false;
        }
    });
};

var showhidemenu = function() {
    if (menuOpen) {
        hidemenu();
    } else {
        showmenu();
    }
};

var hidemenu = function() {
    moveTo = "0";
    if (menuOpen) {
        animateMenu(moveTo);
        handlers.close();
    } else {
        // Ti.API.info('tried to close an already closed menu');
    };
    
};

var showmenu = function() {
    moveTo = "210dp";
    if (!menuOpen) {
        animateMenu(moveTo);
        handlers.open();
    } else {
        // Ti.API.info('tried to open an already opened menu');
    };
    
};

var animateMenu = function(moveTo) {
    Ti.API.info('animateMenu accesibility' + accesible);
    if (accesible) {
        var newWidth = Ti.Platform.displayCaps.platformWidth;
        // if (OS_ANDROID)
            // newWidth /= Ti.Platform.displayCaps.logicalDensityFactor;
        // $.drawermainview.width = newWidth;
        $.drawermainview.animate({
            left : moveTo,
            curve : Ti.UI.ANIMATION_CURVE_EASE_OUT,
            duration : duration
        },function(){
        	if (moveTo=="0"){
        		menuOpen = false;
        		handlers.closed();
        	} else {
        		menuOpen = true;
        		handlers.opened();
        	}
        });
    }
};

var addEventListener = function(listenerName, listenerFunction) {
    switch (listenerName) {
        case 'open' :
            handlers.open = listenerFunction;
            break;
        case 'close' :
            handlers.close = listenerFunction;
            break;
        case 'closed':
        	handlers.closed = listenerFunction;
        	break;
        case 'opened':
        	handlers.opened = listenerFunction;
        	break;
    };
};

// Ti.Gesture.addEventListener('orientationchange', function(e) {
    // var newWidth;
    // newWidth = Ti.Platform.displayCaps.platformWidth;
    // if (OS_ANDROID)
        // newWidth /= Ti.Platform.displayCaps.logicalDensityFactor;
    // $.drawermainview.width = newWidth;
// });

exports.setAccesibility = function(permission) {
    Ti.API.info('setAccesibility ' + permission);
    accesible = permission;
};
exports.getAccesibility = function() {
    return accesible;
};
exports.togglemenu = showhidemenu;
exports.showmenu = showmenu;
exports.hidemenu = hidemenu;
exports.init = init;
exports.showhidemenu = showhidemenu;
exports.menuOpen = menuOpen;
exports.menuIsOpen = function() {
    return menuOpen;
};
exports.addEventListener = addEventListener;
exports.setDuration = function(dur) {
    duration = dur;
};