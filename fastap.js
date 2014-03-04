var events = [];

/**
 *  覆盖zepto默认的tap
 **/
$.fn.tap = function(handler) {
    var $con = this;

    function tapHandler (event) {
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
            }, delay + 10);
        }
        $con.on('touchmove', scrollHandler);
        $tar.on('touchend', endHandler);

        setTimeout(function() {
            isFeed = true;
        }, delay);
    }
    events.push({
        $el: this,
        listener: tapHandler,
        handler: handler
    });
    $con.on('touchstart', tapHandler);
};

/**
 *  取消监听tap事件（必需为覆盖zepto的tap事件）
 **/
$.fn.tapOff = function (handler) {

    for (var i = 0; i < events.length; i ++) {
        var evtObj = events[i];
            isMatched = false;

        if (evtObj) {
            this.each(function (index, el) {
               evtObj.$el.each(function (index, target) {
                   if (target == el) {
                        isMatched = true;
                        return true;
                   }
               });
               if (isMatched) return true;
            });
            if (handler == evtObj.handler && isMatched) {
                this.off('touchstart', evtObj.listener);
                events[i] = null;
            }
        }
    }
};