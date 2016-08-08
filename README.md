# Amazon Product Browser
A Node.js JSON API that consumes and displays product data from the Amazon Product Advertising API.

## Description
This is a sample application as an exercise to use the APS Product API to get product data and consume that data. It's theoretical use case would be to get information for advertising Amazon products on a web page and not be interacted with an end user directly.

For example, if this were used on a website that was running a NodeJS tutorial, it could be used to get a list of NodeJS books from Amazon to advertise with.

## Prerequisites
* An AWS account and access to the Amazon Product API. Information on how to do this can be found in the Amazon documentation:
http://docs.aws.amazon.com/AWSECommerceService/latest/DG/becomingDev.html
* A MongoDB instance.

## Getting Started
1. Clone the repository
1. Install dependencies by running:
```bash
npm install
```
1. Rename the config.tpl.js file to config.js (Do not add this file to source control!)
1. Add required information to run the application in the config.js file:
  * **config.aws.accessKey** - Amazon Access Key
  * **config.aws.secretKey** - Amazon Secret Key
  * **config.aws.associateTag** - Amazon Product API Associate Tag
  * **config.db.url** - MongoDB connection string
1. [Optional] Set optional information in the config.js file:
  * **config.cache.timeout** - The amount of time until cached data from Amazon becomes stale (or times out). Time entered here in in milliseconds. (Default: 1 hour)
1. Start the application:
```bash
npm start
```
1. You can then access the browser using the url: http://localhost:3000/books/:title
  * **title** - book title to search for (for example: nodejs)

## Product Roadmap
* Add additional search indexes. Currently, Can only search for books. Additional endpoints could be created in order to advertise other types of products.
* Allow Configuration information to be setup via environment variables. Sometimes a configuration file can be more of a burden.
* Request logging. Since we already have a database in place, store requests that are made for reporting purposes, and an endpoint to access those logs.
