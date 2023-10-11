import React, { lazy, Suspense, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { QueryClient, QueryClientProvider } from 'react-query';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { ErrorBoundary } from 'react-error-boundary';
import { logErrorToService } from './errorUtils/errorUtils';
import { selectAuthenticated } from './features/user/userSlice'; 
import Header from './components/Header'; 
import LeavingStation from './views/LeavingStation';
import { ThemeProvider } from '@material-ui/core/styles';
import theme from './theme';
import { useNavigate } from 'react-router-dom';
import { logoutUser,startCheck, endCheck } from './features/user/userSlice';
import { checkUserSession } from './api/axiosInstance';
import { useDispatch } from 'react-redux';
import ActivateAccount from './views/ActivateAccount';


function ProtectedRoute({ element }) {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    
    const { isAuthenticated, isChecking } = useSelector(state => ({
        isAuthenticated: state.user.isAuthenticated,
        isChecking: state.user.isChecking
    }));

    useEffect(() => {
        dispatch(startCheck());
        (async () => {
            const isSessionValid = await checkUserSession();
            if (!isSessionValid) {
                dispatch(logoutUser());
            }
            dispatch(endCheck());
        })();
    }, [dispatch]);

    // If you're currently checking the session, show a loading indicator or return null
    if (isChecking) {
        return null;  // or <LoadingIndicator />
    }
    
    // If the user is not authenticated, redirect to login
    if (!isAuthenticated) {
        navigate('/login');
        return null;
    }

    // If the user is authenticated, render the desired component
    return element;
}


function App() {
    const queryClient = new QueryClient();

    const Register = lazy(() => import('./views/Register'));
    const Login = lazy(() => import('./views/Login'));
    const UserProfile = lazy(() => import('./views/UserProfile'));
    const Collection = lazy(() => import('./features/collection/Collection'));
    const TrainList = lazy(() => import('./features/train/TrainList'));
    const Wishlist = lazy(() => import('./features/wishlist/Wishlist'));
    const TradeOffers = lazy(() => import('./features/trade_offer/TradeOffers'));
    const TrainDetail = lazy(() => import('./features/train/TrainDetail'));
    
    

    return (
        <ThemeProvider theme={theme}>
            <QueryClientProvider client={queryClient}>
                <Router>
                    <ErrorBoundary 
                        fallbackRender={({ error, resetErrorBoundary }) => (
                            <div>
                                Something went wrong!

                                <button onClick={resetErrorBoundary}>Try again</button>
                            </div>
                        )}
                        onError={logErrorToService}
                    >
                        <Suspense fallback={<div>Loading...</div>}>
                            <Header />
                            <Routes>
                                <Route path="/login" element={<Login />} />
                                <Route path="/register" element={<Register />} />
                                <Route path="/activate" element={<ActivateAccount />} />
                                {/* <Route path="/forgot-password" element={<ForgotPassword />} /> */}
                                <Route path="/user_profile" element={<ProtectedRoute element={<UserProfile />} />} />
                                <Route path="/collection" element={<ProtectedRoute element={<Collection />} />} />
                                <Route path="/trains" element={<ProtectedRoute element={<TrainList />} />} />
                                <Route path="/wishlist" element={<ProtectedRoute element={<Wishlist />} />} />
                                <Route path="/trade-offers" element={<ProtectedRoute element={<TradeOffers />} />} />
                                <Route path="/trains/:id" element={<ProtectedRoute element={<TrainDetail />} />} />
                                <Route path="/leaving" element={<LeavingStation />} />
                                <Route path="/" element={
                                    !ProtectedRoute.isChecking && ProtectedRoute.isAuthenticated ? <Navigate to="/collection" replace /> : <Navigate to="/login" replace />
                                    } />
                            </Routes>
                        </Suspense>
                    </ErrorBoundary>
                </Router>
            </QueryClientProvider>
        </ThemeProvider>
    );
}

export default App;

