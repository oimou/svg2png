(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['jquery'], function ($) {
            // Also create a global in case some scripts
            // that are loaded still are looking for
            // a global even when an AMD loader is in use.
            return (root.svg2png = factory($));
        });
    } else {
        // Browser globals
        root.svg2png = factory(root.$);
    }
}(this, function ($) {
    "use strict";

    /**
     *    Given svg it returns dataURL
     *    @param {SVGSVGElement} svg
     *    @param {Function} onFinish
     */
    var svg2png = function svg2png(svg, onFinish) {
        var $svg = $(svg);
        var taskQueue = [];

        /**
         *    Inlinify css properties with visual effects
         *    @param {Element} el
         */
        var inlinify = function (el) {
            var $el = $(el);

            // properties with visual effects
            var prop = [
              "-webkit-user-select",
              "-moz-user-select",
              "user-select",
              "cursor",
              "opacity",
              "vector-effect",
              "user-drag",
              "fill",
              "stroke",
              "stroke-width",
              "stroke-linecap",
              "stroke-linejoin",
              "stroke-opacity",
              "display",
              "background-color",
              "margin",
              "text-align",
              "vertical-align",
              "padding"
            ];

            prop.forEach(function (k) {
              $el.css(k, $el.css(k));
            });
        };

        /**
         *    Convert image url to dataURL
         *    @param {String} href
         *    @param {Function} callback
         */
        var href2dataURL = function (href, callback) {
            var img = new Image();

            img.onload = function () {
                var canvas = document.createElement("canvas");
                var ctx = canvas.getContext("2d");
                var dataURL;

                $(canvas).attr({
                    width: img.naturalWidth,
                    height: img.naturalHeight
                });
                ctx.drawImage(img, 0, 0);
                dataURL = canvas.toDataURL("image/png");

                callback && callback(null, dataURL);
            };

            img.onerror = function (err) {
                callback && callback(err);
            };

            img.src = href;
        };

        /**
         *    Given taskQueue it runs each task in order
         *    @param {Array} taskQueue
         *    @param {Function} callback
         */
        var runSeries = function (taskQueue, callback) {
            var task = taskQueue.shift();

            if (!task) return callback && callback();

            task(function done(err) {
                if (err) {
                    if (callback) {
                        return callback(err);
                    } else {
                        throw err;
                    }
                }

                runSeries(taskQueue, callback);
            });
        };

        /**
         *    Convert svg element to dataURL
         *    @param {SVGSVGElement} svg
         *    @param {Function} callback
         */
        var svg2dataURL = function (svg, callback) {
            // IE9~
            // http://caniuse.com/#feat=xml-serializer
            var serializer = new XMLSerializer();
            var svgStr = serializer.serializeToString(svg);
            var encodedSvgStr = unescape(encodeURIComponent(svgStr));
            // IE10~
            // http://caniuse.com/#feat=atob-btoa
            var svgData = btoa(encodedSvgStr);
            // IE9~
            // http://caniuse.com/#feat=canvas
            var canvas = document.createElement("canvas");
            var ctx = canvas.getContext("2d");
            var img = new Image();

            canvas.setAttribute("width", svg.width.baseVal.value);
            canvas.setAttribute("height", svg.height.baseVal.value);

            img.onload = function () {
                ctx.drawImage(img, 0, 0);

                var dataURL = canvas.toDataURL("image/png");

                callback && callback(null, dataURL);
            };

            img.onerror = function (err) {
                if (callback) {
                    callback(err);
                } else {
                    throw err;
                }
            };

            img.src = "data:image/svg+xml;base64," + svgData;
        };

        $svg
            .find("*")
            .each(function () {
                var el = this;
                var $el = $(el);

                // Inlinify some styles
                inlinify(el);

                // Inlinify media resources as DataURL
                if (!$el.attr("href")) return;

                var task = function (done) {
                    var actualHref = $("<a>").attr("href", el.href.baseVal).prop("href");

                    href2dataURL(actualHref, function (err, dataURL) {
                        $el.attr("href", dataURL);

                        done(err);
                    })
                };

                taskQueue.push(task);
            });

        runSeries(taskQueue, function (err) {
            if (err) {
                return onFinish(err);
            }

            svg2dataURL(svg, function (err, dataURL) {
                onFinish(err, dataURL)
            });
        });
    };

    return svg2png;
}));
