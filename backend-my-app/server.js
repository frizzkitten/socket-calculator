const express = require("express");
const http = require("http");
const socketIO = require("socket.io");

// CONNECT TO THE DB
// Connection string of MongoDb database hosted on Mlab or locally
// Collection name should be "calculations"
var connection_string =
    "mongodb+srv://austin:64PXKSwyJKToP6A7@cluster0-ij2mb.mongodb.net/calculator?retryWrites=true&w=majority";
let mongoose = require("mongoose");
mongoose.connect(
    connection_string,
    { useNewUrlParser: true, useUnifiedTopology: true }
);
let db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => console.log("connected to db!"));

// get the db schema
const Calculations = require("./schemas/CalculationSchema");

// our localhost port
const port = process.env.PORT || 3001;

const app = express();

// our server instance
const server = http.createServer(app);

// This creates our socket using the instance of the server
const io = socketIO(server);

io.on("connection", socket => {
    console.log("New client connected" + socket.id);

    // return initial data of calculations
    socket.on("initial_data", async () => {
        Calculations.find({}, {}, { sort: { date: -1 } })
            .limit(10)
            .exec((error, calculations) => {
                if (error) console.log("error with initial_data: ", error);
                io.sockets.emit("get_data", calculations);
            });
    });

    // when a calculation is completed, send it to the database
    socket.on("send_calculation", equation => {
        Calculations.create({ equation, date: new Date() })
            .then(calculation => io.sockets.emit("change_data"))
            .catch(error => console.log("error creating equation: ", error));
    });

    // disconnect is fired when a client leaves the server
    socket.on("disconnect", () => console.log("user disconnected"));
});

/* Below mentioned steps are performed to return the Frontend build of create-react-app from build folder of backend */

app.use(express.static("build"));

server.listen(port, () => console.log(`Listening on port ${port}`));
