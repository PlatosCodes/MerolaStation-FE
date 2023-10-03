import React from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { store } from './store';
import App from './App';
import { logErrorToService } from './errorUtils/errorUtils';


// Using the new createRoot API instead of ReactDOM.render
const root = document.getElementById('root');
const reactRoot = createRoot(root);

class ErrorBoundary extends React.Component {
    state = { hasError: false };
  
    static getDerivedStateFromError(error) {
      return { hasError: true };
    }
  
    componentDidCatch(error, info) {
      logErrorToService(error, info.componentStack);
    }
  
    render() {
      if (this.state.hasError) {
        return <h1>Something went wrong.</h1>;
      }
  
      return this.props.children;
    }
  }

reactRoot.render(
    <Provider store={store}>
        <ErrorBoundary>
            <App />
        </ErrorBoundary>
    </Provider>
);
