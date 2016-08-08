const sigHelper = require('./aws-signature-helper');
const http = require('http');
const xml2js = require('xml2js');

const defaultXml2JsOptions = {
    explicitArray: false
}

module.exports.init = (params) => {
  this.awsId = params.accessKey;
  this.awsSecret = params.secretKey;
  this.associateId = params.associateId;
}

module.exports.search = (params) => {
  params.Service = 'AWSECommerceService';
  params.Operation = 'ItemSearch';
  params.SubscriptionId = this.awsId;
  params.AssociateTag = this.associateId;

  let awsQueryString = sigHelper.sign(params, this.awsSecret);

  // Make Request
  var options = {
    method: 'GET',
    hostname: 'webservices.amazon.com',
    path: '/onca/xml?' + awsQueryString
  }

  console.log('Making Request...', options);
  let responseBody = '';

  return new Promise((resolve, reject) => {
    var request = http.request(options, function(response) {
      response.setEncoding('utf8')

      response.on('data', function (chunk) {
          responseBody += chunk
      })

      response.on('end', function () {
        // console.log(responseBody);
        xml2js.parseString(responseBody, defaultXml2JsOptions, (err, result) => {
          if(err) {
            reject(err);
          }

          // Don't need the metadata, just the items
          resolve(result.ItemSearchResponse.Items.Item);
        })
      })
    });

    request.on('error', function(err) {
      reject(err);
    });

    request.end();
  });
}
