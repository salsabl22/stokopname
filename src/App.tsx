import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './routes/AppRoutes';
import { AuthProvider } from './contexts/AuthContext';
import { BusinessUnitProvider } from './contexts/BusinessUnitContext';

function App() {
  return (
    <AuthProvider>
      <BusinessUnitProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </BusinessUnitProvider>
    </AuthProvider>
  );
}

export default App;
