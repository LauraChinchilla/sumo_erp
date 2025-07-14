import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './Screen/Login';
// import Users from './components/Users'; 
import Dashboard from './Screen/Dashboard';
import { UserProvider } from './context/UserContext';
import ProductsScreen from './Screen/Products/ProductsScreen';

function App() {
  return (
    <UserProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/products" element={<ProductsScreen />} />
        </Routes>
      </Router>
    </UserProvider>
  );
}

export default App;
