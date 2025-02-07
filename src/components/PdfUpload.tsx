import { FC, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Box, Typography, Paper, CircularProgress } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

interface PdfUploadProps {
  onPdfSelected: (file: File) => void;
  isLoading?: boolean;
}

export const PdfUpload: FC<PdfUploadProps> = ({ onPdfSelected, isLoading = false }) => {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file && file.type === 'application/pdf') {
      onPdfSelected(file);
    }
  }, [onPdfSelected]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    multiple: false
  });

  return (
    <Paper
      {...getRootProps()}
      sx={{
        p: 4,
        border: '2px dashed',
        borderColor: isDragActive ? 'primary.main' : 'grey.300',
        backgroundColor: isDragActive ? 'action.hover' : 'background.paper',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        '&:hover': {
          borderColor: 'primary.main',
          backgroundColor: 'action.hover'
        }
      }}
    >
      <input {...getInputProps()} />
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        gap: 2 
      }}>
        {isLoading ? (
          <CircularProgress />
        ) : (
          <>
            <CloudUploadIcon sx={{ fontSize: 48, color: 'primary.main' }} />
            <Typography variant="h6" component="div" align="center">
              {isDragActive 
                ? 'Drop the PDF here...' 
                : 'Drag & drop a PDF here, or click to select'}
            </Typography>
            <Typography variant="body2" color="text.secondary" align="center">
              Supports PDF files with fillable forms
            </Typography>
          </>
        )}
      </Box>
    </Paper>
  );
}; 