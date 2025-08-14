import { useEffect, useState } from "react";
import { Dialog } from "primereact/dialog";
import { supabase } from "../../supabaseClient";
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import formatNumber from "../../utils/funcionesFormatNumber";

pdfMake.vfs = pdfFonts.pdfMake?.vfs || pdfFonts.vfs;

export default function ReciboPago({ showDialog, setShowDialog }) {
  const [pdfUrl, setPdfUrl] = useState(null);

//   const getInfo = async () => {
//     const { data: infoEmpresa, error: errorEmpresa } = await supabase
//       .from("InformacionEmpresa")
//       .select("*");

//     if (errorEmpresa) {
//       console.error(errorEmpresa);
//       return;
//     }

//     const logoUrl = infoEmpresa[0]?.Logo;
//     if (!logoUrl) {
//       console.warn("No se encontró la URL del logo");
//       return;
//     }

//     const { data: ultimaSalida, error: errorUltima } = await supabase
//       .from("vta_salidas")
//       .select("*")
//       .order("IdSalida", { ascending: false })
//       .limit(1);

//     if (errorUltima || !ultimaSalida?.length) {
//       console.error("No se pudo obtener la última salida", errorUltima);
//       return;
//     }

//     const salida = ultimaSalida[0];
//     let dataSalida = [];

//     if (!salida.IdSalidaEnc) {
//       dataSalida = [salida];
//     } else {
//       const { data: salidasRelacionadas, error: errorRelacionadas } =
//         await supabase
//           .from("vta_salidas")
//           .select("*")
//           .eq("IdSalidaEnc", salida.IdSalidaEnc);
//       if (errorRelacionadas) {
//         console.error(
//           "Error obteniendo salidas relacionadas",
//           errorRelacionadas
//         );
//         return;
//       }
//       dataSalida = salidasRelacionadas;
//     }

//     const response = await fetch(logoUrl);
//     const blob = await response.blob();
//     const base64Logo = await blobToBase64(blob);

//     GenerarReporte(dataSalida, base64Logo);
//   };

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
      pageSize: { width: 226, height: "auto" },
      pageMargins: [10, 10, 10, 10],
      content: [
        { text: "RECIBO DE PAGO", style: "header", alignment: "center" },
        { text: "Cliente: Juan Pérez" },
        { text: "Fecha: 14/08/2025" },
        { text: "------------------------------" },
        { text: "Producto A   x2   L 100.00" },
        { text: "Producto B   x1   L 50.00" },
        { text: "------------------------------" },
        { text: "TOTAL: L 150.00", bold: true, alignment: "right" },
      ],
      styles: {
        header: { fontSize: 12, bold: true },
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

//   useEffect(() => {
//     if (showDialog) {
//         console.log('ABIERTOTOOOOOOOOOOOOOO')
//         getInfo();
//     }
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [showDialog]);

  return (
    <Dialog
      visible={showDialog}
      style={{ width: "70%", height: "100vh" }}
      onHide={handleClose}
      modal
    >
      <h1>HOLAAAAAAAAAAA</h1>
      {/* {pdfUrl ? (
        <iframe
          src={pdfUrl}
          title="Salidas"
          width="100%"
          height="730px"
          style={{ border: "none" }}
        />
      ) : (
        <p>Cargando reporte...</p>
      )} */}
    </Dialog>
  );
}
