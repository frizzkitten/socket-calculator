const express = require("express");
const http = require("http");
const socketIO = require("socket.io");

// CONNECT TO THE DB
// Connection string of MongoDb database hosted on Mlab or locally
// Collection name should be "calculations"
var connection_string =
    "mongodb+srv://austin:GdXhpp5P5pfUOtlf@cluster0-yn6k2.mongodb.net/orderkitchen?retryWrites=true&w=majority";
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
        try {
            const calculations = await Calculations.find({});
            io.sockets.emit("get_data", calculations);
        } catch (error) {
            console.log("error with initial_data: ", error);
        }
    });

    // when a calculation is completed, send it to the database
    socket.on("send_calculation", equation => {
        Calculations.create({ equation })
            .then(calculation => io.sockets.emit("change_data"))
            .catch(error => console.log("error creating equation: ", error));
    });

    // disconnect is fired when a client leaves the server
    socket.on("disconnect", () => console.log("user disconnected"));
});

/* Below mentioned steps are performed to return the Frontend build of create-react-app from build folder of backend */

app.use(express.static("build"));
app.use("/kitchen", express.static("build"));
app.use("/updatepredicted", express.static("build"));

server.listen(port, () => console.log(`Listening on port ${port}`));
