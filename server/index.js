const express = require("express");
const dotenv = require("dotenv");
const passport = require("passport");
const mongoose = require("mongoose");
dotenv.config();
const MongoStore = require("connect-mongo");
const cors = require("cors");
const app = express();
const session = require("express-session");
const { Room } = require("./Room");
const Problem = require("./models/Problem");

require("./config/passport")(passport);
const { Server } = require("socket.io");
const rooms = {};

app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

app.use(
  session({
    secret: "some random secret",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.MONGO_URI }),
  })
);

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect(
  process.env.MONGO_URI,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  },
  () => console.log("DB Connected")
);

app.use("/api/code", require("./routes/code"));
app.use("/api/problem", require("./routes/problem"));
app.use("/api/auth", require("./routes/auth"));

app.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/failed",
  }),
  (req, res) => {
    res.redirect("http://localhost:3000/");
  }
);

const PORT = process.env.PORT || 5000;

let server = require("http").createServer(app);
// server.on("request", app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
  },
});

io.on("connection", (socket) => {
  console.log("client connected");

  socket.on("createroom", async () => {
    let room = new Room();
    room.join(socket);
    socket.emit("roomcreated", room.ID);

    const allProblems = await getAllRecords();
    const problemId =
      allProblems[Math.floor(Math.random() * allProblems.length)];
    room.problem = problemId;

    console.log(problemId);

    rooms[room.ID] = room;
    console.log("room created " + room.ID);
  });

  socket.on("roomjoin", (id) => {
    if (rooms[id]) {
      rooms[id].join(socket);

      socket.emit("problemId", rooms[id].problem);

      socket.on("sendmessage", (message) => {
        socket.broadcast.emit("newmessage", message);
      });

      console.log("room joined " + id);
    } else console.log("room doesn't exist");
  });
});

server.listen(PORT, () => {
  console.log("Server listening");
});
// app.listen(PORT, () => console.log("Server is listening"));

async function getAllRecords() {
  let problemList = [];
  try {
    const records = await Problem.find({}, "_id");
    records.forEach((record) => {
      problemList.push(record._id.toString());
    });

    return problemList;
  } catch (error) {
    console.error("Error retrieving records:", error);
  }
}
