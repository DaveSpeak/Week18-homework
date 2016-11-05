var express = require('express');
var path = require('path');
var logger = require('morgan');
// var cookieParser = require('cookie-parser'); // for working with cookies
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
// app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use("/", require("./controllers/article_controller"));
app.use("/note", require("./controllers/note_controller"));
// And we bring in our Note and Article models
var Note = require('./models/Note.js');
var Article = require('./models/Article.js');
// this will get the articles we scraped from the mongoDB
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
	// and populate all of the notes associated with it.
	// now, execute our query
	.exec(function(err, doc){
		console.log("executed the find");
		console.log(doc);
		if (doc){
			console.log("note exists");
		}
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
// replace the existing note of an article with a new one
// or if no note exists for an article, make the posted note it's note.
app.post('/articles/:id', function(req, res){
	// create a new note and pass the req.body to the entry.
	var newNote = new Note(req.body);

	// and save the new note the db
	newNote.save(function(err, doc){
		// log any errors
		if(err){
			console.log(err);
		} 
		// otherwise
		else {
			// using the Article id passed in the id parameter of our url, 
			// prepare a query that finds the matching Article in our db
			// and update it to make it's lone note the one we just saved
			Note.findOneAndUpdate({'_id': doc._id}, {'article':req.params.id})
			// execute the above query
			.exec(function(err, doc){
				// log any errors
				if (err){
					console.log(err);
				} else {
					// or send the document to the browser
					res.send(doc);
				}
			});
		}
	});
});

app.get('/scrape', function(req, res) {
	// first, we grab the body of the html with request
	request('http://www.wsj.com/', function(error, response, html) {
  	// then, we load that into cheerio and save it to $ for a shorthand selector
    var $ = cheerio.load(html);
    // now, we grab every 'a.wsj-headline-link' within an article tag, and do the following:
    $('a.wsj-headline-link').each(function(i, element) {

    		// save an empty result object
				var result = {};
				result.title = $(this).text();
				result.link = $(this).attr('href');
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
						  	// console.log(doc);
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
