'use client';

import { useState, useCallback } from 'react';
import {
  exportToExcel,
  exportToPDF,
  getExportFilename,
  type ExportColumn,
} from '@/lib/export';
import { useTenantFeatures } from '@/hooks/useTenant';

interface UseExportOptions {
  baseFilename: string;
  title: string;
  subtitle?: string;
  columns: ExportColumn[];
}

interface UseExportReturn {
  isExporting: boolean;
  exportExcel: (data: Record<string, unknown>[]) => Promise<void>;
  exportPDF: (data: Record<string, unknown>[]) => Promise<void>;
  canExportExcel: boolean;
  canExportPDF: boolean;
}

/**
 * Hook para manejar exportaciones de datos
 * Usa lazy loading para cargar xlsx y jspdf bajo demanda
 */
export function useExport(options: UseExportOptions): UseExportReturn {
  const [isExporting, setIsExporting] = useState(false);
  const features = useTenantFeatures();

  const exportExcel = useCallback(
    async (data: Record<string, unknown>[]) => {
      if (!features.enableExcelExport) return;

      setIsExporting(true);
      try {
        await exportToExcel({
          filename: getExportFilename(options.baseFilename),
          title: options.title,
          columns: options.columns,
          data,
          sheetName: options.title,
        });
      } finally {
        setIsExporting(false);
      }
    },
    [options, features.enableExcelExport]
  );

  const exportPDF = useCallback(
    async (data: Record<string, unknown>[]) => {
      if (!features.enablePDFExport) return;

      setIsExporting(true);
      try {
        await exportToPDF({
          filename: getExportFilename(options.baseFilename),
          title: options.title,
          subtitle: options.subtitle,
          columns: options.columns,
          data,
        });
      } finally {
        setIsExporting(false);
      }
    },
    [options, features.enablePDFExport]
  );

  return {
    isExporting,
    exportExcel,
    exportPDF,
    canExportExcel: features.enableExcelExport,
    canExportPDF: features.enablePDFExport,
  };
}

export default useExport;
