import React from "react";
import "./Home.css";
import { Button } from "primereact/button";

const modules = [
  { icon: "📦", title: "Inventario", description: "Control total en tiempo real. Visualiza tu inventario disponible al instante, evita quiebres de stock y toma decisiones inteligentes con información precisa." },
  { icon: "🏷️", title: "Productos", description: "Gestión sin complicaciones. Crea, edita y organiza tus productos con facilidad. Mantén tu catálogo actualizado y optimizado para ventas y logística." },
  { icon: "🔄", title: "Entradas", description: "Agiliza el ingreso de mercancía. Registra nuevas adquisiciones al inventario de forma rápida y segura. Ideal para compras, devoluciones o ajustes." },
  { icon: "📤", title: "Salidas", description: "Controla tus ventas y bajas. Documenta cada salida de productos, ya sea por venta, merma o transferencia. Mantén tu inventario siempre al día." },
  { icon: "💰", title: "Flujo de Caja", description: "Tu salud financiera en un vistazo. Monitorea ingresos y egresos en tiempo real. Toma decisiones estratégicas con datos claros y confiables." },
  { icon: "📋", title: "Movimientos de Caja", description: "Transparencia total. Consulta el historial completo de cada movimiento en caja. Ideal para auditorías y control interno." },
  { icon: "⚠️", title: "Stock Bajo", description: "Evita quiebres y pérdidas. Identifica productos con inventario crítico o agotado. Actúa antes de que afecte tus ventas." },
  { icon: "💳", title: "Créditos", description: "Gestión inteligente de cuentas por cobrar. Administra los créditos otorgados a tus clientes, controla vencimientos y mejora tu flujo de efectivo." },
  { icon: "🔍", title: "Movimientos", description: "Todo el historial en un solo lugar. Revisa entradas, salidas y ajustes con filtros avanzados. Ideal para trazabilidad y análisis." },
  { icon: "📈", title: "KPIs", description: "Mide lo que importa. Visualiza indicadores clave de rendimiento para tomar decisiones estratégicas." },
  { icon: "⚙️", title: "Maestros", description: "Administra tu ecosistema empresarial. Gestiona clientes, proveedores, usuarios, datos de empresa y más desde un solo módulo centralizado." },
  { icon: "👜", title: "Retiros", description: "Control de utilidades y capital. Registra retiros por ganancias o aportes de capital. Mantén la contabilidad clara y ordenada." },
  { icon: "👥", title: "Personal", description: "Gestión de talento simplificada. Administra pagos, sueldos y beneficios de tus empleados. Ideal para pymes que buscan eficiencia sin complicaciones." },
];

export default function Home() {
  return (
    <div className="page">
      <div className="contact-banner">
        <img
          src="https://mdexqdspobjpmzactfow.supabase.co/storage/v1/object/public/fondosumo/Avatar2.png"
          alt="Avatar App"
          className="app-avatar"
        />
        <h2>Contáctanos</h2>
        <div className="social-icons">
          <a href="https://wa.me/50499999999" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp">
            <i className="pi pi-whatsapp"></i>
          </a>
          <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
            <i className="pi pi-facebook"></i>
          </a>
          <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
            <i className="pi pi-instagram"></i>
          </a>
        </div>
      </div>
      
      <div className="hero">
        {/* Contenido izquierdo */}
        <div className="hero-content">
          <img
            src="https://mdexqdspobjpmzactfow.supabase.co/storage/v1/object/sign/sumologo/SumoLogo.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8yMGZkZDY3Yy0xODQ0LTRmZTktOTUwNS1mYTMyYjc2NzlhZjEiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJzdW1vbG9nby9TdW1vTG9nby5wbmciLCJpYXQiOjE3NTI2MDk5MDUsImV4cCI6MjA2Nzk2OTkwNX0.Q8pIdnjrePwj7RqyLLjHsQ7av4KhylSJVNZBC05s0fY"
            alt="SUMO ERP Logo"
            className="hero-logo"
          />
          <h1 className="hero-title">Bienvenido a SUMO ERP</h1>
          <p className="hero-subtitle">
            La solución integral para controlar inventarios, ventas, finanzas y
            recursos humanos en un solo lugar.
          </p>

          <div className="button-container">
            <Button className="button login-button" label="Iniciar Sesión" icon="pi pi-sign-in" />
            <Button className="button register-button" label="Registrarse" icon="pi pi-user-plus" />
          </div>

        </div>

        {/* Imagen derecha */}
        <div className="hero-images">
          <img
            src="https://mdexqdspobjpmzactfow.supabase.co/storage/v1/object/public/fondosumo/Imagen3.png"
            alt="Ilustración ERP 1"
            className="hero-image"
            data-tooltip="Módulo de Inventarios"
          />

          <img
            src="https://mdexqdspobjpmzactfow.supabase.co/storage/v1/object/public/fondosumo/Imagen1.png"
            alt="Ilustración ERP 1"
            className="hero-image"
          />

          <img
            src="https://mdexqdspobjpmzactfow.supabase.co/storage/v1/object/public/fondosumo/Imagen2.png"
            alt="Ilustración ERP 2"
            className="hero-image"
          />
        </div>
      </div>

      <div className="modules-section">
        <h2 className="modules-header">🚀 Módulos que transforman tu negocio</h2>
        <div className="modules-grid">
          {modules.map((mod, index) => (
            <div key={index} className="module-card">
              <div className="module-icon">{mod.icon}</div>
              <h3 className="module-title">{mod.title}</h3>
              <p className="module-description">{mod.description}</p>
            </div>
          ))}
        </div>
      </div>

      <footer className="footer-fixed">
        <div className="footer-content">
          <div className="footer-qr">
            <img
              src="https://mdexqdspobjpmzactfow.supabase.co/storage/v1/object/public/fondosumo/QRWaths.png"
              alt="Código QR"
              className="footer-qr-image"
            />
          </div>

          <div className="footer-contact">
            <p>📍 La Encarnacion, Ocotepeque, Honduras.</p>
            <p>📞 +504 9999-9999</p>
            <p>✉ soporte@sumoerp.com</p>
          </div>

          <div className="footer-links">
            <a href="/privacy">Política de Privacidad</a>
            <a href="/terms">Términos y Condiciones</a>
            <a href="/support">Soporte</a>
          </div>

          <div className="footer-socials">
            <a href="https://wa.me/50499999999" aria-label="WhatsApp"><i className="pi pi-whatsapp"></i></a>
            <a href="https://facebook.com/sumoerp" aria-label="Facebook"><i className="pi pi-facebook"></i></a>
            <a href="https://instagram.com/sumoerp" aria-label="Instagram"><i className="pi pi-instagram"></i></a>
          </div>
        </div>

        <div className="footer-copy">
          © 2025 SUMO ERP. Todos los derechos reservados.
        </div>
      </footer>
    </div>
  );
}
