import React, { useState } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import '../base.css';

export default function Table({ columns, data }) {
  const [globalFilter, setGlobalFilter] = useState('');

  const globalFilterFields = columns.filter(col => !col.isIconColumn).map(col => col.field);
  
  const renderIconBody = (iconClass, onClickHandler, rowData) => {
    return (
      <i
        className={iconClass}
        style={{ fontSize: '1.2rem', cursor: onClickHandler ? 'pointer' : 'default' }}
        onClick={onClickHandler ? () => onClickHandler(rowData) : undefined}
        role={onClickHandler ? 'button' : undefined}
        tabIndex={onClickHandler ? 0 : undefined}
        onKeyDown={onClickHandler ? (e) => { if(e.key === 'Enter') onClickHandler(rowData); } : undefined}
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
        paginator
        rows={10}
        removableSort
        filterDisplay="menu"
        globalFilter={globalFilter}
        globalFilterFields={globalFilterFields}
      >
        {columns.map((col, index) => (
          <Column
            key={index}
            field={col.field}
            header={col.Header}
            style={{
              textAlign: col.center ? 'center' : 'left',
              whiteSpace: 'nowrap',
              width: getColumnWidth(col.className),
            }}
            align={col.center ? 'center' : 'start'}
            frozen={col.frozen || false}
            body={rowData =>
              col.isIconColumn
                ? renderIconBody(col.icon, col.onClick, rowData)
                : formatValue(rowData[col.field], col.format)
            }
            filter={col.filter !== false}
            filterMatchMode={col.filterMatchMode || 'contains'}
          />
        ))}
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
  };

  return widths[size] || 'auto';
}

function formatValue(value, format) {
  switch (format) {
    case 'number':
      return new Intl.NumberFormat().format(value);
    case 'text':
    default:
      return value;
  }
}
