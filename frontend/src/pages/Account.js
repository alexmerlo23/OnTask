import React from "react";
import { useAuthContext } from "../hooks/useAuthContext";
import { Link } from "react-router-dom";
import './Account.css';

const Account = () => {
  const { user } = useAuthContext();

  if (!user) {
    return <div className="account">Please log in to view your account details.</div>;
  }

  return (
    <div className="account">
      <h1>Account Info</h1>
      <p><strong>Name:</strong> {user.name}</p>
      <p><strong>Email:</strong> {user.email}</p>
      <p><strong>Account Type:</strong> {user.role}</p>
      <p>
        <strong>Classes:</strong>{" "}
        {user.classes?.length > 0
          ? `${user.classes.length} class${user.classes.length !== 1 ? "es" : ""}`
          : "None yet"}
        {" — "}
        <Link to="/manage-classes" className="account__manage-link">
          Manage Classes
        </Link>
      </p>
    </div>
  );
};

export default Account;