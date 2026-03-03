/**
 * Utilidades de Exportación (con Lazy Loading)
 *
 * Funciones para exportar datos a Excel y PDF.
 * Las librerías pesadas (xlsx, jspdf) se cargan bajo demanda
 * para optimizar el bundle inicial.
 */

// Tipos para las exportaciones
export interface ExportColumn {
  header: string;
  key: string;
  width?: number;
}

export interface ExportOptions {
  filename: string;
  title?: string;
  subtitle?: string;
  columns: ExportColumn[];
  data: Record<string, unknown>[];
  sheetName?: string;
}

/**
 * Exportar datos a Excel (.xlsx)
 * La librería xlsx (~500KB) se carga bajo demanda
 */
export async function exportToExcel(options: ExportOptions): Promise<void> {
  const { filename, title, columns, data, sheetName = 'Datos' } = options;

  // Lazy load xlsx
  const XLSX = await import('xlsx');

  // Preparar datos para Excel
  const headers = columns.map(col => col.header);
  const rows = data.map(item =>
    columns.map(col => {
      const value = item[col.key];
      // Formatear valores
      if (value === null || value === undefined) return '';
      if (typeof value === 'number') return value;
      return String(value);
    })
  );

  // Crear worksheet
  const wsData: (string | number)[][] = [];

  // Agregar título si existe
  if (title) {
    wsData.push([title]);
    wsData.push([]); // Fila vacía
  }

  // Agregar headers y datos
  wsData.push(headers);
  rows.forEach(row => wsData.push(row));

  const ws = XLSX.utils.aoa_to_sheet(wsData);

  // Configurar anchos de columna
  const colWidths = columns.map(col => ({ wch: col.width || 15 }));
  ws['!cols'] = colWidths;

  // Crear workbook
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName);

  // Descargar archivo
  const finalFilename = filename.endsWith('.xlsx') ? filename : `${filename}.xlsx`;
  XLSX.writeFile(wb, finalFilename);
}

/**
 * Exportar datos a PDF
 * La librería jspdf (~200KB) + autotable se cargan bajo demanda
 */
export async function exportToPDF(options: ExportOptions): Promise<void> {
  const { filename, title, subtitle, columns, data } = options;

  // Lazy load jspdf y autotable
  const [{ jsPDF }, autoTableModule] = await Promise.all([
    import('jspdf'),
    import('jspdf-autotable'),
  ]);
  const autoTable = autoTableModule.default;

  // Crear documento PDF
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  // Configuración de fuente
  doc.setFont('helvetica');

  // Título
  if (title) {
    doc.setFontSize(16);
    doc.setTextColor(30, 41, 59); // slate-800
    doc.text(title, 14, 15);
  }

  // Subtítulo
  if (subtitle) {
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139); // slate-500
    doc.text(subtitle, 14, 22);
  }

  // Preparar datos para la tabla
  const headers = columns.map(col => col.header);
  const rows = data.map(item =>
    columns.map(col => {
      const value = item[col.key];
      if (value === null || value === undefined) return '';
      if (typeof value === 'number') {
        return value.toLocaleString('es-MX');
      }
      return String(value);
    })
  );

  // Generar tabla con autoTable
  autoTable(doc, {
    head: [headers],
    body: rows,
    startY: title ? 28 : 14,
    styles: {
      fontSize: 8,
      cellPadding: 2,
    },
    headStyles: {
      fillColor: [59, 130, 246], // blue-500
      textColor: 255,
      fontStyle: 'bold',
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252], // slate-50
    },
    columnStyles: columns.reduce((acc, col, index) => {
      if (col.width) {
        acc[index] = { cellWidth: col.width };
      }
      return acc;
    }, {} as Record<number, { cellWidth: number }>),
  });

  // Pie de página con fecha
  const pageCount = doc.getNumberOfPages();
  const date = new Date().toLocaleDateString('es-MX', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(
      `Página ${i} de ${pageCount} | Generado: ${date}`,
      doc.internal.pageSize.getWidth() / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
  }

  // Descargar archivo
  const finalFilename = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;
  doc.save(finalFilename);
}

/**
 * Hook helper para exportación con formato de fecha
 */
export function getExportFilename(baseName: string): string {
  const date = new Date().toISOString().split('T')[0];
  return `${baseName}_${date}`;
}

/**
 * Formatear número para exportación
 */
export function formatNumberForExport(value: number | null | undefined): string {
  if (value === null || value === undefined) return '';
  return value.toLocaleString('es-MX');
}

/**
 * Formatear fecha para exportación
 */
export function formatDateForExport(date: string | Date | null | undefined): string {
  if (!date) return '';
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('es-MX', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}
