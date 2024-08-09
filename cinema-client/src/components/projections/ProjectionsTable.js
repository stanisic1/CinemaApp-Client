import React, { useEffect, useState, useContext } from "react";
import classes from "./ProjectionsTable.module.css";
import AuthContext from "../../context/AuthContext";
import { Link } from "react-router-dom";
import LoadingSpinner from "../UI/LoadingSpinner";
import flatpickr from "flatpickr";
import "flatpickr/dist/flatpickr.min.css";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const ProjectionsTable = () => {
  const [projections, setProjections] = useState([]);
  const [projectionTypes, setProjectionTypes] = useState([]);
  const [movies, setMovies] = useState([]);
  const [theaters, setTheaters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletionMessage, setDeletionMessage] = useState(null);
  const [filters, setFilters] = useState({
    movieTitle: "",
    dateFrom: "",
    dateTo: "",
    projectionTypeId: "",
    theaterId: "",
    priceFrom: "",
    priceTo: "",
    sortBy: "",
    sortDescending: false,
  });
  const [formProjection, setFormProjection] = useState({
    movieId: "",
    projectionTypeId: "",
    theaterId: "",
    dateTime: "",
    price: "",
  });
  const { token, role } = useContext(AuthContext);

  const [currentPage, setCurrentPage] = useState(1);
  const projectionsPerPage = 3;

  useEffect(() => {
    fetchProjections();
  }, [filters]);

  useEffect(() => {
    fetchProjections();
    fetchProjectionTypes();
    fetchTheaters();
    fetchMovies();
  }, []);

  useEffect(() => {
    flatpickr("#dateFromInput", {
      dateFormat: "Y-m-d",
      onChange: (selectedDates, dateStr) => {
        setFilters((prev) => ({ ...prev, dateFrom: dateStr }));
      },
    });

    flatpickr("#dateToInput", {
      dateFormat: "Y-m-d",
      onChange: (selectedDates, dateStr) => {
        setFilters((prev) => ({ ...prev, dateTo: dateStr }));
      },
    });
  }, []);

  const fetchProjections = async () => {
    const params = new URLSearchParams(filters);
    try {
      const response = await fetch(
        `https://localhost:7044/api/projections?${params.toString()}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch projections");
      }
      const data = await response.json();
      const projectionsArray = data.$values;
      const activeProjections = projectionsArray.filter(
        (projection) => !projection.isDeleted
      );
      setProjections(activeProjections);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchProjectionTypes = async () => {
    try {
      const response = await fetch(
        "https://localhost:7044/api/projectiontypes"
      );
      const data = await response.json();
      const projectionTypesArray = data.$values;
      setProjectionTypes(projectionTypesArray);
    } catch (error) {
      console.error("Failed to fetch projection types:", error);
    }
  };

  const fetchTheaters = async () => {
    try {
      const response = await fetch("https://localhost:7044/api/theaters");
      const data = await response.json();
      const theatersArray = data.$values;
      setTheaters(theatersArray);
    } catch (error) {
      console.error("Failed to fetch theaters:", error);
    }
  };

  const fetchMovies = async () => {
    try {
      const response = await fetch("https://localhost:7044/api/movies");

      if (!response.ok) {
        throw new Error("Failed to fetch movies");
      }

      const data = await response.json();
      const moviesArray = data.$values;

      const activeMovies = moviesArray.filter((movie) => !movie.isDeleted);

      setMovies(activeMovies);
      setError(null);
    } catch (error) {
      setError(error.message);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleSortChange = (field) => {
    console.log(field);
    setFilters((prev) => ({
      ...prev,
      sortBy: field,
      sortDescending: prev.sortBy === field ? !prev.sortDescending : false,
    }));
  };

  if (loading) {
    return (
      <div className={classes.centered}>
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  const handleDateChange = (date) => {
    setFormProjection((prev) => ({ ...prev, dateTime: date }));
  };

  const handleFormProjectionChange = (e) => {
    const { name, value } = e.target;
    setFormProjection((prev) => ({ ...prev, [name]: value }));
  };

  const handleFormProjectionSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      setError("Unauthorized: Admin token is missing.");
      return;
    }

    let projectionData = {
      movieId: formProjection.movieId,
      projectionTypeId: formProjection.projectionTypeId,
      theaterId: formProjection.theaterId,
      dateTime: formProjection.dateTime.toISOString(),
      price: formProjection.price,
    };
    await onAddProjection(projectionData);

    fetchProjections();
    setFormProjection({
      movieId: "",
      projectionTypeId: "",
      theaterId: "",
      dateTime: "",
      price: "",
    });
    setError(null);
  };

  const onAddProjection = async (projectionData) => {
    try {
      const response = await fetch("https://localhost:7044/api/projections", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(projectionData),
      });

      if (!response.ok) {
        const errorData = await response.json();

        throw new Error(
          `Failed to add projection: ${
            errorData.Message
          }\n${errorData.Errors.join(", ")}`
        );
      }
    } catch (error) {
      setError(error.message);
    }
  };

  const deleteProjection = async (id) => {
    try {
      const response = await fetch(
        `https://localhost:7044/api/projections/${id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete projection");
      }

      const result = await response.json();

      setDeletionMessage(result.message);
      fetchProjections();
    } catch (error) {
      setError(error.message);
    }
  };

  const clearDeletionMessage = () => {
    setDeletionMessage(null);
  };

  const indexOfLastProjection = currentPage * projectionsPerPage;
  const indexOfFirstProjection = indexOfLastProjection - projectionsPerPage;
  const currentProjections = projections.slice(
    indexOfFirstProjection,
    indexOfLastProjection
  );

  const pageNumbers = [];
  for (
    let i = 1;
    i <= Math.ceil(projections.length / projectionsPerPage);
    i++
  ) {
    pageNumbers.push(i);
  }

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div className={classes.container}>
      {deletionMessage && (
        <div className={`${classes.message} ${classes.success}`}>
          <button
            className={classes.closeButton}
            onClick={clearDeletionMessage}
          >
            &times;
          </button>
          {deletionMessage}
        </div>
      )}
      <div className={classes.filterSortContainer}>
        <div className={classes.filterContainer}>
          <h3>Filter Projections</h3>
          <div className={classes.inlineFilters}>
            <input
              type="text"
              name="movieTitle"
              placeholder="Movie Title"
              className={classes.input}
              onChange={handleFilterChange}
            />
            <input
              type="date"
              name="dateFrom"
              placeholder="Date From"
              id="dateFromInput"
              className={`${classes.input} ${classes.flatpickrInput}`}
              onChange={handleFilterChange}
            />
            <input
              type="date"
              name="dateTo"
              placeholder="Date To"
              id="dateToInput"
              className={`${classes.input} ${classes.flatpickrInput}`}
              onChange={handleFilterChange}
            />
            <select
              name="projectionTypeId"
              className={classes.input}
              onChange={handleFilterChange}
              value={filters.projectionTypeId}
            >
              <option value="" disabled>
                Select Projection Type
              </option>
              {projectionTypes.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.type}
                </option>
              ))}
            </select>
            <select
              name="theaterId"
              className={classes.input}
              onChange={handleFilterChange}
              value={filters.theaterId}
            >
              <option value="" disabled>
                Select Theater
              </option>
              {theaters.map((theater) => (
                <option key={theater.id} value={theater.id}>
                  {theater.type}
                </option>
              ))}
            </select>
            <input
              type="number"
              name="priceFrom"
              placeholder="Price From"
              className={classes.input}
              onChange={handleFilterChange}
            />
            <input
              type="number"
              name="priceTo"
              placeholder="Price To"
              className={classes.input}
              onChange={handleFilterChange}
            />
          </div>
        </div>
        <div className={classes.sortContainer}>
          <h3>Sort Projections</h3>
          <select
            name="sortBy"
            value={filters.sortBy}
            onChange={(e) => handleSortChange(e.target.value)}
            className={classes.input}
          >
            <option value="" disabled>
              Sort By
            </option>
            <option value="date">Date</option>
            <option value="price">Price</option>
            <option value="title">Title</option>
          </select>
          <div className={classes.sortDirection}>
            <label>
              <input
                type="checkbox"
                name="sortDescending"
                checked={filters.sortDescending}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    sortDescending: e.target.checked,
                  }))
                }
              />
              Descending
            </label>
          </div>
        </div>
      </div>
      <div className={classes.heading}>
        <h1>Projections</h1>
      </div>
      <div className={classes.tableContainer}>
        <table className={classes.table}>
          <thead>
            <tr className={classes.tr}>
              <th className={classes.th}>Movie Title</th>
              <th className={classes.th}>Projection Type</th>
              <th className={classes.th}>Theater</th>
              <th className={classes.th}>Date and Time</th>
              <th className={classes.th}>Price</th>
              <th className={classes.th}>Tickets Left</th>
              {token && (role === "Admin" || role === "User") && (
                <th className={classes.thAction}>Action</th>
              )}
            </tr>
          </thead>
          <tbody>
            {currentProjections.map((projection) => (
              <tr key={projection.id} className={classes.tr}>
                <td className={classes.td}>
                  <Link
                    to={`/movies/${projection.movieId}`}
                    className={classes.link}
                  >
                    {projection.movieTitle}
                  </Link>
                </td>
                <td className={classes.td}>{projection.projectionType}</td>
                <td className={classes.td}>{projection.theater}</td>
                <td className={classes.td}>
                  {new Date(projection.dateTime).toLocaleString()}
                </td>
                <td className={classes.td}>{projection.price.toFixed(2)}</td>
                <td className={classes.td}>{projection.unsoldTicketsCount}</td>

                {token && role === "Admin" && (
                  <td className={classes.td}>
                    <button
                      className={classes.buttonDelete}
                      onClick={() => deleteProjection(projection.id)}
                    >
                      Delete
                    </button>
                  </td>
                )}
                {token && role === "User" && (
                  <td className={classes.td}>
                    {new Date(projection.dateTime) < new Date() ? (
                      <span>Projection has ended</span>
                    ) : projection.unsoldTicketsCount === 0 ? (
                      <span>No tickets available</span>
                    ) : (
                      <Link
                        to={`/projections/${projection.id}`}
                        className={classes.link}
                      >
                        Buy a Ticket
                      </Link>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className={classes.pagination}>
        {pageNumbers.map((number) => (
          <button
            key={number}
            onClick={() => handlePageChange(number)}
            className={currentPage === number ? classes.activePage : ""}
          >
            {number}
          </button>
        ))}
      </div>
      {token && role === "Admin" && (
        <form
          onSubmit={handleFormProjectionSubmit}
          className={classes.formContainer}
        >
          <h3 className={classes.formTitle}>Add Projection</h3>
          <select
            name="movieId"
            onChange={handleFormProjectionChange}
            value={formProjection.movieId}
            className={classes.formSelect}
          >
            <option value="" disabled>
              Select Movie
            </option>
            {movies.map((movie) => (
              <option key={movie.id} value={movie.id}>
                {movie.title}
              </option>
            ))}
          </select>
          <select
            name="projectionTypeId"
            onChange={handleFormProjectionChange}
            value={formProjection.projectionTypeId}
            className={classes.formSelect}
          >
            <option value="" disabled>
              Select Projection Type
            </option>
            {projectionTypes.map((projectionType) => (
              <option key={projectionType.id} value={projectionType.id}>
                {projectionType.type}
              </option>
            ))}
          </select>
          <select
            name="theaterId"
            value={formProjection.theaterId}
            onChange={handleFormProjectionChange}
            className={classes.formSelect}
          >
            <option value="" disabled>
              Select Theater
            </option>
            {theaters.map((theater) => (
              <option key={theater.id} value={theater.id}>
                {theater.type}
              </option>
            ))}
          </select>
          <DatePicker
            showTimeSelect
            dateFormat="Pp"
            placeholderText="Select Date and Time"
            selected={formProjection.dateTime}
            onChange={handleDateChange}
            className={classes.datePicker}
          />
          <input
            type="number"
            name="price"
            placeholder="Price"
            value={formProjection.price}
            onChange={handleFormProjectionChange}
            className={classes.formInput}
          />

          <button type="submit" className={classes.formButton}>
            Add Projection
          </button>
        </form>
      )}
    </div>
  );
};

export default ProjectionsTable;
