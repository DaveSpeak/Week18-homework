// include npm packages
var express = require('express');
var router = express.Router();
var request = require('request');
// set the root to render index.handlebars
router.get("/", function(req, res) {
  res.render("index");
});
module.exports = router;
