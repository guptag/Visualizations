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

      //Interface is inspired from the node module 'flow'

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
        ]).join()
        .serial(function(next) {
          console.log("job 3"); 
          next();
        }).process();
  */
  global.donut.Task_WIP = function (finishCb) {     
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
