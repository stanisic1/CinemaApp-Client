import { useState, useEffect, useContext } from "react";
import AuthContext from "../../context/AuthContext";
import { Link } from "react-router-dom";
import LoadingSpinner from "../UI/LoadingSpinner"; 
import classes from "./AdminPage.module.css";

const AdminPage = () => {
  const { token } = useContext(AuthContext);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [sortCriteria, setSortCriteria] = useState("");
  const [sortDirection, setSortDirection] = useState("asc");

  useEffect(() => {
    fetchUsers();
  }, [search, sortCriteria, sortDirection]);

  const fetchUsers = async () => {
    try {
      const queryParams = new URLSearchParams({
        username: search,
        sortBy: sortCriteria,
        sortDirection: sortDirection
      }).toString();

      const response = await fetch(
        `https://localhost:7044/api/authentication/all-users?${queryParams}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }

      const data = await response.json();
      const usersArray = data.$values;

      if (Array.isArray(usersArray)) {
        setUsers(usersArray);
      } else {
        throw new Error("Unexpected response format");
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
  };

  const handleSortChange = (e) => {
    setSortCriteria(e.target.value);
  };

  const handleSortDirectionChange = (e) => {
    setSortDirection(e.target.value);
  };

  const deleteUser = async (userId) => {
    try {
      const response = await fetch(
        `https://localhost:7044/api/authentication/delete-user/${userId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
  
      if (!response.ok) {
        const contentType = response.headers.get("content-type");
        let errorMessage = "Failed to delete user";
  
        if (contentType && contentType.includes("application/json")) {
          const data = await response.json();
          errorMessage = data.message || errorMessage;
        } else {
          const text = await response.text();
          errorMessage = text || errorMessage;
        }
  
        console.log("Error deleting", errorMessage);
        throw new Error(errorMessage);
      }
  
      await fetchUsers();
    } catch (error) {
      console.error("Error deleting user:", error);
      setError(error.message);
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
      <h2 className={classes.heading}>Users</h2>

      <div className={classes.controls}>
        <input
          type="text"
          placeholder="Search by username"
          value={search}
          onChange={handleSearchChange}
          className={classes.searchInput}
        />

        <select value={sortCriteria} onChange={handleSortChange} className={classes.dropdown}>
          <option value="">Sort By</option>
          <option value="username">Username</option>
          <option value="role">Role</option>
        </select>

        <select value={sortDirection} onChange={handleSortDirectionChange} className={classes.dropdown}>
          <option value="asc">Ascending</option>
          <option value="desc">Descending</option>
        </select>
      </div>

      <table className={classes.table}>
        <thead>
          <tr>
            <th>Username</th>
            <th>Email</th>
            <th>Role</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td><Link className={classes.link}to={`/admin/${user.id}`}>{user.username}</Link></td>
              <td>{user.email}</td>
              <td>{user.role}</td>
              <td>
                <button onClick={() => deleteUser(user.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminPage;
