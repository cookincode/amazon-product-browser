const config = require('./config.js');
const http = require('http');
const crypto = require('crypto');

if(config.aws.accessKey.startsWith('[')) {
  throw new Error('Missing AWS Access Key. Please check config.js.');
}
if(config.aws.secretKey.startsWith('[')) {
  throw new Error('Missing AWS Secret Key. Please check config.js.');
}
if(config.aws.associateTag.startsWith('[')) {
  throw new Error('Missing Associate Tag. Please check config.js.');
}

// Set parameters
let params = {};
params.Service = 'AWSECommerceService';
params.SubscriptionId = config.aws.accessKey;
params.AssociateTag = config.aws.associateTag;
params.Operation = 'ItemSearch';
params.SearchIndex = 'Books';
params.Keywords = 'NodeJS';
params.ResponseGroup = 'Images,Reviews';
params.Sort = 'price';

/** Generate Signature **/
// http://docs.aws.amazon.com/AWSECommerceService/latest/DG/rest-signature.html

// 1. Add property formatted UTC Timestamp (2014-08-18T12:00:00Z)
// let now   = new Date(Date.UTC(2014, 7, 18, 12, 0, 0, 0)),  // For Proto
let now   = new Date(),
    year  = now.getUTCFullYear(),
    month = (now.getUTCMonth() + 1 > 9) ? now.getUTCMonth() + 1 : '0' + (now.getUTCMonth() + 1),
    day   = (now.getUTCDate() > 9) ? now.getUTCDate() : '0' + now.getUTCDate(),
    hours = (now.getUTCHours() > 9) ? now.getUTCHours() : '0' + now.getUTCHours(),
    mins  = (now.getUTCMinutes() > 9) ? now.getUTCMinutes() : '0' + now.getUTCMinutes(),
    secs  = (now.getUTCSeconds() > 9) ? now.getUTCSeconds() : '0' + now.getUTCSeconds();

params.Timestamp = [year, month, day].join('-') + 'T' + [hours, mins, secs].join(':') + 'Z'

// 2. URL encode request
let parts = []
for (var key in params) {
  let k = encodeURIComponent(key);
  let v = encodeURIComponent(params[key]);
  parts.push([k,v].join('='))
}

// 3. Split parameter pairs
//    (already split because they are part of an object)

// 4. Sort your parameter/value pairs by byte value
//    TODO: Don't believe .sort() does it by byte value, but will do for now.
parts.sort();

// 5. Rejoin the sorted parameter/value list with ampersands.
let paramString = parts.join('&');

// 6. Prepend the following three lines (with line breaks) before the canonical string:
let canonical = 'GET\n'
+ 'webservices.amazon.com\n'
+ '/onca/xml\n'
+ paramString

// 7. You now have the string to sign (paramString)

// 8. Calculate an RFC 2104-compliant HMAC with the SHA256 hash algorithm using the string above with AWS secret key
let secretKey = config.aws.secretKey;
let hmac = crypto.createHmac('sha256', secretKey);
hmac.update(canonical);
let sig = hmac.digest('base64');

// 9. URL encode the plus (+) and equal (=) characters in the signature:
let encodedSig = encodeURIComponent(sig);

// 10. Add the URL encoded signature to your request, and the result is a properly-formatted signed request
paramString += '&Signature=' + encodedSig;
let requestString = "http://webservices.amazon.com/onca/xml?" + paramString;



// Make Request
var options = {
  method: 'GET',
  hostname: 'webservices.amazon.com',
  path: '/onca/xml?' + paramString
}

let responseBody = '';
var request = http.request(options, function(response) {
  // console.log(response);
  response.setEncoding('utf8')

  response.on('data', function (chunk) {
      responseBody += chunk
  })

  response.on('end', function () {
      console.log('-----');
      console.log(responseBody);
  })

});

request.on('error', function(err) {
  console.log(err);
});

request.end();
