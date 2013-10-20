(function (global) {
  global.donut = global.donut || {};  
  
  /*
      sample usage:

      //Interface is inspired from the node module 'Flow'

      var task = new donut.Task();
      task.serial(function(next) {
          console.log("job 1"); 
          next();
        }).serial(function(next) {
          console.log("job 2"); 
          next(200);
        }).serial(function(next) {
          console.log("job 3"); 
          next();
        }).done(function() {
          console.log("completed");
        }).process();


      var task2 = new donut.Task();
      task2.serial(function(next) {
          console.log("job 1"); 
          next();
        }).parallel([
          function(ready) {
            console.log("parallel job 1"); 
            ready(100);
          }, 
          function(ready) {
            console.log("parallel job 1"); 
            ready();
          }
        ]).serial(function(next) {
          console.log("job 3"); 
          next();
        }).process();
  */

  global.donut.Task = function () {     
    this.jobs = [];
    this.parallelJobId = 0;    
    this.isCompleted = false;
  }

  donut.Task.createNew = function () {
    return new donut.Task();
  }

  _prototype  = global.donut.Task.prototype;
  
  _prototype.serial = function(p_fn) {
      
     if (this.isCompleted) {
       console && console.log("Cannot add jobs to the completed task");
       return this;
     }
      
     if (typeof p_fn === "function") {
        this.jobs.push({
            execFn: p_fn
        });
     } else if (p_fn.length) {
        var _this = this;
         //remove nulls from array
        var p_fnList = p_fn.filter(function(e){return e}); 
        $.each(p_fnList, function(index, item) {
          _this.jobs.push({
            execFn: item
          })
        });
     }    
      
     return this;
  };


  _prototype.parallel = function (p_fnList) {

      if (this.isCompleted) {
        console && console.log("Cannot add jobs to the completed task");
        return this;
      }

      if (!p_fnList || p_fnList.length == 0) {
        return this;
      }

      //remove nulls from array
      p_fnList = p_fnList.filter(function(e){return e}); 
      
      this.jobs.push({
        meta: { 
                  id: ++this.parallelJobId, 
                  jobcount: p_fnList.length,
                  completed: 0
                },
        execFnList: p_fnList
      });  

      return this;
  };   

  _prototype.done = function (doneCb) {
      this.onComplete = doneCb || function() {};
      return this;
  };

  _prototype.process = function () {
      executeNextTask(this);
  }; 

  var executeNextTask = function (p_this) {
    if (!p_this.isCompleted && p_this.jobs.length > 0) {
      var item_to_process = p_this.jobs.shift();
      
      // if parallel job
      if(item_to_process.meta) {              
        $.each(item_to_process.execFnList, function(index, item) {
          // stagger calling batch jobs
          setTimeout(function() { 
            item.call(global, getReadyCb(p_this, item_to_process.meta)); 
          }, index * 25);
        })
      } else {
        item_to_process.execFn.call(global, getNextCb(p_this));
      }
    } else {
      p_this.isCompleted = true;      
      // execute complete callback (if exists)
      p_this.onComplete && p_this.onComplete.call(global);      
    }
  };

  var getNextCb = function(p_this) {
    var p_this = p_this;
    return function next(msec) {
      setTimeout(function() { 
        executeNextTask(p_this);
       }, msec || 0); 
    };
  };

  var getReadyCb = function (p_this, meta) {
      return function ready (msec) {
        // move to the next job once all the parallel tasks are completed
        if (++meta.completed === meta.jobcount) {
            setTimeout(function() { 
              executeNextTask(p_this);
           }, msec || 0);
        }    
      };
  };

})(window);  
