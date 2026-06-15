import React, { useState } from 'react';
import { FileDown } from 'lucide-react';
import { exportToPDF } from '../utils/pdfExport';

function PDFExportButton({ messages, user }) {
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    setExporting(true);
    try {
      await exportToPDF(messages, user);
    } catch (err) {
      console.error("Export to PDF failed:", err);
      alert("Failed to compile PDF. Please check console errors.");
    } finally {
      setExporting(false);
    }
  };

  return (
    <button 
      className="btn btn-secondary" 
      onClick={handleExport}
      disabled={exporting || messages.length <= 1}
      style={{
        height: '34px',
        fontSize: '11px',
        padding: '0 12px',
        opacity: (exporting || messages.length <= 1) ? 0.6 : 1
      }}
    >
      <FileDown size={14} /> 
      {exporting ? 'Compiling Dossier...' : 'Save as PDF Report'}
    </button>
  );
}

export default PDFExportButton;
