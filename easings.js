(function (global) {
    /* ============================================================
     * jQuery Easing v1.3 - http://gsgd.co.uk/sandbox/jquery/easing/
     *
     * Open source under the BSD License.
     *
     * Copyright © 2008 George McGinley Smith
     * All rights reserved.
     * https://raw.github.com/danro/jquery-easing/master/LICENSE
     * ======================================================== */

     //https://github.com/danro/jquery-easing/blob/master/jquery.easing.js
    global.donut = global.donut || {};
    global.donut.EasingHelper =  {
      // t: current time, b: begInnIng value, c: change In value, d: duration
      easeInCubic: function (t, b, c, d) {
        return c*(t/=d)*t*t + b;
      },
      easeInSine: function (t, b, c, d) {
        return -c * Math.cos(t/d * (Math.PI/2)) + c + b;
      }
    };
  })(window); 