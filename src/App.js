import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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

function AppContent() {
  const { logout } = useUser();

  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route
        path="/Dashboard"
        element={
          <MainLayout onLogout={logout}>
            <Dashboard />
          </MainLayout>
        }
      />
      <Route
        path="/products"
        element={
          <MainLayout onLogout={logout}>
            <ProductsScreen />
          </MainLayout>
        }
      />
      <Route
        path="/inventory"
        element={
          <MainLayout onLogout={logout}>
            <InventarioScreen />
          </MainLayout>
        }
      />
      <Route
        path="/entradas"
        element={
          <MainLayout onLogout={logout}>
            <EntradasScreen />
          </MainLayout>
        }
      />
      <Route
        path="/salidas"
        element={
          <MainLayout onLogout={logout}>
            <SalidasScreen />
          </MainLayout>
        }
      />
      <Route
        path="/config"
        element={
          <MainLayout onLogout={logout}>
            <Configuraciones />
          </MainLayout>
        }
      />
      <Route
        path="/stockBajo"
        element={
          <MainLayout onLogout={logout}>
            <StockBajoScreen />
          </MainLayout>
        }
      />
      <Route
        path="/caja"
        element={
          <MainLayout onLogout={logout}>
            <FlujoCajaScreen />
          </MainLayout>
        }
      />
      <Route
        path="/movimientos"
        element={
          <MainLayout onLogout={logout}>
            <MovimientosScreen />
          </MainLayout>
        }
      />
    </Routes>
  );
}

function App() {
  return (
    <UserProvider>
      <Router>
        <AppContent />
      </Router>
    </UserProvider>
  );
}

export default App;
