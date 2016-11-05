"use strict";
var fs        = require("fs");
var path      = require("path");
var mongoose  = require("mongoose");
var env       = process.env.NODE_ENV || "development";
var config    = require(path.join(__dirname, '..', 'config', 'config.json'))[env];
// var mongoUrl  = config.mongo_url;
if(process.env.MONGO_URL != undefined) {
  mongoUrl = process.env.MONGO_URL;
}

// mongoose.connect(config.mongo_url);
mongoose.connect('mongodb://heroku_rq0gjxq2:vghvfomjnd3uekvmbqu1ud31vf@ds139267.mlab.com:39267/heroku_rq0gjxq2');
console.log('mongoose connected');
var db = {};

fs
  .readdirSync(__dirname)
  .filter(function(file) {
    return (file.indexOf(".") !== 0) && (file !== "index.js");
  })
  .forEach(function(file) {
    var modelDefinition = require(path.join(__dirname, file));
    var model = mongoose.model(modelDefinition.modelName, modelDefinition.schema);
    db[modelDefinition.modelName] = model;
  });

module.exports = db;
