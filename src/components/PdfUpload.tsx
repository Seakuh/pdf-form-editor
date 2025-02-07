import { FC, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Box, Typography, Paper, Button } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { motion, AnimatePresence } from 'framer-motion';

interface PdfUploadProps {
  onPdfSelected: (file: File) => void;
  isLoading: boolean;
  variant?: 'default' | 'small';
}

export const PdfUpload: FC<PdfUploadProps> = ({ 
  onPdfSelected, 
  isLoading,
  variant = 'default' 
}) => {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: useCallback((files) => files[0] && onPdfSelected(files[0]), [onPdfSelected]),
    accept: { 'application/pdf': ['.pdf'] },
    multiple: false
  });

  const LoadingAnimation = () => (
    <Box sx={{ position: 'relative', width: 48, height: 48 }}>
      <motion.div
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          border: '3px solid #1976d2',
          borderRadius: '50%',
          borderTopColor: 'transparent'
        }}
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      />
      <motion.div
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          border: '3px dashed #90caf9',
          borderRadius: '50%',
          borderBottomColor: 'transparent'
        }}
        animate={{ rotate: -360 }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
      />
    </Box>
  );

  const uploadStyles = {
    p: 3,
    border: '2px dashed',
    borderColor: isDragActive ? 'primary.main' : 'grey.300',
    bgcolor: 'background.paper',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    position: 'relative',
    overflow: 'hidden',
    '&:hover': {
      borderColor: 'primary.main',
      bgcolor: 'action.hover'
    }
  };

  const content = (
    <AnimatePresence mode="wait">
      {isLoading ? (
        <motion.div
          key="loading"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.3 }}
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}
        >
          <LoadingAnimation />
          <Typography variant="body1" color="primary">
            Verarbeite PDF...
          </Typography>
        </motion.div>
      ) : (
        <motion.div
          key="upload"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}
        >
          <CloudUploadIcon sx={{ fontSize: 48, color: 'primary.main' }} />
          <Typography variant="h6" align="center">
            {variant === 'small' ? 'PDF ändern' : 'PDF hochladen'}
          </Typography>
          <Typography variant="body2" color="text.secondary" align="center">
            {isDragActive ? 'PDF hier ablegen' : 'Drag & Drop oder klicken'}
          </Typography>
        </motion.div>
      )}
    </AnimatePresence>
  );

  if (variant === 'small') {
    return (
      <Paper
        {...getRootProps()}
        elevation={0}
        sx={{
          ...uploadStyles,
          width: '100%',
          maxWidth: 300,
          p: 2
        }}
      >
        <input {...getInputProps()} />
        {content}
      </Paper>
    );
  }

  return (
    <Paper
      {...getRootProps()}
      elevation={0}
      sx={uploadStyles}
    >
      <input {...getInputProps()} />
      {content}
      {isDragActive && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(25, 118, 210, 0.05)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <Typography variant="h6" color="primary">
            PDF hier ablegen
          </Typography>
        </motion.div>
      )}
    </Paper>
  );
}; 