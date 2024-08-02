import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import classes from "./MovieDetail.module.css";
import LoadingSpinner from "../UI/LoadingSpinner";

const MovieDetail = () => {
  const { movieId } = useParams();
  const [movie, setMovie] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchMovie();
  }, [movieId]);

  const fetchMovie = async () => {
    try {
      const response = await fetch(
        `https://localhost:7044/api/movies/${movieId}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch movie details");
      }

      const data = await response.json();

      setMovie(data);
      setError(null);
    } catch (error) {
      setError(error.message);
    }
  };

  if (error) {
    return <div className={classes.error}>Error: {error}</div>;
  }

  if (!movie) {
    return (
      <div className={classes.centered}>
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className={classes.container}>
      <h1>{movie.title}</h1>
      <p>
        <strong>Director:</strong> {movie.director}
      </p>
      <p>
        <strong>Actors:</strong> {movie.actors}
      </p>
      <p>
        <strong>Genre:</strong> {movie.genre}
      </p>
      <p>
        <strong>Duration:</strong> {movie.duration}
      </p>
      <p>
        <strong>Distributor:</strong> {movie.distributor}
      </p>
      <p>
        <strong>Country:</strong> {movie.countryOrigin}
      </p>
      <p>
        <strong>Year:</strong> {movie.releaseYear}
      </p>
      <p>
        <strong>Description:</strong> {movie.description}
      </p>
      <div></div>
    </div>
  );
};

export default MovieDetail;
