! function() {
    var events = [],
        touchable = isTouchDevice;

    // touch event support detect
    function isTouchDevice() {
        try {
            document.createEvent("TouchEvent");
            return true;
        } catch (e) {
            return false;
        }
    }

    /**
     *  覆盖zepto默认的tap
     **/
    $.fn.tap = function(handler) {
            var $con = this;

            if (!touchable) {
                $con.on('click', handler);
                return;
            }

            // support touch event
            function tapHandler(event) {
                var $tar = $(event.target);
            // 解决input元素blur时不触发touchend的问题
            if (document.activeElement && document.activeElement !== event.target) {
                document.activeElement.blur();
            }

            var backupEvent = event.targetTouches && event.targetTouches[0] ? event: null;
            
            var oevt = event.originalEvent || backupEvent,
                // accordType = event.originalEvent ? 'page': 'screen',
                accordType = 'page',
                touches = oevt && oevt.targetTouches && oevt.targetTouches[0],
                pageX = touches ? touches[accordType + 'X'] : 0,
                pageY = touches ? touches[accordType + 'Y'] : 0,
                endTouches,
                moveOevt,
                endPageX, 
                endPageY;


            $con.off('touchmove', moveHandler);
            $tar.off('touchend', endHandler);
            $tar.off('scroll', scrollHandler);
            
            var isMove = false,
                isEnd = false,
                isFeed = false,
                isTimeout = false,
                isScroll = false,
                delay = 50;

            function scrollHandler () {
                isScroll = true;

                setTimeout(function() {
                    isScroll = false;
                }, 500);
            }

            function moveHandler(e) {
                isMove = true;
                backupEvent = e.targetTouches && e.targetTouches[0] ? e: null;

                moveOevt = e.originalEvent || backupEvent;
                endTouches = moveOevt && moveOevt.targetTouches && moveOevt.targetTouches[0];
                endPageX = endTouches ? endTouches[accordType + 'X'] : 0;
                endPageY = endTouches ? endTouches[accordType + 'Y'] : 0;
            }

            function endHandler(e) {
                isEnd = true;
                $con.off('touchmove', moveHandler);
                $tar.off('touchend', endHandler);
                $tar.off('scroll', scrollHandler);

                if ((!oevt || !moveOevt) && isMove) {
                    return;
                }
                // 滚动了或者偏移超过5px都取消点击行为
                if (Math.abs(pageX - endPageX) > 5 || Math.abs(pageY - endPageY) > 5) {
                    return;
                }
                setTimeout(function() {
                    !isTimeout && !isScroll && isFeed && handler && handler(event);
                }, 60);
            }
            $con.on('touchmove', moveHandler);
            $tar.on('touchend', endHandler);
            $tar.on('scroll', scrollHandler);

            setTimeout(function() {
                isFeed = true;
            }, delay);

            setTimeout(function () {
                isTimeout = true;
            }, 350);
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
    $.fn.tapOff = function(handler) {

        if (!touchable) {
            this.of('click', handler);
            return;
        }

        // touch events off
        for (var i = 0; i < events.length; i++) {
            var evtObj = events[i];
            isMatched = false;

            if (evtObj) {
                this.each(function(index, el) {
                    evtObj.$el.each(function(index, target) {
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
}();
