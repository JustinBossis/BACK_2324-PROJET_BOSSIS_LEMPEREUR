const path = require('path');
const express = require("express");
const morgan = require('morgan');
const http = require('http');
const {Server} = require("socket.io");
const jwt = require('jsonwebtoken');

const app = express()
require("dotenv").config()
const port = process.env.PORT;
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:4200",
    methods: ["GET", "POST"]
  }
});
const cors=require('cors');

app.use(morgan('tiny'));
app.use(express.static("public"));
app.set('views', path.join(__dirname, "views"));
app.set('view engine', 'pug');
app.use(express.json())
app.use(express.urlencoded({ extended: true }));
app.use(cors())

const indexRouter = require("./routes/index.js");
const eventsRouter = require("./routes/events.js");
const routerUser = require("./routes/user.js");
const chatRouter = require("./routes/chat.js");
const chat = require("./model/Chat");

app.use("/", indexRouter);
app.use("/events/", eventsRouter);
app.use("/auth/", routerUser);
app.use("/chat/", chatRouter);

app.use( (req, res, next) => {
  res.status(404).send('Page not found!');
});

io.engine.use((req, res, next) => {
  const isHandshake = req._query.sid === undefined;
  if (!isHandshake) {
    return next();
  }

  const header = req.headers["authorization"];

  if (!header) {
    return next(new Error("no token"));
  }

  if (!header.startsWith("bearer ")) {
    return next(new Error("invalid token"));
  }

  const token = header.substring(7);

  jwt.verify(token, process.env.JWT_PRIVATE_KEY, (err, decoded) => {
    if (err) {
      return next(new Error("invalid token"));
    }
    req.userid = decoded.id;
    next();
  });
});

io.on('connection', (socket) => {
  console.log(`New connection. Socket id : ${socket.id}`);

  const userId = socket.request.userid;

  let room = "";

  socket.on('joinRoom', (data) => {
    room = data.conversation;
    socket.join(room);
    console.log(`join room ${room}`)
  });

  socket.on('leaveRoom', () => {
    socket.leave(room);
    console.log(`leave room ${room}`)
    room = "";
  });

  socket.on('message', (data) => {
    chat.addMessage(data, userId).then((id) => {
      data._id = id;
      io.to(room).emit("chat", data)
    }).catch((error) => {
      socket.emit("error", error.message);
    })

  });

});

server.listen(port, () => {
  console.log(`Listening on port ${port}`);
  console.log(process.env.NODE_ENV)
});
