Ti.include('test_utils.js')

var _ = require('underscore'),
    touchdb = require('com.obscure.titouchdb');

exports.run_tests = function() {
  var mgr = touchdb.databaseManager;
  var db = mgr.createDatabaseNamed('test014');
  
  
  var pullTotal = 0, pullCompleted = 0;
  var pushTotal = 0, pushCompleted = 0;
  var pullDone = false, pushDone = false, checkCount = 20;
  
  try {
    Ti.API.info("starting replication test");
    
    var dt = new Date();
    createDocWithProperties(db, {
      testname: 'push_to_remote',
      timestamp: dt.getTime() / 1000,
    }, 'zzz');
    
    var pull = db.pullFromURL('http://touchbooks.iriscouch.com/test');
    pull.addEventListener('change', function(e) {
      assert(!pull.error.error, "replication error: "+JSON.stringify(pull.error));
      pullTotal = pull.total > pullTotal ? pull.total : pullTotal;
      pullCompleted = pull.completed > pullCompleted ? pull.completed : pullCompleted;
      
      pullDone = !pull.running && pullCompleted >= pullTotal;
    });
    pull.start();
    
    // just do pull replication for now
    pushDone = true;
    /*
    var push = db.pushToURL('http://touchbooks.iriscouch.com/test');
    push.addEventListener('change', function(e) {
      assert(!push.error.error, "replication error: "+JSON.stringify(push.error));
      pushTotal = push.total > pushTotal ? push.total : pushTotal;
      pushCompleted = push.completed > pushCompleted ? push.completed : pushCompleted;
      
      pushDone = !push.running && pushCompleted >= pushTotal;
    });
    push.start();
    */
  }
  catch (e) {
    db.deleteDatabase();
    throw e;
  }
  
  Ti.API.info("replication started");

  // TODO maybe launch replication in a timeout and block on the check?
  var interval = setInterval(function() {
    if (pullDone && pushDone) {
      Ti.API.info("replication done!  doc count = "+db.getDocumentCount());
      clearInterval(interval);
      db.deleteDatabase();
    }
    else if (checkCount-- < 0) {
      clearInterval(interval);
      db.deleteDatabase();
      throw new Error("timed out waiting for replication");
    }
  }, 2000);
  

}