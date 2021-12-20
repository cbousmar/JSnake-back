"use strict";
const { parse, serialize } = require("../utils/json");
var escape = require("escape-html");
const size = 10;

const jsonDbPath = __dirname + "/../data/bestscorescoop.json";

// Default pizza menu
const defaultScores = [
  {
    username1: "admin",
    username2: "zoe",
    score: 6,
  },
  {
    username1: "zoe",
    username2: "eliott",
    score: 5,
  },
  {
    username1: "eliott",
    username2: "admin",
    score: 4,
  },
];

class BestScoresCoop {
  constructor(dbPath = jsonDbPath, defaultItems = defaultScores) {
    this.jsonDbPath = dbPath;
    this.defaultBestScoresCoop = defaultItems;
  }

  /**
   * Returns all scores
   * @returns {Array} Array of scores
   */
  getAll() {
    const scores = parse(this.jsonDbPath, this.defaultBestScoresCoop);
    console.log(scores);
    return scores;
  }

  /**
   * Returns the scores identified by player's username
   * @param {string} username1 - username of the user to find
   * @param {string} username2 - username of the user to find
   * @returns {object} the score found or undefined if the id does not lead to a score
   */
  async getOne(username1, username2) {
    const scores = parse(this.jsonDbPath, this.defaultdefaultBestScoresCoopcores);
    var foundIndex = scores.findIndex((score) => score.username1 == username1 || score.username2 == username2);
    if (foundIndex < 0) {
      foundIndex = scores.findIndex((score) => score.username2 == username1 || score.username1 == username2);
      if (foundIndex < 0) return 0;
    }
    return scores[foundIndex];
  }

  /**
   * Add a score in the DB and returns the added score
   * @param {object} body - it contains all required data to create a score
   * @returns {object} the score that was created (with id)
   */

  async addOne(body) {
    var scores = parse(this.jsonDbPath, this.defaultBestScoresCoop);
   
    const newScore = {
      username1: escape(body.username1),
      username2: escape(body.username2),
      score: escape(body.score),
    };

    if(await this.getOne(newScore.username1, newScore.username2)){
      // the player is already in the table => we delete it
      this.deleteOne(newScore.username1, newScore.username2);
      scores = parse(this.jsonDbPath, this.defaultBestScoresCoop);
    }
    var j;
    var scoreAjoute = false;
    for(j = 0; j < scores.length; j++){
      if(newScore.score >= scores[j]){
        scores.splice(j, 0, newScore);
        scoreAjoute = true;
        break;
      } 
    }
    if(j<=10 && !scoreAjoute){
      scores.push(newScore);
    }
    if(scores.length === size && scoreAjoute) scores.pop;
    serialize(this.jsonDbPath, scores);
    return newScore;
  }

  /**
   * Delete a score in the DB and return the deleted score
   * @param {string} username1 - username of the first player
   * @param {string} username2 - username of the second player
   * @returns {object} the score that was deleted or undefined if the delete operation failed
   */
  async deleteOne(username1, username2) {
    const scores = parse(this.jsonDbPath, this.defaultBestScoresCoop);
    const foundIndex = scores.findIndex((score) => score.username1 == username1 && score.username2 == username2);
    if (foundIndex < 0) {
      foundIndex = scores.findIndex((score) => score.username2 == username1 || score.username1 == username2);
      if (foundIndex < 0) return 0;
    }
    const itemRemoved = scores.splice(foundIndex, 1);
    serialize(this.jsonDbPath, scores);

    return itemRemoved[0];
  }

  /**
   * Update a score a in the DB and return the updated score
   * @param {string} username1 - username of the first player
   * @param {string} unsername2 - username of the second player
   * @param {object} body - it contains all the data to be updated
   * @returns {object} the updated score or undefined if the update operation failed
   */
  updateOne(username1, username2, body) {
    const scores = parse(this.jsonDbPath, this.defaultBestScoresCoop);
    const foundIndex = scores.findIndex((score) => score.idPlayer1 == id && score.idPlayer2 == id);
    if (foundIndex < 0) {
      foundIndex = scores.findIndex((score) => score.username2 == username1 || score.username1 == username2);
      if (foundIndex < 0) return 0;
    }
    // create a new object based on the existing score - prior to modification -
    // and the properties requested to be updated (those in the body of the request)
    // use of the spread operator to create a shallow copy and repl
    const updatedScore = { ...scores[foundIndex], ...body };
    // replace the pizza found at index : (or use splice)
    scores[foundIndex] = updatedScore;

    serialize(this.jsonDbPath, scores);
    return updatedScore;
  }
}

module.exports = { BestScoresCoop };