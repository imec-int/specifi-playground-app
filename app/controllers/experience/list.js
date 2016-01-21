var header = Alloy.Globals.header.view;
header.showHeader();
header.changeTitle(L("Experience_store"));

//Properties
var tableData = [];

//Services
var AjaxExperience = require('net/ajaxexperience');

/*
	AjaxExperience success handler
*/
var ajaxExperienceSuccessHandler = function(result){
	if (result.experiences){
		var experiences = result.experiences;
		if (experiences.length && experiences.length > 0) {
			$.refreshWrapper.hide();
			$.refreshWrapper.height = "0dp";
			$.refreshWrapper.touchEnabled = false;
		} else {
			$.refreshWrapper.show();
			$.refreshWrapper.height = Ti.UI.FILL;
			$.refreshWrapper.touchEnabled = true;
		}
		
		_.each(experiences,function(exitem,index){
			exitem.even = !(index%2);
			var row = Alloy.createController('experience/row',exitem).getView();
			tableData.push(row);
		});
		$.experienceTable.setData(tableData);
	}
};


/*
	AjaxExperience error handler
*/
var ajaxExperienceErrorHandler = function (aeError){
	alert(L("err" + err.error));
};

/*
	Fetch experiences
*/
var ajaxExperience = new AjaxExperience({
	onSuccess: ajaxExperienceSuccessHandler,
	onError: ajaxExperienceErrorHandler,
	params :{
		
	}
});
ajaxExperience.list();

/*
	List click handler
*/
function listClickHandler(e){
	Alloy.Globals.pushPath({
		viewId: "experience/detail",
		data: {
			id: e.row.id
		}
	});
}
