import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import 'primeicons/primeicons.css';
import { useUser } from '../context/UserContext';
import { Button } from 'primereact/button';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';


export default function Dashboard() {
  const { user, loading } = useUser();
  const navigate = useNavigate();
  const [selectedIndex, setSelectedIndex] = useState(null);

  
  const defaultCards = [
    {
      icon: 'pi pi-box',
      title: 'Inventario',
      description: 'Consulta general del inventario disponible en el sistema.',
      ruta: '/inventory',
    },
    {
      icon: 'pi pi-tags',
      title: 'Productos',
      description: 'Gestión de productos: creación, edición y eliminación.',
      ruta: '/products',
    },
    {
      icon: 'pi pi-sign-in',
      title: 'Entradas',
      description: 'Registro de ingreso de productos al inventario.',
      ruta: '/entradas',
    },
    {
      icon: 'pi pi-sign-out',
      title: 'Salidas',
      description: 'Registro de salidas de productos por ventas o bajas.',
      ruta: '/salidas',
    },
    {
      icon: 'pi pi-money-bill',
      title: 'Flujo de Caja',
      description: 'Control de ingresos y gastos del negocio.',
      ruta: '/caja',
    },
    {
      icon: 'pi pi-list',
      title: 'Mov. de Caja',
      description: 'Consulta detallada del historial de movimientos en caja.',
      ruta: '/cajamovimientos',
    },
    {
      icon: 'pi pi-exclamation-triangle',
      title: 'Stock Bajo',
      description: 'Productos con inventario crítico o en cero.',
      ruta: '/stockBajo',
    },
    {
      icon: 'pi pi-credit-card',
      title: 'Créditos',
      description: 'Gestión de cuentas por cobrar y créditos a clientes.',
      ruta: '/creditos',
    },
    {
      icon: 'pi pi-history',
      title: 'Movimientos',
      description: 'Historial completo de entradas, salidas y ajustes.',
      ruta: '/movimientos',
    },
    {
      icon: 'pi pi-chart-line',
      title: 'KPIs',
      description:'Indicadores clave de mi Empresa',
      ruta:'/KPIs'
    },
    {
      icon: 'pi pi-cog',
      title: 'Maestros',
      description: 'Gestión de clientes, proveedores, usuarios, empresa y más.',
      ruta: '/maestros', // ajusta esta ruta si usas una diferente
    },
    {
      icon: 'pi pi-wallet',
      title: 'Retiros',
      description: 'Registro de retiros por ganancias o capital.',
      ruta: '/retiros',
    },
    {
      icon: 'pi pi-users',
      title: 'Nómina',
      description: 'Gestión de pagos a empleados y sueldos.',
      ruta: '/nomina',
    },
  ];

  const [cards, setCards] = useState(() => {
    const saved = localStorage.getItem('dashboard-cards');
    return saved ? JSON.parse(saved) : defaultCards;
  });

  useEffect(() => {
    if (!loading && !user) {
      navigate('/');
    }
    document.title = 'Sumo - Dashboard';
  }, [user, loading, navigate]);

  if (loading) return null;

  const onDragEnd = (result) => {
    if (!result.destination) return;

    const reordered = [...cards];
    const [removed] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, removed);
    setCards(reordered);
    localStorage.setItem('dashboard-cards', JSON.stringify(reordered));
  };

  const filteredCards = cards.filter(card => {
    if (
      card.title === 'Movimientos' ||
      card.title === 'KPIs' ||
      card.title === 'Créditos' ||
      card.title === 'Mov. de Caja' ||
      card.title === 'Retiros'
    ) {
      return user?.IdRol === 1 || user?.IdRol === 2;
    }
    return true;
  });

  return (
    <div
      style={{
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        minHeight: '87.9vh',
        padding: '1rem'
      }}
    >
      <div className="dashboard-container">
        <h2 style={{ color: '#fff', textShadow: '1px 1px 4px #000' }}>
          Bienvenido, {user?.UserName}
        </h2>

        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="dashboard-cards" direction="horizontal">
            {(provided) => (
              <div
                className="card-grid"
                ref={provided.innerRef}
                {...provided.droppableProps}
              >
                {filteredCards.map((card, index) => (
                  <Draggable key={card.title} draggableId={card.title} index={index}>
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className={`dashboard-card ${selectedIndex === index ? 'card-selected' : ''}`}
                        style={{ position: 'relative', ...provided.draggableProps.style }}
                        onClick={() => {
                          setSelectedIndex(index);
                          navigate(card.ruta);
                        }}
                      >
                        <Button
                          icon="pi pi-external-link"
                          className="p-button-text p-button-sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(card.ruta, '_blank');
                          }}
                          style={{
                            position: 'absolute',
                            top: '0.5rem',
                            right: '0.5rem',
                            zIndex: 1,
                            color: '#555'
                          }}
                        />
                        <i className={`card-icon ${card.icon}`} />
                        <div>
                          <h3 style={{ margin: 0 }}>{card.title}</h3>
                          <p style={{ marginTop: '0.5rem', fontSize: '14px', color: '#555' }}>
                            {card.description}
                          </p>
                        </div>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>
    </div>
  );
}


// import React, { useEffect, useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import 'primeicons/primeicons.css';
// import { useUser } from '../context/UserContext';
// import { Button } from 'primereact/button';

// export default function Dashboard() {
//   const { user, loading } = useUser();
//   const navigate = useNavigate();
//   const [selectedIndex, setSelectedIndex] = useState(null);

//   useEffect(() => {
//     if (!loading && !user) {
//       navigate('/');
//     }
//     document.title = 'Sumo - Dashboard';
//   }, [user, loading, navigate]);

//   if (loading) return null;

  // const cards = [
  //   {
  //     icon: 'pi pi-box',
  //     title: 'Inventario',
  //     description: 'Consulta general del inventario disponible en el sistema.',
  //     ruta: '/inventory',
  //   },
  //   {
  //     icon: 'pi pi-tags',
  //     title: 'Productos',
  //     description: 'Gestión de productos: creación, edición y eliminación.',
  //     ruta: '/products',
  //   },
  //   {
  //     icon: 'pi pi-sign-in',
  //     title: 'Entradas',
  //     description: 'Registro de ingreso de productos al inventario.',
  //     ruta: '/entradas',
  //   },
  //   {
  //     icon: 'pi pi-sign-out',
  //     title: 'Salidas',
  //     description: 'Registro de salidas de productos por ventas o bajas.',
  //     ruta: '/salidas',
  //   },
  //   {
  //     icon: 'pi pi-money-bill',
  //     title: 'Flujo de Caja',
  //     description: 'Control de ingresos y gastos del negocio.',
  //     ruta: '/caja',
  //   },
  //   {
  //     icon: 'pi pi-list',
  //     title: 'Mov. de Caja',
  //     description: 'Consulta detallada del historial de movimientos en caja.',
  //     ruta: '/cajamovimientos',
  //   },
  //   {
  //     icon: 'pi pi-exclamation-triangle',
  //     title: 'Stock Bajo',
  //     description: 'Productos con inventario crítico o en cero.',
  //     ruta: '/stockBajo',
  //   },
  //   {
  //     icon: 'pi pi-credit-card',
  //     title: 'Créditos',
  //     description: 'Gestión de cuentas por cobrar y créditos a clientes.',
  //     ruta: '/creditos',
  //   },
  //   {
  //     icon: 'pi pi-history',
  //     title: 'Movimientos',
  //     description: 'Historial completo de entradas, salidas y ajustes.',
  //     ruta: '/movimientos',
  //   },
  //   {
  //     icon: 'pi pi-chart-line',
  //     title: 'KPIs',
  //     description:'Indicadores clave de mi Empresa',
  //     ruta:'/KPIs'
  //   },
  //   {
  //     icon: 'pi pi-cog',
  //     title: 'Maestros',
  //     description: 'Gestión de clientes, proveedores, usuarios, empresa y más.',
  //     ruta: '/maestros', // ajusta esta ruta si usas una diferente
  //   },
  //   {
  //     icon: 'pi pi-wallet',
  //     title: 'Retiros',
  //     description: 'Registro de retiros por ganancias o capital.',
  //     ruta: '/retiros',
  //   },
  //   {
  //     icon: 'pi pi-users',
  //     title: 'Nómina',
  //     description: 'Gestión de pagos a empleados y sueldos.',
  //     ruta: '/nomina',
  //   },
  // ];

//   return (
//     <div
//       style={{
//         // backgroundImage: 'url(https://mdexqdspobjpmzactfow.supabase.co/storage/v1/object/public/fondosumo//Fonfo2.avif)',
//         backgroundSize: 'cover',
//         backgroundPosition: 'center',
//         minHeight: '87.9vh',
//         padding: '1rem'
//       }}
//     >
//       <div className="dashboard-container">
//         <h2 style={{ color: '#fff', textShadow: '1px 1px 4px #000' }}>
//           Bienvenido, {user?.UserName}
//         </h2>
//         <div className="card-grid">
//           {cards
//             .filter(card => {
//               if (card.title === 'Movimientos' || card.title === 'KPIs' || card.title === 'Créditos'  || card.top === 'Retiros' || card.title === 'Mov. de Caja') {
//                 return user?.IdRol === 1 || user?.IdRol === 2;
//               }
//               return true;
//             })
//             .map((card, index) => (
//               <div
//                 key={index}
//                 className={`dashboard-card ${selectedIndex === index ? 'card-selected' : ''}`}
//                 style={{ position: 'relative' }}
//                 onClick={() => {
//                   setSelectedIndex(index);
//                   navigate(card.ruta);
//                 }}
//               >
//                 <Button
//                   icon="pi pi-external-link"
//                   className="p-button-text p-button-sm"
//                   onClick={(e) => {
//                     e.stopPropagation(); 
//                     window.open(card.ruta, '_blank');
//                   }}
//                   style={{
//                     position: 'absolute',
//                     top: '0.5rem',
//                     right: '0.5rem',
//                     zIndex: 1,
//                     color: '#555'
//                   }}
//                 />

//                 <i className={`card-icon ${card.icon}`} />
//                 <div>
//                   <h3 style={{ margin: 0 }}>{card.title}</h3>
//                   <p style={{ marginTop: '0.5rem', fontSize: '14px', color: '#555' }}>
//                     {card.description}
//                   </p>
//                 </div>
//               </div>
//             ))}
//         </div>

//       </div>
//     </div>
//   );
// }
