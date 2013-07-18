(function (global) {
  
  global.donut = global.donut || {};  

  /*
      Sample usage: 

        //Trigger two animation loops in parallel    
        donut.AnimHelper.animate(
          0, 
          10, 
          function(f, t) { 
            console.log(f + ":" + t); 
          }, 
          function() {
            console.log("anim one completed"); 
          });

        donut.AnimHelper.animate(
          100, 
          200, 
          function(f, t) { 
            console.log(f + ":" + t); 
          }, 
          function () { 
            console.log("anim two completed"); 
          });

       // animate two variables at a time       
        donut.AnimHelper.animateTwoParams(
          0, 
          10,
          200,
          100,
          function(f, t, f1, t1) { 
            console.log(f + ":" + t + " :::: " + f1 + ":" + t1); 
          }, 
          function() {
            console.log("anim one completed"); 
          });   
  */

  global.donut.AnimHelper = new function() {
    var _this = this;

    var requestAnimationFrame = global.requestAnimationFrame ||
          global.webkitRequestAnimationFrame ||
          global.mozRequestAnimationFrame    ||
          global.msRequestAnimationFrame    ||
          function( callback ){
            return global.setTimeout(callback, 1000 / 60);
          };

    var cancelAnimationFrame = global.cancelAnimationFrame ||
          global.cancelRequestAnimationFrame ||
          global.webkitcancelAnimationFrame ||
          global.webkitcancelRequestAnimationFrame ||
          global.mozcancelAnimationFrame    ||
          global.mozcancelRequestAnimationFrame ||
          global.mscancelAnimationFrame    ||
          global.mscancelRequestAnimationFrame ||
          function( id ){
            global.clearTimeout(id);
          };          


    _this.animate = function (p_from, p_to, p_execFn, p_finishCb, p_totalSteps, p_easingFn) {
      var animLoop = animationFrameCallback(p_from, p_to, p_execFn, p_finishCb, p_totalSteps, p_easingFn);
      requestAnimationFrame($.proxy(animLoop, _this));
    };

    _this.animateTwoParams = function (p_from, p_to, p_from_1, p_to_1, p_execFn, p_finishCb, p_totalSteps, p_easingFn) {
      var animLoop = animationFrameTwoParamsCallback(p_from, p_to, p_from_1, p_to_1, p_execFn, p_finishCb, p_totalSteps, p_easingFn);
      requestAnimationFrame($.proxy(animLoop, _this));
    };

    function animationFrameCallback(p_from, p_to, p_execFn, p_finishCb, p_totalSteps, p_easingFn) {
      var step = 0;         
      var totalSteps = p_totalSteps !== undefined ? p_totalSteps : 15; 
      var easingFn = p_easingFn || global.donut.EasingHelper.easeInSine;       

      return function animLoop() {
        console && console.log("in anim frame");
        step += 1;
        
        var temp_to = easingFn(step, p_from, p_to - p_from, totalSteps);
        
        if ((p_from <= p_to && temp_to >= p_to) ||
            (p_from > p_to && temp_to < p_to)) {
          temp_to = p_to;
        }

        p_execFn.call(global, p_from, temp_to);

        if (temp_to === p_to || step > totalSteps) {          
          p_finishCb.call(global);
        } else {
          requestAnimationFrame($.proxy(animLoop, _this));
        }
      };
    }

    function animationFrameTwoParamsCallback(p_from, p_to, p_from_1, p_to_1, p_execFn, p_finishCb, p_totalSteps, p_easingFn) {
      var step = 0;         
      var totalSteps = p_totalSteps !== undefined ? p_totalSteps : 15; 
      var easingFn = p_easingFn || global.donut.EasingHelper.easeInSine;       

      return function animLoop() {
        console && console.log("in anim frame");
        step += 1;

        var temp_to = easingFn(step, p_from, p_to - p_from, totalSteps);
        var temp_to_1 = easingFn(step, p_from_1, p_to_1 - p_from_1, totalSteps);
        
        if ((p_from <= p_to && temp_to >= p_to) ||
            (p_from > p_to && temp_to < p_to) || 
            (p_from_1 <= p_to_1 && temp_to_1 >= p_to_1) ||
            (p_from_1 > p_to_1 && temp_to_1 < p_to_1)) {
          temp_to = p_to;
          temp_to_1 = p_to_1;
        }

        p_execFn.call(global, p_from, temp_to, p_from_1, temp_to_1);

        if (temp_to === p_to || temp_to_1 === p_to_1 || step > totalSteps) {          
          p_finishCb.call(global);
        } else {
          requestAnimationFrame($.proxy(animLoop, _this));
        }
      };
    }
  };    
})(window);