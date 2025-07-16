// src/components/SelectorFechasEntradas.jsx
import React, { useEffect, useState } from 'react';
import { Calendar } from 'primereact/calendar';
import { Dropdown } from 'primereact/dropdown';

const CalendarMonth = ({ rangeDates, setRangeDates, selectedMonth, setSelectedMonth }) => {
  const [monthOptions, setMonthOptions] = useState([]);

  useEffect(() => {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();

    const months = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];

    const options = [];

    for (let year = currentYear - 1; year <= currentYear + 1; year++) {
      for (let i = 0; i < 12; i++) {
        const optionDate = new Date(year, i, 1);
        options.push({
          label: `${months[i]} ${year}`,
          value: optionDate,
        });
      }
    }

    setMonthOptions(options);

    // Valor inicial si aún no hay uno
    if (!selectedMonth) {
      const current = options.find(opt =>
        opt.value.getFullYear() === currentYear && opt.value.getMonth() === currentMonth
      );
      setSelectedMonth(current.value);

      const firstDay = new Date(current.value.getFullYear(), current.value.getMonth(), 1);
      const lastDay = new Date(current.value.getFullYear(), current.value.getMonth() + 1, 0);
      setRangeDates([firstDay, lastDay]);
    }
  }, []);

  const handleMonthChange = (value) => {
    setSelectedMonth(value);
    const firstDay = new Date(value.getFullYear(), value.getMonth(), 1);
    const lastDay = new Date(value.getFullYear(), value.getMonth() + 1, 0);
    setRangeDates([firstDay, lastDay]);
  };

  return (
    <div style={{ display: 'flex', gap: '1rem' }}>
      <Dropdown
        value={selectedMonth}
        options={monthOptions}
        onChange={(e) => handleMonthChange(e.value)}
        placeholder="Seleccionar mes"
        optionLabel="label"
        style={{ width: '220px' }}
      />

      <Calendar
        value={rangeDates}
        onChange={(e) => setRangeDates(e.value)}
        selectionMode="range"
        readOnlyInput
        showIcon
        placeholder="Filtrar por fecha"
        dateFormat="dd/mm/yy"
      />
    </div>
  );
};

export default CalendarMonth;
