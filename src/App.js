import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './Screen/Login';
import Dashboard from './Screen/Dashboard';
import { UserProvider } from './context/UserContext';
import ProductsScreen from './Screen/Products/ProductsScreen';
import InventarioScreen from './Screen/InventarioScreen';
import EntradasScreen from './Screen/Entradas/EntradasScreen';
import Configuraciones from './Screen/Configuraciones/Configuraciones';

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
          <Route path="/config" element={<Configuraciones />} />
        </Routes>
      </Router>
    </UserProvider>
  );
}

export default App;
