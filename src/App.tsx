import { useState } from 'react';
import { Typography, Box, ThemeProvider, createTheme, GlobalStyles } from '@mui/material';
import { PdfUpload } from './components/PdfUpload';
import { PdfForm } from './components/PdfForm';
import { AnimatedHeadline } from './components/AnimatedHeadline';
import { fillPdfForm, downloadPdf, analyzePdf } from './utils/pdfUtils';
import type { FormField } from './types/types';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
  },
});

function App() {
  const [isLoading, setIsLoading] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string>('');
  const [activeField, setActiveField] = useState<string>('');
  const [fields, setFields] = useState<FormField[]>([]);

  const handleFieldChange = (name: string, value: string) => {
    setActiveField(name);
    setFields(fields.map(field => 
      field.name === name ? { ...field, value } : field
    ));
  };

  const handleSubmit = async (pdfName: string) => {
    try {
      setIsLoading(true);
      const response = await fetch(pdfUrl);
      const pdfBytes = await response.arrayBuffer();
      const filledPdfBytes = await fillPdfForm(pdfBytes, fields);
      downloadPdf(filledPdfBytes, pdfName);
    } catch (error) {
      console.error('Error filling PDF:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePdfSelected = async (file: File) => {
    try {
      setIsLoading(true);
      const url = URL.createObjectURL(file);
      setPdfUrl(url);
      
      const extractedFields = await analyzePdf(file);
      setFields(extractedFields);
    } catch (error) {
      console.error('Error processing PDF:', error);
      // Hier könnten Sie einen Toast oder eine andere Fehlermeldung anzeigen
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <GlobalStyles
          styles={`
            @keyframes fadeIn {
              from { opacity: 0; }
              to { opacity: 1; }
            }
            
            @keyframes slideUp {
              from {
                opacity: 0;
                transform: translateY(20px);
              }
              to {
                opacity: 1;
                transform: translateY(0);
              }
            }
          `}
        />
        <Box sx={{
          minHeight: '100vh',
          bgcolor: '#f5f5f5',
          py: 2,
          px: { xs: 2, sm: 3 }
        }}>
          {!fields.length ? (
            // Upload Screen
            <Box sx={{
              maxWidth: '600px',
              margin: '0 auto',
              display: 'flex',
              flexDirection: 'column',
              gap: 3,
              pt: 4
            }}>
              <AnimatedHeadline />
              <Typography 
                variant="body1" 
                color="text.secondary"
                textAlign="center"
                sx={{ mb: 3 }}
              >
                Laden Sie Ihr PDF-Formular hoch, um es auszufüllen
              </Typography>
              <PdfUpload 
                onPdfSelected={handlePdfSelected}
                isLoading={isLoading}
              />
            </Box>
          ) : (
            // Form View
            <Box sx={{
              maxWidth: '600px',
              margin: '0 auto',
              display: 'flex',
              flexDirection: 'column',
              gap: 3
            }}>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 2
              }}>
                <Typography 
                  variant="h5" 
                  component="h1"
                  sx={{ color: 'primary.main' }}
                >
                  PDF Formular
                </Typography>
                <PdfUpload 
                  onPdfSelected={handlePdfSelected}
                  isLoading={isLoading}
                  variant="small"
                />
              </Box>
              
              <PdfForm
                fields={fields}
                onChange={handleFieldChange}
                onSubmit={handleSubmit}
                activeField={activeField}
              />
            </Box>
          )}
        </Box>
      </LocalizationProvider>
    </ThemeProvider>
  );
}

export default App; 