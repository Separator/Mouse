/**
 * Created with JetBrains PhpStorm.
 * User: Максим
 * Date: 09.10.14
 * Time: 0:14
 * Requires: jquery
 */

function Mouse(options) {
    var defaultSettings = {
        'buttons': {},
        'checkEvents': {
            'mousedown': 1,
            'mouseup': 1,
            'mousemove': 1,
            'contextmenu': 1
        },
        'eventsTarget': null,
        'handlerFunction': null,
        'frameMinSize': 10,
        'currentLayerX': 0,
        'currentLayerY': 0,
        'doubleClickTime': 170,
        'handlers': {
            'leftClick':        function(event) {},
            'leftDoubleClick':  function(event) {},
            'rightClick':       function(event) {},
            'rightDoubleClick': function(event) {},
            'centerClick':      function(event) {},
            'centerDoubleClick':function(event) {},
            'frameComplete':    function(frame) {},
            'frameSizeChange':  function(frame) {},
            'frameDeleted':     function(frame) {}
        }
    };

    /**
     * Получить свойства текущего фрейма
     * @returns {*}
     */
    this.getFrame = function() {
        if (this['buttons'] && this['buttons'][0] && this['buttons'][0]['pressed']) {
            var mouseDownX = this['buttons'][0]['x'];
            var mouseDownY = this['buttons'][0]['y'];
            var currentLayerX = this['currentLayerX'];
            var currentLayerY = this['currentLayerY'];
            var frameMinSize = this['frameMinSize'];
            var size = Math.abs(mouseDownX - currentLayerX) + Math.abs(mouseDownY - currentLayerY);
            if (size >= frameMinSize) {
                return {
                    'beginX':   mouseDownX,
                    'beginY':   mouseDownY,
                    'endX':     currentLayerX,
                    'endY':     currentLayerY
                };
            } else {
                return false;
            };
        } else {
            return false;
        };
    };
    /**
     * Обработать событие и выполнить действие
     * @param event
     */
    this.processing = function(event) {
        var eventType = event['type'];
        switch (eventType) {
            case 'mousedown':
                if (!this['buttons']) {
                    this['buttons'] = {};
                };
                if (this['buttons'][event['button']]) {
                    this['buttons'][event['button']]['pressed'] = true;
                    this['buttons'][event['button']]['x'] = event['layerX'];
                    this['buttons'][event['button']]['y'] = event['layerY'];
                } else {
                    this['buttons'][event['button']] = {
                        'pressed':          true,
                        'x':                event['layerX'],
                        'y':                event['layerY'],
                        'lastClickTime':    null
                    };
                };
                break;
            case 'mouseup':
                var frame = this.getFrame();
                if (frame) {
                    if (this['handlers'] && this['handlers']['frameComplete']) {
                        this['handlers']['frameComplete'](frame);
                    };
                } else {
                    var buttonName;
                    switch (event['button']) {
                        case 0: buttonName = 'left';    break;
                        case 1: buttonName = 'center';  break;
                        case 2: buttonName = 'right';   break;
                        default:buttonName = 'left';    break;
                    };
                    if (this['buttons'][event['button']]['lastClickTime']) {
                        var doubleClickTime = this['doubleClickTime'];
                        var currentTime = (new Date()).getTime();
                        if (currentTime - this['buttons'][event['button']]['lastClickTime'] <= doubleClickTime) {
                            if (this['handlers'] && this['handlers'][buttonName + 'DoubleClick']) {
                                this['handlers'][buttonName + 'DoubleClick']({
                                    x:  event['layerX'],
                                    y:  event['layerY']
                                });
                            };
                        } else {
                            if (this['handlers'] && this['handlers'][buttonName + 'Click']) {
                                this['handlers'][buttonName + 'Click']({
                                    x:  event['layerX'],
                                    y:  event['layerY']
                                });
                            };
                        };
                    } else {
                        if (this['handlers'] && this['handlers'][buttonName + 'Click']) {
                            this['handlers'][buttonName + 'Click']({
                                x:  event['layerX'],
                                y:  event['layerY']
                            });
                        };
                    };
                    this['buttons'][event['button']]['lastClickTime'] = (new Date()).getTime();
                };
                this['buttons'][event['button']]['pressed'] = false;
                break;
            case 'mousemove':
                this['currentLayerX'] = event['layerX'];
                this['currentLayerY'] = event['layerY'];
                var frame = this.getFrame();
                if (frame) {
                    if (this['handlers'] && this['handlers']['frameSizeChange']) {
                        this['handlers']['frameSizeChange'](frame);
                    };
                } else {
                    if (this['handlers'] && this['handlers']['frameDeleted']) {
                        this['handlers']['frameDeleted'](frame);
                    };
                };
                break;
        };
    };
    /**
     * Перехват событий
     */
    this.link = function() {
        var that = this;
        if (!this['handlerFunction']) {
            this['handlerFunction'] = function(event) {
                that.processing(event);
                event.preventDefault();
            };
        };
        var checkEvents = this['checkEvents'];
        for (var eventName in checkEvents) {
            this['eventsTarget'].removeEventListener(eventName, this['handlerFunction'], false);
            this['eventsTarget'].addEventListener(eventName, this['handlerFunction'], false);
        };
    };
    /**
     * Инициализация
     * @param options
     */
    this.init = function(options) {
        $.extend(true, this, _.clone(defaultSettings), options);
        if (this['eventsTarget']) {
            this.link();
            return true;
        } else {
            return false;
        };
    };
    /**
     * Инициализация
     */
    this.init(options);
};