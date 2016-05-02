function RandomButton ()
{
	var wpId = "";
	var completed = false;
	var button;
	this.createRandomButton = function (args, $) {
		wpId = args.wpId;
		completed = args.completed;
	    var buttonWrapper = Ti.UI.createView({
	    	id:'buttonWrapper', 
	    	height: '50dp',
			width: Titanium.UI.FILL,
			borderWidth: '1dp',
			borderColor: "#989786",
			backgroundColor: Alloy.Globals.CustomColor1Light,
			borderRadius: '5dp',
			left: '10dp',
			right: '10dp',
			top: '15dp',
			bottom: '15dp',
			touchEnabled: !completed
		});
	    var layoutWrapper = Ti.UI.createView({
	    	id:'layoutWrapper',
	    	width: Titanium.UI.FILL,
			height: Titanium.UI.FILL,
			layout: 'absolute',
			touchEnabled: !completed
	    });
	    
	    var textWrapper = Ti.UI.createView({
	    	id:'textWrapper',
		    top: '2dp',
			bottom: '2dp',
			height: Titanium.UI.FILL,
			right: '45dp',
			left: '4dp',
			layout: 'horizontal',
			touchEnabled: !completed
		});
	    var iconWrapper = Ti.UI.createView({
	    	id:'iconWrapper',
	    	width: Titanium.UI.SIZE,
		    height: Titanium.UI.SIZE,
		    right: '4dp',
		    layout: 'absolute',
		    touchEnabled: !completed
	    });
	    var buttonLabel = Ti.UI.createLabel({
	    	id: "buttonLabel",
	    	text: args.text,
	    	height: Titanium.UI.FILL,
			width: Titanium.UI.FILL,
			font: {
				fontSize: '36dp'
			},
			color: "#FFFFFF",
			touchEnabled: !completed
		});
	    var notCompletedIcon = Ti.UI.createLabel({
	    	id: "notCompletedIcon",
		    left: '0dp',
			top: '0dp',
			height: '36dp',
			width: '36dp',
			font: {
				fontSize: '36dp'
			},
			color: 'white',
			visible: !completed,
			touchEnabled: !completed,
			icon: "fa-circle-o"
		});
	    var completedIcon = Ti.UI.createLabel({
	    	id: "completedIcon",
	    	visible: completed,
		    left: '0dp',
			top: '0dp',
			height: '36dp',
			width: '36dp',
			font: {
				fontSize: '36dp'
			},
			color: 'white',
			touchEnabled: !completed,
			icon: "fa-check-circle-o"
		});
		
   		buttonWrapper.wpId = wpId;
	    buttonWrapper.completed = completed;
	    
	    buttonWrapper.add(layoutWrapper);
	    layoutWrapper.wpId = wpId;
	    layoutWrapper.completed = completed;
	    
	    layoutWrapper.add(textWrapper);
	    textWrapper.wpId = wpId;
	    textWrapper.completed = completed;
	    
	    layoutWrapper.add(iconWrapper);
	    iconWrapper.wpId = wpId;
	    iconWrapper.completed = completed;
	    
	    textWrapper.add(buttonLabel);
	    buttonLabel.wpId = wpId;
	    buttonLabel.completed = completed;
	    
	    iconWrapper.add(notCompletedIcon);
	    notCompletedIcon.wpId = wpId;
	    notCompletedIcon.completed = completed;
	    
	    iconWrapper.add(completedIcon);
	    completedIcon.wpId = wpId;
	    completedIcon.completed = completed;
	    
	    $.fa.add(completedIcon, 'fa-check-circle-o');
	    $.fa.add(notCompletedIcon,'fa-circle-o');
	    
	    button = buttonWrapper;
	    return buttonWrapper;
	};

	this.getWpId = function() {
		Ti.API.info("Get wpId called: "+JSON.stringify(wpId));
		return wpId;
	};
	
	this.getCompleted = function(){
		Ti.API.info("Get completed called: "+JSON.stringify(completed));
		return completed;
	};
	
	this.addEventListener = function(eventType, cb){
		button.addEventListener(eventType,cb);
	};
	
	this.removeEventListener = function(eventType, cb){
		button.removeEventListener(eventType,cb);
	};
}
 
module.exports = RandomButton;