var args = arguments[0] || {};

if (!args.available) {
    $.leftBullet.setBackgroundColor("#666666");
} else {
    $.leftBullet.setBackgroundColor("#00aaad");
}

$.dayLabel.setText(args.dayText);
$.scheduleLabel.setText(args.scheduleText);
