import React, { useState } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { ColumnGroup } from 'primereact/columngroup';
import { Row } from 'primereact/row';
import '../base.css';

export default function Table({ columns, data, globalFilter: externalFilter }) {
  const [globalFilter, setGlobalFilter] = useState('');
  const globalFilterValue = externalFilter !== undefined ? externalFilter : globalFilter;

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

  const getSummary = (columns, data) => {
    const summaryRow = {};

    columns.forEach(col => {
      if (col.count) {
        summaryRow[col.field] = data.length;
      } else if (col.summary) {
        const total = data.reduce((acc, item) => acc + (parseFloat(item[col.field]) || 0), 0);
        summaryRow[col.field] = total;
      } else {
        summaryRow[col.field] = '';
      }
    });
    return summaryRow;
  };

  const summaryData = getSummary(columns, data);

  const footerGroup = (
    <ColumnGroup>
      <Row>
        {columns.filter(col => !col.hidden).map((col, index) => {
          const isNumber = col.format === 'number';
          const value = summaryData[col.field];

          return (
            <Column
              key={index}
              footer={
                value !== ''
                  ? col.format === 'number'
                    ? new Intl.NumberFormat('en-US', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    }).format(value)
                    : value
                  : ''
              }
              footerStyle={{
                textAlign: isNumber ? 'right' : (col.center ? 'center' : 'left'),
                fontWeight: 'bold',
                background: 'var(--footer-bg)',
                color: 'var(--text-color)',
              }}
            />
          );
        })}
      </Row>
    </ColumnGroup>
  );

  return (
    <div className="card table-wrapper">
      {externalFilter === undefined && (
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
      )}

      <DataTable
        value={data}
        scrollable
        scrollHeight="590px"
        removableSort
        filterDisplay="menu"
        globalFilter={globalFilterValue}
        globalFilterFields={globalFilterFields}
        className="custom-table p-datatable-gridlines"
        footerColumnGroup={footerGroup}
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
              body={rowData =>
                col.isIconColumn
                  ? renderIconBody(col.icon, col.onClick, rowData, col.tooltip)
                  : formatValue(rowData[col.field], col.format, rowData, col)
              }
              filter={col.filter !== false}
              filterMatchMode={col.filterMatchMode || 'contains'}
              frozen={col.frozen || false}
              alignFrozen={col.alignFrozen || 'left'}
            />
          );
        })}
      </DataTable>
    </div>
  );
}

function getColumnWidth(size) {
  const widths = {
    XxxxSmall: '20px',
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
    Xxxxxlarge: '650px',
  };
  return widths[size] || 'auto';
}

function formatValue(value, format, rowData, column = {}) {
  let formattedValue;

  switch (format) {
    case 'number':
      const num = parseFloat(value);
      formattedValue = isNaN(num)
        ? value
        : new Intl.NumberFormat('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }).format(num);
      break;

    case 'badge': {
      const valueField = column.valueField || column.field;
      const val = rowData[valueField] || '';
      const safeValue = val.toString().toLowerCase().replace(/\s+/g, '-');

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
          {val}
        </span>
      );
    }

    case 'checkbox':
      return (
        <input
          type="checkbox"
          checked={!!value}
          disabled
          style={{ transform: 'scale(1.2)', cursor: 'default' }}
        />
      );

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
      formattedValue = date.toLocaleString('es-HN', options);
      break;

    case 'text':
    default:
      formattedValue = value;
  }

  const prefix = column.prefix || '';
  const suffix = column.suffix || '';

  if (formattedValue === null || formattedValue === undefined) formattedValue = '';

  return formattedValue ? prefix + formattedValue + suffix : formattedValue;
}
