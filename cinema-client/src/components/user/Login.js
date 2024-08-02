import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import Card from "../UI/Card";
import Button from "../UI/Button";
import classes from "./Login.module.css";
import AuthContext from "../../context/AuthContext";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const authCtx = useContext(AuthContext);

  const clearFormHandler = () => {
    setUsername("");
    setPassword("");
  };

  const loginHandler = async (event) => {
    event.preventDefault();

    if (username.trim().length === 0 || password.trim().length === 0) {
      setError("Username and password cannot be empty!");
    }

    setIsLoading(true);

    const userData = {
      username,
      password,
    };

    try {
      const response = await fetch(
        "https://localhost:7044/api/authentication/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(userData),
        }
      );

      if (!response.ok) {
        throw new Error("Login failed!");
      }

      const data = await response.json();
      console.log(data);

      const { token, role, username } = data;

      authCtx.login(token, role, username);

      clearFormHandler();

      alert("Login successful!");

      navigate("/");
    } catch (error) {
      setError(error.message);
      clearFormHandler();
    } finally {
      setIsLoading(false);
    }
  };

 

  return (
    <Card className={classes.input}>
      <form onSubmit={loginHandler}>
        <h1>User login</h1>
        {error && <p style={{ color: "red" }}>{error}</p>}
        <label htmlFor="username">Username</label>
        <input
          id="username"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <Button type="button" onClick={clearFormHandler}>
          Clear Form
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Logging..." : "Log in"}
        </Button>
      </form>
    </Card>
  );
};

export default Login;
