var express = require("express");
var logger = require("morgan");
var cookieSession = require("cookie-session");

var authsRouter = require("./routes/auths");
var singleRouter = require("./routes/bestScoresSingle");
var coopRouter = require("./routes/bestScoresCoop");

var app = express();

let expiryDate = new Date(Date.now() + 60 * 60 * 1000); // 1h;
app.use(
  cookieSession({
    name: "user",
    keys: ["689HiHoveryDi79*"],
    cookie: {
      httpOnly: true,
      expires: expiryDate,
    },
  })
);

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use("/auths", authsRouter);
app.use("/single", singleRouter);
app.use("/coop", coopRouter);

module.exports = app;
