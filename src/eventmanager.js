(function (global) {    
        
  global.donut = global.donut || {};

  global.donut.EventManager = function (p_canvas) {          
    var _center, _radius, _innerRadius;
    var _this = this;
    var $canvas = p_canvas;    
    var _canvasOffset = $canvas.offset();    
    var _mousePtr = new donut.Point(0, 0);
    var _intervalId = null;
    var _isHighlighted = false;
    var _lastMousePtr = new donut.Point(0,0);

    _this.init = function (p_center, p_radius, p_innerRadius) {
       _center = new donut.Point(p_center.X , p_center.Y);
       _radius = p_radius;
       _innerRadius = p_innerRadius;       
       $canvas.click(clickEventHandlder);
       $canvas.mousemove(mouseMoveHandler);
       $canvas.hover(mouseEnteredHanlder, mouseLeftHandler);
    };

    function clickEventHandlder(ev) {
      var angle = getAngleRelativeToCenter(true);
      if (angle !== null) {
        console && console.log("click: " + angle);
        $(global).trigger("event.click", [{angle: angle}]);
      }
    }

    function mouseEnteredHanlder(ev) {
        //console.log("mouse entered");
        if(!_intervalId) {
          _intervalId = window.setInterval(checkLoop, 200);
          _mousePtr.X = ev.clientX;
          _mousePtr.Y = ev.clientY;
        }
      };

      function mouseLeftHandler(ev) {
        //console.log("mouse left");
        if(_intervalId) {
          window.clearInterval(_intervalId);
          _intervalId = null;
        }
      };

    function mouseMoveHandler(ev) {     
      _mousePtr.X = ev.offsetX;
      _mousePtr.Y = ev.offsetY;             
    };

    function getAngleRelativeToCenter(detectInnerCircle) {
      var _distance = Math.sqrt(Math.pow(_mousePtr.Y - _center.Y, 2) + Math.pow(_mousePtr.X - _center.X, 2));
      var _angle = Math.atan2(_mousePtr.Y - _center.Y, _mousePtr.X - _center.X);

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

    function checkLoop () {
      if ((_lastMousePtr.X != _mousePtr.X || _lastMousePtr.Y != _mousePtr.Y)) {
        var angle = getAngleRelativeToCenter(false);
        if (angle === null) {
          if  (_isHighlighted) {
            $(window).trigger("event.hover", [{angle: null}]);
          }
          _isHighlighted = false;         
        } else {
          _isHighlighted = true;
          $(window).trigger("event.hover", [{angle: angle}]);
        }

        _lastMousePtr.X = _mousePtr.X;
        _lastMousePtr.Y = _mousePtr.Y;
      }       
    }
  };
})(window);