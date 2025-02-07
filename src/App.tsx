import { useState } from 'react';
import { Container, Typography, Box, ThemeProvider, createTheme, GlobalStyles } from '@mui/material';
import { PdfUpload } from './components/PdfUpload';
import { PdfForm } from './components/PdfForm';
import { PdfPreview } from './components/PdfPreview';
import { PDFDocument } from 'pdf-lib';
import { AnimatedHeadline } from './components/AnimatedHeadline';
import { fillPdfForm, downloadPdf, analyzePdf } from './utils/pdfUtils';

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
  const [fields, setFields] = useState<Array<{
    name: string;
    type: 'text' | 'checkbox' | 'radio' | 'select';
    value: string;
    options?: string[];
  }>>([]);

  const handleFieldChange = (name: string, value: string) => {
    setFields(fields.map(field => 
      field.name === name ? { ...field, value } : field
    ));
  };

  const handleSubmit = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(pdfUrl);
      const pdfBytes = await response.arrayBuffer();
      const filledPdfBytes = await fillPdfForm(pdfBytes, fields);
      downloadPdf(filledPdfBytes);
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
        display: 'flex',
        bgcolor: '#f5f5f5',
        justifyContent: 'center',
        alignItems: 'center',
      }}>
        <Container maxWidth="xl" sx={{ 
          py: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}>
          {!fields.length ? (
            // Initial Upload Screen
            <Box sx={{
              height: '90vh',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              gap: 4
            }}>
              <Box sx={{ 
                textAlign: 'center', 
                maxWidth: 800,
                animation: 'fadeIn 1s ease-out'
              }}>
                <AnimatedHeadline />
                
                <Typography 
                  variant="h5" 
                  color="text.secondary"
                  sx={{ 
                    mb: 4,
                    opacity: 0,
                    animation: 'slideUp 0.8s ease-out forwards',
                    animationDelay: '0.5s'
                  }}
                >
                  Transform your PDF experience with our intelligent form filler
                </Typography>
                
                <Typography 
                  variant="body1" 
                  color="text.secondary"
                  sx={{ 
                    mb: 6,
                    opacity: 0,
                    animation: 'slideUp 0.8s ease-out forwards',
                    animationDelay: '0.7s'
                  }}
                >
                  Supports all PDF forms with fillable fields. Simply drag and drop your PDF 
                  or click to select a file. Your data remains private and secure.
                </Typography>
              </Box>
              
              <Box sx={{ 
                width: '100%', 
                maxWidth: 500,
                opacity: 0,
                animation: 'slideUp 0.8s ease-out forwards',
                animationDelay: '0.9s'
              }}>
                <PdfUpload 
                  onPdfSelected={handlePdfSelected}
                  isLoading={isLoading}
                />
              </Box>
            </Box>
          ) : (
            // Editor View
            <>
              <Typography 
                variant="h4" 
                component="h1" 
                align="center"
                sx={{ 
                  mb: 4,
                  fontWeight: 500,
                  color: '#1976d2'
                }}
              >
                PDF Form Editor
              </Typography>
              
              <Box sx={{ 
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 4,
                alignItems: 'start',
                width: '100%',
                maxWidth: '1400px',
                margin: '0 auto'
              }}>
                {/* Linke Seite: Upload und Formular */}
                <Box sx={{ 
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 3
                }}>
                  <PdfUpload 
                    onPdfSelected={handlePdfSelected}
                    isLoading={isLoading}
                  />
                  
                  <PdfForm
                    fields={fields}
                    onChange={(name, value) => {
                      setActiveField(name);
                      handleFieldChange(name, value);
                    }}
                    onSubmit={handleSubmit}
                    activeField={activeField}
                  />
                </Box>

                {/* Rechte Seite: PDF Vorschau */}
                {pdfUrl && (
                  <PdfPreview
                    pdfUrl={pdfUrl}
                    activeField={activeField}
                    fields={fields}
                  />
                )}
              </Box>
            </>
          )}
        </Container>
      </Box>
    </ThemeProvider>
  );
}

export default App; 