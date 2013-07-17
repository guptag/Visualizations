(function(global) {
  
  global.donut = global.donut || {};

  /*
  
  */

  global.donut.DataManager = function (p_data) {
    this.data = p_data;
    this.current = this.data;
    setupReferences(this.data, null);
  }

  var _prototype = global.donut.DataManager.prototype

  _prototype.getCurrent = function () {
    return this.current;
  }

  _prototype.reset = function () {
    this.current = this.data;
  }

  _prototype.drillIn = function(p_index) {
    // drill into the item only if it has children
    if (this.canDrillIn(p_index)) {
       this.current = this.current.items[p_index];              
    }
    return this.current;
  }

  _prototype.canDrillIn = function (p_index) {
    var item = this.current;
    
    // can drill into the item only if it has children
    // returns false for leaf nodes
    return (item && 
            item.items && 
            item.items.length > p_index && 
            item.items[p_index].items);
  }

  _prototype.drillOut = function() {
    this.current = this.current.parent || this.data;
  }

  function setupReferences(p_data, p_parent) {
    if (!p_data) {
      return;
    }

    p_data.parent = p_parent;

    if (p_data && p_data.items) {       
       var total = 0;

       $.each(p_data.items, function(index, item) {
         total += item.value;  
       });
        
       var _startAngle = 0;
       var _endAngle = 0;
       
       $.each(p_data.items, function(index, item) {
         item.valuePercentage = item.value * 100 / total; //todo: valuePercent
         item.startAngle = _startAngle = _endAngle; //in radians
         item.endAngle = _endAngle = _startAngle + (item.valuePercentage/100) * 360 * (Math.PI/180);  
        });

       // set up references for children
       $.each(p_data.items, function(index, item) {
         setupReferences(item, p_data);
       });
    }
  }
})(window); 