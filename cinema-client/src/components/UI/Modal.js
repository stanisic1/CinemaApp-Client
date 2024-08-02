import React from "react";
import classes from "./Modal.module.css";

const Modal = ({ show, handleClose, children }) => {
  if (!show) {
    return null;
  }

  return (
    <div className={classes.modalBackdrop}>
      <div className={classes.modalContent}>
        {children}
        <button onClick={handleClose} className={classes.closeButton}>Close</button>
      </div>
    </div>
  );
};

export default Modal;
