var express = require("express");
const { BestScoresCoop } = require("../model/bestScoresCoop");
const { authorizeFromCookie } = require("../utils/authorize");

var router = express.Router();
const bestScoresCoopModel = new BestScoresCoop();

// GET /bestScoresCoop : read all the bestScoresCoop
router.get("/bestscorescoop", function (req, res) {
  console.log("GET /bestscorescoop");
  return res.json(bestScoresCoopModel.getAll());
});

// GET /bestscorescoop/{username1}/{username2} : Get a bestScoresSingle from players' ids
router.get("/bestscorescoop/:username1/:username2", function (req, res) {
  console.log(`GET /bestscorescoop/${req.params.username1}/${req.params.username2}`);

  const bestScoreCoop = bestScoresCoopModel.getOneByIds(req.params.username1, req.params.username2);
  // Send an error code '404 Not Found' if the bestScoresCoop was not found
  if (!bestScoreCoop) return res.status(404).end();

  return res.json(bestScoreCoop);
});

// POST /bestscorescoop/ : Add the best score "score" for the players
router.post("/bestscorescoop/", function (req, res) {
  // Send an error code '400 Bad request' if the body parameters are not valid
  if (
    !req.body ||
    (req.body.hasOwnProperty("score") && req.body.score.length === 0) ||
    (req.body.hasOwnProperty("username1") && req.body.username1.length === 0) ||
    (req.body.hasOwnProperty("username2") && req.body.username2.length === 0)
  )
    return res.status(400).end();

  const score = bestScoresCoopModel.addOne(req.body);

  return res.json(score);
});


module.exports = router;