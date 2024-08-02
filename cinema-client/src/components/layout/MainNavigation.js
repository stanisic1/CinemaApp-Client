import { NavLink } from "react-router-dom";
import { useContext } from "react";
import classes from "./MainNavigation.module.css";
import AuthContext from "../../context/AuthContext";

const MainNavigation = () => {
  const authCtx = useContext(AuthContext)

  return (
    <div>
      <header className={classes.header}>
        <div>
          <NavLink
            to="/"
            className={({ isActive }) =>
              isActive ? `${classes.logo} ${classes.active}` : classes.logo
            }
          >
            Movies App
          </NavLink>
        </div>
        <nav className={classes.nav}>
          <ul>
            {!authCtx.token && (
              <>
                <li>
                  <NavLink
                    to="/register"
                    className={({ isActive }) =>
                      isActive ? classes.active : undefined
                    }
                  >
                    Register
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/login"
                    className={({ isActive }) =>
                      isActive ? classes.active : undefined
                    }
                  >
                    Login
                  </NavLink>
                </li>
              </>
            )}
            {authCtx.token && (
              <li>
                <NavLink
                  to="/logout"
                  className={({ isActive }) =>
                    isActive ? classes.active : undefined
                  }
                >
                  Logout
                </NavLink>
              </li>
            )}
             {authCtx.token && authCtx.role === "User" &&(
              <li>
                <NavLink
                  to="/user"
                  className={({ isActive }) =>
                    isActive ? classes.active : undefined
                  }
                >
                  User Page
                </NavLink>
              </li>
            )}
             {authCtx.token && authCtx.role === "Admin" &&(
              <li>
                <NavLink
                  to="/admin"
                  className={({ isActive }) =>
                    isActive ? classes.active : undefined
                  }
                >
                  Administrator Page
                </NavLink>
              </li>
            )}
            <li>
              <NavLink
                to="/movies"
                className={({ isActive }) =>
                  isActive ? classes.active : undefined
                }
              >
                Movies
              </NavLink>
            </li>
          </ul>
        </nav>
      </header>
    </div>
  );
};

export default MainNavigation;
