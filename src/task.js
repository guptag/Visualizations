(function (global) {
  global.donut = global.donut || {};  
  
  /*
      sample usage:

      var t1 = new donut.Task();
      t1.addJob(function(p_task) { console.log("job 1"); p_task.notifyJobComplete(); });
      t1.addJob(function(p_task) { console.log("job 2"); p_task.notifyJobComplete(); });
      t1.addJob(function(p_task) { console.log("job 3"); p_task.notifyJobComplete(); });
      t1.process();


      var batchId = 100;
      var t2 = new donut.Task();
      t2.addJob(function(p_task) { console.log("job 1"); p_task.notifyJobComplete(); });
      t2.addBatchJob(batchId,
                    [ function(p_task) { console.log("job 2: batch item 1"); p_task.notifyBatchItemComplete(batchId); },
                      function(p_task) { console.log("job 2: batch item 2"); p_task.notifyBatchItemComplete(batchId); },
                      function(p_task) { console.log("job 2: batch item 3"); p_task.notifyBatchItemComplete(batchId); }]);
      t2.addJob(function(p_task) { console.log("job 3"); p_task.notifyJobComplete(); });
      t2.process();

  */
  global.donut.Task = function (finishCb) {     
    this.onComplete = finishCb;
    this.jobs = [];
    this.batchJobsHash = {}; //hash for batch id and the count of functions to execute
    this.isCompleted = false;
  }

  _prototype  = global.donut.Task.prototype;
  
  _prototype.addJob = function(p_fn) {
    if (!this.isCompleted) {
      this.jobs.push({
        execFn: p_fn
      });
    } else {
      console && console.log("Cannot add jobs to the completed task");
    }
  };

  _prototype.addBatchJob = function(p_batch_id, p_fnList) {
    if (!this.isCompleted) {      
      p_fnList = p_fnList.filter(function(e){return e}); //remove nulls from array
      this.jobs.push({
        batchId: p_batch_id,
        execFnList: p_fnList
      });

      // keep a hash of batch id and number of jobs it needs to execute
      this.batchJobsHash[p_batch_id] = {total: p_fnList.length, completed: 0};
    } else {
      console && console.log("Cannot add work items to the completed task");
    }
  }  

  _prototype.process = function () {
    if (!this.isCompleted && this.jobs.length > 0) {
      var item_to_process = this.jobs.shift();
      
      // if batch job
      if(item_to_process.batchId) {
        var _this = this;
        $.each(item_to_process.execFnList, function(index, item) {
          // stagger calling batch jobs
          setTimeout(function() { 
            item.call(global, _this, item_to_process.batchId); 
          }, index * 25);
        })
      } else {
        item_to_process.execFn.call(global, this);
      }
    } else {
      this.isCompleted = true;      
      // execute complete callback (if exists)
      this.onComplete && this.onComplete.call(global);      
    }
  }

  _prototype.notifyJobComplete = function () {
    if (!this.isCompleted) {
      this.process();
    } 
  }

  _prototype.notifyBatchItemComplete = function (p_id) {
    if (!this.isCompleted && this.batchJobsHash[p_id]) {
      
      // increment completed jobs count
      this.batchJobsHash[p_id].completed += 1;
      
      // if all are completed, flag the signal
      if (this.batchJobsHash[p_id].completed  === this.batchJobsHash[p_id].total) {
        this.notifyJobComplete();
      }
    } 
  }
})(window);


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

  global.donut.Task_WIP = function () {     
    this.jobs = [];
    this.parallelJobId = 0;    
    this.isCompleted = false;
  }

  donut.Task_WIP.createNew = function () {
    return new donut.Task_WIP();
  }

  _prototype  = global.donut.Task_WIP.prototype;
  
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
      return function ready () {
        // move to the next job once all the parallel tasks are completed
        (++meta.completed === meta.jobcount) && executeNextTask(p_this);
      };
  };

})(window);  
