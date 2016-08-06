const config = require('./config.js');
const express = require('express');

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

/*** AWS Client ***/
let client = new AWSClient(config.aws.accessKey,
                           config.aws.secretKey,
                           config.aws.associateTag);



/** Server **/
let server = express();
let router = express.Router();

router.use(function(req, res, next) {
  console.log('%s %s %s', req.method, req.url, req.path);
  next();
});

router.param('title', function(req, res, next, title) {
  req.info = {
    title: title
  }
  next();
});

router.route('/:title')
.all(function(req, res, next) {
  next();
})
.get(function(req, res, next) {

  // // Set parameters
  let params = {};
  params.SearchIndex = 'Books';
  params.Keywords = req.info.title;
  params.ResponseGroup = 'Small,Images,ItemAttributes';

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
    res.json(items);
  }).catch((err) => {
    console.error(err);
  });
  //
  // res.json(req.title);
});

server.use('/books', router);
server.listen(3000, function() {
  console.log('Amazon Product Browser listening on port 3000!');
});
