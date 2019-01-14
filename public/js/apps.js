$(function() {
    setAppContainer($('.app').length);
});

function setAppContainer(appCount) {
    // TODO: handle apps < boxPerRow

    let windowWidth = $(window).width();
    let boxPerRow = Math.floor(windowWidth * 0.48 / $('.app').outerWidth(true));
    let containerWidth = boxPerRow * $('.app').outerWidth(true);
    let containerHeight = Math.ceil(appCount/boxPerRow) * $('.app').outerHeight(true);

    $('#apps').css({
        width: containerWidth,
        height: containerHeight
    });
}