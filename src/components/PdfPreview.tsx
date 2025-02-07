import { FC } from 'react';
import { Paper } from '@mui/material';

interface PdfPreviewProps {
  pdfUrl: string;
  activeField: string;
  fields: Array<{
    name: string;
    type: string;
    value: string;
    bounds?: {
      x: number;
      y: number;
      width: number;
      height: number;
      page: number;
    };
  }>;
}

export const PdfPreview: FC<PdfPreviewProps> = ({ pdfUrl }) => {
  return (
    <Paper sx={{ 
      width: '100%',
      height: '800px',
      overflow: 'hidden'
    }}>
      <iframe
        src={`${pdfUrl}#toolbar=0`}
        style={{
          width: '100%',
          height: '100%',
          border: 'none'
        }}
        title="PDF Preview"
      />
    </Paper>
  );
}; 