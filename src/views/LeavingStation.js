import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const LeavingStation = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/login");
    }, 3000); // Redirect after 3 seconds

    return () => clearTimeout(timer); // Clear the timer if the component is unmounted
  }, [navigate]);

  return <div>Leaving the Station. We hope to see you again soon!</div>;
};


export default LeavingStation;