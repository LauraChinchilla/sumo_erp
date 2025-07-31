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

function AppContent() {
  const { logout } = useUser();
  const navigate = useNavigate();

  const handlerLogout = () => {
    navigate('./')
    logout()
  }

  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route
        path="/Dashboard"
        element={
          <MainLayout onLogout={handlerLogout}>
            <Dashboard />
          </MainLayout>
        }
      />
      <Route
        path="/products"
        element={
          <MainLayout onLogout={handlerLogout}>
            <ProductsScreen />
          </MainLayout>
        }
      />
      <Route
        path="/inventory"
        element={
          <MainLayout onLogout={handlerLogout}>
            <InventarioScreen />
          </MainLayout>
        }
      />
      <Route
        path="/entradas"
        element={
          <MainLayout onLogout={handlerLogout}>
            <EntradasScreen />
          </MainLayout>
        }
      />
      <Route
        path="/salidas"
        element={
          <MainLayout onLogout={handlerLogout}>
            <SalidasScreen />
          </MainLayout>
        }
      />
      <Route
        path="/config"
        element={
          <MainLayout onLogout={handlerLogout}>
            <Configuraciones />
          </MainLayout>
        }
      />
      <Route
        path="/stockBajo"
        element={
          <MainLayout onLogout={handlerLogout}>
            <StockBajoScreen />
          </MainLayout>
        }
      />
      <Route
        path="/caja"
        element={
          <MainLayout onLogout={handlerLogout}>
            <FlujoCajaScreen />
          </MainLayout>
        }
      />
      <Route
        path="/movimientos"
        element={
          <MainLayout onLogout={handlerLogout}>
            <MovimientosScreen />
          </MainLayout>
        }
      />

      <Route
        path="/KPIs"
        element={
          <MainLayout onLogout={handlerLogout}>
            <KPIsScreen />
          </MainLayout>
        }
      />
      <Route
        path="/Maestros"
        element={
          <MainLayout onLogout={handlerLogout}>
            <MaestrosScreen />
          </MainLayout>
        }
      />

      <Route
        path="/creditos"
        element={
          <MainLayout onLogout={handlerLogout}>
            <CreditosScreen />
          </MainLayout>
        }
      />

      <Route
        path="/retiros"
        element={
          <MainLayout onLogout={handlerLogout}>
            <RetirosScreen />
          </MainLayout>
        }
      />

      <Route
        path="/cajamovimientos"
        element={
          <MainLayout onLogout={handlerLogout}>
            <CajaMovimientosScreen />
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
