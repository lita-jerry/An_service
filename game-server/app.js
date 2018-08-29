
var fs = require('fs');
var pomelo = require('pomelo');
// var dispatcher = require('./app/util/dispatcher');

// route definition for user server
var userRoute = function(session, msg, app, cb) {
  var userServers = app.getServersByType('user');

	if(!userServers || userServers.length === 0) {
		cb(new Error('can not find user servers.'));
		return;
	}

  // var res = dispatcher.dispatch(session.get('rid'), userServers);
  // var res = dispatcher.dispatch(session.id, userServers);
  
  // var _id = userServers[session % userServers.length];
  var _id = userServers[0].id;
  
  cb(null, _id);

	// cb(null, res.id);
};

/**
 * Init app for client.
 */
var app = pomelo.createApp();
app.set('name', 'Pomelo_Server');

// app configuration
app.configure('production|development', 'connector', function(){
  app.set('connectorConfig',
    {
      connector : pomelo.connectors.hybridconnector,
      heartbeat : 3,
      useDict : false,
      useProtobuf : false,
      ssl: {
        type: 'wss',
      	key: fs.readFileSync('../shared/server.key'),
  			cert: fs.readFileSync('../shared/server.crt')
      }
    });
});

// app configure
app.configure('production|development', function() {
	// route configures
	app.route('user', userRoute);
  app.filter(pomelo.timeout());
});

app.configure('production|development', 'user', function() {
  // app.filter(abuseFilter());
});

// start app
app.start();

process.on('uncaughtException', function (err) {
  console.error(' Caught exception: ' + err.stack);
});