import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import Login from './Screen/Login';
import Dashboard from './Screen/Dashboard';
import { UserProvider } from './context/UserContext';
import ProductsScreen from './Screen/Products/ProductsScreen';
import InventarioScreen from './Screen/InventarioScreen';
import EntradasScreen from './Screen/Entradas/EntradasScreen';
import Configuraciones from './Screen/Configuraciones/Configuraciones';
import SalidasScreen from './Screen/Salidas/SalidasScreen';
import StockBajoScreen from './Screen/StockBajo/StockBajoScreen';
import FlujoCajaScreen from './Screen/FlujoCaja/FlijoCajaScreen';
import MovimientosScreen from './Screen/Movimientos/MovimientosScreen';
import MainLayout from './components/MainLayout';
import { useUser } from './context/UserContext';
import KPIsScreen from './Screen/KPIs/KPIsScreen';
import MaestrosScreen from './Screen/Maestros/MaestrosScreen';
import CreditosScreen from './Screen/Creditos/CreditosScreen';
import RetirosScreen from './Screen/Retiros/RetirosScreen';
import CajaMovimientosScreen from './Screen/CajaMovimientos/CajaMovimientosScreen';
import PersonalScreen from './Screen/Personal/PersonalScreen';
import { ThemeProvider } from './context/ThemeContext';
import { Navigate } from 'react-router-dom';
import Home from './Screen/Home';
import NotFound from './Screen/NotFound/NotFound';

function PrivateRoute({ children }) {
  const { user, loading } = useUser();
  if (loading) {
    return <div>Cargando...</div>;
  }
  if (!user) {
    return <Navigate to="/" replace />;
  }
  return children;
}


function AppContent() {
  const { logout } = useUser();
  const navigate = useNavigate();

  const handlerLogout = () => {
    navigate('./')
    logout()
  }

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<Home />} />
      <Route
        path="/Dashboard"
        element={
          <PrivateRoute>
            <MainLayout onLogout={handlerLogout}>
              <Dashboard />
            </MainLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/products"
        element={
          <PrivateRoute>
            <MainLayout onLogout={handlerLogout}>
              <ProductsScreen />
            </MainLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/inventory"
        element={
          <PrivateRoute>
            <MainLayout onLogout={handlerLogout}>
              <InventarioScreen />
            </MainLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/entradas"
        element={
          <PrivateRoute>
            <MainLayout onLogout={handlerLogout}>
              <EntradasScreen />
            </MainLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/salidas"
        element={
          <PrivateRoute>
            <MainLayout onLogout={handlerLogout}>
              <SalidasScreen />
            </MainLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/config"
        element={
          <PrivateRoute>
            <MainLayout onLogout={handlerLogout}>
              <Configuraciones />
            </MainLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/stockBajo"
        element={
          <PrivateRoute>
            <MainLayout onLogout={handlerLogout}>
              <StockBajoScreen />
            </MainLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/caja"
        element={
          <PrivateRoute>
            <MainLayout onLogout={handlerLogout}>
              <FlujoCajaScreen />
            </MainLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/movimientos"
        element={
          <PrivateRoute>
            <MainLayout onLogout={handlerLogout}>
              <MovimientosScreen />
            </MainLayout>
          </PrivateRoute>
        }
      />

      <Route
        path="/KPIs"
        element={
          <PrivateRoute>
            <MainLayout onLogout={handlerLogout}>
              <KPIsScreen />
            </MainLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/Maestros"
        element={
          <PrivateRoute>
            <MainLayout onLogout={handlerLogout}>
              <MaestrosScreen />
            </MainLayout>
          </PrivateRoute>
        }
      />

      <Route
        path="/creditos"
        element={
          <PrivateRoute>
            <MainLayout onLogout={handlerLogout}>
              <CreditosScreen />
            </MainLayout>
          </PrivateRoute>
        }
      />

      <Route
        path="/retiros"
        element={
          <PrivateRoute>
            <MainLayout onLogout={handlerLogout}>
              <RetirosScreen />
            </MainLayout>
          </PrivateRoute>
        }
      />

      <Route
        path="/cajamovimientos"
        element={
          <PrivateRoute>
            <MainLayout onLogout={handlerLogout}>
              <CajaMovimientosScreen />
            </MainLayout>
          </PrivateRoute>
        }
      />

      <Route
        path="/personal"
        element={
          <PrivateRoute>
            <MainLayout onLogout={handlerLogout}>
              <PersonalScreen />
            </MainLayout>
          </PrivateRoute>
        }
      />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

function App() {
  return (
    <UserProvider>
      <ThemeProvider>
        <Router>
          <AppContent />
        </Router>
      </ThemeProvider>
    </UserProvider>
  );
}

export default App;
