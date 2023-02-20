const express = require("express");
const path = require("path");

const app = express();
app.use(express.json());
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const dbPath = path.join(__dirname, "moviesData.db");

let db = null;

const initializeDb = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("server running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error ${e.message}`);
    process.exit(1);
  }
};

initializeDb();

const convertDbObjectToResponseObject = (dbObject) => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  };
};

//Get all rows

app.get("/movies/", async (request, response) => {
  const getMovieNamesQuery = `
 SELECT
 movie_name
 FROM
 movie;`;
  const moviesArray = await db.all(getMovieNamesQuery);
  response.send(moviesArray);
});

app.post("/movies/", async (requst, response) => {
  const movieDetails = requst.body;
  const { directorId, movieName, leadActor } = movieDetails;
  const addMovieQuery = `
    INSERT INTO movie (director_id,movie_name,lead_actor) 
    VALUES 
    (${directorId},'${movieName}','${leadActor}')`;

  const dbResponse = await db.run(addMovieQuery);
  response.send("Movie Successfully Added");
});

app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const query = `
    SELECT * FROM movie WHERE movie_id = ${movieId}`;
  const result = await db.get(query);
  response.send(result);
});

app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;
  const query = `UPDATE movie
    SET 
    director_id = ${directorId},
    movie_name = '${movieName}',
    lead_actor = '${leadActor}'
    WHERE 
    movie_id = ${movieId}`;
  const result = db.run(query);
  response.send("Movie Details Updated");
});

app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const query = `DELETE FROM movie WHERE
    movie_id = ${movieId}`;
  const result = await db.run(query);
  response.send("Movie Removed");
});

app.get("/directors/", async (request, response) => {
  const getMovieNamesQuery = `
 SELECT
 *
 FROM
 director;`;
  const moviesArray = await db.all(getMovieNamesQuery);
  response.send(moviesArray);
});

app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const query = `
    SELECT movie_name FROM movie WHERE director_id = ${directorId}`;
  const result = await db.all(query);
  response.send(result);
});

module.exports = app;
