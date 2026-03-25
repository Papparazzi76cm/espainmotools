import jsPDF from "jspdf";

interface ContratoData {
  contrato: string;
  clausulas_clave: string[];
  base_legal: string[];
  advertencias: string[];
  resumen: string;
}

interface ContratoMeta {
  tipo: string;
  partes: string;
  inmueble: string;
  condiciones: string;
}

interface AgencyData {
  agency_name?: string;
  agency_phone?: string;
  agency_email?: string;
  agency_logo_url?: string;
}

export async function exportContratoPdf(
  contrato: ContratoData,
  meta: ContratoMeta,
  agency?: AgencyData
) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;
  let y = 20;

  const primaryColor: [number, number, number] = [37, 99, 235];
  const darkColor: [number, number, number] = [15, 23, 42];
  const mutedColor: [number, number, number] = [100, 116, 139];
  const amberColor: [number, number, number] = [217, 119, 6];
  const blueColor: [number, number, number] = [59, 130, 246];

  const checkPage = (needed: number) => {
    if (y + needed > 275) {
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

  const addParagraph = (text: string, fontSize = 9) => {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(fontSize);
    doc.setTextColor(...darkColor);
    const lines = doc.splitTextToSize(text, contentWidth);
    for (const line of lines) {
      checkPage(5);
      doc.text(line, margin, y);
      y += 4.5;
    }
    y += 3;
  };

  const addBulletList = (
    items: string[],
    bulletColor: [number, number, number] = primaryColor,
    bulletChar = "•"
  ) => {
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

  // === HEADER ===
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, pageWidth, 44, "F");

  let headerTextX = margin;

  if (agency?.agency_logo_url) {
    try {
      const img = await loadImage(agency.agency_logo_url);
      doc.addImage(img, "PNG", margin, 6, 32, 32);
      headerTextX = margin + 36;
    } catch {
      // skip
    }
  }

  const tipoLabel =
    meta.tipo.charAt(0).toUpperCase() + meta.tipo.slice(1).replace(/-/g, " ");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.setTextColor(255, 255, 255);
  doc.text(`CONTRATO DE ${tipoLabel.toUpperCase()}`, headerTextX, 16);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text("DOCUMENTO INMOBILIARIO", headerTextX, 24);

  if (agency?.agency_name) {
    doc.setFontSize(9);
    doc.text(agency.agency_name, headerTextX, 32);
  }

  const rightX = pageWidth - margin;
  doc.setFontSize(8);
  doc.text(
    `Fecha: ${new Date().toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    })}`,
    rightX,
    14,
    { align: "right" }
  );
  if (agency?.agency_phone) {
    doc.text(`Tel: ${agency.agency_phone}`, rightX, 20, { align: "right" });
  }
  if (agency?.agency_email) {
    doc.text(agency.agency_email, rightX, 26, { align: "right" });
  }
  if (!agency?.agency_name && !agency?.agency_phone) {
    doc.text("Generado por Pynmo Tools", rightX, 20, { align: "right" });
  }

  y = 52;

  // === RESUMEN ===
  addSection("RESUMEN");
  addParagraph(contrato.resumen);

  // === CONTRATO COMPLETO ===
  addSection("TEXTO DEL CONTRATO");
  // Split by line breaks and render paragraph by paragraph
  const paragraphs = contrato.contrato.split(/\n+/).filter((p) => p.trim());
  for (const p of paragraphs) {
    addParagraph(p, 9);
  }

  // === CLÁUSULAS CLAVE ===
  if (contrato.clausulas_clave?.length > 0) {
    addSection("CLÁUSULAS CLAVE");
    addBulletList(contrato.clausulas_clave, primaryColor, "•");
  }

  // === BASE LEGAL ===
  if (contrato.base_legal?.length > 0) {
    addSection("BASE LEGAL ESPAÑOLA", blueColor);
    addBulletList(contrato.base_legal, blueColor, "§");
  }

  // === ADVERTENCIAS ===
  if (contrato.advertencias?.length > 0) {
    addSection("ADVERTENCIAS", amberColor);
    addBulletList(contrato.advertencias, amberColor, "!");
  }

  // === DISCLAIMER ===
  checkPage(20);
  doc.setFillColor(245, 247, 250);
  const disclaimerText =
    "Este documento es un modelo orientativo generado por inteligencia artificial y NO sustituye el asesoramiento legal profesional. Debe ser revisado por un abogado antes de su firma. El uso de este contrato es responsabilidad exclusiva de las partes.";
  const disclaimerLines = doc.splitTextToSize(disclaimerText, contentWidth - 8);
  const disclaimerH = disclaimerLines.length * 3.5 + 8;
  doc.rect(margin, y, contentWidth, disclaimerH, "F");
  doc.setFontSize(7);
  doc.setTextColor(...mutedColor);
  doc.text(disclaimerLines, margin + 4, y + 5);
  y += disclaimerH + 6;

  // === FIRMA SPACES ===
  checkPage(50);
  y += 10;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...darkColor);

  const colWidth = contentWidth / 2 - 5;
  const lineY = y + 25;

  doc.line(margin, lineY, margin + colWidth, lineY);
  doc.text("Firma Parte 1", margin + colWidth / 2, lineY + 5, {
    align: "center",
  });

  doc.line(margin + colWidth + 10, lineY, margin + contentWidth, lineY);
  doc.text("Firma Parte 2", margin + colWidth + 10 + colWidth / 2, lineY + 5, {
    align: "center",
  });

  // === FOOTER ===
  const totalPages = doc.getNumberOfPages();
  const footerText = agency?.agency_name || "Pynmo Tools";
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setTextColor(...mutedColor);
    doc.text(`${footerText} — Contrato Inmobiliario`, margin, 290);
    doc.text(`Página ${i} de ${totalPages}`, pageWidth - margin - 25, 290);
  }

  doc.save(`contrato-${meta.tipo}-${Date.now()}.pdf`);
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
