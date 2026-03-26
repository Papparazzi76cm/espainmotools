import jsPDF from "jspdf";
import "jspdf-autotable";

interface InformeData {
  resumen_ejecutivo: string;
  analisis_mercado: string;
  valoracion_estimada: string;
  factores_positivos: string[];
  factores_negativos: string[];
  recomendaciones: string[];
  metodologia: string;
  disclaimer: string;
  analisis_visual?: string;
}

interface InmuebleData {
  tipo: string;
  ubicacion: string;
  superficie?: string;
  superficieTerreno?: string;
  habitaciones?: string;
  banos?: string;
  antiguedad?: string;
  estado?: string;
}

interface AgencyData {
  agency_name?: string;
  agency_phone?: string;
  agency_email?: string;
  agency_logo_url?: string;
}

export async function exportInformePdf(informe: InformeData, inmueble: InmuebleData, agency?: AgencyData) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;
  let y = 20;

  const primaryColor: [number, number, number] = [37, 99, 235];
  const darkColor: [number, number, number] = [15, 23, 42];
  const mutedColor: [number, number, number] = [100, 116, 139];
  const greenColor: [number, number, number] = [22, 163, 74];
  const redColor: [number, number, number] = [220, 38, 38];

  const checkPage = (needed: number) => {
    if (y + needed > 270) {
      doc.addPage();
      y = 20;
    }
  };

  const addSection = (title: string, color: [number, number, number] = primaryColor) => {
    checkPage(20);
    doc.setFillColor(...color);
    doc.rect(margin, y, contentWidth, 8, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(255, 255, 255);
    doc.text(title, margin + 4, y + 5.5);
    y += 12;
  };

  const addParagraph = (text: string) => {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...darkColor);
    const lines = doc.splitTextToSize(text, contentWidth);
    checkPage(lines.length * 4.5);
    doc.text(lines, margin, y);
    y += lines.length * 4.5 + 4;
  };

  const addBulletList = (items: string[], bulletColor: [number, number, number] = primaryColor, bulletChar = "•") => {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    items.forEach((item) => {
      const lines = doc.splitTextToSize(item, contentWidth - 8);
      checkPage(lines.length * 4.5 + 2);
      doc.setTextColor(...bulletColor);
      doc.text(bulletChar, margin + 2, y);
      doc.setTextColor(...darkColor);
      doc.text(lines, margin + 8, y);
      y += lines.length * 4.5 + 1.5;
    });
    y += 2;
  };

  // === HEADER with agency branding ===
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, pageWidth, 44, "F");

  let headerTextX = margin;

  // Try to add agency logo
  if (agency?.agency_logo_url) {
    try {
      const img = await loadImage(agency.agency_logo_url);
      doc.addImage(img, "PNG", margin, 6, 32, 32);
      headerTextX = margin + 36;
    } catch {
      // Logo failed to load, skip
    }
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(255, 255, 255);
  doc.text("INFORME DE VALORACIÓN", headerTextX, 16);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text("INMOBILIARIA", headerTextX, 24);

  if (agency?.agency_name) {
    doc.setFontSize(9);
    doc.text(agency.agency_name, headerTextX, 32);
  }

  // Right side: date + agency contact
  doc.setFontSize(8);
  const rightX = pageWidth - margin;
  doc.text(
    `Fecha: ${new Date().toLocaleDateString("es-ES", { day: "2-digit", month: "long", year: "numeric" })}`,
    rightX, 14, { align: "right" }
  );
  if (agency?.agency_phone) {
    doc.text(`Tel: ${agency.agency_phone}`, rightX, 20, { align: "right" });
  }
  if (agency?.agency_email) {
    doc.text(agency.agency_email, rightX, 26, { align: "right" });
  }
  if (!agency?.agency_name && !agency?.agency_phone) {
    doc.text("Generado por Espainmo Tools", rightX, 20, { align: "right" });
  }

  y = 52;

  // === PROPERTY DATA TABLE ===
  const tableData = [
    ["Tipo", inmueble.tipo || "—"],
    ["Ubicación", inmueble.ubicacion || "—"],
    ["Sup. construida", inmueble.superficie ? `${inmueble.superficie} m²` : "—"],
    ["Sup. terreno", inmueble.superficieTerreno ? `${inmueble.superficieTerreno} m²` : "—"],
    ["Habitaciones", inmueble.habitaciones || "—"],
    ["Baños", inmueble.banos || "—"],
    ["Antigüedad", inmueble.antiguedad ? `${inmueble.antiguedad} años` : "—"],
    ["Estado", inmueble.estado || "—"],
  ];

  (doc as any).autoTable({
    startY: y,
    head: [["Característica", "Valor"]],
    body: tableData,
    margin: { left: margin, right: margin },
    headStyles: { fillColor: primaryColor, fontSize: 9, font: "helvetica" },
    bodyStyles: { fontSize: 9, font: "helvetica", textColor: darkColor },
    alternateRowStyles: { fillColor: [245, 247, 250] },
    columnStyles: { 0: { fontStyle: "bold", cellWidth: 45 } },
  });
  y = (doc as any).lastAutoTable.finalY + 8;

  // === SECTIONS ===
  addSection("RESUMEN EJECUTIVO");
  addParagraph(informe.resumen_ejecutivo);

  addSection("VALORACIÓN ESTIMADA", greenColor);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...darkColor);
  const valLines = doc.splitTextToSize(informe.valoracion_estimada, contentWidth);
  checkPage(valLines.length * 5);
  doc.text(valLines, margin, y);
  y += valLines.length * 5 + 6;

  addSection("ANÁLISIS DE MERCADO");
  addParagraph(informe.analisis_mercado);

  // === VISUAL ANALYSIS (if available) ===
  if (informe.analisis_visual) {
    addSection("ANÁLISIS VISUAL DEL INMUEBLE", [139, 92, 246]);
    addParagraph(informe.analisis_visual);
  }

  addSection("FACTORES POSITIVOS", greenColor);
  addBulletList(informe.factores_positivos, greenColor, "✓");

  addSection("FACTORES NEGATIVOS", redColor);
  addBulletList(informe.factores_negativos, redColor, "✗");

  addSection("RECOMENDACIONES");
  addBulletList(informe.recomendaciones, primaryColor, "→");

  addSection("METODOLOGÍA", mutedColor);
  doc.setFontSize(8);
  doc.setTextColor(...mutedColor);
  const methLines = doc.splitTextToSize(informe.metodologia, contentWidth);
  checkPage(methLines.length * 3.5);
  doc.text(methLines, margin, y);
  y += methLines.length * 3.5 + 6;

  // === DISCLAIMER ===
  checkPage(20);
  doc.setFillColor(245, 247, 250);
  const disclaimerLines = doc.splitTextToSize(informe.disclaimer, contentWidth - 8);
  const disclaimerHeight = disclaimerLines.length * 3.5 + 8;
  doc.rect(margin, y, contentWidth, disclaimerHeight, "F");
  doc.setFontSize(7);
  doc.setTextColor(...mutedColor);
  doc.text(disclaimerLines, margin + 4, y + 5);

  // === FOOTER on every page ===
  const totalPages = doc.getNumberOfPages();
  const footerText = agency?.agency_name || "Espainmo Tools";
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setTextColor(...mutedColor);
    doc.text(`${footerText} — Informe de Valoración`, margin, 290);
    doc.text(`Página ${i} de ${totalPages}`, pageWidth - margin - 25, 290);
  }

  doc.save(`informe-valoracion-${Date.now()}.pdf`);
}

function loadImage(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return reject("No canvas context");
      ctx.drawImage(img, 0, 0);
      resolve(canvas.toDataURL("image/png"));
    };
    img.onerror = reject;
    img.src = url;
  });
}
