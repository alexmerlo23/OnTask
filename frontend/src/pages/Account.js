import React, { useEffect, useState } from 'react';
import { useAuthContext } from "../hooks/useAuthContext";

const Account = () => {
    const { user } = useAuthContext();
    const [classroomData, setClassroomData] = useState(null);
    const [loading, setLoading] = useState(true);

    // Fetch classroom data based on user email
    useEffect(() => {
        if (user && user.email) {
            const fetchClassroom = async () => {
                try {
                    const response = await fetch(`/api/classes/by-email?email=${user.email}`, {
                        method: 'GET',
                        headers: {
                            'Authorization': `Bearer ${user.token}`, // Use the token from the user context
                        }
                    });

                    const data = await response.json();
                    if (response.ok) {
                        setClassroomData(data); // Store classroom data if request is successful
                    } else {
                        console.log('No classroom found for this email');
                    }
                } catch (error) {
                    console.error('Error fetching classroom:', error);
                } finally {
                    setLoading(false);
                }
            };

            fetchClassroom();
        }
    }, [user]);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (!user) {
        return <div>Please log in to view your account details.</div>;
    }

    return (
        <div className="account">
            <h1>Account Info</h1>
            <p>Account Type: {user.role}</p>
            <p>Name: {user.name}</p>
            <p>Email: {user.email}</p>
            {classroomData && (
                <>
                    <p>Class Name: {classroomData.classroomName}</p>
                    <p>Class Code: {classroomData.code}</p>
                </>
            )}
            {!classroomData && <p>No classroom associated with this email.</p>}
        </div>
    );
};

export default Account;
