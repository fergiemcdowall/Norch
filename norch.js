/**
 * Module dependencies.
 */

var express = require('express'),
    http = require('http'),
    path = require('path'),
    fs = require('fs'),
    norch = require('search-index'),
    program = require('commander'),
    app = express();


program
  .version('0.2.1')
  .option('-p, --port <port>', 'specify the port, defaults to 3000', Number, 3000)
  .option('-h, --home <home>', 'specify the home directory, stores the index and settings, defaults to ./norch', String, './norch')
  .parse(process.argv);

norch.init({home: path.resolve(program.home)});

// all environments
app.set('port', program.port);
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

/*
norch.calibrate(function(msg) {
  console.log('startup calibration completed');
  console.log(msg);
});
*/

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}


function getQuery(req) {
  //default values
  var offsetDefault = 0,
      pagesizeDefault = 10,
      q = {};
  q['query'] = "*";
  if (req.query['q']) {
    q['query'] = req.query['q'].toLowerCase().split(' ');
  }
  if (req.query['searchFields']) {
    q['searchFields'] = req.query.searchFields;
  }
  if (req.query['offset']) {
    q['offset'] = req.query['offset'];
  } else {
    q['offset'] = offsetDefault;
  }
  if (req.query['pagesize']) {
    q['pageSize'] = req.query['pagesize'];
  } else {
    q['pageSize'] = pagesizeDefault;
  }
  if (req.query['facets']) {
    q['facets'] = req.query['facets'].toLowerCase().split(',');
  }
  if (req.query['weight']) {
    q['weight'] = req.query.weight;
  }
  //&filter[topics][]=cocoa&filter[places][]=usa
  if (req.query['filter']) {
    q['filter'] = req.query.filter;
  }
  console.log(q);
  return q;
}


app.get('/', function(req, res) {
  res.sendfile('public/search.html');
});


app.get('/calibrate', function(req, res) {
  norch.calibrate(function(msg) {
    res.send(msg);
  });
});


app.get('/README.md', function(req, res) {
  res.sendfile('README.md');
});


app.get('/indexPeek', function(req, res) {
  norch.indexPeek(req.query['start'], req.query['stop'], function(msg) {
    res.send(msg);
  });
});


app.get('/indexData', function(req, res) {
  norch.indexData(function(msg) {
    res.send(msg);
  });
});


app.post('/delete', function(req, res) {
  norch.deleteDoc(req.body.docID, function(msg) {
    res.send(msg);
  });
});


app.get('/searchgui', function(req, res) {
  res.send('Welcome to Norch');
});


//curl localhost:3000/search?q=aberdeen\&weight=%22category%22:10
app.get('/search', function(req, res) {
  var q = getQuery(req);
  norch.search(q, function(msg) {
    res.send(msg);
  });
});


//curl --form document=@testdata.json http://localhost:3000/indexer
//--form facetOn=topics
app.post('/indexer', function(req, res) {
  console.log('requested indexer');
  var filters = [];
  if (req.body.filterOn) {
    filters = req.body.filterOn.split(',');
  }
  fs.readFile(req.files.document.path, {'encoding': 'utf8'}, function(err, batch) {
    if(err) return res.send(500, 'Error reading document');
    norch.index(batch, req.files.document.name, filters, function(msg) {
      res.send(msg);
    });
  });
});


http.createServer(app).listen(app.get('port'), function(){
  console.log();
  console.log('      ___           ___           ___           ___           ___     ');
  console.log('     /__/\\         /  /\\         /  /\\         /  /\\         /__/\\     ');
  console.log('     \\  \\:\\       /  /::\\       /  /::\\       /  /:/         \\  \\:\\    ');
  console.log('      \\  \\:\\     /  /:/\\:\\     /  /:/\\:\\     /  /:/           \\__\\:\\   ');
  console.log('  _____\\__\\:\\   /  /:/  \\:\\   /  /:/~/:/    /  /:/  ___   ___ /  /::\\  ');
  console.log(' /__/::::::::\\ /__/:/ \\__\\:\\ /__/:/ /:/___ /__/:/  /  /\\ /__/\\  /:/\\:\\ ');
  console.log(' \\  \\:\\~~\\~~\\/ \\  \\:\\ /  /:/ \\  \\:\\/:::::/ \\  \\:\\ /  /:/ \\  \\:\\/:/__\\/ ');
  console.log('  \\  \\:\\  ~~~   \\  \\:\\  /:/   \\  \\::/~~~~   \\  \\:\\  /:/   \\  \\::/      ');
  console.log('   \\  \\:\\        \\  \\:\\/:/     \\  \\:\\        \\  \\:\\/:/     \\  \\:\\      ');
  console.log('    \\  \\:\\        \\  \\::/       \\  \\:\\        \\  \\::/       \\  \\:\\     ');
  console.log('     \\__\\/         \\__\\/         \\__\\/         \\__\\/         \\__\\/     ');
  console.log();
  console.log('http://fergiemcdowall.github.io/Norch                 MIT license, 2013');
  console.log();
  console.log('Norch server listening on port ' + app.get('port'));
  console.log('Norch home is ' + program.home);
  console.log();
});
