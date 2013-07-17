(function (global) {

  global.donut = global.donut || {};

  global.donut.Chart = function (p_canvas, p_dataManager, p_eventManager) {
    var _this = this;
    var $canvas = this.$canvas = p_canvas;
    
    this.dataMgr = p_dataManager;          
    this.context = $canvas[0].getContext("2d");
    this.center = new donut.Point($canvas.width() / 2, $canvas.height() / 2);
    this.radius = Math.min($canvas.width() / 2, $canvas.height()) * 0.95
    this.innerRadius = this.radius * 0.7;
    this.innerCircleColor = "white";

    this.eventMgr = p_eventManager;                   
    this.eventMgr.init(this.center, this.radius, this.innerRadius);    
    $(window).on("event.click", function(e, params) { 
      console && console.log(params);
      _this.selectQuadrant(params.angle);
    });
  }

  var _prototype = global.donut.Chart.prototype;

  _prototype.drawRing = function (p_angle_from, p_angle_to, p_color, p_radius, p_innerRadius, p_innerCircleColor) {
    
    var _context = this.context;

    _context.save();
    _context.beginPath();
    _context.moveTo(this.center.X, this.center.Y);
    _context.arc(this.center.X, this.center.Y, p_radius || this.radius, p_angle_from, p_angle_to, false);    
    _context.lineWidth = 1;
    _context.fillStyle = p_color;
    _context.strokeStyle = "white";
    _context.closePath();
    _context.fill(); 
    _context.stroke(); 
    _context.restore();                             
   
  }

  _prototype.drawInnerCircle = function (p_angle_from, p_angle_to, p_color, p_radius) {    
    var _context = this.context;

    p_angle_from = p_angle_from || 0;
    p_angle_to = p_angle_to || 2 * Math.PI;

    _context.beginPath();
    //_context.moveTo(this.center.X, this.center.Y);
    _context.fillStyle = p_color || this.innerCircleColor; 
    _context.strokeStyle = "white";
    _context.lineWidth = 1;   
    _context.arc(this.center.X, this.center.Y, p_radius || this.innerRadius, p_angle_from , p_angle_to, false);
    _context.closePath();
    _context.fill();
    _context.stroke();
  };

  _prototype.drawText = function(p_text, p_fillColor) {            
    this.context.save();
    this.context.fillStyle = p_fillColor || "black";
    this.context.font = '18pt Calibri Helvetica, Arial';
    var _text_dimensions = this.context.measureText(p_text);        
    this.context.fillText(p_text, this.center.X - _text_dimensions.width / 2, this.center.Y);
    this.context.restore();   
  } 

  _prototype.render = function () {
    var _current = this.dataMgr.current;
    console && console.log(_current);    
    if (_current.items) {
      for (var i = 0; i < _current.items.length; ++i) {               
          this.drawRing(_current.items[i].startAngle, _current.items[i].endAngle, _current.items[i].primaryColor);
      }
    }

    this.drawInnerCircle(0, 2 * Math.PI, _current.primaryColor || "white");
    this.drawText(_current.name, _current.parent ? "white" : "black");        
  };

  _prototype.selectQuadrant = function (p_angle) {
    //if (p_angle && p_angle === -1) {
    if (p_angle === -1) {
      this.dataMgr.drillOut();
      this.render();
    } else {
      var _index = getQuandrantIndexFromAngle(this.dataMgr, p_angle);
      if (_index !== null) {
        var _current = this.dataMgr.current;
        this.dataMgr.drillIn(_current, _index);
        this.render();
      }
    }
  }

  _prototype.clear = function () {
    this.context.clearRect(0, 0, this.$canvas.width(), this.$canvas.height());
  }

  function getQuandrantIndexFromAngle(p_dataMgr, p_angle) {
    if (p_angle === null) {
      return null;
    }

    var _current = p_dataMgr.current;
    if (_current.items && _current.items.length > 0) {
      for (var i = 0; i < _current.items.length; ++i) {
        if (p_angle <= _current.items[i].endAngle) {
          return i;
        }
      }
    }

    return null;
  }


})(window);