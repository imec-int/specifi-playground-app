function onClick(e){
	if (Alloy.Globals.sliderMenu.menuIsOpen() && e.source.id!="mainHeaderSliderButton") 	
		Alloy.Globals.sliderMenu.hidemenu();
}
