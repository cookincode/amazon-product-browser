const express = require('express');
const router = express.Router();

const cache = require('../lib/mongo-cache-control');
const client = require('../lib/aws-client');

router.param('title', function(req, res, next, title) {
  req.info = {
    title: title
  }
  next();
});


router.route('/:title')
.get((req, res, next) => {
  let call = req.originalUrl;

  cache.retrieve(call).then((result) => {
    if(result) {
      res.json({from:'Cache', items:result});
    } else {

      // // Set parameters
      let params = {};
      params.SearchIndex = 'Books';
      params.Keywords = req.info.title;
      params.ResponseGroup = 'Small,Images,ItemAttributes';

      client.search(params).then((result) => {
        let items = result.map((r) => {
          return {
            asin: r.ASIN,
            title: r.ItemAttributes.Title,
            author: r.ItemAttributes.Author,
            publisher: r.ItemAttributes.Publisher,
            published: r.ItemAttributes.PublicationDate,
            format: r.ItemAttributes.Format || 'Unknown',
            pages: r.ItemAttributes.NumberOfPages,
            coverUrl: r.MediumImage.URL
          };
        });

        cache.store(call, items);

        res.json({from:'Search', items:items});
      }).catch((err) => {
        console.dir(err);
      });

    }
  });
});

module.exports = router;
