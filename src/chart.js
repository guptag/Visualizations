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
    $(window).on("event.hover", function(e, params) 
    { 
      _this.highlightRing(params.angle);
    });
  }

  var _prototype = global.donut.Chart.prototype;

  _prototype.drawRing = function (p_angle_from, p_angle_to, p_ring_color, p_center_color, p_radius, p_counterClockwise) {
    
    var _context = this.context;

    _context.save();
    _context.beginPath();
    _context.moveTo(this.center.X, this.center.Y);
    _context.arc(this.center.X, this.center.Y, p_radius || this.radius, p_angle_from, p_angle_to, p_counterClockwise || false);    
    _context.lineWidth = 1;
    _context.fillStyle = p_ring_color;
    _context.strokeStyle = "white";
    _context.closePath();
    _context.fill(); 
    _context.stroke(); 
    _context.restore();
    
    _context.beginPath();
    _context.moveTo(this.center.X, this.center.Y);
    _context.fillStyle = p_center_color || this.innerCircleColor;     
    _context.lineWidth = 1;   
    if (p_counterClockwise) {
      _context.arc(this.center.X, this.center.Y, this.innerRadius, p_angle_from + 0.3, p_angle_to - 0.3, true);
    } else {
      _context.arc(this.center.X, this.center.Y, this.innerRadius, p_angle_from - 0.3, p_angle_to + 0.3, false);
    }
    _context.closePath();
    _context.fill();    
  }

  _prototype.animateRingHandler = function (p_batchId, p_delayNotifyMsec, p_angle_from, p_angle_to, p_color, p_center_color, p_radius, p_counterClockwise, p_steps) {
    var _this = this;
    
    return function (p_task) {
      donut.AnimHelper.animate(          
        p_angle_from, 
        p_angle_to,
        function (from, temp_to) 
        { 
          _this.drawRing(from, temp_to, p_color, p_center_color, p_radius, p_counterClockwise);
        }, 
        function() 
        { 
           if (p_batchId) {
            setTimeout(function () { p_task.notifyBatchItemComplete(p_batchId); }, p_delayNotifyMsec || 0); 
           } else {
            setTimeout(function () { p_task.notifyJobComplete(); }, p_delayNotifyMsec || 0); 
           }
        },
        p_steps);
    };
  };

  _prototype.animateRingIn2DHandler = function (p_batchId, p_delayNotifyMsec, p_angle_from, p_angle_to, p_color, p_center_color, p_radius_from, p_radius_to, p_counterClockwise) {
    var _this = this;
    
    return function (p_task) {
      donut.AnimHelper.animateTwoParams(          
        p_angle_from, 
        p_angle_to,
        p_radius_from,
        p_radius_to,
        function (a_from, a_temp_to, r_from, r_temp_to) 
        { 
          if (p_angle_from < p_angle_to) {            
            _this.drawRing(a_from, a_temp_to, p_color, p_center_color, r_temp_to, p_counterClockwise);
          } else {
            // opposite to sprouting the ring (collapse)
            _this.drawRing(p_angle_to, p_angle_from, "white", p_center_color, this.radius, p_counterClockwise);
            _this.drawRing(p_angle_to, a_temp_to, p_color, p_center_color, r_temp_to, p_counterClockwise);
          }
        }, 
        function() 
        { 
           if (p_batchId) {
            setTimeout(function () { p_task.notifyBatchItemComplete(p_batchId); }, p_delayNotifyMsec || 0); 
           } else {
            setTimeout(function () { p_task.notifyJobComplete(); }, p_delayNotifyMsec || 0); 
           }
        });
    };
  };  

  _prototype.drawCircle = function (p_angle_from, p_angle_to, p_color, p_radius, p_counterClockwise) {    
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

  _prototype.animateCircleHandler = function (p_batchId, p_delayNotifyMsec, p_angle_from, p_angle_to, p_color, p_radius, p_counterClockwise) {
    var _this = this;    
    return function (p_task) {
      donut.AnimHelper.animate(          
        p_angle_from, 
        p_angle_to,
        function (from, temp_to) 
        { 
          _this.drawCircle(from, temp_to, p_color, p_radius, p_counterClockwise);
        }, 
        function() 
        { 
           if (p_batchId) {
            setTimeout(function () { p_task.notifyBatchItemComplete(p_batchId); }, p_delayNotifyMsec || 0); 
           } else {
            setTimeout(function () { p_task.notifyJobComplete(); }, p_delayNotifyMsec || 0); 
           }
        });
    };
  };

  _prototype.animateCircleWithRadiusHandler = function (p_batchId, p_delayNotifyMsec, p_angle_from, p_angle_to, p_color, p_radius_from, p_radius_to, p_counterClockwise) {
    var _this = this;    
    return function (p_task) {
      donut.AnimHelper.animate(          
        p_radius_from, 
        p_radius_to,
        function (from, temp_to) 
        { 
          _this.clear();
          _this.drawCircle(p_angle_from, p_angle_to, p_color, temp_to, p_counterClockwise);
        }, 
        function() 
        { 
           if (p_batchId) {
            setTimeout(function () { p_task.notifyBatchItemComplete(p_batchId); }, p_delayNotifyMsec || 0); 
           } else {
            setTimeout(function () { p_task.notifyJobComplete(); }, p_delayNotifyMsec || 0); 
           }
        });
    };
  };

  _prototype.drawText = function(p_text, p_fillColor) {                
    var _context = this.context;


    p_text = p_text.length > 20 ? p_text.substring(0, 14) + "..." : p_text;
    
    _context.save();
    _context.fillStyle = p_fillColor || "black";
    _context.font = '18pt Calibri Helvetica, Arial';
    _context.fillText(p_text, this.center.X - _context.measureText(p_text).width / 2, this.center.Y - 2);
    _context.restore();   
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
        return _this.animateRingHandler(batchId, null, item.startAngle, item.endAngle, item.primaryColor, null);
    }));
    task.addJob(this.animateCircleHandler(null, null, 0, 2 * Math.PI, current.primaryColor || "white"));
    task.addJob(function(p_task) {
      _this.drawText(current.name, current.parent ? "white" : "black"); 
      p_task.notifyJobComplete();
    });
    task.process();
  };


  _prototype.selectRing = function (p_angle) {
    if (p_angle === -1) {
      if(this.dataMgr.canDrillOut()) {
        runDrillOutAnimations(this);
      }
    } else {
      var _index = mapAngleToRingIndex(this.dataMgr, p_angle);
      if (_index !== null && this.dataMgr.canDrillIn(_index)) {                
        runDrillInAnimations(this, _index);        
      }
    }
  }

  _prototype.highlightRing = function(p_angle) {
    
   /* this.drawCircle (0, 2 * Math.PI, this.dataMgr.current.primaryColor);
    if (!p_angle) {      
      this.drawText(this.dataMgr.current.name, this.dataMgr.current.parent ? "white" : "black");
    } else {
     var _index = mapAngleToRingIndex(this.dataMgr, p_angle);      
     this.drawText(this.dataMgr.current.items[_index].name, this.dataMgr.current.parent ? "white" : "black");
    } */   
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

  function runDrillInAnimations(p_this, p_index) {    
    var _this = p_this;    
    var task = new donut.Task(), batchId_1 = 100, batchId_2 = 200, batchId_3 = 300;

    var _parentDataItem = _this.dataMgr.current;
    var _selectedDataItem =_this.dataMgr.drillIn(p_index);    

    task.addJob(function (p_task) {      
      _this.drawCircle (0, 2 * Math.PI, "white");
      for (var i = 0; i < _parentDataItem.items.length; ++i) {
        var item = _parentDataItem.items[i];
        if (item.name !== _selectedDataItem.name) {
          _this.drawRing(item.startAngle, item.endAngle, "white", "white", _this.radius);
        }
      }
      setTimeout(function() { p_task.notifyJobComplete(); }, 100);
    });   
    task.addBatchJob(batchId_2, _parentDataItem.items.map(function (item, index) {
        if (item.name === _selectedDataItem.name) {
          return _this.animateRingHandler(batchId_2, 15, item.endAngle, 2 * Math.PI + item.startAngle, _selectedDataItem.primaryColor, "white", _this.radius);
        }
        return null;
    }));
    task.addJob(_this.animateCircleWithRadiusHandler(null, null, 0, 2 * Math.PI, _selectedDataItem.primaryColor, _this.radius, _this.radius / 10, false));
    task.addJob(function (p_task) {
      _this.clear();
      p_task.notifyJobComplete();
    });
    task.addJob(_this.animateCircleWithRadiusHandler(null, 70, 0, 2 * Math.PI, _selectedDataItem.primaryColor, 0, _this.innerRadius, false));    
    task.addBatchJob(batchId_3, _selectedDataItem.items.map(function (item, index) {
        return _this.animateRingIn2DHandler(batchId_3, null, item.startAngle, item.endAngle, item.primaryColor, _selectedDataItem.primaryColor, _this.innerRadius, _this.radius);
    }));
    task.addJob(function (p_task) {
      _this.drawCircle (0, 2 * Math.PI, _selectedDataItem.primaryColor);
      _this.drawText(_selectedDataItem.name, _selectedDataItem.parent ? "white" : "black");
      p_task.notifyJobComplete();
    }); 
    task.process();    
  }

  function runDrillOutAnimations(p_this) {    
    var _this = p_this;    
    var task = new donut.Task(), batchId_1 = 300, batchId_2 = 400, batchId_3 = 500;

    var _prevDataItem = _this.dataMgr.current;
    var _currentDataItem =_this.dataMgr.drillOut();    

    
    task.addBatchJob(batchId_1, _prevDataItem.items.map(function (item, index) {
        return _this.animateRingIn2DHandler(batchId_1, null, item.endAngle, item.startAngle, item.primaryColor, _prevDataItem.primaryColor, _this.radius, _this.innerRadius);
    }));
    task.addJob(_this.animateCircleWithRadiusHandler(null, null, 0, 2 * Math.PI, _prevDataItem.primaryColor, _this.innerRadius, _this.radius, false));
    task.addJob(function (p_task) {
      _this.clear();
      _this.drawRing(0, 2 * Math.PI, _prevDataItem.primaryColor, "white", _this.radius);
      setTimeout(function() { p_task.notifyJobComplete(); }, 100);
    });    

    $.each(_currentDataItem.items, function(index, item) {
      if (item.name === _prevDataItem.name) {
        // erase all rings except the zoomout node (in anticlockwise direction)
        task.addJob(_this.animateRingHandler(null, 30, Math.PI * 2 + item.startAngle, item.endAngle, "white", "white", _this.radius, true, 20));
      }
    });    

    $.each(reorderItemsToRenderSequentially(_currentDataItem.items, _prevDataItem.name), function(index, item) {
      task.addJob(_this.animateRingHandler(null, 0, item.endAngle, item.startAngle, item.primaryColor, "white", _this.radius, true, 5));      
    });
    
    task.addJob(function (p_task) {
      _this.drawCircle (0, 2 * Math.PI, _currentDataItem.primaryColor);
      _this.drawText(_currentDataItem.name, _currentDataItem.parent ? "white" : "black");
      p_task.notifyJobComplete();
    }); 
    task.process(); 
  }

  //shuffle the items so the rings are rendered in sequence from the selected ring
  // [a, b, c, d, e] -> zooiming out on 'c' -> draw [b, a, e, d] in anticlockwise
  function reorderItemsToRenderSequentially(items, prevItemName) {    
    var shuffledArray = [], selIndex = -1;
    $.each(items, function (index, item) {
      if (item.name === prevItemName) { 
        selIndex = index;
      } else {
        if (selIndex == -1) {
            //add new item to the front
            shuffledArray.unshift(item); 
        } else {
            // add new items at the index of the selected element 
            shuffledArray.splice(selIndex, 0, item);
        } 
      }
    });

    return shuffledArray;
  }

})(window);