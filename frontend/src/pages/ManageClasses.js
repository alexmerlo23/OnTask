import React, { useEffect, useState, useCallback } from "react";
import { useAuthContext } from "../hooks/useAuthContext";
import API_URL from "../config/api";
import './ManageClasses.css';

// ─── Shared sub-components ────────────────────────────────────────────────────

const StatusMessage = ({ error, success }) => (
  <>
    {error   && <p className="mc-msg mc-msg--error">{error}</p>}
    {success && <p className="mc-msg mc-msg--success">{success}</p>}
  </>
);

const ClassCard = ({ cls, onRemove, removeLabel = "Leave", onViewStats }) => (
  <div className="mc-card">
    <div className="mc-card__body">
      <span className="mc-card__name">{cls.classroomName}</span>
      <span className="mc-card__code">Code: <strong>{cls.code}</strong></span>
      {cls.teacherEmail && (
        <span className="mc-card__meta">Teacher: {cls.teacherEmail}</span>
      )}
    </div>
    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
      {onViewStats && (
        <button className="mc-btn mc-btn--primary" onClick={() => onViewStats(cls.code)}>
          View Stats
        </button>
      )}
      {onRemove && (
        <button className="mc-btn mc-btn--danger" onClick={() => onRemove(cls.code)}>
          {removeLabel}
        </button>
      )}
    </div>
  </div>
);

// ─── Progress bar ─────────────────────────────────────────────────────────────

const ProgressBar = ({ completed, total }) => {
  const pct = total === 0 ? 0 : Math.round((completed / total) * 100);
  return (
    <div className="mc-progress">
      <div className="mc-progress__bar" style={{ width: `${pct}%` }} />
      <span className="mc-progress__label">{completed}/{total} ({pct}%)</span>
    </div>
  );
};

// ─── Class stats modal ────────────────────────────────────────────────────────

const ClassStatsModal = ({ classCode, className, user, onClose }) => {
  const [stats,   setStats]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');
  const [tab,     setTab]     = useState('overview'); // 'overview' | 'events'

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API_URL}/api/completions/class-stats/${classCode}`, {
          headers: { Authorization: `Bearer ${user.token}` }
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || 'Failed to load stats');
        setStats(json);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [classCode, user]);

  return (
    <div className="modal-overlay">
      <div className="mc-stats-modal">
        <div className="mc-stats-modal__header">
          <h2 className="mc-stats-modal__title">📊 {className}</h2>
          <button className="mc-stats-modal__close" onClick={onClose}>✕</button>
        </div>

        {loading && <p className="mc-loading">Loading stats…</p>}
        {error   && <p className="mc-msg mc-msg--error">{error}</p>}

        {stats && (
          <>
            {/* ── Summary row ── */}
            <div className="mc-stats-summary">
              <div className="mc-stats-card">
                <span className="mc-stats-card__value">{stats.studentCount}</span>
                <span className="mc-stats-card__label">Students enrolled</span>
              </div>
              <div className="mc-stats-card">
                <span className="mc-stats-card__value">{stats.eventStats.length}</span>
                <span className="mc-stats-card__label">Total events</span>
              </div>
              <div className="mc-stats-card">
                <span className="mc-stats-card__value">
                  {stats.eventStats.length === 0 ? '—'
                    : Math.round(
                        stats.eventStats.reduce((sum, e) =>
                          sum + (e.totalStudents === 0 ? 0 : e.completedCount / e.totalStudents), 0)
                        / stats.eventStats.length * 100
                      ) + '%'}
                </span>
                <span className="mc-stats-card__label">Avg completion</span>
              </div>
            </div>

            {/* ── Tabs ── */}
            <div className="mc-tabs">
              <button className={`mc-tab ${tab === 'overview' ? 'mc-tab--active' : ''}`} onClick={() => setTab('overview')}>
                Events
              </button>
              <button className={`mc-tab ${tab === 'students' ? 'mc-tab--active' : ''}`} onClick={() => setTab('students')}>
                Students
              </button>
            </div>

            {/* ── Events tab ── */}
            {tab === 'overview' && (
              <div className="mc-stats-events">
                {stats.eventStats.length === 0 ? (
                  <p className="mc-empty">No events for this class yet.</p>
                ) : (
                  stats.eventStats.map(ev => (
                    <div key={ev.eventId} className="mc-event-row">
                      <div className="mc-event-row__top">
                        <span className="mc-event-row__name">{ev.eventName}</span>
                        <span className="mc-event-row__type">{ev.eventType}</span>
                        <span className="mc-event-row__date">
                          {new Date(ev.eventStart).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                      <ProgressBar completed={ev.completedCount} total={ev.totalStudents} />
                      {ev.pendingCount > 0 && (
                        <p className="mc-event-row__pending">
                          ⏳ {ev.pendingCount} student{ev.pendingCount !== 1 ? 's' : ''} yet to verify
                        </p>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}

            {/* ── Students tab ── */}
            {tab === 'students' && (
              <div className="mc-stats-students">
                {stats.students.length === 0 ? (
                  <p className="mc-empty">No students enrolled yet.</p>
                ) : (
                  <table className="mc-student-table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Verified</th>
                        <th>Pending</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.students.map(s => {
                        const verified = stats.eventStats.filter(ev =>
                          ev.completedBy.some(c => c.email === s.email)
                        ).length;
                        const pending = stats.eventStats.length - verified;
                        return (
                          <tr key={s.email}>
                            <td>{s.name || '—'}</td>
                            <td>{s.email}</td>
                            <td className="mc-cell--ok">{verified}</td>
                            <td className="mc-cell--warn">{pending}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

// ─── Teacher panel ─────────────────────────────────────────────────────────────

const TeacherPanel = ({ user, dispatch }) => {
  const [classes,       setClasses]       = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [classroomName, setClassroomName] = useState("");
  const [code,          setCode]          = useState("");
  const [error,         setError]         = useState(null);
  const [success,       setSuccess]       = useState("");
  const [statsModal,    setStatsModal]    = useState(null); // { code, name }

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
    setError(null); setSuccess("");
    try {
      const res = await fetch(`${API_URL}/api/classes`, {
        method:  "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${user.token}` },
        body:    JSON.stringify({ classroomName, code })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to create class");
      setClasses(prev => [...prev, json]);
      const newEntry    = { classroomName: json.classroomName, code: json.code };
      const updatedUser = { ...user, classes: [...(user.classes || []), newEntry] };
      dispatch({ type: "LOGIN", payload: updatedUser });
      sessionStorage.setItem("user", JSON.stringify(updatedUser));
      setSuccess(`Class "${json.classroomName}" created!`);
      setClassroomName(""); setCode("");
    } catch (err) { setError(err.message); }
  };

  const handleDelete = async (classCode) => {
    if (!window.confirm("Delete this class? This cannot be undone.")) return;
    setError(null); setSuccess("");
    try {
      const res = await fetch(`${API_URL}/api/classes/${classCode}`, {
        method:  "DELETE",
        headers: { Authorization: `Bearer ${user.token}` }
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to delete class");
      const updatedClasses = classes.filter(c => c.code !== classCode);
      setClasses(updatedClasses);
      const updatedUser = { ...user, classes: (user.classes || []).filter(c => c.code !== classCode) };
      dispatch({ type: "LOGIN", payload: updatedUser });
      sessionStorage.setItem("user", JSON.stringify(updatedUser));
      setSuccess("Class deleted.");
    } catch (err) { setError(err.message); }
  };

  return (
    <div className="mc-panel">
      <StatusMessage error={error} success={success} />

      <section className="mc-section">
        <h2 className="mc-section__title"><span className="mc-section__icon">📚</span> My Classes</h2>
        {loading ? (
          <div className="mc-loading">Loading classes…</div>
        ) : classes.length === 0 ? (
          <div className="mc-empty">You haven't created any classes yet. Use the form below to get started.</div>
        ) : (
          <div className="mc-list">
            {classes.map(cls => (
              <ClassCard
                key={cls.code}
                cls={cls}
                onRemove={handleDelete}
                removeLabel="Delete"
                onViewStats={(code) => setStatsModal({ code, name: cls.classroomName })}
              />
            ))}
          </div>
        )}
      </section>

      <section className="mc-section">
        <h2 className="mc-section__title"><span className="mc-section__icon">➕</span> Create a New Class</h2>
        <form className="mc-form" onSubmit={handleCreate}>
          <div className="mc-form__row">
            <label className="mc-form__label">
              Class Name
              <input className="mc-form__input" type="text" value={classroomName}
                onChange={e => setClassroomName(e.target.value)} placeholder="e.g. Period 3 Biology" required />
            </label>
            <label className="mc-form__label">
              Class Code
              <input className="mc-form__input" type="text" value={code}
                onChange={e => setCode(e.target.value)} placeholder="e.g. BIO-P3 (must be unique)" required />
            </label>
          </div>
          <button className="mc-btn mc-btn--primary" type="submit">Create Class</button>
        </form>
      </section>

      {statsModal && (
        <ClassStatsModal
          classCode={statsModal.code}
          className={statsModal.name}
          user={user}
          onClose={() => setStatsModal(null)}
        />
      )}
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
    setError(null); setSuccess("");
    try {
      const res = await fetch(`${API_URL}/api/user/join`, {
        method:  "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${user.token}` },
        body:    JSON.stringify({ code: codeInput.trim() })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to join class");
      setClasses(json.classes);
      syncContext(json.classes);
      setSuccess("Successfully joined the class!");
      setCodeInput("");
    } catch (err) { setError(err.message); }
  };

  const handleLeave = async (classCode) => {
    if (!window.confirm("Leave this class?")) return;
    setError(null); setSuccess("");
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
    } catch (err) { setError(err.message); }
  };

  return (
    <div className="mc-panel">
      <StatusMessage error={error} success={success} />

      <section className="mc-section">
        <h2 className="mc-section__title"><span className="mc-section__icon">📖</span> Enrolled Classes</h2>
        {classes.length === 0 ? (
          <div className="mc-empty">You haven't joined any classes yet. Enter a class code below to get started.</div>
        ) : (
          <div className="mc-list">
            {classes.map(cls => (
              <ClassCard key={cls.code} cls={cls} onRemove={handleLeave} removeLabel="Leave" />
            ))}
          </div>
        )}
      </section>

      <section className="mc-section">
        <h2 className="mc-section__title"><span className="mc-section__icon">🔑</span> Join a Class</h2>
        <form className="mc-form" onSubmit={handleJoin}>
          <div className="mc-form__row">
            <label className="mc-form__label">
              Class Code
              <input className="mc-form__input" type="text" value={codeInput}
                onChange={e => setCodeInput(e.target.value)} placeholder="Enter the code from your teacher" required />
            </label>
          </div>
          <button className="mc-btn mc-btn--primary" type="submit">Join Class</button>
        </form>
      </section>
    </div>
  );
};

// ─── Page shell ────────────────────────────────────────────────────────────────

const ManageClasses = () => {
  const { user, dispatch } = useAuthContext();
  if (!user) return <div className="mc-page"><p>Please log in to manage your classes.</p></div>;

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