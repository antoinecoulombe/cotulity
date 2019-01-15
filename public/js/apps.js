
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
        overflow = 'visible',
        maxContainerHeight = $(window).height() - $('#logo').outerHeight(true) * 2;

    if (containerHeight > maxContainerHeight) {
        containerHeight = Math.floor(maxContainerHeight / $('.app').outerHeight(true));
        containerHeight = (containerHeight < 2 ? 2 : containerHeight) * $('.app').outerHeight(true);
        overflow = 'overlay';
    }

    $('#apps').css({
        width: containerWidth,
        height: containerHeight,
        overflowY: overflow
    });
}