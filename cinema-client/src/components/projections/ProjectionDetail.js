import { Link, useParams } from "react-router-dom";
import { useState, useEffect, useContext } from "react";
import Modal from "../UI/Modal";
import AuthContext from "../../context/AuthContext";
import classes from "./ProjectionDetail.module.css";
import LoadingSpinner from "../UI/LoadingSpinner";

const ProjectionDetail = () => {
  const { projectionId } = useParams();
  const [projection, setProjection] = useState(null);
  const [seats, setSeats] = useState([]);
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const { token } = useContext(AuthContext);

  useEffect(() => {
    fetchProjection();
    fetchSeats();
  }, [projectionId]);

  const fetchProjection = async () => {
    try {
      const response = await fetch(
        `https://localhost:7044/api/projections/${projectionId}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch movie details");
      }

      const data = await response.json();
      setProjection(data);
      setError(null);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchSeats = async () => {
    try {
      const response = await fetch(
        `https://localhost:7044/api/projections/${projectionId}/seats`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch seats");
      }

      const data = await response.json();
      const seatsArray = data.$values;
      setSeats(seatsArray);
      setError(null);
    } catch (error) {
      setError(error.message);
    }
  };

  const handleSeatSelect = (seatId) => {
    setSelectedSeat(seatId);
  };

  const handleBuyTicket = async () => {
    if (!selectedSeat) {
      setError("Please select a seat");
      return;
    }

    try {
      const body = JSON.stringify({
        projectionId: Number(projectionId),
        seatId: Number(selectedSeat),
      });

      const response = await fetch("https://localhost:7044/api/tickets/buy", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: body,
      });

      if (!response.ok) {
        const errorData = await response.json();
        const errorMessage = errorData.title || "Failed to buy ticket";
        const errorDetails = errorData.errors
          ? Object.values(errorData.errors).flat().join(", ")
          : "";
        console.error("Error data:", errorData);
        throw new Error(
          `${errorMessage}${errorDetails ? `: ${errorDetails}` : ""}`
        );
      }

      const data = await response.json();
      console.log("Ticket bought successfully:", data);

      setShowModal(true);
      setError(null);
    } catch (error) {
      setError(error.message);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
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

  return (
    <div className={classes.container}>
      <h1>
        <Link to={`/movies/${projection.movieId}`}>
          {projection.movieTitle}
        </Link>
      </h1>
      <div>{new Date(projection.dateTime).toLocaleString()}</div>
      <div>{projection.projectionType}</div>
      <div>{projection.theater}</div>
      <p className={classes.price}>
        <strong>Price: </strong>
        {projection.price}
      </p>

      <h2>Select a Seat in {seats.length > 0 ? seats[0].theater : ""}</h2>
      <div className={classes.seats}>
        {seats.map((seat) => (
          <button
            key={seat.id}
            className={`${classes.seat} ${
              selectedSeat === seat.id ? classes.selected : ""
            }`}
            onClick={() => handleSeatSelect(seat.id)}
            disabled={!seat.isAvailable}
          >
            {seat.number}
          </button>
        ))}
      </div>

      <button onClick={handleBuyTicket} disabled={!selectedSeat}>
        Buy Ticket
      </button>

      <Modal show={showModal} handleClose={handleCloseModal}>
        <h2>Ticket Bought Successfully</h2>
        <p>Projection: {projection.movieTitle}</p>
        <p>Date and Time: {new Date(projection.dateTime).toLocaleString()}</p>
        <p>Seat: {seats.find((seat) => seat.id === selectedSeat)?.number}</p>
        <p>Price: {projection.price}</p>
      </Modal>
    </div>
  );
};

export default ProjectionDetail;
