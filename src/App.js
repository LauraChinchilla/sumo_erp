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

function App() {
  return (
    <UserProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/Dashboard" element={<Dashboard />} />
          <Route path="/products" element={<ProductsScreen />} />
          <Route path="/inventory" element={<InventarioScreen />} />
          <Route path="/entradas" element={<EntradasScreen />} />
          <Route path="/salidas" element={<SalidasScreen />} />
          <Route path="/config" element={<Configuraciones />} />
          <Route path="/stockBajo" element={<StockBajoScreen />} />
          <Route path="/caja" element={<FlujoCajaScreen />} />
          <Route path="/movimientos" element={<MovimientosScreen />} />
        </Routes>
      </Router>
    </UserProvider>
  );
}

export default App;
