(function (global) {

  global.donut = global.donut || {};

  global.donut.Chart = function (p_canvas, p_dataManager, p_eventManager) {
    var _this = this;
    var $canvas = this.$canvas = p_canvas;
    
    this.dataMgr = p_dataManager;          
    this.context = $canvas[0].getContext("2d");
    this.center = new donut.Point($canvas.width() / 2, $canvas.height() / 2);
    this.radius = Math.min($canvas.width() / 2, $canvas.height()) * 0.95
    this.innerRadius = this.radius * 0.65;
    this.innerCircleColor = "white";

    this.eventMgr = p_eventManager;                   
    this.eventMgr.init(this.center, this.radius, this.innerRadius);    
    $(window).on("event.click", function(e, params) { 
      console && console.log(params);
      _this.selectRing(params.angle);
    });
  }

  var _prototype = global.donut.Chart.prototype;

  _prototype.drawRing = function (p_angle_from, p_angle_to, p_color, p_radius, p_counterClockwise) {
    
    var _context = this.context;

    _context.save();
    _context.beginPath();
    _context.moveTo(this.center.X, this.center.Y);
    _context.arc(this.center.X, this.center.Y, p_radius || this.radius, p_angle_from, p_angle_to, p_counterClockwise || false);    
    _context.lineWidth = 1;
    _context.fillStyle = p_color;
    _context.strokeStyle = "white";
    _context.closePath();
    _context.fill(); 
    _context.stroke(); 
    _context.restore();
    
    _context.beginPath();
    _context.moveTo(this.center.X, this.center.Y);
    _context.fillStyle = this.innerCircleColor; 
    _context.strokeStyle = this.innerCircleColor;
    _context.lineWidth = 1;   
    _context.arc(this.center.X, this.center.Y, p_radius || this.innerRadius, p_angle_from , p_angle_to, p_counterClockwise || false);
    _context.closePath();
    _context.fill();
    _context.stroke();
    
  }

  _prototype.animateRingHandler = function (p_batchId, p_angle_from, p_angle_to, p_color, p_radius, p_counterClockwise) {
    var _this = this;
    
    return function (p_task) {
      donut.AnimHelper.animate(          
        p_angle_from, 
        p_angle_to,
        function (from, to) 
        { 
          _this.drawRing(from, to, p_color, p_radius, p_counterClockwise);
        }, 
        function() 
        { 
           if (p_batchId) {
            p_task.notifyBatchItemComplete(p_batchId); 
           } else {
            p_task.notifyJobComplete(); 
           }
        });
    };
  };    

  _prototype.drawInnerCircle = function (p_angle_from, p_angle_to, p_color, p_radius, p_counterClockwise) {    
    var _context = this.context;

    p_angle_from = p_angle_from || 0;
    p_angle_to = p_angle_to || 2 * Math.PI;

    _context.beginPath();
    _context.fillStyle = p_color || this.innerCircleColor; 
    _context.strokeStyle = "white";
    _context.lineWidth = 1;   
    _context.arc(this.center.X, this.center.Y, p_radius || this.innerRadius, p_angle_from , p_angle_to, p_counterClockwise || false);
    _context.closePath();
    _context.fill();
    _context.stroke();
  };

  _prototype.animateInnerCircleHandler = function (p_batchId, p_angle_from, p_angle_to, p_color, p_radius, p_counterClockwise) {
    var _this = this;
    
    return function (p_task) {
      donut.AnimHelper.animate(          
        p_angle_from, 
        p_angle_to,
        function (from, to) 
        { 
          _this.drawInnerCircle(from, to, p_color, p_radius, p_counterClockwise);
        }, 
        function() 
        { 
           if (p_batchId) {
            p_task.notifyBatchItemComplete(p_batchId); 
           } else {
            p_task.notifyJobComplete(); 
           }
        });
    };
  };

  _prototype.drawText = function(p_text, p_fillColor) {            
    this.context.save();
    this.context.fillStyle = p_fillColor || "black";
    this.context.font = '18pt Calibri Helvetica, Arial';
    var _text_dimensions = this.context.measureText(p_text);        
    this.context.fillText(p_text, this.center.X - _text_dimensions.width / 2, this.center.Y - 2);
    this.context.restore();   
  } 

  _prototype.render = function () {    
    var _this = this, 
        current = this.dataMgr.current,        
        batchId = 100;

    if (!current.items) {
      return;
    }    

    var task = new donut.Task();
    task.addBatchJob(batchId, current.items.map(function (item, index) {
        return _this.animateRingHandler(batchId, item.startAngle, item.endAngle, item.primaryColor)
    }));
    task.addJob(this.animateInnerCircleHandler(null, 0, 2 * Math.PI, current.primaryColor || "white"));
    task.addJob(function() {
      _this.drawText(current.name, current.parent ? "white" : "black"); 
    })
    task.process();
  };


  _prototype.selectRing = function (p_angle) {
    //if (p_angle && p_angle === -1) {
    if (p_angle === -1) {
      this.dataMgr.drillOut();
      this.render();
    } else {
      var _index = mapAngleToRingIndex(this.dataMgr, p_angle);
      if (_index !== null) {
        this.dataMgr.drillIn(_index);
        this.render();
      }
    }
  }

  _prototype.clear = function () {
    this.context.clearRect(0, 0, this.$canvas.width(), this.$canvas.height());
  }

  function mapAngleToRingIndex(p_dataMgr, p_angle) {
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