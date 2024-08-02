import { useNavigate } from "react-router-dom";
import { useContext, useEffect } from "react";
import AuthContext from "../../context/AuthContext";

const Logout = () => {
  const authCtx = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    authCtx.logout();
    navigate("/");
  }, [navigate, authCtx]);

  return null;
};

export default Logout;
