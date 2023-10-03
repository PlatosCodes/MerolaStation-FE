import React, { lazy, Suspense } from 'react';
import { useSelector } from 'react-redux';
import { QueryClient, QueryClientProvider } from 'react-query';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { ErrorBoundary } from 'react-error-boundary';
import { logErrorToService } from './errorUtils/errorUtils';
import { selectAuthenticated } from './features/user/userSlice'; 


function App() {
    const queryClient = new QueryClient();

    const Register = lazy(() => import('./views/Register'));
    const Login = lazy(() => import('./views/Login'));
    const UserProfile = lazy(() => import('./views/UserProfile'));
    const UserCollection = lazy(() => import('./features/collection/UserCollection'));
    const TrainList = lazy(() => import('./features/train/TrainList'));
    const Wishlist = lazy(() => import('./features/wishlist/Wishlist'));
    const TradeOffers = lazy(() => import('./features/trade_offer/TradeOffers'));
    const TrainDetail = lazy(() => import('./features/train/TrainDetail'));

    return (
        <QueryClientProvider client={queryClient}>
            <Router>
                <ErrorBoundary 
                    fallbackRender={({ error, resetErrorBoundary }) => (
                        <div>
                            Something went wrong! 
                        </div>
                    )}
                    onError={logErrorToService}
                >
                    <Suspense fallback={<div>Loading...</div>}>
                        <Routes>
                            <Route path="/login" element={<Login />} />
                            <Route path="/register" element={<Register />} />
                            <Route path="/user_profile" element={<ProtectedRoute element={<UserProfile />} />} />
                            <Route path="/collection" element={<ProtectedRoute element={<UserCollection />} />} />
                            <Route path="/trains" element={<ProtectedRoute element={<TrainList />} />} />
                            <Route path="/wishlist" element={<ProtectedRoute element={<Wishlist />} />} />
                            <Route path="/trade-offers" element={<ProtectedRoute element={<TradeOffers />} />} />
                            <Route path="/trains/:id" element={<ProtectedRoute element={<TrainDetail />} />} />
                            <Route path="/" element={<Navigate to="/login" replace />} />
                        </Routes>
                    </Suspense>
                </ErrorBoundary>
            </Router>
        </QueryClientProvider>
    );
}

function ProtectedRoute({ component, element }) {
    const isAuthenticated = useSelector(selectAuthenticated); // You need to define the selector function `selectAuthenticated`
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (component) {
        return React.createElement(component);
    }
  
    if (element) {
        return element;
    }

    return null;
}

export default App;
