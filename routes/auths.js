var express = require("express");
var router = express.Router();
const { Users } = require("../model/users");
const userModel = new Users();

/* Register a user : POST /auths/register */
router.post("/register1", async function (req, res, next) {
  console.log("register1");
  // Send an error code '400 Bad request' if the body parameters are not valid
  if (
    !req.body ||
    (req.body.hasOwnProperty("username") && req.body.username.length === 0) ||
    (req.body.hasOwnProperty("password") && req.body.password.length === 0)
  ) return res.status(400).end();
  var bestScoreSingle = 0;
  if(req.body.hasOwnProperty("bestScoreSingle")) bestScoreSingle = req.body.bestScoreSingle;

  var bestScoreCoop = 0;
  if(req.body.hasOwnProperty("bestScoreCoop")) bestScoreCoop = req.body.bestScoreCoop;
  const authenticatedUser = await userModel.register(
    req.body.username,
    req.body.password, 
    bestScoreSingle,
    bestScoreCoop
  );
  console.log(authenticatedUser);
  // Error code '409 Conflict' if the username already exists
  if (!authenticatedUser) return res.status(409).end();

  // Create the session data (to be put into a cookie)
  req.session.username1 = authenticatedUser.username;
  req.session.token1 = authenticatedUser.token;

  return res.json({ 
    id: authenticatedUser.id,
    username: authenticatedUser.username,
    bestScoreSingle: authenticatedUser.bestScoreSingle,
    bestScoreCoop: authenticatedUser.bestScoreCoop,
    keyUp1: "Z",
    keyRight1: "D",
    keyDown1: "S",
    keyLeft1: "Q",
    keyUp2: "Z",
    keyRight2: "D",
    keyDown2: "S",
    keyLeft2: "Q",

  });
});

/* Register a user : POST /auths/register */
router.post("/register2", async function (req, res, next) {
  // Send an error code '400 Bad request' if the body parameters are not valid
  if (
    !req.body ||
    (req.body.hasOwnProperty("username") && req.body.username.length === 0) ||
    (req.body.hasOwnProperty("password") && req.body.password.length === 0)
  )
    return res.status(400).end();

  const authenticatedUser = await userModel.register(
    req.body.username,
    req.body.password
  );
  // Error code '409 Conflict' if the username already exists
  if (!authenticatedUser) return res.status(409).end();

  // Create the session data (to be put into a cookie)
  req.session.username2 = authenticatedUser.username;
  req.session.token2 = authenticatedUser.token;

  return res.json({ username: authenticatedUser.username });
});

/* login the first user : POST /auths/login1 */
router.post("/login1", async function (req, res, next) {
  // Send an error code '400 Bad request' if the body parameters are not valid
  if (
    !req.body ||
    (req.body.hasOwnProperty("username") && req.body.username.length === 0) ||
    (req.body.hasOwnProperty("password") && req.body.password.length === 0)
  )
    return res.status(400).end();

  const authenticatedUser = await userModel.login(
    req.body.username,
    req.body.password
  );
    console.log(authenticatedUser);
  // Error code '401 Unauthorized' if the user could not be authenticated
  if (!authenticatedUser) return res.status(401).end();

  // Create the session data (to be put into a cookie)
  //req.session.id = authenticatedUser.id;
  req.session.username1 = authenticatedUser.username;
  req.session.token1 = authenticatedUser.token;

  return res.json({
    id: authenticatedUser.id,
    username1: authenticatedUser.username,
    bestScoreSingle: authenticatedUser.bestScoreSingle,
    bestScoreCoop: authenticatedUser.bestScoreCoop, 
    keyUp1: authenticatedUser.keyUp1,
    keyRight1: authenticatedUser.keyRight1,
    keyDown1: authenticatedUser.keyDown1,
    keyLeft1: authenticatedUser.keyLeft1,
    keyUp2: authenticatedUser.keyUp2,
    keyRight2: authenticatedUser.keyRight2,
    keyDown2: authenticatedUser.keyDown2,
    keyLeft2: authenticatedUser.keyLeft2,
  });
});

/* login the second user : POST /auths/login2 */
router.post("/login2", async function (req, res, next) {
  // Send an error code '400 Bad request' if the body parameters are not valid
  if (
    !req.body ||
    (req.body.hasOwnProperty("username") && req.body.username.length === 0) ||
    (req.body.hasOwnProperty("password") && req.body.password.length === 0)
  )
    return res.status(400).end();

  const authenticatedUser = await userModel.login(
    req.body.username,
    req.body.password
  );
  // Error code '401 Unauthorized' if the user could not be authenticated
  if (!authenticatedUser) return res.status(401).end();

  // Create the session data (to be put into a cookie)
  req.session.username2 = authenticatedUser.username;
  req.session.token2 = authenticatedUser.token;

  return res.json({ username2: authenticatedUser.username });
});

/* Logout a/all user(s) : POST /auths/logout */
router.get("/logout", async function (req, res, next) {
  req.session = null;
  return res.status(200).end();
});


// GET /user/{id} : Get a user from its id in the menu
router.get("/user/:id", function (req, res) {
  console.log(`GET /auths/user/${req.params.id}`);

  const user = userModel.getOne(req.params.id);
  // Send an error code '404 Not Found' if the user was not found
  if (!user){
    console.log("not found");
    return res.status(404).end();
  }

  return res.json(user);
});

// PUT /user/{id} : update a user at id
// This shall be authorized only to connected users
router.put("/user/:id", function (req, res) {
  console.log(`PUT /auths/user/${req.params.id}`);

  const user = userModel.updateOne(req.params.id, req.body);
  // Send an error code 'Not Found' if the user was not found :
  if (!user) return res.status(404).end();
  return res.json(user);
});


module.exports = router;
