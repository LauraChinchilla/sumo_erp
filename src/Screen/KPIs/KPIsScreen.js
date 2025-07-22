import React, { useEffect, useRef, useState } from "react";
import { Toast } from "primereact/toast";
import { Chart } from "primereact/chart";
import { Card } from "primereact/card";
import ChartDataLabels from 'chartjs-plugin-datalabels';


import { supabase } from "../../supabaseClient";

import CalendarMonth from "../../components/CalendarMonth";
import formatNumber from "../../utils/funcionesFormatNumber";
import { Button } from "primereact/button";
import Loading from "../../components/Loading";

export default function KPIsScreen() {
  const [loading, setLoading] = useState(false);
  const toast = useRef(null);
  const [rangeDates, setRangeDates] = useState(() => {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return [firstDay, lastDay];
  });
  const [selectedMonth, setSelectedMonth] = useState(null);

  const [chartData, setChartData] = useState({});
  const [chartOptions, setChartOptions] = useState({});

  // Nuevo estado para el gráfico de barras
  const [barChartData, setBarChartData] = useState({});
  const [barChartOptions, setBarChartOptions] = useState({});
  const [lineChartData, setLineChartData] = useState({});
  const [lineChartOptions, setLineChartOptions] = useState({});
  const [lineChartData1, setLineChartData1] = useState({});
  const [lineChartOptions1, setLineChartOptions1] = useState({});

  const getInfo = async () => {
    setLoading(true);

    const from = new Date(rangeDates[0]);
    const to = new Date(rangeDates[1]);
    to.setHours(23, 59, 59, 999); // incluir todo el día

    const { data, error } = await supabase
      .from("vta_flujocaja")
      .select("*")
      .gte("Date", from.toISOString())
      .lte("Date", to.toISOString());

    const { data: productosMasVendidos, error: errorProductos } = await supabase
      .from("vta_salidas")
      .select(
        `
            "IdProduct",
            "Name",
            "Code",
            CantidadSalida,
            Total,
            Date
        `
      )
      .gte("Date", from.toISOString())
      .lte("Date", to.toISOString())
      .order("CantidadSalida", { ascending: false })
      .limit(50); // más datos para agrupar bien

    const year = from.getFullYear();

    const { data: gananciaData, error: errorGanancia } = await supabase
      .from("vta_ganancias_mensuales")
      .select("*")
      .eq("Ano", year);

    const { data: ventas, error: errorVentas } = await supabase
      .from("vta_ventas_usuario")
      .select("*");

    const totalPorUsuario = ventas.reduce((acc, curr) => {
      if (!acc[curr.IdUserEdit]) {
        acc[curr.IdUserEdit] = {
          IdUserEdit: curr.IdUserEdit,
          UserName: curr.UserName,
          TotalVendido: 0,
        };
      }
      acc[curr.IdUserEdit].TotalVendido += curr.TotalVendido;
      return acc;
    }, {});

    const resultado = Object.values(totalPorUsuario);

    if (!error && !errorProductos && !errorGanancia && !errorVentas) {
      const ingresos = data.reduce((acc, item) => acc + (item.Salidas || 0), 0);
      const egresos = data.reduce((acc, item) => acc + (item.Entradas || 0), 0);

      if (ingresos <= 0 && egresos <= 0) {
        toast.current?.show({
          severity: "error",
          summary: "Error al cargar datos",
          detail: "No existen datos para el mes seleccionado",
          life: 3000,
        });
      }

      generarPieChart({ ingresos, egresos });
      generarGraficoBarras(productosMasVendidos);
      generarGraficoLineal(gananciaData);
      generarGraficoLineal1(
        resultado.sort((a, b) => b.TotalVendido - a.TotalVendido)
      );
    } else {
      toast.current?.show({
        severity: "error",
        summary: "Error al cargar datos",
        detail: error?.message || errorProductos?.message,
        life: 3000,
      });
    }

    setLoading(false);
  };

  const formatMonthYear = (date) => {
    const options = { year: "numeric", month: "long" };
    return date.toLocaleDateString("es-ES", options);
  };

  const generarPieChart = (datos) => {
    const documentStyle = getComputedStyle(document.documentElement);

    const data = {
      labels: ["Ingresos", "Egresos"],
      datasets: [
        {
          data: [datos?.ingresos, datos?.egresos],
          backgroundColor: [
            documentStyle.getPropertyValue("--color-azul").trim(),
            documentStyle.getPropertyValue("--color-rosa").trim(),
          ],
          hoverBackgroundColor: [
            documentStyle.getPropertyValue("--color-azul-hover").trim(),
            documentStyle.getPropertyValue("--color-rosa-hover").trim(),
          ],
        },
      ],
    };

    const options = {
      plugins: {
        legend: {
          display: true,
          position: "top",
          labels: {
            usePointStyle: true,
            color: "#333",
            font: { size: 14 },
          },
        },
        tooltip: {
          enabled: true,
          backgroundColor: "rgba(0,0,0,0.7)",
          titleFont: { size: 16, weight: "bold" },
          bodyFont: { size: 14 },
          padding: 10,
          callbacks: {
            label: function (context) {
              const value = context.parsed || 0;
              return ` L ${formatNumber(value)}`;
            },
          },
        },
        datalabels: {
          color: "#000",
          font: {
            size: 14,
          },
          formatter: function (value) {
            return `L ${formatNumber(value)}`;
          },
        },
      },
    };

    setChartData(data);
    setChartOptions(options);
  };

  const generarGraficoBarras = (datos) => {
    if (!datos || datos.length === 0) {
      setBarChartData({});
      setBarChartOptions({});
      return;
    }

    // Agrupar productos por IdProduct sumando CantidadSalida
    const agrupado = datos.reduce((acc, item) => {
      if (!acc[item.IdProduct]) {
        acc[item.IdProduct] = {
          name: item.Name,
          cantidad: 0,
        };
      }
      acc[item.IdProduct].cantidad += item.CantidadSalida;
      return acc;
    }, {});

    // Ordenar por cantidad descendente y tomar top 10
    const top10 = Object.values(agrupado)
      .sort((a, b) => b.cantidad - a.cantidad)
      .slice(0, 10);

    const documentStyle = getComputedStyle(document.documentElement);

    const data = {
      labels: top10.map((p) => p.name),
      datasets: [
        {
          label: "Cantidad Vendida",
          backgroundColor: documentStyle
            .getPropertyValue("--color-azul")
            .trim(),
          data: top10.map((p) => p.cantidad),
        },
      ],
    };

    const options = {
      indexAxis: "x",
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          enabled: true,
          callbacks: {
            label: function (context) {
              return `Cantidad: ${context.parsed.y}`;
            },
          },
        },
        datalabels: {
          anchor: 'end',
          align: 'top',
          color: '#000',
          font: {
            weight: 'bold',
            size: 12,
          },
          formatter: (value) => value
        }
      },
      scales: {
        x: {
          title: {
            display: true,
            text: "Producto",
          },
          ticks: {
            maxRotation: 90,
            minRotation: 90,
            font: { size: 12 },
          },
        },
        y: {
          beginAtZero: true,
          ticks: {
            align: "start",
            crossAlign: "near",
            padding: 10,
            maxRotation: 90,
            minRotation: 90,
          },
          title: {
            display: true,
            text: "Cantidad",
          },
        },
      },
      responsive: true,
      maintainAspectRatio: false,
    };
    setBarChartData(data);
    setBarChartOptions(options);
  };

  const generarGraficoLineal = (datos) => {
    const documentStyle = getComputedStyle(document.documentElement);

    // labels con nombre del mes
    const labels = datos.map((item) => item.NombreMes);

    // datos con ganancia estimada
    const ganancias = datos.map((item) => item.GananciaEstimada);

    const data = {
      labels,
      datasets: [
        {
          label: "Ganancia Estimada",
          data: ganancias,
          fill: false,
          borderColor:
            documentStyle.getPropertyValue("--color-verde") || "#42A5F5",
          backgroundColor:
            documentStyle.getPropertyValue("--color-verde") || "#42A5F5",
          tension: 0.4,
          pointBackgroundColor: "#ffffff",
          pointBorderColor:
            documentStyle.getPropertyValue("--color-verde") || "#42A5F5",
        },
      ],
    };

    const options = {
      indexAxis: "x",
      responsive: true,
      plugins: {
        legend: { position: "top" },
        tooltip: {
          callbacks: {
            label: function (context) {
              const value = context.parsed.y;
              return `L ${formatNumber(value)}`;
            },
          },
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          title: { display: true, text: "Ganancia Estimada" },
          ticks: {
            callback: (value) => `L ${formatNumber(value)}`,
          },
        },
        x: {
          title: { display: true, text: "Mes" },
          ticks: {
            maxRotation: 90, // <-- aquí está lo importante
            minRotation: 90,
            font: { size: 12 },
          },
        },
      },
    };

    setLineChartData(data);
    setLineChartOptions(options);
  };

  const generarGraficoLineal1 = (datos) => {
    const documentStyle = getComputedStyle(document.documentElement);

    const labels = datos.map((item) => item.UserName);
    const totales = datos.map((item) => item.TotalVendido);

    const data = {
      labels,
      datasets: [
        {
          label: "Total Vendido por Usuario",
          data: totales,
          fill: false,
          borderColor:
            documentStyle.getPropertyValue("--color-rosa") || "#FFA726",
          backgroundColor:
            documentStyle.getPropertyValue("--color-rosa") || "#FFA726",
          tension: 0.4,
          pointBackgroundColor: "#ffffff",
          pointBorderColor:
            documentStyle.getPropertyValue("--color-rosa") || "#FFA726",
        },
      ],
    };

    const options = {
      indexAxis: "x",
      responsive: true,
      plugins: {
        legend: { position: "top" },
        tooltip: {
          callbacks: {
            label: function (context) {
              const value = context.parsed.y;
              return `L ${formatNumber(value)}`;
            },
          },
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          title: { display: true, text: "Total Vendido" },
          ticks: {
            callback: (value) => `L ${formatNumber(value)}`,
          },
        },
        x: {
          title: { display: true, text: "Usuario" },
          ticks: {
            maxRotation: 90,
            minRotation: 90,
            font: { size: 12 },
          },
        },
      },
    };

    setLineChartData1(data);
    setLineChartOptions1(options);
  };

  useEffect(() => {
    getInfo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rangeDates]);

  useEffect(() => {
    document.title = "Sumo - KPIs";
  }, []);

  return (
    <>
      <Toast ref={toast} />
      {loading && <Loading message="Cargando..." />}
      <div className="dashboard-container">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "1rem",
            marginTop: "1.5rem",
          }}
        >
          <CalendarMonth
            rangeDates={rangeDates}
            setRangeDates={setRangeDates}
            selectedMonth={selectedMonth}
            setSelectedMonth={setSelectedMonth}
            ocultarCalendar={true}
          />
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <Button
              icon="pi pi-refresh"
              className="p-button-success"
              onClick={getInfo}
              disabled={loading}
              severity="primary"
            />
          </div>
        </div>

        {!loading && (
          <div
            style={{
              display: "flex",
              gap: "1rem",
              justifyContent: "center",
              flexWrap: "nowrap",
              marginTop: "0.5rem",
            }}
          >
            <Card style={{ width: "580px", flexShrink: 0 }}>
              <h4 style={{ textAlign: "center", marginBottom: "0.5rem" }}>
                Resumen Financiero - {formatMonthYear(rangeDates[0])}
              </h4>
              <Chart
                type="pie"
                data={chartData}
                options={chartOptions}
                plugins={[ChartDataLabels]} 
                style={{ height: "540px", width: "100%" }}
              />
            </Card>

            <Card style={{ width: "580px", flexShrink: 0 }}>
              <h4 style={{ textAlign: "center", marginBottom: "1rem" }}>
                Productos más vendidos - {formatMonthYear(rangeDates[0])}
              </h4>
              <Chart
                type="bar"
                data={barChartData}
                options={barChartOptions}
                style={{ height: "540px", width: "100%" }}
                plugins={[ChartDataLabels]}
              />
            </Card>

            <Card
              style={{ width: "580px", flexShrink: 0, paddingBottom: "1rem" }}
            >
              <h4 style={{ textAlign: "center", marginBottom: "0.5rem" }}>
                Ganancia Estimada
              </h4>
              <Chart
                type="line"
                data={lineChartData}
                options={lineChartOptions}
                style={{ height: "240px", width: "100%" }}
              />

              <h4 style={{ textAlign: "center", margin: "1rem 0 0.5rem" }}>
                Total Vendido por Usuario
              </h4>
              <Chart
                type="line"
                data={lineChartData1}
                options={lineChartOptions1}
                style={{ height: "240px", width: "100%" }}
              />
            </Card>
          </div>
        )}
      </div>
    </>
  );
}
