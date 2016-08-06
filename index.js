const config = require('./config.js');

const AWSClient = require('./lib/aws-client').AWSClient;

if(config.aws.accessKey.startsWith('[')) {
  throw new Error('Missing AWS Access Key. Please check config.js.');
}
if(config.aws.secretKey.startsWith('[')) {
  throw new Error('Missing AWS Secret Key. Please check config.js.');
}
if(config.aws.associateTag.startsWith('[')) {
  throw new Error('Missing Associate Tag. Please check config.js.');
}

let client = new AWSClient(config.aws.accessKey,
                           config.aws.secretKey,
                           config.aws.associateTag);

// Set parameters
let params = {};
params.SearchIndex = 'Books';
params.Keywords = 'NodeJS';
params.ResponseGroup = 'Small,Images,ItemAttributes';
params.Sort = 'price';

client.search(params).then((result) => {
  console.log('-----');
  // console.log(result);
  // console.log(result[0]);

  let items = result.map((r) => {
    return {
      title: r.ItemAttributes.Title,
      author: r.ItemAttributes.Author,
      publisher: r.ItemAttributes.Publisher,
      published: r.ItemAttributes.PublicationDate,
      format: r.ItemAttributes.Format,
      pages: r.ItemAttributes.NumberOfPages,
      coverUrl: r.MediumImage.URL
    };
  });

  console.log(items);
}).catch((err) => {
  console.error(err);
});
