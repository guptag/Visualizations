(function (global) {    
        
  global.donut = global.donut || {};

  global.donut.EventManager = function (p_canvas) {          
    var _center, _radius, _innerRadius;
    var _this = this;
    var $canvas = p_canvas;    
    var _canvasOffset = $canvas.offset();    
    var _mousePtr = new donut.Point(0, 0);

    _this.init = function (p_center, p_radius, p_innerRadius) {
       _center = new donut.Point(p_center.X , p_center.Y);
       _radius = p_radius;
       _innerRadius = p_innerRadius;
       $canvas.click(clickEventHandlder);
       $canvas.mousemove(mouseMoveHandler);
    };

    function clickEventHandlder(ev) {
      var angle = getAngleRelativeToCenter(true);
      if (angle !== null) {
        //console && console.log("click: " + angle);
        $(global).trigger("event.click", [{angle: angle}]);
      }
    }

    function mouseMoveHandler(ev) {
     // console && console.log("mouse move[{0}, {1}]".format(ev.clientX, ev.clientY));
      _mousePtr.X = ev.offsetX;
      _mousePtr.Y = ev.offsetY;
     // console && console.log("Adj move[{0}, {1}]".format(_mousePtr.X, _mousePtr.Y));
     // console && console.log("Center[{0}, {1}]".format(_center.X, _center.Y));            
    };

    function getAngleRelativeToCenter(detectInnerCircle) {
      var _distance = Math.sqrt(Math.pow(_mousePtr.Y - _center.Y, 2) + Math.pow(_mousePtr.X - _center.X, 2));
      var _angle = Math.atan2(_mousePtr.Y - _center.Y, _mousePtr.X - _center.X);

      console && console.log("distance: {0}, angle: {1}".format(_distance, _angle));

      if (_angle < 0) {
        // normalize angle from -180 -> 180 to 0 -> 360
        _angle = Math.PI + (_angle + Math.PI);
      }

      if (detectInnerCircle && _distance < _innerRadius) {
         return -1; //inner circle
      } else  if (_distance >= _innerRadius && _distance <= _radius) {
        return _angle;
      }

      return null;
    }
  };
})(window);