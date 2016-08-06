const sigHelper = require('./aws-signature-helper');
const http = require('http');

class AWSClient {
  constructor(accessKey, secretKey, associateKey) {
    this.awsId = accessKey;
    this.awsSecret = secretKey;
    this.associateId = associateKey;
  }

  search(params) {
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

    let responseBody = '';

    return new Promise((resolve, reject) => {
      var request = http.request(options, function(response) {
        response.setEncoding('utf8')

        response.on('data', function (chunk) {
            responseBody += chunk
        })

        response.on('end', function () {
          resolve(responseBody);
        })
      });

      request.on('error', function(err) {
        reject(err);
      });

      request.end();
    });
  }
}

exports.AWSClient = AWSClient;
