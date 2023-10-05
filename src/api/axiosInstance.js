import Axios from 'axios';
import Cookie from 'js-cookie';

const instance = Axios.create({
    baseURL: 'http://localhost:8080',
    withCredentials: true
});

// Define a function to handle token refresh
async function handleTokenRefresh(error, originalRequest) {

    try {
       const { data } = await instance.post('/renew_access');

        // Update the instance header
        instance.defaults.headers['Authorization'] = 'Bearer ' + data.access_token;

        // Retry the original request with the new token
        return instance(originalRequest);
    } catch (err) {
        console.error("Unable to refresh token");
        // handle logout here, e.g., redirect to login page or clear local state/session
        throw err;
    }
}

instance.interceptors.response.use(
    response => response,
    async error => {
        const originalRequest = error.config;

        // If error response code is 401 Unauthorized & hasn't retried
        if (error.response.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                return handleTokenRefresh(error, originalRequest);
            } catch (err) {
                console.error(err);
                // handle logout here, e.g., redirect to login page or clear local state/session
                throw err;
            }
        } else if (error.response.status === 500) {
            console.error("Internal server error");
            // handle other types of errors
        } else if (error.request) {
            console.error('No response received', error.request);
        } else {
            console.error('Unexpected error', error.message);
        }

        return Promise.reject(error);
    }
);

export default instance;

export const checkUserSession = async () => {
    try {
        const response = await instance.get('/check_session');
        return response.data.isAuthenticated;
    } catch (error) {
        console.error('Failed to check user session:', error);
        return false;
    }
};