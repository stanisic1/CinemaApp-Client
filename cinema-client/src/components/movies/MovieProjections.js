import { useParams, Link } from "react-router-dom";
import { useState, useEffect, useContext } from "react";
import AuthContext from "../../context/AuthContext";
import classes from "./MovieProjections.module.css";
import LoadingSpinner from "../UI/LoadingSpinner";

const MovieProjections = () => {
  const { movieId } = useParams();
  const [projections, setProjections] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const { token } = useContext(AuthContext);

  useEffect(() => {
    fetchProjections();
  }, [movieId]);

  const fetchProjections = async () => {
    try {
      const response = await fetch(
        `https://localhost:7044/api/projections/movies/${movieId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch movie details");
      }

      const data = await response.json();
      const moviesArray = data.$values;

      setProjections(moviesArray);

      setLoading(false);
      setError(null);
    } catch (error) {
      setError(error.message);
    }
  };

  if (error) {
    return <div className={classes.error}>Error: {error}</div>;
  }

  if (loading) {
    return (
      <div className={classes.centered}>
        <LoadingSpinner />
      </div>
    );
  }

  if (projections.length === 0) {
    return <h3>There is no projections of this movie</h3>;
  }

  return (
    <div className={classes.container}>
      {projections.map((projection) => (
        <div key={projection.id} className={classes.projection}>
          <h2>{projection.movieTitle}</h2>
          <div>{projection.projectionType}</div>
          <div>{projection.theater}</div>
          <div>{new Date(projection.dateTime).toLocaleString()}</div>
          <p className={classes.price}>
            <strong>Price: </strong>
            {projection.price.toFixed(2)}
          </p>
          {new Date(projection.dateTime) > new Date() &&
            projection.unsoldTicketsCount > 0 && (
              <Link
                to={`/projections/${projection.id}`}
                className={classes.link}
              >
                Buy a Ticket
              </Link>
            )}
        </div>
      ))}
    </div>
  );
};

export default MovieProjections;
