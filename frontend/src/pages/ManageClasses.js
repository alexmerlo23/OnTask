import React, { useEffect, useState, useCallback } from "react";
import { useAuthContext } from "../hooks/useAuthContext";
import API_URL from "../config/api";

// ─── Shared sub-components ────────────────────────────────────────────────────

const StatusMessage = ({ error, success }) => (
  <>
    {error   && <p className="mc-msg mc-msg--error">{error}</p>}
    {success && <p className="mc-msg mc-msg--success">{success}</p>}
  </>
);

const ClassCard = ({ cls, onRemove, removeLabel = "Leave" }) => (
  <div className="mc-card">
    <div className="mc-card__body">
      <span className="mc-card__name">{cls.classroomName}</span>
      <span className="mc-card__code">Code: <strong>{cls.code}</strong></span>
      {cls.teacherEmail && (
        <span className="mc-card__meta">Teacher: {cls.teacherEmail}</span>
      )}
    </div>
    {onRemove && (
      <button
        className="mc-btn mc-btn--danger"
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
          "Content-Type": "application/json",
          Authorization:  `Bearer ${user.token}`
        },
        body: JSON.stringify({ classroomName, code })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to create class");

      setClasses((prev) => [...prev, json]);

      const newEntry = { classroomName: json.classroomName, code: json.code };
      const updatedUser = { ...user, classes: [...(user.classes || []), newEntry] };
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
    <div className="mc-panel">
      <StatusMessage error={error} success={success} />

      <section className="mc-section">
        <h2 className="mc-section__title">
          <span className="mc-section__icon">📚</span> My Classes
        </h2>
        {loading ? (
          <div className="mc-loading">Loading classes…</div>
        ) : classes.length === 0 ? (
          <div className="mc-empty">You haven't created any classes yet. Use the form below to get started.</div>
        ) : (
          <div className="mc-list">
            {classes.map((cls) => (
              <ClassCard key={cls.code} cls={cls} onRemove={handleDelete} removeLabel="Delete" />
            ))}
          </div>
        )}
      </section>

      <section className="mc-section">
        <h2 className="mc-section__title">
          <span className="mc-section__icon">➕</span> Create a New Class
        </h2>
        <form className="mc-form" onSubmit={handleCreate}>
          <div className="mc-form__row">
            <label className="mc-form__label">
              Class Name
              <input
                className="mc-form__input"
                type="text"
                value={classroomName}
                onChange={(e) => setClassroomName(e.target.value)}
                placeholder="e.g. Period 3 Biology"
                required
              />
            </label>
            <label className="mc-form__label">
              Class Code
              <input
                className="mc-form__input"
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="e.g. BIO-P3 (must be unique)"
                required
              />
            </label>
          </div>
          <button className="mc-btn mc-btn--primary" type="submit">
            Create Class
          </button>
        </form>
      </section>
    </div>
  );
};

// ─── Student panel ─────────────────────────────────────────────────────────────

const StudentPanel = ({ user, dispatch }) => {
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
    <div className="mc-panel">
      <StatusMessage error={error} success={success} />

      <section className="mc-section">
        <h2 className="mc-section__title">
          <span className="mc-section__icon">📖</span> Enrolled Classes
        </h2>
        {classes.length === 0 ? (
          <div className="mc-empty">You haven't joined any classes yet. Enter a class code below to get started.</div>
        ) : (
          <div className="mc-list">
            {classes.map((cls) => (
              <ClassCard key={cls.code} cls={cls} onRemove={handleLeave} removeLabel="Leave" />
            ))}
          </div>
        )}
      </section>

      <section className="mc-section">
        <h2 className="mc-section__title">
          <span className="mc-section__icon">🔑</span> Join a Class
        </h2>
        <form className="mc-form" onSubmit={handleJoin}>
          <div className="mc-form__row">
            <label className="mc-form__label">
              Class Code
              <input
                className="mc-form__input"
                type="text"
                value={codeInput}
                onChange={(e) => setCodeInput(e.target.value)}
                placeholder="Enter the code from your teacher"
                required
              />
            </label>
          </div>
          <button className="mc-btn mc-btn--primary" type="submit">
            Join Class
          </button>
        </form>
      </section>
    </div>
  );
};

// ─── Page shell ────────────────────────────────────────────────────────────────

const ManageClasses = () => {
  const { user, dispatch } = useAuthContext();

  if (!user) {
    return (
      <div className="mc-page">
        <p>Please log in to manage your classes.</p>
      </div>
    );
  }

  return (
    <div className="mc-page">
      <div className="mc-header">
        <h1 className="mc-header__title">Manage Classes</h1>
        <p className="mc-header__sub">
          {user.role === "teacher"
            ? "Create and manage the classes you teach."
            : "Join and manage the classes you're enrolled in."}
        </p>
      </div>

      {user.role === "teacher" && <TeacherPanel user={user} dispatch={dispatch} />}
      {user.role === "student" && <StudentPanel user={user} dispatch={dispatch} />}
    </div>
  );
};

export default ManageClasses;