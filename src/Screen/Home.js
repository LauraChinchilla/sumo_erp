import "./Home.css";
import { Button } from "primereact/button";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();

  const valores = [
    { img: "https://cdn-icons-png.flaticon.com/512/190/190411.png", alt: "Innovación", text: "Innovación" },
    { img: "https://cdn-icons-png.flaticon.com/512/942/942748.png", alt: "Compromiso", text: "Compromiso" },
    { img: "https://cdn-icons-png.flaticon.com/512/3135/3135715.png", alt: "Trabajo en equipo", text: "Trabajo en equipo" },
    { img: "https://cdn-icons-png.flaticon.com/512/942/942751.png", alt: "Transparencia", text: "Transparencia" },
    { img: "https://cdn-icons-png.flaticon.com/512/2965/2965567.png", alt: "Adaptabilidad", text: "Adaptabilidad" },
    { img: "https://cdn-icons-png.flaticon.com/512/2917/2917993.png", alt: "Empoderamiento Empresarial", text: "Empoderamiento Empresarial" },
    { img: "https://cdn-icons-png.flaticon.com/512/2917/2917963.png", alt: "Trazabilidad", text: "Trazabilidad" },
  ];

  const valoresDuplicados = [...valores, ...valores];

    const [showButtons, setShowButtons] = useState(false);

    useEffect(() => {
      function handleScroll() {
        if (window.scrollY > 300) {
          setShowButtons(true);
        } else {
          setShowButtons(false);
        }
      }

      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
    }, []);

  return (
    <div className="page">

      {/* BARRA FIJA */}
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

      {/* BBOTONES FLOTANTES */}
      {showButtons && (
        <div className="floating-buttons">
          <button className="floating-btn login-btn" onClick={() => navigate('./login')}>
            <i className="pi pi-sign-in"></i> Iniciar Sesión
          </button>
        </div>
      )}
      
      {/* PRIMERA SECCION */}
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
            <Button className="button login-button" label="Iniciar Sesión" icon="pi pi-sign-in" onClick={() => navigate('./login')}/>
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

      {/* SEGUNDA SECCION */}
      <div className="modules-section">
        <h2 className="modules-header">🚀 Módulos que transforman tu negocio</h2>

        {/* Fila 1: Inventario */}
        <div className="modules-row">
          <div className="module-inventario horizontal">
            <img
              src="https://mdexqdspobjpmzactfow.supabase.co/storage/v1/object/public/fondosumo/Inv.png"
              alt="Inventario"
              className="module-image"
            />
            <div className="module-text">
              <h1>Inventario</h1>
              <p style={{ fontStyle: 'oblique', fontWeight: 'bold' }}>
                Control total en tiempo real. Visualiza tu inventario disponible al instante, evita quiebres de stock y toma decisiones inteligentes con información precisa.
              </p>
            </div>
          </div>
        </div>

        {/* Fila 2: Entradas y Ventas */}
        <div className="modules-row">
          <div className="module-card vertical">
            <h1>Entradas</h1>
            <img
              src="https://mdexqdspobjpmzactfow.supabase.co/storage/v1/object/public/fondosumo/Entradas.png"
              alt="Entradas"
              className="module-image"
            />
            <p style={{color: '#0a3a6e', fontStyle: 'oblique', fontWeight: 'bold' }}>
              Registra fácilmente el ingreso de productos y materiales, manteniendo un control exacto y actualizado de todas tus entradas.
            </p>
          </div>

          <div className="module-card vertical">
            <h1>Ventas</h1>
            <img
              src="https://mdexqdspobjpmzactfow.supabase.co/storage/v1/object/public/fondosumo/Ventas.png"
              alt="Ventas"
              className="module-image"
            />
            <p style={{color: '#0a3a6e', fontStyle: 'oblique', fontWeight: 'bold' }}>
              Gestiona tus ventas con rapidez y precisión, con reportes en tiempo real para optimizar la toma de decisiones.
            </p>
          </div>

          <div className="module-card vertical">
            <h1>Personal</h1>
            <img
              src="https://mdexqdspobjpmzactfow.supabase.co/storage/v1/object/public/fondosumo/Personal.png"
              alt="Personal"
              className="module-image"
            />
            <p style={{color: '#0a3a6e', fontStyle: 'oblique', fontWeight: 'bold' }}>
              Gestión de talento simplificada. Administra pagos, sueldos y beneficios de tus empleados. Ideal para pymes que buscan eficiencia sin complicaciones.
            </p>
          </div>
        </div>

        {/* Fila 3: Imagen con texto afuera */}
        <div className="modules-row">
          <div className="module-card-only-image">
            <img
              src="https://mdexqdspobjpmzactfow.supabase.co/storage/v1/object/public/fondosumo/StockBajo.png"
              alt="Stock Bajo"
              className="module-image"
            />
          </div>

          <div className="module-text-outside">
            <h1>Stock Bajo</h1>
            <p style={{ fontStyle: 'oblique', fontWeight: 'bold', color: '#0a3a6e' }}>
              Evita quiebres y pérdidas. Identifica productos con inventario crítico o agotado. Actúa antes de que afecte tus ventas.
            </p>
          </div>
        </div>

        {/* Fila 4: Imagen con texto afuera */}
        <div className="modules-row">

          <div className="module-text-outside">
            <h1>KPIs</h1>
            <p style={{ fontStyle: 'oblique', fontWeight: 'bold', color: '#0a3a6e' }}>
              Mide lo que importa. Visualiza indicadores clave de rendimiento para tomar decisiones estratégicas.
            </p>
          </div>


          <div className="module-card-only-image">
            <img
              src="https://mdexqdspobjpmzactfow.supabase.co/storage/v1/object/public/fondosumo/KPIs.png"
              alt="KPIs"
              className="module-image"
            />
          </div>
        </div>

      </div>

      {/* TERCERA SECCION */}
      <div className="about-section-alt">
        <h2 className="about-title-alt">Conócenos</h2>

        {/* Breve Historia */}
        <div className="about-history">
          <div className="history-image"></div>
          <div className="history-text">
            <h3>Nuestra Historia</h3>
            <p>
              SUMO ERP nació en julio de 2025, desde una idea gestada en casa pero con una visión clara: traer orden, eficiencia y trazabilidad a los negocios locales. En un entorno donde muchas empresas operan con procesos dispersos y poco integrados, SUMO surge como una solución modular, intuitiva y centrada en el usuario.
            </p>
            <p>
              Desde su primer módulo de inventario hasta sus funciones de retiros financieros, cada componente de SUMO ha sido diseñado con propósito, cuidando tanto la lógica como la estética. El objetivo es claro: que cada negocio, sin importar su tamaño, pueda operar con la misma precisión y transparencia que una gran empresa.
              SUMO está creciendo, y con él, la comunidad de usuarios que creen en el poder de la organización inteligente. Porque cuando hay orden, hay espacio para crecer.
            </p>
          </div>
        </div>

        {/* Mision - Vision */}
        <div className="about-row">
          <div className="about-card">
            <div className="about-icon">🎯</div>
            <h3>Misión</h3>
            <p>
              Facilitar orden y control en los negocios locales mediante una plataforma modular, intuitiva y visualmente coherente que integra procesos clave y promueve decisiones claras.
            </p>
          </div>

          <div className="about-card">
            <div className="about-icon">🚀</div>
            <h3>Visión</h3>
            <p>
              Ser el sistema de gestión preferido por negocios dinámicos, reconocido por su simplicidad, adaptabilidad y capacidad para transformar procesos en resultados sostenibles.
            </p>
          </div>
        </div>

        {/* Valores */}
        <div className="ticker-wrapper">
          <div className="ticker">
            {valoresDuplicados.map(({ img, alt, text }, i) => (
              <div className="value-item" key={i}>
                <img src={img} alt={alt} />
                <span>{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>


      <footer className="footer-fixed">
        <div className="footer-content">
          <div className="footer-contact">
            <p>📍 La Encarnacion, Ocotepeque, Honduras.</p>
            <p>📞 +504 8804-7361</p>
            <p>✉ sumosuport115@gmail.com</p>
          </div>

          <div className="footer-links">
            <a href="/privacy">Política de Privacidad</a>
            <a href="/terms">Términos y Condiciones</a>
            <a href="/support">Soporte</a>
          </div>

          <div className="footer-socials" style={{marginRight: '-150px'}}>
            <a href="https://wa.me/50488047361" aria-label="WhatsApp"><i className="pi pi-whatsapp"></i></a>
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
