const crypto = require('crypto');

let requestMethod = 'GET',
    host = 'webservices.amazon.com',
    requestUri = '/onca/xml';

// Generate a current timestamp in proper AWS format: 2014-08-18T12:00:00Z
function generateTimestamp() {
  let now   = new Date(),
      year  = now.getUTCFullYear(),
      month = (now.getUTCMonth() + 1 > 9) ? now.getUTCMonth() + 1 : '0' + (now.getUTCMonth() + 1),
      day   = (now.getUTCDate() > 9) ? now.getUTCDate() : '0' + now.getUTCDate(),
      hours = (now.getUTCHours() > 9) ? now.getUTCHours() : '0' + now.getUTCHours(),
      mins  = (now.getUTCMinutes() > 9) ? now.getUTCMinutes() : '0' + now.getUTCMinutes(),
      secs  = (now.getUTCSeconds() > 9) ? now.getUTCSeconds() : '0' + now.getUTCSeconds();

  return [year, month, day].join('-') + 'T' + [hours, mins, secs].join(':') + 'Z'
}

// Ensure that parameters are URI encoded
function encode(params) {
  let encodedParams = [];

  for(let key in params) {
    let k = encodeURIComponent(key);
    let v = encodeURIComponent(params[key]);
    encodedParams.push([k,v].join('='));
  }

  return encodedParams;
}

function generateSigParam(awsQueryString, secret) {
  let canonical = requestMethod + '\n'
                + host + '\n'
                + requestUri + '\n'
                + awsQueryString;

  let hmac = crypto.createHmac('sha256', secret);
  hmac.update(canonical);
  let sig = hmac.digest('base64');

  let param = {};
  param['Signature'] = sig;

  return param;
}


exports.sign = function(params, secret) {
  // let queryParams = splitParameters(uri);
  params['Timestamp'] = generateTimestamp();

  let encodedParams = encode(params);

  // Query paramters are to be sorted by byte (meaning not case sensitive)
  encodedParams.sort(function(a,b) {
    return a.localeCompare(b, 'en', {'sensitivity': 'base'})
  });

  let awsQueryString = encodedParams.join('&');
  let signature = generateSigParam(awsQueryString, secret);
  let encodedSignature = encode(signature)[0];
  awsQueryString += '&' + encodedSignature;

  return awsQueryString;
}
