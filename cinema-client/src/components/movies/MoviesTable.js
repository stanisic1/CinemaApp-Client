import classes from "./MoviesTable.module.css";
import { Link } from "react-router-dom";
import { useState, useEffect, useContext } from "react";
import AuthContext from "../../context/AuthContext";
import Button from "../UI/Button";
import LoadingSpinner from "../UI/LoadingSpinner";

const MoviesTable = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [movies, setMovies] = useState([]);
  const [filters, setFilters] = useState({
    titleFilter: "",
    genreFilter: "",
    distributorFilter: "",
    countryFilter: "",
    durationFrom: "",
    durationTo: "",
    yearFromFilter: "",
    yearToFilter: "",
  });
  const [sortOrder, setSortOrder] = useState("");
  const [formMovie, setFormMovie] = useState({
    id: null,
    title: "",
    director: "",
    actors: "",
    genre: "",
    duration: "",
    distributor: "",
    countryOrigin: "",
    releaseYear: "",
    description: "",
  });
  const { token, role } = useContext(AuthContext);

  useEffect(() => {
    fetchMovies();
  }, [filters, sortOrder]);

  const fetchMovies = async () => {
    const params = new URLSearchParams({ ...filters, sortOrder });

    try {
      const response = await fetch(
        `https://localhost:7044/api/movies?${params.toString()}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch movies");
      }

      const data = await response.json();

      const moviesArray = data.$values;

      const activeMovies = moviesArray.filter((movie) => !movie.isDeleted);

      setMovies(activeMovies);
      setError(null);
      setLoading(false);
    } catch (error) {
      setError(error.message);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prevFilters) => ({ ...prevFilters, [name]: value }));
  };

  const handleSortChange = (field) => {
    const order = sortOrder === field ? `${field}_desc` : field;
    setSortOrder(order);
  };

  const handleFormMovieChange = (e) => {
    const { name, value } = e.target;
    setFormMovie((prevMovie) => ({ ...prevMovie, [name]: value }));
  };

  const handleFormMovieSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      setError("Unauthorized: Admin token is missing.");
      return;
    }

    let movieData;
    if (formMovie.id) {
      movieData = {
        id: formMovie.id,
        title: formMovie.title,
        director: formMovie.director,
        actors: formMovie.actors,
        genre: formMovie.genre,
        duration: formMovie.duration,
        distributor: formMovie.distributor,
        countryOrigin: formMovie.countryOrigin,
        releaseYear: formMovie.releaseYear,
        description: formMovie.description,
      };
      await onEditMovie(formMovie.id, movieData);
    } else {
      movieData = {
        title: formMovie.title,
        director: formMovie.director,
        actors: formMovie.actors,
        genre: formMovie.genre,
        duration: formMovie.duration,
        distributor: formMovie.distributor,
        countryOrigin: formMovie.countryOrigin,
        releaseYear: formMovie.releaseYear,
        description: formMovie.description,
      };
      await onAddMovie(movieData);
    }

    fetchMovies();
    setFormMovie({
      id: null,
      title: "",
      director: "",
      actors: "",
      genre: "",
      duration: "",
      distributor: "",
      countryOrigin: "",
      releaseYear: "",
      description: "",
    });
    setError(null);
  };

  const onEditMovie = async (id, movieData) => {
    try {
      const response = await fetch(`https://localhost:7044/api/movies/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(movieData),
      });

      if (!response.ok) {
        throw new Error("Failed to edit movie");
      }
    } catch (error) {
      setError(error.message);
    }
  };

  const onAddMovie = async (movieData) => {
    try {
      const response = await fetch(`https://localhost:7044/api/movies`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(movieData),
      });

      if (!response.ok) {
        throw new Error("Failed to add movie");
      }
    } catch (error) {
      setError(error.message);
    }
  };

  const startEditingMovie = (movie) => {
    setFormMovie(movie);
  };

  const deleteMovie = async (id) => {
    try {
      const response = await fetch(`https://localhost:7044/api/movies/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete movie");
      }
      fetchMovies();
    } catch (error) {
      setError(error.message);
    }
  };

  if (loading) {
    return (
      <div className={classes.centered}>
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className={classes.container}>
      <h3>Filter</h3>
      <div className={classes["filter-container"]}>
        <input
          type="text"
          name="titleFilter"
          placeholder="Title"
          value={filters.titleFilter}
          onChange={handleFilterChange}
        />
        <input
          type="text"
          name="genreFilter"
          placeholder="Genre"
          value={filters.genreFilter}
          onChange={handleFilterChange}
        />
        <input
          type="text"
          name="distributorFilter"
          placeholder="Distributor"
          value={filters.distributorFilter}
          onChange={handleFilterChange}
        />
        <input
          type="text"
          name="countryFilter"
          placeholder="Country"
          value={filters.countryFilter}
          onChange={handleFilterChange}
        />
        <input
          type="number"
          name="durationFrom"
          placeholder="Duration From"
          value={filters.durationFrom}
          onChange={handleFilterChange}
        />
        <input
          type="number"
          name="durationTo"
          placeholder="Duration To"
          value={filters.durationTo}
          onChange={handleFilterChange}
        />
        <input
          type="number"
          name="yearFromFilter"
          placeholder="Year From"
          value={filters.yearFromFilter}
          onChange={handleFilterChange}
        />
        <input
          type="number"
          name="yearToFilter"
          placeholder="Year To"
          value={filters.yearToFilter}
          onChange={handleFilterChange}
        />
      </div>
      <div className={classes["sort-container"]}>
        <h3>Sort</h3>
        <button onClick={() => handleSortChange("title")}>Title</button>
        <button onClick={() => handleSortChange("genre")}>Genre</button>
        <button onClick={() => handleSortChange("duration")}>Duration</button>
        <button onClick={() => handleSortChange("distributor")}>
          Distributor
        </button>
        <button onClick={() => handleSortChange("country")}>Country</button>
        <button onClick={() => handleSortChange("year")}>Year</button>
      </div>
      {error && <div className={classes.error}>Error: {error}</div>}
      <h1>Movies</h1>
      <table className={classes["movies-table"]}>
        <thead>
          <tr>
            <th>Title</th>
            <th>Genre</th>
            <th>Duration</th>
            <th>Distributor</th>
            <th>Country</th>
            <th>Year</th>
            {token && role === "User" && <th>Projections</th>}
            {token && role === "Admin" && <th>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {movies.map((movie) => (
            <tr key={movie.id}>
              <td>
                <Link to={`/movies/${movie.id}`} className={classes.link}>
                  {movie.title}
                </Link>
              </td>
              <td>{movie.genre}</td>
              <td>{movie.duration}</td>
              <td>{movie.distributor}</td>
              <td>{movie.countryOrigin}</td>
              <td>{movie.releaseYear}</td>
              {token && role === "User" && (
                <td>
                  <Link
                    to={`/movies/projections/${movie.id}`}
                    className={classes.linkProjection}
                  >
                    See projections
                  </Link>
                </td>
              )}
              {token && role === "Admin" && (
                <td>
                  <Button onClick={() => startEditingMovie(movie)}>Edit</Button>
                  <Button onClick={() => deleteMovie(movie.id)}>Delete</Button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
      {token && role === "Admin" && (
        <form
          className={classes["new-movie-form"]}
          onSubmit={handleFormMovieSubmit}
        >
          <h3>{formMovie.id ? "Edit Movie" : "Add New Movie"}</h3>
          <input
            type="text"
            name="title"
            placeholder="Title"
            value={formMovie.title}
            onChange={handleFormMovieChange}
          />
          <input
            type="text"
            name="director"
            placeholder="Director"
            value={formMovie.director}
            onChange={handleFormMovieChange}
          />
          <input
            type="text"
            name="actors"
            placeholder="Actors"
            value={formMovie.actors}
            onChange={handleFormMovieChange}
          />
          <input
            type="text"
            name="genre"
            placeholder="Genre"
            value={formMovie.genre}
            onChange={handleFormMovieChange}
          />
          <input
            type="number"
            name="duration"
            placeholder="Duration"
            value={formMovie.duration}
            onChange={handleFormMovieChange}
          />
          <input
            type="text"
            name="distributor"
            placeholder="Distributor"
            value={formMovie.distributor}
            onChange={handleFormMovieChange}
          />
          <input
            type="text"
            name="countryOrigin"
            placeholder="Country"
            value={formMovie.countryOrigin}
            onChange={handleFormMovieChange}
          />
          <input
            type="number"
            name="releaseYear"
            placeholder="Year"
            value={formMovie.releaseYear}
            onChange={handleFormMovieChange}
          />
          <input
            type="text"
            name="description"
            placeholder="Description"
            value={formMovie.description}
            onChange={handleFormMovieChange}
          />
          <button type="submit">
            {formMovie.id ? "Update Movie" : "Add Movie"}
          </button>
        </form>
      )}
    </div>
  );
};

export default MoviesTable;
