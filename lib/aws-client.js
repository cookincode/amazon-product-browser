const sigHelper = require('./aws-signature-helper');
const http = require('http');

// Used to convert XML data to JSON data
const xml2js = require('xml2js');

const defaultXml2JsOptions = {
    explicitArray: false
}

/**
*  Initialize the AWS client with required information to run a request:
*    accessKey, secretKey, associateId
**/
module.exports.init = (params) => {
  this.awsId = params.accessKey;
  this.awsSecret = params.secretKey;
  this.associateId = params.associateId;
}

/**
*  Send a search to Amazon Product API
*  Params should include, SearchIndex, Keywords, and ResponseGroup
*  ResponseGroup options can be found on the Amazon Website:
*    http://docs.aws.amazon.com/AWSECommerceService/latest/DG/CHAP_ResponseGroupsList.html
**/
module.exports.search = (params) => {
  params.Service = 'AWSECommerceService';
  params.Operation = 'ItemSearch';
  params.SubscriptionId = this.awsId;
  params.AssociateTag = this.associateId;

  // Helper function which returns a properly formatted and signed query string
  //   to be sent to AWS.
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

      // Concatinates the response from AWS
      response.on('data', function (chunk) {
          responseBody += chunk
      });

      // Process the response when it has been received
      response.on('end', function () {
        // AWS only returns XML formatted responses
        // Transform the XML file into JSON.
        xml2js.parseString(responseBody, defaultXml2JsOptions, (err, result) => {
          if(err) {
            reject(err);
          }

          // Don't need the metadata, just the items
          resolve(result.ItemSearchResponse.Items.Item);
        })
      })
    });

    // Reject the promise upon error
    request.on('error', function(err) {
      reject(err);
    });

    request.end();
  });
}
