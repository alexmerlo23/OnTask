import React, { useEffect, useState } from "react";
import { useAuthContext } from "../hooks/useAuthContext";
import API_URL from "../config/api";

const Account = () => {
  const { user, dispatch } = useAuthContext();
  const [classroomData, setClassroomData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [teacherCode, setTeacherCode] = useState("");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState("");

  // Fetch classroom data for teacher or student
  useEffect(() => {
    if (user) {
      const fetchClassroom = async () => {
        try {
          let endpoint = "";
          if (user.role === "teacher") {
            endpoint = `${API_URL}/api/classes/by-email?email=${user.email}`;
          } else if (user.role === "student" && user.code) {
            endpoint = `${API_URL}/api/classes/by-code/${user.code}`;
          }
  
          if (endpoint) {
            console.log("Fetching data from endpoint:", endpoint);
            const response = await fetch(endpoint, {
              method: "GET",
              headers: {
                Authorization: `Bearer ${user.token}`,
              },
            });
  
            if (!response.ok) {
              throw new Error(`Failed to fetch classroom: ${response.status} ${response.statusText}`);
            }
  
            const contentType = response.headers.get("Content-Type");
            if (contentType && contentType.includes("application/json")) {
              const data = await response.json();
              console.log("Fetched data:", data);
              setClassroomData(data);
            } else {
              const errorText = await response.text();
              throw new Error(`Unexpected response format: ${errorText}`);
            }
          }
        } catch (error) {
          console.error("Error fetching classroom:", error);
          setError(error.message);
        } finally {
          setLoading(false);
        }
      };
  
      fetchClassroom();
    }
  }, [user]);
  
  // Handle teacher code input submission for students
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess("");
    setLoading(true);

    // verify user
    if (!user) {
      setError("User is not logged in");
      setLoading(false);
      return;
    }

    try {
      // patch the user code with absolute URL
      const response = await fetch(`${API_URL}/api/user`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({
          email: user.email,
          newCode: teacherCode,
        }),
      });

      const json = await response.json();

      if (!response.ok) {
        throw new Error(json.error || "Failed to join the class.");
      }

      // Update user context and local storage
      const updatedUser = { ...user, code: teacherCode };
      dispatch({ type: "LOGIN", payload: updatedUser });
      localStorage.setItem("user", JSON.stringify(updatedUser));

      setClassroomData(json);
      setSuccess("Successfully joined the class!");
    } catch (err) {
      console.error("Error joining class:", err);
      setError(err.message || "An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
    window.location.reload();
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <div>Please log in to view your account details.</div>;
  }

  // account page
  return (
    <div className="account">
      <h1>Account Info</h1>
      <p>Account Type: {user.role}</p>
      <p>Name: {user.name}</p>
      <p>Email: {user.email}</p>
      
      {user.role === "teacher" && (
        <>
          {classroomData ? (
            <>
              <p>Class Name: {classroomData.classroomName}</p>
              <p>Class Code: {classroomData.code}</p>
            </>
          ) : (
            <p>No classroom associated with this email.</p>
          )}
        </>
      )}

      {user.role === "student" && (
        <>
          {!classroomData && (
            <form onSubmit={handleSubmit}>
              <label>
                Enter Teacher's Code:
                <input
                  type="text"
                  value={teacherCode}
                  onChange={(e) => setTeacherCode(e.target.value)}
                  required
                />
              </label>
              <button type="submit">Submit</button>
            </form>
          )}
          {error && <p style={{ color: "red" }}>{error}</p>}
          {success && <p style={{ color: "green" }}>{success}</p>}
          {classroomData ? (
            <>
              <p>Class Name: {classroomData.classroomName}</p>
              <p>Class Code: {classroomData.code}</p>
              <p>Teacher's Email: {classroomData.email}</p>
            </>
          ) : (
            <p>No classroom associated yet.</p>
          )}
        </>
      )}
    </div>
  );
};

export default Account;