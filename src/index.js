const express = require("express");
const path = require("path");
const hbs = require("hbs");
const cookieParser = require("cookie-parser");
const sessions = require("client-sessions");
require("./db/mongoose");

const userRouter = require("./routers/user");
const taskRouter = require("./routers/task");

const app = express();
const port = process.env.PORT || 3000;

//define path for express config
const publicDirectoryPath = path.join(__dirname, "../public");
const viewsPath = path.join(__dirname, "../templates/views");
const partialsPath = path.join(__dirname, "../templates/partials");

//middleware for authentication
// app.use((req, res, next) => {
//   if (req.method === "GET") console.log("GET methods are disables");
//   else next();
// });

//middleware for down mode
// app.use((req, res, next) => {
//   console.log("server down");
//   res.status(503).send("server down");
// });

//setip handlebars engine and views location
app.set("view engine", "hbs");
app.set("views", viewsPath);
hbs.registerPartials(partialsPath);

//setup static directory to serve
app.use(
  sessions({
    cookieName: "session",
    secret: "thisismynewcourse",
    expires: new Date(Date.now() + 10 * 1000),
    // duration: 3 * 60 * 1000, //3 minutes
  })
);
app.use(express.static(publicDirectoryPath));
app.use(express.json());
app.use(userRouter);
app.use(taskRouter);
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.get("", (req, res) => {
  res.render("login", {
    country: "India",
    holder: "IN",
  });
});

app.get("/registerationpage", (req, res) => {
  res.render("register", {});
});

app.get("/loginpage", (req, res) => {
  res.render("login", {});
});

app.get("/about", (req, res) => {
  res.render("about", { holder: "IN" });
});

app.get("*", (req, res) => {
  res.render("404", {
    holder: "IN",
    errorMessage: "page not found :(",
  });
});

app.listen(port, () => {
  console.log("server is active on http://localhost:" + port);
});
