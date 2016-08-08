config = {};

// Your AWS configuration information
config.aws = {};
config.aws.accessKey = "[AWS ID HERE]";
config.aws.secretKey = "[AWS SECRET HERE]";
config.aws.associateTag = "[ASSOCIATE TAG HERE]";

config.db = {};
config.db.url = 'mongodb://localhost:27017/aznprodDb';

config.cache = {};
config.cache.timeout = 3600000;

module.exports = config;
