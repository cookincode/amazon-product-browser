const config = require('./config.js');
const express = require('express');

const AWSClient = require('./lib/aws-client');
const MongoCache = require('./lib/mongo-cache-control');

if(config.aws.accessKey.startsWith('[')) {
  throw new Error('Missing AWS Access Key. Please check config.js.');
}
if(config.aws.secretKey.startsWith('[')) {
  throw new Error('Missing AWS Secret Key. Please check config.js.');
}
if(config.aws.associateTag.startsWith('[')) {
  throw new Error('Missing Associate Tag. Please check config.js.');
}

/** Setup MongoCache **/
let cache = MongoCache.init({
  url: config.db.url,
  timeout: config.cache.timeout});

/** Setup AWS Client **/
let client = AWSClient.init({
  accessKey: config.aws.accessKey,
  secretKey: config.aws.secretKey,
  associateId: config.aws.associateTag});

/** Setup Server **/
let server = express();

server.use('/books', require('./routes/books'));

/** Run Server **/
server.listen(3000, function() {
  console.log('Amazon Product Browser listening on port 3000!');
});
