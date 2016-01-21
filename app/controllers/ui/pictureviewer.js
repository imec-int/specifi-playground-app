var args = arguments[0] || {};
$.photo.setImage(args.url);

if (OS_ANDROID) {
    $.imageWrapper.addEventListener('android:back', function() {
        //suppressing back button
        return false;
    });
}

function onClick() {
    $.imageWrapper.close();
}
