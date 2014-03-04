/**
 *  覆盖zepto默认的tap
 **/
$.fn.tap = function(handler) {
    var $con = $(this);

    $con.on('touchstart', function(event) {
        var $tar = $(event.target);
        if (!$tar) return;

        $con.off('touchmove', scrollHandler);
        $tar.off('touchend', endHandler);

        var isSroll = false,
            isEnd = false,
            isFeed = false,
            delay = 50;

        function scrollHandler(e) {
            isSroll = true;
            $con.off('touchmove', scrollHandler);
            return;
        }

        function endHandler(e) {
            isEnd = true;
            $tar.off('touchend', endHandler);

            if (isSroll) {
                return;
            }

            setTimeout(function() {
                isFeed && handler && handler(event);
            }, 20);
        }
        $con.on('touchmove', scrollHandler);
        $tar.on('touchend', endHandler);

        setTimeout(function() {
            isFeed = true;
        }, delay);
    });
};
