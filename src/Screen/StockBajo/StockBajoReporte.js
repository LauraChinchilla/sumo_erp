import { useEffect, useState } from "react";
import { Dialog } from "primereact/dialog";
import { supabase } from "../../supabaseClient";
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import formatNumber from "../../utils/funcionesFormatNumber";


pdfMake.vfs = pdfFonts.pdfMake?.vfs || pdfFonts.vfs;

export default function StockBajoReporte({ showDialog, setShowDialog, data }) {
  const [pdfUrl, setPdfUrl] = useState(null);

  const getInfo = async (data) => {
    const { data: infoEmpresa, error } = await supabase
      .from("InformacionEmpresa")
      .select("*");

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
    const docDefinition = {
      pageSize: "letter",
      pageMargins: [40, 100, 40, 60],

      header: {
        columns: [
          {
            image: Logo,
            width: 140,
            margin: [30, 20, 0, 0],
          },
          {
            text: infoEmpresa?.NombreLargo || "",
            style: "titulo",
            margin: [90, 45, 0, 0],
          },
          {
            text: "STOCK BAJO",
            style: "titulo2",
            margin: [30, 45, 0, 0],
          },
        ],
      },

      footer: (currentPage, pageCount) => {
        const fecha = new Date();
        const fechaFormateada = fecha.toLocaleDateString("es-HN", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        });

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
            widths: ["15%", "*", "15%", "12%", "12%"],
            body: [
              [
                { text: "Codigo", style: "headerTable" },
                { text: "Producto", style: "headerTable" },
                { text: "Categoria", style: "headerTable" },
                { text: "Unidad", style: "headerTable" },
                { text: "Cantidad", style: "headerTable" },
              ],
              ...(data || []).map((item) => [
                {text: item.Code, style: 'table', alignment: 'center'},
                {text: item.Name, style: 'table'},
                {text: item.categoryname, style: 'table'},
                {text: item.UnitName, style: 'table'},
                {text: formatNumber(item.TotalUnidades), style: 'table', alignment: 'right'},
              ]),
            ],
          },
          margin: [0, 30, 0, 0],
          layout: 'lightHorizontalLines'
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
          fontSize: 10,
        },
        headerTable: {
          fontSize: 10,
          bold: true,
          alignment: 'center',
        },

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
          title="Reporte Stock Bajo"
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
