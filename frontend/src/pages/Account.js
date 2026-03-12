import React, { useState } from "react";
import { useAuthContext } from "../hooks/useAuthContext";
import { Link } from "react-router-dom";
import API_URL from "../config/api";
import './Account.css';

// ── Parent Code section (students only) ──────────────────────────────────────
const ParentCodeSection = ({ user, dispatch }) => {
  const [editing,    setEditing]    = useState(false);
  const [codeInput,  setCodeInput]  = useState('');
  const [error,      setError]      = useState('');
  const [success,    setSuccess]    = useState('');
  const [isLoading,  setIsLoading]  = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/user/parent-code`, {
        method:  'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization:  `Bearer ${user.token}`
        },
        body: JSON.stringify({ parentCode: codeInput })
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to save parent code');

      // Persist updated user (with new parentCode) to session + context
      const updatedUser = { ...user, parentCode: json.parentCode };
      sessionStorage.setItem('user', JSON.stringify(updatedUser));
      dispatch({ type: 'LOGIN', payload: updatedUser });

      setSuccess('Parent code saved!');
      setEditing(false);
      setCodeInput('');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="account__parent-code">
      <p>
        <strong>Parent Code:</strong>{' '}
        {user.parentCode
          ? <span className="account__code-set">✅ Set (•••••)</span>
          : <span className="account__code-missing">⚠️ Not set yet</span>}
        {' '}
        <button className="account__link-btn" onClick={() => { setEditing(e => !e); setError(''); setSuccess(''); }}>
          {editing ? 'Cancel' : user.parentCode ? 'Change' : 'Set code'}
        </button>
      </p>

      {!user.parentCode && !editing && (
        <p className="account__hint">
          A parent code lets your parent or guardian verify that assignments have been completed.
          Set one so the ☑️ button works on your calendar.
        </p>
      )}

      {editing && (
        <form className="account__code-form" onSubmit={handleSave}>
          <input
            type="text"
            placeholder="Enter new parent code (min 4 chars)"
            value={codeInput}
            onChange={e => setCodeInput(e.target.value)}
            className="account__code-input"
            minLength={4}
            required
          />
          <button type="submit" className="account__save-btn" disabled={isLoading}>
            {isLoading ? 'Saving…' : 'Save'}
          </button>
          {error   && <p className="account__msg account__msg--error">{error}</p>}
          {success && <p className="account__msg account__msg--success">{success}</p>}
        </form>
      )}
    </div>
  );
};

// ── Page ─────────────────────────────────────────────────────────────────────
const Account = () => {
  const { user, dispatch } = useAuthContext();

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
        <strong>Classes:</strong>{' '}
        {user.classes?.length > 0
          ? `${user.classes.length} class${user.classes.length !== 1 ? 'es' : ''}`
          : 'None yet'}
        {' — '}
        <Link to="/manage-classes" className="account__manage-link">
          Manage Classes
        </Link>
      </p>

      {user.role === 'student' && (
        <ParentCodeSection user={user} dispatch={dispatch} />
      )}
    </div>
  );
};

export default Account;