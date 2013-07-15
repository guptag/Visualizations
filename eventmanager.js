(function (global) {    
        
  global.donut = global.donut || {};

  global.donut.EventManager = function (p_canvas, p_center, p_radius, p_innerRadius) {          
    var _this = this;
    var $canvas = p_canvas;
    var _center = p_center;
    var _radius = p_radius;
    var _canvasOffset = $canvas.position();
    var _innerRadius = p_innerRadius;
    var _mousePtr = new Point(0, 0);

    _this.init = function () {
       $canvas.click(clickEventHandlder);
       $canvas.mousemove(mouseMoveHandler);
    };

    function clickEventHandlder(ev) {
      var angle = getHoveredRingAngle(true);
      if (angle !== null) {
        console && console.log("click: " + angle);
        $(global).trigger("event.click", [{angle: angle}]);
      }
    }

    function mouseMoveHandler(ev) {
      //console.log("mouse move");
      if(_intervalId) {
        _mousePtr.X = ev.clientX - _canvasOffset.left;
        _mousePtr.Y = ev.clientY - _canvasOffset.top;
      }
    };

    function getHoveredQuadrantAngle (detectInnerCircle) {
      var _distance = Math.sqrt((_mousePtr.Y - _center.Y) * (_mousePtr.Y - _center.Y) + (_mousePtr.X - _center.X) * (_mousePtr.X - _center.X));
      var _angle = Math.atan2(_mousePtr.Y - _center.Y, _mousePtr.X - _center.X);

      if (_angle < 0) {
        // 0 - 360
        _angle = Math.PI + (_angle + Math.PI);
      }

      if (detectInnerCircle && _distance < _innerRadius) {
         return -1; //inner circle
      } else  if (_distance >= _innerRadius && _distance < _radius) {
        return _angle;
      }

      return null;
    }
  };
})(window);