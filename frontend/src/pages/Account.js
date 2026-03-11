import React, { useEffect, useState, useCallback } from "react";
import { useAuthContext } from "../hooks/useAuthContext";
import API_URL from "../config/api";

// ─── small reusable components ────────────────────────────────────────────────

const StatusMessage = ({ error, success }) => (
  <>
    {error   && <p className="msg msg--error">{error}</p>}
    {success && <p className="msg msg--success">{success}</p>}
  </>
);

const ClassCard = ({ cls, onRemove, removeLabel = "Leave" }) => (
  <div className="class-card">
    <div className="class-card__info">
      <strong>{cls.classroomName}</strong>
      <span className="class-card__code">Code: {cls.code}</span>
      {cls.teacherEmail && (
        <span className="class-card__meta">Teacher: {cls.teacherEmail}</span>
      )}
    </div>
    {onRemove && (
      <button
        className="btn btn--danger btn--sm"
        onClick={() => onRemove(cls.code)}
      >
        {removeLabel}
      </button>
    )}
  </div>
);

// ─── Teacher panel ─────────────────────────────────────────────────────────────

const TeacherPanel = ({ user, dispatch }) => {
  const [classes,       setClasses]       = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [classroomName, setClassroomName] = useState("");
  const [code,          setCode]          = useState("");
  const [error,         setError]         = useState(null);
  const [success,       setSuccess]       = useState("");

  // Fetch all classes this teacher owns
  const fetchClasses = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `${API_URL}/api/classes/by-email?email=${encodeURIComponent(user.email)}`,
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      if (!res.ok) throw new Error("Failed to load classes");
      const data = await res.json();
      setClasses(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { fetchClasses(); }, [fetchClasses]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess("");

    try {
      const res = await fetch(`${API_URL}/api/classes`, {
        method:  "POST",
        headers: {
          "Content-Type":  "application/json",
          Authorization:   `Bearer ${user.token}`
        },
        body: JSON.stringify({ classroomName, code })
      });
      const json = await res.json();

      if (!res.ok) throw new Error(json.error || "Failed to create class");

      // Update local list and sync user context
      const newEntry = { classroomName: json.classroomName, code: json.code };
      setClasses((prev) => [...prev, json]);

      const updatedUser = {
        ...user,
        classes: [...(user.classes || []), newEntry]
      };
      dispatch({ type: "LOGIN", payload: updatedUser });
      sessionStorage.setItem("user", JSON.stringify(updatedUser));

      setSuccess(`Class "${json.classroomName}" created!`);
      setClassroomName("");
      setCode("");
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (classCode) => {
    if (!window.confirm("Delete this class? This cannot be undone.")) return;
    setError(null);
    setSuccess("");

    try {
      const res = await fetch(`${API_URL}/api/classes/${classCode}`, {
        method:  "DELETE",
        headers: { Authorization: `Bearer ${user.token}` }
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to delete class");

      const updatedClasses = classes.filter((c) => c.code !== classCode);
      setClasses(updatedClasses);

      const updatedUser = {
        ...user,
        classes: (user.classes || []).filter((c) => c.code !== classCode)
      };
      dispatch({ type: "LOGIN", payload: updatedUser });
      sessionStorage.setItem("user", JSON.stringify(updatedUser));

      setSuccess("Class deleted.");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <section className="panel">
      <h2>My Classes</h2>
      <StatusMessage error={error} success={success} />

      {loading ? (
        <p>Loading classes…</p>
      ) : classes.length === 0 ? (
        <p className="empty-state">You haven't created any classes yet.</p>
      ) : (
        <div className="class-list">
          {classes.map((cls) => (
            <ClassCard
              key={cls.code}
              cls={cls}
              onRemove={handleDelete}
              removeLabel="Delete"
            />
          ))}
        </div>
      )}

      <h2>Create a New Class</h2>
      <form className="class-form" onSubmit={handleCreate}>
        <label>
          Class Name
          <input
            type="text"
            value={classroomName}
            onChange={(e) => setClassroomName(e.target.value)}
            placeholder="e.g. Period 3 Biology"
            required
          />
        </label>
        <label>
          Class Code
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="e.g. BIO-P3 (must be unique)"
            required
          />
        </label>
        <button className="btn btn--primary" type="submit">
          Create Class
        </button>
      </form>
    </section>
  );
};

// ─── Student panel ─────────────────────────────────────────────────────────────

const StudentPanel = ({ user, dispatch }) => {
  // Initialise from what's already in the auth context so the list is instant
  const [classes,   setClasses]   = useState(user.classes || []);
  const [codeInput, setCodeInput] = useState("");
  const [error,     setError]     = useState(null);
  const [success,   setSuccess]   = useState("");

  const syncContext = (updatedClasses) => {
    const updatedUser = { ...user, classes: updatedClasses };
    dispatch({ type: "LOGIN", payload: updatedUser });
    sessionStorage.setItem("user", JSON.stringify(updatedUser));
  };

  const handleJoin = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess("");

    try {
      const res = await fetch(`${API_URL}/api/user/join`, {
        method:  "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization:  `Bearer ${user.token}`
        },
        body: JSON.stringify({ code: codeInput.trim() })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to join class");

      setClasses(json.classes);
      syncContext(json.classes);
      setSuccess("Successfully joined the class!");
      setCodeInput("");
    } catch (err) {
      setError(err.message);
    }
  };

  const handleLeave = async (classCode) => {
    if (!window.confirm("Leave this class?")) return;
    setError(null);
    setSuccess("");

    try {
      const res = await fetch(`${API_URL}/api/user/leave/${classCode}`, {
        method:  "DELETE",
        headers: { Authorization: `Bearer ${user.token}` }
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to leave class");

      setClasses(json.classes);
      syncContext(json.classes);
      setSuccess("You have left the class.");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <section className="panel">
      <h2>My Classes</h2>
      <StatusMessage error={error} success={success} />

      {classes.length === 0 ? (
        <p className="empty-state">You haven't joined any classes yet.</p>
      ) : (
        <div className="class-list">
          {classes.map((cls) => (
            <ClassCard key={cls.code} cls={cls} onRemove={handleLeave} />
          ))}
        </div>
      )}

      <h2>Join a Class</h2>
      <form className="class-form" onSubmit={handleJoin}>
        <label>
          Class Code
          <input
            type="text"
            value={codeInput}
            onChange={(e) => setCodeInput(e.target.value)}
            placeholder="Enter the code from your teacher"
            required
          />
        </label>
        <button className="btn btn--primary" type="submit">
          Join Class
        </button>
      </form>
    </section>
  );
};

// ─── Main Account page ─────────────────────────────────────────────────────────

const Account = () => {
  const { user, dispatch } = useAuthContext();

  if (!user) {
    return <div className="account">Please log in to view your account.</div>;
  }

  return (
    <div className="account">
      <h1>Account</h1>
      <div className="account__info">
        <p><strong>Name:</strong>  {user.name}</p>
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>Role:</strong>  {user.role}</p>
      </div>

      {user.role === "teacher" && (
        <TeacherPanel user={user} dispatch={dispatch} />
      )}
      {user.role === "student" && (
        <StudentPanel user={user} dispatch={dispatch} />
      )}
    </div>
  );
};

export default Account;