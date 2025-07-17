import React, { useState } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import '../base.css';

export default function Table({ columns, data }) {
  const [globalFilter, setGlobalFilter] = useState('');

  const globalFilterFields = columns.filter(col => !col.isIconColumn).map(col => col.field);
  
  const renderIconBody = (iconClass, onClickHandler, rowData, tooltip) => {
    return (
      <i
        className={iconClass}
        style={{ fontSize: '1rem', cursor: onClickHandler ? 'pointer' : 'default' }}
        onClick={onClickHandler ? () => onClickHandler(rowData) : undefined}
        role={onClickHandler ? 'button' : undefined}
        tabIndex={onClickHandler ? 0 : undefined}
        onKeyDown={onClickHandler ? (e) => { if (e.key === 'Enter') onClickHandler(rowData); } : undefined}
      ></i>
    );
  };

  return (
    <div className="card table-wrapper">
      <div style={{ marginBottom: 10 }}>
        <InputText
          type="search"
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          placeholder="Buscar en todos los campos"
          className="p-inputtext-sm"
          style={{ width: '100%', maxWidth: 300 }}
        />
      </div>

      <DataTable
        value={data}
        scrollable
        scrollHeight="400px"
        removableSort
        filterDisplay="menu"
        globalFilter={globalFilter}
        globalFilterFields={globalFilterFields}
        className="custom-table" 
      >
        {columns.filter(col => !col.hidden).map((col, index) => {
          const isNumber = col.format === 'number';
          return (
            <Column
              key={index}
              field={col.field}
              header={col.Header}
              style={{
                textAlign: isNumber ? 'right' : (col.center ? 'center' : 'left'),
                whiteSpace: 'nowrap',
                width: getColumnWidth(col.className),
              }}
              align={isNumber ? 'end' : (col.center ? 'center' : 'start')}
              frozen={col.frozen || false}
              body={rowData =>
                col.isIconColumn
                  ? renderIconBody(col.icon, col.onClick, rowData, col.tooltip)
                  : formatValue(rowData[col.field], col.format, rowData, col)
              }
              filter={col.filter !== false}
              filterMatchMode={col.filterMatchMode || 'contains'}
            />
          );
        })}
      </DataTable>
    </div>
  );
}

function getColumnWidth(size) {
  const widths = {
    XxxSmall: '40px',
    XxSmall: '60px',
    Xsmall: '90px',
    Small: '120px',
    Medium: '150px',
    Large: '180px',
    Xlarge: '220px',
    Xxlarge: '280px',
    Xxxlarge: '350px',
    Xxxxlarge: '450px',
  };
  return widths[size] || 'auto';
}

function formatValue(value, format, rowData, column = {}) {
  switch (format) {
    case 'number':
      const num = parseFloat(value);
      return isNaN(num) ? value : num.toFixed(2);


      case 'badge': {
        const valueField = column.valueField || column.field;
        const value = rowData[valueField] || '';
        const safeValue = value.toString().toLowerCase().replace(/\s+/g, '-');

        const handleClick = (e) => {
          e.stopPropagation();
          if (typeof column.onClick === 'function') {
            column.onClick(rowData);
          }
        };

        return (
          <span
            onClick={handleClick}
            className={`badge badge-${safeValue}`}
          >
            {value}
          </span>
        );
      }

    case 'Date':
      if (!value) return '';
      const date = new Date(value);
      const options = {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      };
      return date.toLocaleString('es-HN', options); // Cambia a 'es-ES' si lo prefieres

    case 'text':
    default:
      return value;
  }
}
