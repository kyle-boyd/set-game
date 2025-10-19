import React from "react";

export default function Modal({ show, onClose, onConfirm }) {
  if (!show) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2 className="modal-title">Start a new game?</h2>
        <p className="modal-text">
          This will reset your current game. Are you sure you want to continue?
        </p>
        <div className="modal-buttons">
          <button className="modal-btn cancel" onClick={onClose}>
            Cancel
          </button>
          <button className="modal-btn confirm" onClick={onConfirm}>
            Yes, start new game
          </button>
        </div>
      </div>
    </div>
  );
}