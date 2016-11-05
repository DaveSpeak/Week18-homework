// Get required npm packages
var express = require('express');
var path = require('path');
var logger = require('morgan');
var bodyParser = require('body-parser');
var session = require('express-session');
var request = require('request'); 
var cheerio = require('cheerio');
// instantiate our app
var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));

//set up handlebars
var exphbs = require('express-handlebars');
app.engine('handlebars', exphbs({
    defaultLayout: 'main'
}));
app.set('view engine', 'handlebars');
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
// set up path for public directories
app.use(express.static(path.join(__dirname, 'public')));
// access the controllers - which don't do much in this application
app.use("/", require("./controllers/article_controller"));
app.use("/note", require("./controllers/note_controller"));
// Note and Article models
var Note = require('./models/Note.js');
var Article = require('./models/Article.js');

// this will find the articles we scraped and stored on mongoDB
app.get('/articles', function(req, res){
	// grab every doc in the Articles array
	Article.find({}, function(err, doc){
		// log any errors
		if (err){
			console.log(err);
		} 
		// or send the doc to the browser as a json object
		else {
			res.json(doc);
		}
	});
});
// grab an article by it's ObjectId
app.get('/articles/:id', function(req, res){
	// using the id passed in the id parameter, 
	// prepare a query that finds the matching one in our db...
	Note.find({'article': req.params.id})
	// now, execute our query
	.exec(function(err, doc){
		// log any errors
		if (err){
			console.log(err);
		} 
		// otherwise, send the doc to the browser as a json object
		else {
			res.json(doc);
		}
	});
});

// delete note when it's clicked
app.post('/delnote/:id', function(req,res){
	Note.remove({"_id":req.params.id})
	.exec(function(err,doc){
		if (err){
			console.log(err);
		} else {
			res.send(doc);
		}
	});
});
// Add a new note associated with a passed article id
app.post('/articles/:id', function(req, res){
	// create a new note and pass the req.body to the entry.
	var newNote = new Note(req.body);

	// save the new note the db
	newNote.save(function(err, doc){
		// log any errors
		if(err){
			console.log(err);
		} 
		// otherwise
		else {
			// find the note and add the article id to it
			Note.findOneAndUpdate({'_id': doc._id}, {'article':req.params.id})
			// execute the above query
			.exec(function(err, doc){
				// log any errors
				if (err){
					console.log(err);
				} else {
					// send the document to the browser
					res.send(doc);
				}
			});
		}
	});
});

// scrape articles from the web
app.get('/scrape', function(req, res) {
	// body of the html with request
	request('http://www.wsj.com/', function(error, response, html) {
  	// load that into cheerio and save it to $ for a shorthand selector
    var $ = cheerio.load(html);
    // grab every 'a.wsj-headline-link' within an article tag, and do the following:
    $('a.wsj-headline-link').each(function(i, element) {
		// create an empty result object
		var result = {};
		// update with article title and link
		result.title = $(this).text();
		result.link = $(this).attr('href');
		// find article - if it exists, don't add to mongodb
		Article.findOne({'title':result.title})
		.exec(function(err, doc){
			if (!doc){
				var entry = new Article (result);
				// now, save that entry to the db
				entry.save(function(err, doc) {
					// log any errors
				  if (err) {
				    console.log(err);
				  } 
				  // or log the doc
				  else {
				  	console.log(doc);
				  }
				});
			}
		});
    });
  });
});
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
// no stacktraces leaked to user unless in development environment
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: (app.get('env') === 'development') ? err : {}
  });
});


// our module get's exported as app.
module.exports = app;
