import { useState, useEffect, useContext } from "react";
import { useParams } from "react-router-dom";
import AuthContext from "../../context/AuthContext";
import classes from "./AdminToUserPage.module.css";
import LoadingSpinner from "../UI/LoadingSpinner";

const AdminToUserPage = () => {
  const { userId } = useParams();
  const { token } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState();
  const [tickets, setTickets] = useState([]);
  const [userInfo, setUserInfo] = useState(null);
  const [newRole, setNewRole] = useState("");

  useEffect(() => {
    fetchUserTickets();
    fetchUserInfo();
  }, [userId]);

  const fetchUserTickets = async () => {
    try {
      const response = await fetch(
        `https://localhost:7044/api/tickets/usertickets/${userId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      let data;
      if (!response.ok) {
        try {
          data = await response.json();
          console.log("Error Tickets API response:", data);
        } catch (err) {
          data = null;
        }
        throw new Error((data && data.message) || "Failed to fetch tickets");
      }

      data = await response.json();

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
      setLoading(false);
    }
  };

  const fetchUserInfo = async () => {
    try {
      const response = await fetch(
        `https://localhost:7044/api/authentication/userinfo/${userId}`,
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

  const updateUserRole = async () => {
    try {
      const normalizedRole = capitalizeRole(newRole);

      const response = await fetch(
        `https://localhost:7044/api/authentication/update-role`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: userInfo.username,
            role: normalizedRole,
          }),
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error((data && data.message) || "Failed to update user role");
      }

      const data = await response.json();
      console.log("Role update response:", data);
      setUserInfo((prevUserInfo) => ({
        ...prevUserInfo,
        role: normalizedRole,
      }));
      setNewRole("");
    } catch (error) {
      console.error("Error updating user role:", error);
      setError(error.message);
    }
  };

  const capitalizeRole = (role) => {
    const normalizedRole = role.trim().toLowerCase();
    if (normalizedRole === "user" || normalizedRole === "admin") {
      return normalizedRole.charAt(0).toUpperCase() + normalizedRole.slice(1);
    }
    return "";
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
      <div className={classes.userInfo}>
        {userInfo && (
          <div className={classes.infoContainer}>
            <h3>User Info</h3>
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
        <div className={classes.roleForm}>
          <h3>Update Role</h3>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const normalizedRole = capitalizeRole(newRole);
              if (normalizedRole) {
                updateUserRole();
              } else {
                alert("Invalid role. Only 'User' or 'Admin' are allowed.");
              }
            }}
          >
            <label>
              New Role (User/Admin):
              <input
                type="text"
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
              />
            </label>
            <button type="submit">Update Role</button>
          </form>
        </div>
      </div>
      <div className={classes.headingContainer}>
        <h2>User's bought tickets</h2>
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

export default AdminToUserPage;
