import classes from "./App.module.css";
import image from "../src/components/assets/MovieTheater.webp";
import { Routes, Route } from "react-router-dom";
import MoviesTable from "./components/movies/MoviesTable";
import MovieDetail from "./components/movies/MovieDetail";
import MainNavigation from "./components/layout/MainNavigation";
import Registration from "./components/user/Registration";
import Login from "./components/user/Login";
import Logout from "./components/user/Logout";
import { AuthContextProvider } from "./context/AuthContext";
import ProjectionsTable from "./components/projections/ProjectionsTable";
import ProjectionDetail from "./components/projections/ProjectionDetail";
import MovieProjections from "./components/movies/MovieProjections";
import UserPage from "./components/user/UserPage";
import AdminPage from "./components/user/AdminPage";
import AdminToUserPage from "./components/user/AdminToUserPage";

function App() {
  return (
    <AuthContextProvider>
      <div className={classes["App-background"]}>
      <img src={image} alt="Background image" />
      <div className={classes.overlay}></div>
        <MainNavigation />
        <main>
          <Routes>
            <Route path="/" exact element={<ProjectionsTable />} />
            <Route
              path="projections/:projectionId"
              element={<ProjectionDetail />}
            />
            <Route
              path="movies/projections/:movieId"
              element={<MovieProjections />}
            />
            <Route path="/logout" element={<Logout />} />
            <Route path="/register" element={<Registration />} />
            <Route path="/login" element={<Login />} />
            <Route path="user" element={<UserPage />} />
            <Route path="admin" element={<AdminPage />} />
            <Route path="admin/:userId" element={<AdminToUserPage />} />
            <Route path="/movies" element={<MoviesTable />} />
            <Route path="movies/:movieId" element={<MovieDetail />} />
          </Routes>
        </main>
      </div>
    </AuthContextProvider>
  );
}

export default App;
