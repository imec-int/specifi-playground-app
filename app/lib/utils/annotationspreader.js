//Spreads the annotations so no two annotions are on the same coordinates
 function spread(annotations) {
 	_.each(annotations, function(annotation) {
 		var same = _.find(annotations,function(check) {
 			if(check.latitude == annotation.latitude && check.longitude == annotation.longitude)
 				return true;
			else
				return false;
 		});
 		if(same) {
 			annotation.latitude +=(Math.random()*0.0005);
 			annotation.longitude +=(Math.random()*0.0005);
 		}
 	});
 	return annotations;
};

exports.spread = spread;