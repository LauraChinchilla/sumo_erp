import { useEffect, useState } from "react";
import { Dialog } from "primereact/dialog";
import { supabase } from "../../supabaseClient";
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import formatNumber from "../../utils/funcionesFormatNumber";

pdfMake.vfs = pdfFonts.pdfMake?.vfs || pdfFonts.vfs;

export default function EntradasReporte({ showDialog, setShowDialog, data, rangeDates }) {
  const [pdfUrl, setPdfUrl] = useState(null);

  const getInfo = async (data) => {
    const { data: infoEmpresa, error } = await supabase.from("InformacionEmpresa").select("*");

    const logoUrl = infoEmpresa[0]?.Logo;

    if (!logoUrl) {
      console.warn("No se encontró la URL del logo");
      return;
    }

    const response = await fetch(logoUrl);
    const blob = await response.blob();
    const base64Logo = await blobToBase64(blob);

    if (error) {
      console.error(error);
      return;
    }

    GenerarReporte(data, infoEmpresa[0], base64Logo);
  };

  function blobToBase64(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  const GenerarReporte = (data, infoEmpresa, Logo) => {
    const totalGeneral = (data || []).reduce((acc, item) => acc + (item.Total || 0), 0);
    const subTotalGeneral = (data || []).reduce((acc, item) => acc + (item.SubTotal || 0), 0);
    const formatDate = (date) =>
    date.toLocaleDateString("es-HN", { day: "2-digit", month: "2-digit", year: "numeric" });

    const fechaInicio = formatDate(rangeDates[0]);
    const fechaFin = formatDate(rangeDates[1]);

    const docDefinition = {
      pageSize: "letter",
      pageMargins: [40, 100, 40, 60],
      pageOrientation: 'landscape',


      header: {
        table: {
            widths: [160, '*', '*'],
            body: [
            [
                {
                    image: Logo,
                    width: 140,
                    margin: [30, 20, 0, 0],
                    rowSpan: 2,
                },
                {
                    text: infoEmpresa?.NombreLargo || "",
                    style: "titulo",
                    margin: [20, 25, 0, 0],
                },
                {
                    text: "Entradas",
                    style: "titulo2",
                    margin: [40, 25, 0, 0],
                }
            ],
            [
                {}, 
                { text: "" }, 
                { text: `${fechaInicio} - ${fechaFin}`, style: "subtituloFechas", margin: [115, 0, 0, 0] },
            ]
            ]
        },
        layout: "noBorders"
      },

      footer: (currentPage, pageCount) => {
        const fecha = new Date();
        const fechaFormateada = fecha.toLocaleDateString("es-HN", { day: "2-digit", month: "2-digit", year: "numeric"});

        return {
          columns: [
            {
              text: `Fecha de impresión: ${fechaFormateada}`,
              alignment: "left",
              margin: [40, 0, 0, 0],
              style: "footer",
            },
            {
              text: `Página ${currentPage} de ${pageCount}`,
              alignment: "right",
              margin: [0, 0, 40, 0],
              style: "footer",
            },
          ],
        };
      },
      
      content: [
        {
            table: {
            widths: ["15%", "*", "10%", "10%", "11%", '10%', '11%', '10%'],
            body: [
                [
                    { text: "Codigo", style: "headerTable" },
                    { text: "Producto", style: "headerTable" },
                    { text: "Proveedor", style: "headerTable" },
                    { text: "Cantidad", style: "headerTable1" },
                    { text: "Precio", style: "headerTable1" },
                    { text: "ISV", style: "headerTable1" },
                    { text: "SubTotal", style: "headerTable1" },
                    { text: "Total", style: "headerTable1" },
                ],
                ...(data || []).map((item) => [
                    { text: item.Code, style: "table", alignment: "center" },
                    { text: item.ProductName, style: "table" },
                    { text: item.VendorName, style: "table" },
                    { text: `${formatNumber(item.Cantidad || 0)} ${item?.UnitSymbol || 'U'}`, style: "table", alignment: "right" },
                    { text: `L ${formatNumber(item.PrecioCompra || 0)}`, style: "table", alignment: "right" },
                    { text: `${formatNumber(item.ISV || 0)} %`, style: "table", alignment: "right" },
                    { text: `L ${formatNumber(item.SubTotal || 0)}`, style: "table", alignment: "right" },
                    { text: `L ${formatNumber(item.Total || 0)}`, style: "table", alignment: "right" },
                ]),
                // Fila de total general
                [
                { text: "TOTAL", style: "headerTable"},
                { text: "", border: [false, false, false, false] },
                { text: "", border: [false, false, false, false] },
                { text: "", border: [false, false, false, false] },
                { text: "", border: [false, false, false, false] },
                { text: "", border: [false, false, false, false] },
                { text: `L ${formatNumber(subTotalGeneral)}`, style: "headerTable", alignment: "right" },
                { text: `L ${formatNumber(totalGeneral)}`, style: "headerTable", alignment: "right" },
                ],
            ],
            },
            margin: [0, 30, 0, 0],
            layout: "lightHorizontalLines",
        },
      ],

      styles: {
        header: {
          fontSize: 18,
          bold: true,
        },
        subheader: {
          fontSize: 14,
          margin: [0, 10, 0, 5],
        },
        titulo: {
          fontSize: 17,
          alignment: "center",
          bold: true,
        },
        titulo2: {
          fontSize: 14,
          alignment: "center",
          color: "red",
          bold: true,
        },
        footer: {
          fontSize: 10,
        },
        table: {
          fontSize: 9,
        },
        headerTable: {
          fontSize: 9,
          bold: true,
          alignment: 'center',
        },
        headerTable1: {
          fontSize: 9,
          bold: true,
          alignment: 'right',
        },
        subtituloFechas: {
            fontSize: 12,
            italics: true,
            color: '#555',
            margin: [45,0,0,0]
        }

      },
    };

    pdfMake.createPdf(docDefinition).getBlob((blob) => {
      const url = URL.createObjectURL(blob);
      setPdfUrl(url);
    });
  };

  const handleClose = () => {
    setShowDialog(false);
    setPdfUrl(null);
  };

  useEffect(() => {
    if (showDialog) {
      getInfo(data);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showDialog]);

  return (
    <Dialog
      visible={showDialog}
      style={{ width: "70%", height: "100vh" }}
      onHide={handleClose}
      modal
    >
      {pdfUrl ? (
        <iframe
          src={pdfUrl}
          title="Salidas"
          width="100%"
          height="730px"
          style={{ border: "none" }}
        />
      ) : (
        <p>Cargando reporte...</p>
      )}
    </Dialog>
  );
}
