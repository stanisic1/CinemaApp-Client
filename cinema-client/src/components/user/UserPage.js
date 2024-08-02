import { useState, useEffect, useContext } from "react";
import AuthContext from "../../context/AuthContext";
import LoadingSpinner from "../UI/LoadingSpinner";
import classes from "./UserPage.module.css";

const UserPage = () => {
  const [tickets, setTickets] = useState([]);
  const [userInfo, setUserInfo] = useState(null);
  const [error, setError] = useState();
  const [loading, setLoading] = useState(true);
  const { token } = useContext(AuthContext);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [changePasswordError, setChangePasswordError] = useState();
  const [changePasswordSuccess, setChangePasswordSuccess] = useState();

  useEffect(() => {
    fetchUserTickets();
    fetchUserInfo();
  }, []);

  const fetchUserTickets = async () => {
    try {
      const response = await fetch(
        "https://localhost:7044/api/tickets/mytickets",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch tickets");
      }

      const data = await response.json();

      console.log("Tickets API response:", data);

      const ticketsArray = data.values.$values;

      if (Array.isArray(ticketsArray)) {
        setTickets(ticketsArray);
        setLoading(false);
      } else {
        throw new Error(
          "Unexpected response format: data.$values is not an array"
        );
      }
    } catch (error) {
      console.error("Error fetching tickets:", error);
      setError(error.message);
    }
  };

  const fetchUserInfo = async () => {
    try {
      const response = await fetch(
        "https://localhost:7044/api/authentication/userinfo",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch user info");
      }

      const data = await response.json();
      setUserInfo(data);
    } catch (error) {
      console.error("Error fetching user info:", error);
      setError(error.message);
    }
  };

  const handleChangePassword = async (event) => {
    event.preventDefault();

    try {
      const response = await fetch(
        "https://localhost:7044/api/authentication/change-password",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: userInfo.username,
            currentPassword: currentPassword,
            newPassword: newPassword,
          }),
        }
      );

      let data;
      if (!response.ok) {
        try {
          data = await response.json();
        } catch (err) {
          data = null;
        }
        throw new Error((data && data.message) || "Failed to change password");
      }

      setChangePasswordSuccess("Password changed successfully!");
      setChangePasswordError(null);
      setCurrentPassword("");
      setNewPassword("");
    } catch (error) {
      console.error("Error changing password:", error);
      setChangePasswordError(error.message);
      setChangePasswordSuccess(null);
    }
  };

  if (error) {
    return <div>Error: {error}</div>;
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
      <div className={classes.userInfoFormContainer}>
        {userInfo && (
          <div className={classes.userInfo}>
            <div className={classes.infoContainer}>
              <h3>User Info</h3>
            </div>
            <p>
              <strong>Username:</strong> {userInfo.username}
            </p>
            <p>
              <strong>Email:</strong> {userInfo.email}
            </p>
            <p>
              <strong>Role:</strong> {userInfo.role}
            </p>
          </div>
        )}

        <div className={classes.changePassword}>
          <form onSubmit={handleChangePassword}>
            <div className={classes.formControl}>
              <label htmlFor="currentPassword">Current Password</label>
              <input
                type="password"
                id="currentPassword"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />
            </div>
            <div className={classes.formControl}>
              <label htmlFor="newPassword">New Password</label>
              <input
                type="password"
                id="newPassword"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>
            {changePasswordError && (
              <div className={classes.error}>{changePasswordError}</div>
            )}
            {changePasswordSuccess && (
              <div className={classes.success}>{changePasswordSuccess}</div>
            )}
            <button type="submit" className={classes.button}>
              Change Password
            </button>
          </form>
        </div>
      </div>
      <div className={classes.headingContainer}>
        <h2>Bought Tickets</h2>
      </div>
      {tickets.length === 0 ? (
        <h3>User still hasn't bought any tickets!</h3>
      ) : (
        <table className={classes.table}>
          <thead>
            <tr>
              <th>Movie</th>
              <th>Date and Time</th>
              <th>Projection Type</th>
              <th>Theater</th>
              <th>Seat</th>
              <th>Ticket Price</th>
            </tr>
          </thead>
          <tbody>
            {tickets.map((ticket) => (
              <tr key={ticket.id}>
                <td>{ticket.projectionMovieTitle}</td>
                <td>{new Date(ticket.projectionDateTime).toLocaleString()}</td>
                <td>{ticket.projectionType}</td>
                <td>{ticket.theater}</td>
                <td>{ticket.seat}</td>
                <td>{ticket.price}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default UserPage;
