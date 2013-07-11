<html>
<head>
 <script src="http://ajax.googleapis.com/ajax/libs/jquery/1.10.0/jquery.min.js"></script>
 <script type="text/javascript">
  //http://stackoverflow.com/questions/1038746/equivalent-of-string-format-in-jquery
  String.prototype.format = String.prototype.f = function() {
      var s = this,
          i = arguments.length;

      while (i--) {
          s = s.replace(new RegExp('\\{' + i + '\\}', 'gm'), arguments[i]);
      }

      return s;
  };

  (function () {
      window.Point = function (x, y) {
          this.X = x;
          this.Y = y;
      }
  })();

  (function () {
      /*window.DonutData = [{
          name: "Health Care",
          value: 15,
          primaryColor: "hsl(145, 63%, 49%)",
          secondaryColor: "hsla(145, 63%, 49%, 0.5)"

      }, {
          name: "Technology",
          value: 50,
          primaryColor: "hsl(37, 90%, 51%)",
          secondaryColor: "hsla(37, 90%, 51%, 0.5)"
      }, {
          name: "Materials",
          value: 35,
          primaryColor: "hsl(6, 78%, 57%)",
          secondaryColor: "hsla(6, 78%, 57%, 0.5)"
      }]; */

      window.DonutData1 = {
        name: "Your asset allocation",
        items: [{
                name: "Health Care",
                value: 15,
                primaryColor: "hsl(145, 63%, 49%)",
                secondaryColor: "hsla(145, 63%, 49%, 0.5)",
                items: [{
                  name: "Primary Care",
                  value: 4,
                  primaryColor: "#5DE100",
                  secondaryColor: "#A0FF5C",
                },
                {
                  name: "Cancer Research",
                  value: 8,
                  primaryColor: "#00B060",
                  secondaryColor: "#5CFFB6",
                },
                {
                  name: "Obesity Research",
                  value: 3,
                  primaryColor: "#3D9200",
                  secondaryColor: "#68f800",
                }]

            }, {
                name: "Technology",
                value: 50,
                primaryColor: "#F39c12",
                secondaryColor: "#F7BE63",
                items: [{
                  name: "Software",
                  value: 35,
                  primaryColor: "#F36312",
                  secondaryColor: "#F9A87A",
                  items: [{
                       name: "Crm",
                       value: 12,
                       primaryColor: "#F3AE12",
                       secondaryColor: "#f8cf73"
                    },
                    {
                       name: "Office Software",
                       value: 6,
                       primaryColor: "#B65F38",
                       secondaryColor: "#d7997d"
                    },
                    {
                       name: "Sharepoint",
                       value: 4,
                       primaryColor: "#9E3506",
                       secondaryColor: "#f99366"
                    },
                    {
                       name: "Communications",
                       value: 7,
                       primaryColor: "#F9824C",
                       secondaryColor: "#fba47d"
                    },
                    {
                       name: "Security Products",
                       value: 6,
                       primaryColor: "#f64339",
                       secondaryColor: "#fbafab"
                    }]                  
                 },
                 {
                  name: "Hardware",
                  value: 15,
                  primaryColor: "#F3C212",
                  secondaryColor: "#F9DD7A"
                  
                 }]
            }, {
                name: "Materials",
                value: 35,
                primaryColor: "#E74D3C",
                secondaryColor: "hsla(6, 78%, 57%, 0.5)",
                items: [{
                  name: "Coal",
                  value: 15,
                  primaryColor: "#DE3A4D",
                  secondaryColor: "#E77381"
                 },
                 {
                  name: "Metals",
                  value: 20,
                  primaryColor: "#E7603C",
                  secondaryColor: "#ED896E"
                 }]
            }]};

  })();


  (function() {
    window.DonutDataManager1 = function (p_data) {
      this.data = p_data;
      this.current = this.data;
      setupReferences(this.data, null);
    }

    var _prototype = window.DonutDataManager1.prototype

    _prototype.getCurrent = function () {
      return this.current;
    }

    _prototype.drillDown = function(p_item, p_index) {
      if (p_item && p_item.items && p_item.items.length > p_index) {
         this.current = p_item.items[p_index];
         return true; 
      }
      return false;     
    }

    _prototype.moveUp = function() {
      this.current = this.current.parent || this.data;
    }

    function setupReferences(p_data, p_parent) {
       
       if (p_data && p_data.items) {

         p_data.parent = p_parent;

         var total = 0
         $.each(p_data.items, function(index, item) {
          total += item.value;  
         });
          
       var _startAngle = 0;
           var _endAngle = 0;
         $.each(p_data.items, function(index, item) {
           item.valuePercentage = item.value * 100 / total;
           item.startAngle = _startAngle = _endAngle;
             item.endAngle = _endAngle = _startAngle + (item.valuePercentage/100) * 360 * (Math.PI/180);  
          });

         $.each(p_data.items, function(index, item) {
          setupReferences(item, p_data);
         });
       }     

       return;
    }
  })();

  (function () {    
        
    window.EventManager1 = function (p_canvas) {      
      var _this = this;
      var $canvas = p_canvas;
      var _intervalId = null;
      var _mousePtr = new Point(0, 0);
      var _isHighlighted = false;

      var _lastMousePtr = new Point(0,0);

      var _center = new Point($canvas.width() / 2, $canvas.height() / 2);
          var _radius = Math.min($canvas.width() / 2, $canvas.height()) * 0.9;
          var _innerRadius = _radius * 0.6;
      
      console.log("radius:{0}; inner_radius:{1}".format(_radius, _innerRadius));

      _this.init = function () {         
         $canvas.hover(_this.mouseEntered, _this.mouseLeft);
         $canvas.mousemove(_this.mouseMove);
         $canvas.click(_this.click);  
      };

      _this.mouseEntered = function (ev) {
        //console.log("mouse entered");
        if(!_intervalId) {
          _intervalId = window.setInterval(checkLoop, 200);
          _mousePtr.X = ev.clientX;
          _mousePtr.Y = ev.clientY;
        }
      };

      _this.mouseLeft = function (ev) {
        //console.log("mouse left");
        if(_intervalId) {
          window.clearInterval(_intervalId);
          _intervalId = null;
        }
      };

      _this.mouseMove = function (ev) {
        //console.log("mouse move");  
        if(_intervalId) {         
          _mousePtr.X = ev.clientX;
          _mousePtr.Y = ev.clientY;
        }
      };

      _this.click = function (ev) {
        var angle = getHoveredQuadrantAngle(true);
        if (angle !== null) {
          console.log("click: " + angle);
          $(window).trigger("event.click", [{angle: angle}]);
        }
      }

      function checkLoop () {       
        
        if ((_lastMousePtr.X != _mousePtr.X || _lastMousePtr.Y != _mousePtr.Y)) {
          var angle = getHoveredQuadrantAngle(false);
          if (angle === null) {
            console.log("trigger hover event: angle null");
            if  (_isHighlighted) {
              console.log("trigger reset event");
              $(window).trigger("event.hover", [{angle: null}]);
            }
            _isHighlighted = false;         
          } else {
            _isHighlighted = true;
            console.log("trigger hover: " + angle);
            $(window).trigger("event.hover", [{angle: angle}]);
          }

          _lastMousePtr.X = _mousePtr.X;
          _lastMousePtr.Y = _mousePtr.Y;
        }       
      }

      function getHoveredQuadrantAngle (detectInnerCircle) {
        var _distance = Math.sqrt((_mousePtr.Y - _center.Y) * (_mousePtr.Y - _center.Y) + (_mousePtr.X - _center.X) * (_mousePtr.X - _center.X));
        var _angle = Math.atan2(_mousePtr.Y - _center.Y, _mousePtr.X - _center.X);

        if (_angle < 0) {
          //convert -3.10 to 3.18
          _angle = Math.PI + (_angle + Math.PI);
        }
        
        //console.log("distance:{0}; angle: {1}".format(_distance, _angle * 180 / Math.PI));
        if (detectInnerCircle && _distance < _innerRadius) {
           return -1; //inner circle
        } else  if (_distance >= _innerRadius && _distance < _radius) {
          return _angle;
        }

        return null;
      }   
    };
  })();

  (function () {      
        window.DonutChart1 = function (p_canvas, p_dataManager, p_eventManager) {
          var _this = this;
          var $canvas = this.$canvas = p_canvas;
          
          this.context = $canvas[0].getContext("2d");
          this.center = new Point($canvas.width() / 2, $canvas.height() / 2);
          this.radius = Math.min($canvas.width() / 2, $canvas.height()) * 0.9;
          this.innerRadius = this.radius * 0.6;
          this.lastHighlightedQuadrant = -1;
          
          this.dataMgr = p_dataManager;
          
          this.eventMgr = p_eventManager;                   
          this.eventMgr.init();
          $(window).on("event.hover", function(e, params) 
            { 
              console.log(params);
              _this.highlightQuadrant(params.angle);
            });
          $(window).on("event.click", function(e, params) 
            { 
              console.log(params);
              _this.selectQuadrant(params.angle);
            });

      };

      var _prototype = window.DonutChart1.prototype;
      
      _prototype.drawQuadrant = function (p_angle_from, p_angle_to, p_color) {          
            // console.log("Angle_From:{0}; Angle_To: {1}; color: {2}".format(p_angle_from, p_angle_to, p_color));
          this.context.save();
          this.context.beginPath();
          this.context.moveTo(this.center.X, this.center.Y);
          this.context.arc(this.center.X, this.center.Y, this.radius, p_angle_from, p_angle_to, false);
          this.context.closePath();
          this.context.fillStyle = p_color;
          this.context.fill();
          this.context.restore();         
      };

      _prototype.drawQuadrantWithAnimation = function (p_angle_from, p_angle_to, p_color) {         
            
            var _startAngle = p_angle_from;
            var _step = (p_angle_to - p_angle_from) / 8;
            var loop = 0;
            var _this = this;

            while (true) {
              loop += 1;
              var st = _startAngle;
              var en = _startAngle + _step;
              _startAngle = en - 0.01;
              if(_startAngle > p_angle_to) {
                en = _startAngle = p_angle_to;
              }

              setTimeout((function(start, end) {
                
                return function () {
                   console.log("Angle_From:{0}; Angle_To: {1};".format(start, end));
               // _this.context.save();
                _this.context.beginPath();
                _this.context.moveTo(_this.center.X, _this.center.Y);
                _this.context.arc(_this.center.X, _this.center.Y, _this.radius, start, end, false);               
                _this.context.closePath();
                _this.context.fillStyle = p_color;
                _this.context.fill();
                //_this.context.save();
            
            _this.context.beginPath();

            _this.context.moveTo(_this.center.X, _this.center.Y);
            _this.context.fillStyle ="white";
                _this.context.arc(_this.center.X, _this.center.Y, _this.innerRadius, start -0.2 ,end + 0.2, false);
                _this.context.fill();
                //_this.context.restore();
               
            }
              })(st, en), 45 + 45 * loop);

        if (en >= p_angle_to) {
          break;
        }
            }              
      };


      _prototype.reDrawQuadrantForDataItem = function(p_dataItem, p_isPrimaryColor) {            
        var _dataItem = p_dataItem;
        if (_dataItem && _dataItem.startAngle !== undefined && _dataItem.endAngle !== undefined) {
              console.log("redraw : start:{0}, end: {1}, isPrimary:{2}".format(_dataItem.startAngle, _dataItem.endAngle, p_isPrimaryColor));
              this.drawQuadrant(_dataItem.startAngle, _dataItem.endAngle, "hsla(0,0,0,0)");
              this.drawQuadrant(_dataItem.startAngle, _dataItem.endAngle, p_isPrimaryColor ? _dataItem.primaryColor : _dataItem.secondaryColor ); 
              this.drawInnerCircle();                            
            }               
      }

      _prototype.drawInnerCircle = function (p_color) {
        this.context.beginPath();
          this.context.moveTo(this.center.X, this.center.Y);
          this.context.fillStyle = p_color || "white";
          this.context.arc(this.center.X, this.center.Y, this.innerRadius, 0 , 2 * Math.PI, false);
          this.context.closePath();
          this.context.fill();
      }

      _prototype.highlightQuadrant = function (p_angle) {
      var _index = getQuandrantIndexFromAngle(this.dataMgr, p_angle);     
      if (this.lastHighlightedQuadrant !== _index) {
        var _current = this.dataMgr.current;
        // console.log("highlight_index:" + _index);
        if (!(_current.items && _current.items.length > 0)) return;
        console.log("triggered highlight_index:" + _index)

        if (_index === null) {
          for (var i = 0; i < _current.items.length; ++i) {
             this.reDrawQuadrantForDataItem(_current.items[i], true);            
          } 
        } else {
          for (var i = 0; i < _current.items.length; ++i) {
             this.reDrawQuadrantForDataItem(_current.items[i], i === _index);              
          } 
        }

        this.lastHighlightedQuadrant = _index;
      }
      }

      _prototype.selectQuadrant = function (p_angle) {      
        //if (p_angle && p_angle === -1) {
        if (p_angle === -1) { 
        this.dataMgr.moveUp();
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

      _prototype.render = function () {
          var _current = this.dataMgr.current;
          for (var i = 0; i < _current.items.length; ++i) {               
              this.drawQuadrantWithAnimation(_current.items[i].startAngle, _current.items[i].endAngle, _current.items[i].primaryColor);
          }
          this.drawInnerCircle();
      };

      _prototype.clear = function () {
        this.context.clearRect(0, 0, this.$canvas.width(), this.$canvas.height());
      };

      function getQuandrantIndexFromAngle(p_dataMgr, p_angle) {
      if (p_angle === null) return null;      
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
  })(); 
 </script>
</head>
<body>
  <canvas id="canvas" width=400 height=400></canvas>

  <script type="text/javascript">
    /*var chart = new DonutChart("#canvas", window.DonutData);
  chart.render();

  var eventManager = new EventManager($("#canvas"), chart);
  eventManager.init();*/

  var dataManager = new DonutDataManager1(DonutData1);
  var eventManager = new EventManager1($("#canvas")); 
  var chart = new DonutChart1($("#canvas"), dataManager, eventManager);
  chart.render();

  </script>
</body>
</html>