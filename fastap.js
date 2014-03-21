! function() {
    // touch event support detect
    function isTouchDevice() {
        try {
            document.createEvent("TouchEvent");
            return true;
        } catch (e) {
            return false;
        }
    }

    var eventManger = {
            events: []
        },
        touchable = isTouchDevice();


    // Add scroll forzen time when using touch simulate click
    var isScroll = false,
        timeoutTimer;

    if (touchable) {
        
        $(window).on('scroll', function () {
            // 标识为出于滚动冷冻期
            isScroll = true;
            // 清除上次滚动冷冻timer
            clearTimeout(timeoutTimer);

            timeoutTimer = setTimeout(function() {
                isScroll = false;
            }, 300);
        });
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
            var $tar = $(event.target),
                ctx = {
                    hash: window.location.hash
                };

            // 解决input元素blur时不触发touchend的问题
            if (document.activeElement && document.activeElement !== event.target) {
                document.activeElement.blur();
            }

            var backupEvent = event.targetTouches && event.targetTouches[0] ? event: null;
            
            var oevt = event.originalEvent || backupEvent,
                touches = oevt && oevt.targetTouches && oevt.targetTouches[0],
                pageX = touches ? touches['pageX'] : 0,
                pageY = touches ? touches['pageY'] : 0,
                endTouches,
                moveOevt,
                startScrollTop = document.body.scrollTop,
                endScrollTop = startScrollTop,
                endPageX = 0, 
                endPageY = 0;
            
            var isMove = false,
                isFeed = false,
                isTimeout = false,
                delay = 40; // 此值与滚动触发点击的灵敏度和点击透传的出现几率有关

            // 获取touchmove的偏移地址
            function moveHandler(e) {
                isMove = true;
                backupEvent = e.targetTouches && e.targetTouches[0] ? e: null;

                moveOevt = e.originalEvent || backupEvent;
                endTouches = moveOevt && moveOevt.targetTouches && moveOevt.targetTouches[0];
                endPageX = endTouches ? endTouches['pageX'] : 0;
                endPageY = endTouches ? endTouches['pageY'] : 0;
            }

            // touch结束的处理
            function endHandler(e) {

                $con.off('touchmove', moveHandler);
                $tar.off('touchend', endHandler);
                
                if ((!oevt || !moveOevt) && isScroll) {
                    return;
                }

                // 滚动了或者偏移超过5px都取消点击行为
                if ( isMove && (Math.abs(pageX - endPageX) > 5 || Math.abs(pageY - endPageY) > 5) ) {
                    return;
                }

                setTimeout(function() {
                    !isTimeout && !isScroll && isFeed && handler && handler(event, ctx);
                }, 40);

            }

            $con.on('touchmove', moveHandler);
            $tar.on('touchend', endHandler);

            // 此延时是为了解决滚动点击问题
            setTimeout(function() {
                isFeed = true;
            }, delay);

            // touchstart停留超过350ms认为取消点击行为
            setTimeout(function () {
                isTimeout = true;
            }, 350);
        }

        // observer pattern, this is a subject
        eventManger.events.push({
            $el: this,
            listener: tapHandler,
            handler: handler
        });
        $con.on('touchstart', tapHandler);
    };

    /**
     *  取消监听tap事件（必需为覆盖zepto的tap事件）
     **/
    $.fn.tapOff = function(evtHandler) {

        if (!touchable) {
            this.off('click', evtHandler);
            return;
        }
        // touch events off
        var events = [];
        for (var i = 0; i < eventManger.events.length; i++) {
            var evtObj = eventManger.events[i],
                isMatched = false,
                matchEls = [];

            if (evtObj) {
                this.each(function(index, el) {
                    evtObj.$el.each(function(index, target) {
                        if (target == el) {
                            matchEls.push(el);
                        }
                    });
                });
                if ( ( !evtHandler || evtHandler === evtObj.handler) && matchEls.length > 0) {
                    $(matchEls).off('touchstart', evtObj.listener);
                    continue;
                }
                
            }
            events.push(evtObj);
        }
        eventManger.events = events;
    };
}();
