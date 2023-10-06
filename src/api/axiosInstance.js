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

        if (error.response.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            return handleTokenRefresh(error, originalRequest);
        }
        // If it's another kind of error or it's a second try to get an access token
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