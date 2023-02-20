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
    (${directorId},${movieName},${leadActor})`;

  const dbResponse = await db.run(addMovieQuery);
  response.send("Movie Successfully Added");
});

app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const query = `
    SELECT * FROM movie WHERE movie_id is ${movieId}`;
  const movie = await db.get(query);
  response.send(movie);
});

module.exports = app;
