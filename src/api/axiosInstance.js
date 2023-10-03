import Axios from 'axios';
import { useNavigate } from 'react-router-dom';

// Notice the removal of manual setting of the token.
// Instead, we can handle this in the request interceptor.

const instance = Axios.create({
    baseURL: 'http://localhost:8080', //I want to replace this
    withCredentials: true
});

// axiosInstance.js
instance.interceptors.response.use(
    response => response,
    async error => {
        const originalRequest = error.config;
        const navigate = useNavigate();

        // If error response code is 401 Unauthorized & hasn't retried
        if (error.response.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const { data } = await instance.post('/renew_access', {
                    refresh_token: document.cookie // Assuming the refresh token is in the cookie
                });

                // Update the instance header
                instance.defaults.headers['Authorization'] = 'Bearer ' + data.access_token;

                // Retry the original request with new token
                return instance(originalRequest);
            } catch (err) {
                console.error("Unable to refresh token");
                // handle logout here, e.g., redirect to login page or clear local state/session
                navigate('/login')
            }
        } else if(error.response.status === 500) {
            console.error("Internal server error");
            // handle other types of errors
        } else {
            return Promise.reject(error);
        }
        
        return Promise.reject(error);
    }
);



export default instance;
