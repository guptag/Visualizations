(function (global) {

  global.donut = global.donut || {};

  global.donut.chart = function (p_canvas, p_dataManager, p_eventManager) {
    var _this = this;
    var $canvas = this.$canvas = p_canvas;
    this.dataMgr = p_dataManager;          
    this.context = $canvas[0].getContext("2d");
    this.center = new donut.Point($canvas.width() / 2, $canvas.height() / 2);
    this.radius = Math.min($canvas.width() / 2, $canvas.height()) * 0.8
    this.innerRadius = this.radius * 0.815;
    this.innerCircleColor = "white";
  }

  var _prototype = global.donut.chart.prototype;

  _prototype.drawRing = function (p_angle_from, p_angle_to, p_color, p_radius, p_innerRadius, p_innerCircleColor) {
    
    var _context = this.context;

    _context.save();
    _context.beginPath();
    _context.arc(this.center.X, this.center.Y, p_radius || this.radius, p_angle_from, p_angle_to, false);    
    _context.lineWidth = 60;
    _context.strokeStyle = p_color;
    _context.stroke();  
    _context.restore();                             
  
    _context.beginPath();
    _context.moveTo(this.center.X, this.center.Y);            
    _context.arc(this.center.X, this.center.Y, p_innerRadius ? p_innerRadius : this.innerRadius, p_angle_from, p_angle_to, false);                
    _context.closePath();
    _contextfillStyle = p_innerCircleColor || this.innerCircleColor;
    _context.fill();
  }

  _prototype.drawInnerCircle = function (p_angle_from, p_angle_to, p_color, p_radius) {    
    var _context = this.context;

    p_angle_from = p_angle_from || 0;
    p_angle_to = p_angle_to || 2 * Math.PI;

    _context.beginPath();
    _context.moveTo(this.center.X, this.center.Y);
    _context.fillStyle = p_color || this.innerCircleColor;    
    _context.arc(this.center.X, this.center.Y, p_radius || this.innerRadius, p_angle_from , p_angle_to, false);
    _context.closePath();
    _context.fill();
  };

  _prototype.render = function () {
    var _current = this.dataMgr.current;    
    for (var i = 0; i < _current.items.length; ++i) {               
        this.drawRing(_current.items[i].startAngle, _current.items[i].endAngle, _current.items[i].primaryColor);
    }        
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
        this.dataMgr.drillDown(_current, _index);
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