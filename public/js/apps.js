
var previousWidth = $(window).width(),
    previousHeight = $(window).height();

$(() => {
    setAppContainer($('.app').length);

    $(window).resize(() => {
        if (hasChanged(previousWidth, $(window).width()) || hasChanged(previousHeight, $(window).height()))
            setAppContainer($('.app').length);

        previousWidth = $(window).width();
        previousHeight = $(window).height();
    });
});

function hasChanged(previous, current) {
    return previous != current; // && current % 10 == 0;
}

function setAppContainer(appCount) {
    let windowWidth = $(window).width(),
        boxPerRow = Math.floor(windowWidth * 0.48 / $('.app').outerWidth(true)),
        containerWidth = (boxPerRow < 2 ? 2 : boxPerRow) * $('.app').outerWidth(true),
        containerHeight = Math.ceil(appCount/boxPerRow) * $('.app').outerHeight(true),
        maxContainerHeight = $(window).height() - $('#logo').outerHeight(true) * 2,
        posLeft = 8, padding = 0, overflow = 'visible';

    if (containerHeight > maxContainerHeight) {
        containerHeight = Math.floor(maxContainerHeight / $('.app').outerHeight(true));
        containerHeight = (containerHeight < 2 ? 2 : containerHeight) * $('.app').outerHeight(true);
        containerWidth += 17;
        posLeft = 16;
        padding = 17;
        overflow = 'auto';
    }

    $('#apps-container').css({
        width: containerWidth,
        height: containerHeight,
        left: posLeft
    });
    $("#apps").css({
        paddingRight: padding,
        overflow: overflow
    });
}