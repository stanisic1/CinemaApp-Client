import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Card from "../UI/Card";
import Button from "../UI/Button";
import classes from "./Registration.module.css";

const Registration = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [role, setRole] = useState("");
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const clearFormHandler = () => {
    setUsername("");
    setEmail("");
    setPassword("");
    setPasswordConfirm("");
    setRole("");
  };

  const registerHandler = async (event) => {
    event.preventDefault();

    if (password !== passwordConfirm) {
      setError("Passwords do not match");
      return;
    }

    setError(null);
    setIsLoading(true);

    const userData = {
      username,
      email,
      password,
      role,
    };

    try {
      const response = await fetch(
        "https://localhost:7044/api/authentication/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(userData),
        }
      );

      if (!response.ok) {
        throw new Error("Registration failed!");
      }

      const data = await response.json();

      clearFormHandler();

      alert("Registration successful!");
      navigate("/login");
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  

  return (
    <Card className={classes.input}>
      <form onSubmit={registerHandler}>
        <h1>User registration</h1>
        {error && <p style={{ color: "red" }}>{error}</p>}
        <label htmlFor="username">Username</label>
        <input
          id="username"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <label htmlFor="email">E mail</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
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
        <label htmlFor="passwordConfirm">Confirm password</label>
        <input
          id="passwordConfirm"
          type="password"
          value={passwordConfirm}
          onChange={(e) => setPasswordConfirm(e.target.value)}
          required
        />
        <label htmlFor="role">Role</label>
        <input
          id="role"
          type="role"
          value={role}
          onChange={(e) => setRole(e.target.value)}
          
        />
        <Button type="button" onClick={clearFormHandler}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Registering..." : "Register"}
        </Button>
      </form>
    </Card>
  );
};

export default Registration;
