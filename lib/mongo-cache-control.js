const MongoClient = require('mongodb').MongoClient;

/**
*  Initialize the Mongo Cache
*  A URL to the Mongo Database is required in order to use the cache.
*  Optional Parameters:
*    - collection: collection to store the cache in (default: cache)
*    - timeout: timeout (in millisecond) to refresh the cache request (default 1 hour 3600000ms)
**/
module.exports.init = (params) => {
  if(typeof(params.url) === 'undefined') {
    throw new Error('Need URL to Mongo Database');
  }

  this.url = params.url;
  this.collection = params.collection || 'cache';
  this.timeout = params.timeout || (60 * 60 * 1000);

  console.log(this.url, this.timeout);
  console.log('Mongo Cache Setup with timeout ' + (this.timeout / 1000) + ' seconds');
}

/**
*  Check the cache for a specific URI call that was made.
*  If one is found, the data will be returned in a resolved promise.
*  If the call is not found, or if it has timed out, will return undefined in
*    the resolved promise.
**/
module.exports.retrieve = (call) => {
  let url = this.url,
      collection = this.collection,
      timeout = this.timeout;

  return new Promise((resolve, reject) => {
    var request = MongoClient.connect(url, (err, db) => {
      if(err) { return console.dir(err) }

      db.collection(collection).findOne({call: call}, (err, doc) => {
        if(err) {
          console.dir(err);
          reject(err);
          db.close();
          return;
        }

        // Check to see if an entry was found
        if(doc == null) {
          resolve(undefined)
          db.close();
          return;
        }

        // Return cache value if not stale (exceeded timeout)
        if( ((new Date) - doc.date) < timeout ) {
          resolve(doc.value)
          db.close();
          return;
        }

        // Stale cache values get deleted.
        // Return value is the same as if there had been no entry
        db.collection(collection).deleteMany({call: call}, (err, results) => {
          if(err) { console.dir(err); }
          db.close();
        });
        resolve(undefined);
      });
    })
  });
}

/**
*  Store a call/value pair into the cache.
*  It will be timestamped with the current date/time to check for timeout.
**/
module.exports.store = (call, value) => {
  let url = this.url,
      collection = this.collection;

  MongoClient.connect(url, (err, db) => {
    if(err) { return console.dir(err) }

    let doc = {
      call: call,        // String of call to cache
      date: new Date(),  // Add date of call to manage timeout
      value: value};     // Value to cache

    db.collection(collection).insert(doc);
    db.close();
  });
}
