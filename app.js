require("dotenv").config()
const {express,app,server,io} = require('./utils/server')
const bodyParser = require("body-parser")
const Sentry = require("@sentry/node")


const {PORT,ENV} = process.env
app.use(express.static(__dirname + '/public'));
const apiRoute = require("./routes/index.routes")
app.set("view engine","ejs")
app.use(bodyParser.urlencoded({ extended: false }))
app.use(express.json());


Sentry.init({
    dsn: 'https://f2714d34e81dbd66228e41d25da12463@o4506178962915328.ingest.sentry.io/4506239936364544',
    environment : ENV,
    integrations: [
    
      // enable HTTP calls tracing
      new Sentry.Integrations.Http({ tracing: true }),
      // enable Express.js middleware tracing
      new Sentry.Integrations.Express({ app }),
    ],
    // Performance Monitoring
    tracesSampleRate: 1.0,
    // Set sampling rate for profiling - this is relative to tracesSampleRate
    profilesSampleRate: 1.0,
  });
  
// The request handler must be the first middleware on the app
app.use(Sentry.Handlers.requestHandler());

// TracingHandler creates a trace for every incoming request
app.use(Sentry.Handlers.tracingHandler());


app.use('/api/v1',apiRoute)
app.get("/debug-sentry", function mainHandler(req, res) {
    throw new Error("My first Sentry error!");
  });


io.on("connection", (client) => {
    console.log("connected to",client.id);

    client.on("register_notif", (notif) => {
        console.log("notif : ",notif);
        io.emit("register_notif",notif)
    })
})

app.use(Sentry.Handlers.errorHandler());

app.use((err,req,res,next) => {
    res.status(500).json({
        status : "false",
        message : err.message,
        data : null
    })
})

app.use((req,res,next) => {
    res.status(404)
    .json({
        status : "false",
        message : "not found",
        data : null
    });
})
server.listen(PORT,() => console.log('listening to port',PORT))



