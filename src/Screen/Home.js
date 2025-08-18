import React,{ useEffect, useState } from "react";
import "./Home.css";
import { Button } from "primereact/button";
import { Dialog } from 'primereact/dialog';
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
  const [showDialogPoliticas, setShowDialogPoliticas] = useState(false);
  const [showDialogTerminos, setShowDialogTerminos] = useState(false);
  const [showDialogSoporte, setShowDialogSoporte] = useState(false);

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
          <a
            href="https://wa.me/50488047361"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="WhatsApp"
          >
            <i className="pi pi-whatsapp"></i>
          </a>
          <a
            href="https://facebook.com"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Facebook"
          >
            <i className="pi pi-facebook"></i>
          </a>
          <a
            href="https://www.instagram.com/sumoerp?igsh=NGQ5bnY3NGt6enB6&utm_source=qr"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram"
          >
            <i className="pi pi-instagram"></i>
          </a>
        </div>
      </div>

      {/* BBOTONES FLOTANTES */}
      {showButtons && (
        <div className="floating-buttons">
          <button
            className="floating-btn login-btn"
            onClick={() => navigate("./login")}
          >
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
            <Button
              className="button login-button"
              label="Iniciar Sesión"
              icon="pi pi-sign-in"
              onClick={() => navigate("./login")}
            />
            {/* <Button className="button register-button" label="Registrarse" icon="pi pi-user-plus" /> */}
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
        <h2 className="modules-header">
          🚀 Módulos que transforman tu negocio
        </h2>

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
              <p style={{ fontStyle: "oblique", fontWeight: "bold" }}>
                Control total en tiempo real. Visualiza tu inventario disponible
                al instante, evita quiebres de stock y toma decisiones
                inteligentes con información precisa.
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
            <p
              style={{
                color: "#0a3a6e",
                fontStyle: "oblique",
                fontWeight: "bold",
              }}
            >
              Registra fácilmente el ingreso de productos y materiales,
              manteniendo un control exacto y actualizado de todas tus entradas.
            </p>
          </div>

          <div className="module-card vertical">
            <h1>Ventas</h1>
            <img
              src="https://mdexqdspobjpmzactfow.supabase.co/storage/v1/object/public/fondosumo/Ventas.png"
              alt="Ventas"
              className="module-image"
            />
            <p
              style={{
                color: "#0a3a6e",
                fontStyle: "oblique",
                fontWeight: "bold",
              }}
            >
              Gestiona tus ventas con rapidez y precisión, con reportes en
              tiempo real para optimizar la toma de decisiones.
            </p>
          </div>

          <div className="module-card vertical">
            <h1>Personal</h1>
            <img
              src="https://mdexqdspobjpmzactfow.supabase.co/storage/v1/object/public/fondosumo/Personal.png"
              alt="Personal"
              className="module-image"
            />
            <p
              style={{
                color: "#0a3a6e",
                fontStyle: "oblique",
                fontWeight: "bold",
              }}
            >
              Gestión de talento simplificada. Administra pagos, sueldos y
              beneficios de tus empleados. Ideal para pymes que buscan
              eficiencia sin complicaciones.
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
            <p
              style={{
                fontStyle: "oblique",
                fontWeight: "bold",
                color: "#0a3a6e",
              }}
            >
              Evita quiebres y pérdidas. Identifica productos con inventario
              crítico o agotado. Actúa antes de que afecte tus ventas.
            </p>
          </div>
        </div>

        {/* Fila 4: Imagen con texto afuera */}
        <div className="modules-row">
          <div className="module-text-outside">
            <h1>KPIs</h1>
            <p
              style={{
                fontStyle: "oblique",
                fontWeight: "bold",
                color: "#0a3a6e",
              }}
            >
              Mide lo que importa. Visualiza indicadores clave de rendimiento
              para tomar decisiones estratégicas.
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
              SUMO ERP nació en julio de 2025, desde una idea gestada en casa
              pero con una visión clara: traer orden, eficiencia y trazabilidad
              a los negocios locales. En un entorno donde muchas empresas operan
              con procesos dispersos y poco integrados, SUMO surge como una
              solución modular, intuitiva y centrada en el usuario.
            </p>
            <p>
              Desde su primer módulo de inventario hasta sus funciones de
              retiros financieros, cada componente de SUMO ha sido diseñado con
              propósito, cuidando tanto la lógica como la estética. El objetivo
              es claro: que cada negocio, sin importar su tamaño, pueda operar
              con la misma precisión y transparencia que una gran empresa. SUMO
              está creciendo, y con él, la comunidad de usuarios que creen en el
              poder de la organización inteligente. Porque cuando hay orden, hay
              espacio para crecer.
            </p>
          </div>
        </div>

        {/* Mision - Vision */}
        <div className="about-row">
          <div className="about-card">
            <div className="about-icon">🎯</div>
            <h3>Misión</h3>
            <p>
              Facilitar orden y control en los negocios locales mediante una
              plataforma modular, intuitiva y visualmente coherente que integra
              procesos clave y promueve decisiones claras.
            </p>
          </div>

          <div className="about-card">
            <div className="about-icon">🚀</div>
            <h3>Visión</h3>
            <p>
              Ser el sistema de gestión preferido por negocios dinámicos,
              reconocido por su simplicidad, adaptabilidad y capacidad para
              transformar procesos en resultados sostenibles.
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
            <a
              onClick={(e) => {
                setShowDialogPoliticas(true);
              }}
            >
              Política de Privacidad
            </a>
            <a 
              onClick={(e) => {
                setShowDialogTerminos(true);
              }}
            > Términos y Condiciones</a>
            <a 
              onClick={(e) => {
                setShowDialogSoporte(true);
              }}
            >Soporte</a>
          </div>
          <div className="footer-socials" style={{ marginRight: "-150px" }}>
            <a href="https://wa.me/50488047361" aria-label="WhatsApp" target="_blank">
              <i className="pi pi-whatsapp"></i>
            </a>
            <a href="https://facebook.com/sumoerp" aria-label="Facebook" target="_blank">
              <i className="pi pi-facebook"></i>
            </a>
            <a href="https://instagram.com/sumoerp" aria-label="Instagram" target="_blank">
              <i className="pi pi-instagram"></i>
            </a>
          </div>
        </div>

        <div className="footer-copy">
          © 2025 SUMO ERP. Todos los derechos reservados.
        </div>
      </footer>

      {showDialogPoliticas && (
        <Dialog
          visible={showDialogPoliticas}
          onHide={() => setShowDialogPoliticas(false)}
          style={{ width: "60%", height: "80%" }}
          header="Políticas de Privacidad"
          modal
          className="dialog-politicas"
          baseZIndex={10000}
        >
          <div style={{ maxHeight: "65vh", overflowY: "auto", paddingRight: "1rem" }}>
            <p><strong>Última actualización:</strong> Agosto 2025</p>

            <p>
              En <strong>SUMO ERP</strong> valoramos y respetamos la privacidad de nuestros usuarios. 
              Estas políticas explican cómo recopilamos, usamos, almacenamos y protegemos la información 
              personal y empresarial que gestionas a través de nuestra plataforma.
            </p>

            <h4>1. Información que recopilamos</h4>
            <ul>
              <li><strong>Información de cuenta:</strong> nombre de usuario, correo electrónico, credenciales de acceso y datos de la empresa.</li>
              <li><strong>Datos operativos:</strong> inventario, productos, entradas, salidas, movimientos de caja, créditos, retiros, KPIs, maestros, personal.</li>
              <li><strong>Información financiera:</strong> ingresos, gastos, créditos y retiros registrados dentro del sistema.</li>
              <li><strong>Datos de terceros:</strong> información de clientes, proveedores, empleados y personal administrativo.</li>
              <li><strong>Datos técnicos:</strong> dirección IP, tipo de navegador, sistema operativo y métricas de uso.</li>
            </ul>

            <h4>2. Uso de la información</h4>
            <p>La información se utiliza exclusivamente para:</p>
            <ul>
              <li>Proporcionar acceso y funcionamiento correcto de los módulos de SUMO ERP.</li>
              <li>Facilitar trazabilidad de procesos administrativos y financieros.</li>
              <li>Generar reportes y análisis de negocio.</li>
              <li>Mejorar la experiencia y seguridad del sistema.</li>
              <li>Cumplir obligaciones legales y regulatorias.</li>
            </ul>

            <h4>3. Compartición de información</h4>
            <p>
              No compartimos información con terceros sin tu consentimiento, salvo obligación legal. 
              Podremos usar servicios de infraestructura en la nube bajo acuerdos de confidencialidad.
            </p>

            <h4>4. Seguridad de la información</h4>
            <p>
              Implementamos medidas de seguridad técnicas y administrativas, como cifrado de datos, 
              control de accesos, autenticación y copias de seguridad regulares.
            </p>

            <h4>5. Retención de datos</h4>
            <p>
              Conservamos datos mientras mantengas una cuenta activa o sea necesario para los fines 
              descritos. Puedes solicitar la eliminación, salvo obligación legal de conservarlos.
            </p>

            <h4>6. Derechos de los usuarios</h4>
            <p>Como usuario tienes derecho a:</p>
            <ul>
              <li>Acceder a tus datos.</li>
              <li>Rectificar información incorrecta.</li>
              <li>Solicitar la eliminación de tus datos.</li>
              <li>Limitar u oponerte al tratamiento de tu información.</li>
            </ul>

            <h4>7. Cambios en la política</h4>
            <p>
              SUMO ERP podrá actualizar estas políticas en cualquier momento. 
              Notificaremos cambios relevantes dentro de la aplicación o por correo.
            </p>

            <h4>8. Contacto</h4>
            <p>
              Si tienes preguntas o solicitudes sobre estas políticas, escríbenos a:  
              📧 <strong>sumosuport115@gmail.com</strong>  
            </p>
          </div>
        </Dialog>
      )}

      {showDialogTerminos && (
        <Dialog
          visible={showDialogTerminos}
          onHide={() => setShowDialogTerminos(false)}
          style={{ width: "60%", height: "80vh" }}
          header="Términos y Condiciones"
          modal
          contentStyle={{ overflowY: "auto", maxHeight: "70vh" }}
          className="dialog-politicas"
          baseZIndex={10000}
        >
          <div style={{ paddingRight: "1rem" }}>
            <p><strong>Última actualización:</strong> Agosto 2025</p>

            <p>
              Bienvenido a <strong>SUMO ERP</strong>. Estos Términos y Condiciones regulan el uso de 
              nuestra plataforma y todos los servicios asociados. Al acceder y utilizar el sistema, 
              aceptas estos términos en su totalidad.
            </p>

            <h4>1. Uso de la plataforma</h4>
            <p>
              El usuario se compromete a utilizar SUMO ERP únicamente para fines legales y legítimos 
              relacionados con la gestión de su negocio. Está prohibido utilizar el sistema para actividades 
              fraudulentas, ilegales o que perjudiquen a terceros.
            </p>

            <h4>2. Cuentas de usuario</h4>
            <p>
              Cada cuenta es personal e intransferible. El usuario es responsable de mantener la 
              confidencialidad de sus credenciales y de todas las actividades que ocurran en su cuenta.
            </p>

            <h4>3. Propiedad intelectual</h4>
            <p>
              Todo el software, diseño, logotipos, textos y gráficos de SUMO ERP son propiedad de la empresa. 
              No está permitido copiar, modificar, distribuir o reproducir el sistema sin autorización previa.
            </p>

            <h4>4. Datos y contenido</h4>
            <p>
              Los datos ingresados en la plataforma son propiedad exclusiva del usuario. 
              SUMO ERP no reclama derechos de propiedad sobre la información cargada, pero se reserva el derecho 
              de procesar dichos datos para fines de mejora del servicio y soporte técnico.
            </p>

            <h4>5. Disponibilidad del servicio</h4>
            <p>
              Hacemos lo posible para mantener la plataforma disponible 24/7, sin embargo, no garantizamos 
              la ausencia de interrupciones, errores técnicos o mantenimientos programados.
            </p>

            <h4>6. Limitación de responsabilidad</h4>
            <p>
              SUMO ERP no será responsable por pérdidas de datos, daños indirectos o interrupciones ocasionadas 
              por factores externos (fallos de internet, servicios de terceros, fuerza mayor).
            </p>

            <h4>7. Modificaciones</h4>
            <p>
              La empresa podrá actualizar estos Términos y Condiciones en cualquier momento. 
              Notificaremos a los usuarios en caso de cambios relevantes.
            </p>

            <h4>8. Terminación de servicio</h4>
            <p>
              SUMO ERP se reserva el derecho de suspender o cancelar cuentas que incumplan estos términos o 
              hagan un uso indebido de la plataforma.
            </p>

            <h4>9. Contacto</h4>
            <p>
              Para consultas sobre estos términos, puedes contactarnos en:  
              📧 <strong>sumosuport115@gmail.com</strong>  
            </p>
          </div>
        </Dialog>
      )}

      {showDialogSoporte && (
        <Dialog
          visible={showDialogSoporte}
          onHide={() => setShowDialogSoporte(false)}
          style={{ width: "50%", height: "60vh" }}
          header="Soporte"
          modal
          contentStyle={{ overflowY: "auto", maxHeight: "60vh" }}
          className="dialog-politicas"
          baseZIndex={10000}
        >
          <div style={{ paddingRight: "1rem" }}>
            <p>
              En <strong>SUMO ERP</strong> estamos comprometidos en ofrecerte la mejor experiencia posible.  
              Si tienes dudas, problemas técnicos o necesitas ayuda con el sistema, puedes comunicarte con nosotros 
              a través de los siguientes canales:
            </p>

            <h4>📧 Correo electrónico</h4>
            <p>
              Escríbenos a <strong>sumosuport115@gmail.com</strong> y nuestro equipo responderá lo antes posible.
            </p>

            <h4>📞 Teléfono</h4>
            <p>
              Atención al cliente: <strong>+504 8804-7361</strong>  
            </p>
            <p>
              Horario: Lunes a Viernes, 8:00 am – 5:00 pm
            </p>

            <p>
              Nuestro equipo está listo para ayudarte a aprovechar al máximo todas las funciones de <strong>SUMO ERP</strong>.
            </p>

            <div className="social-icons" style={{ marginTop: '0.5rem', textAlign: 'center' }}>
              <h4 style={{ marginBottom: '1rem' }}>🌐 Síguenos en nuestras redes sociales</h4>
              
              <a
                href="https://wa.me/50488047361"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
                title="Escríbenos por WhatsApp"
              >
                <i className="pi pi-whatsapp"></i>
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                title="Visítanos en Facebook"
              >
                <i className="pi pi-facebook"></i>
              </a>
              <a
                href="https://www.instagram.com/sumoerp?igsh=NGQ5bnY3NGt6enB6&utm_source=qr"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                title="Síguenos en Instagram"
              >
                <i className="pi pi-instagram"></i>
              </a>
            </div>
          </div>
        </Dialog>
      )}

    </div>
  );
}
