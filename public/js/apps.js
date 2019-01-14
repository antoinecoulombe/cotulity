$(function() {
    setAppContainer($('.app').length);
});

function setAppContainer(appCount) {
    let windowWidth = $(window).width();
    let boxPerRow = floor(windowWidth);
    let containerWidth = boxPerRow * $('.app').outerWidth(true);
    let containerHeight = (appCount/boxPerRow) * $('.app').outerHeight(true);

    $('#apps').css({
        width: containerWidth,
        height: containerHeight
    });
}