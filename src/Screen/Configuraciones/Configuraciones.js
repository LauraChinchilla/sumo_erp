import React from 'react';
import Navbar from '../../components/Navbar';
import { useUser } from '../../context/UserContext';
import { useNavigate } from 'react-router-dom';

export default function Configuraciones() {
    const { logout } = useUser();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };
    return (
        <div className="p-4">
            <Navbar onLogout={handleLogout} />
        <h2 className="mb-4">Configuraciones del Sistema</h2>
        <div style={{marginTop: '2rem'}}></div>

        </div>
    );
}
