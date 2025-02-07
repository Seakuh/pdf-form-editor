import { FC } from 'react';
import { 
  Modal, 
  Box, 
  Typography, 
  IconButton,
  Button,
  Divider
} from '@mui/material';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import TelegramIcon from '@mui/icons-material/Telegram';
import EmailIcon from '@mui/icons-material/Email';
import CloseIcon from '@mui/icons-material/Close';
import { fillPdfForm } from '../utils/pdfUtils';
import type { FormField } from '../types/types';

interface ShareModalProps {
  open: boolean;
  onClose: () => void;
  pdfName: string;
  pdfUrl?: string;
  fields: FormField[];
}

export const ShareModal: FC<ShareModalProps> = ({ 
  open, 
  onClose, 
  pdfName, 
  pdfUrl,
  fields 
}) => {
  const websiteUrl = 'https://pdf-form-editor-y6inb.kinsta.page/';
  const shareText = encodeURIComponent(
    `Here's the generated PDF: ${pdfName} 📄✨\n\nCreated with ${websiteUrl}`
  );

  const generatePdf = async () => {
    if (!pdfUrl) return null;
    try {
      const response = await fetch(pdfUrl);
      const pdfBytes = await response.arrayBuffer();
      
      // Stelle sicher, dass die Felder korrekte Werte haben
      const filledFields = fields.map(field => {
        // Entferne _text und _choice Suffixe für die PDF-Lib
        const cleanName = field.name.replace(/_text$/, '').replace(/_choice$/, '');
        return {
          ...field,
          name: cleanName
        };
      });

      // Fülle das PDF mit den bereinigten Feldern
      const filledPdfBytes = await fillPdfForm(pdfBytes, filledFields);
      return new Blob([filledPdfBytes], { type: 'application/pdf' });
    } catch (error) {
      console.error('Error generating PDF:', error);
      return null;
    }
  };

  const shareButtons = [
    {
      name: 'WhatsApp',
      icon: <WhatsAppIcon />,
      color: '#25D366',
      onClick: async () => {
        const blob = await generatePdf();
        if (blob) {
          const file = new File([blob], pdfName, { type: 'application/pdf' });
          
          if (navigator.share && navigator.canShare({ files: [file] })) {
            try {
              await navigator.share({
                files: [file],
                title: 'Shared PDF',
                text: decodeURIComponent(shareText)
              });
            } catch (err) {
              // Nur wenn Share fehlschlägt, öffne WhatsApp
              window.open(`https://wa.me/?text=${shareText}`);
            }
          } else {
            // Wenn Web Share API nicht verfügbar ist, zeige Download-Dialog
            const shouldDownload = window.confirm(
              'Web sharing is not available. Would you like to download the PDF and share the link?'
            );
            
            if (shouldDownload) {
              const pdfUrl = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = pdfUrl;
              a.download = pdfName;
              a.click();
              URL.revokeObjectURL(pdfUrl);
              
              // Warte kurz und öffne dann WhatsApp
              setTimeout(() => {
                window.open(`https://wa.me/?text=${shareText}`);
              }, 1000);
            }
          }
        }
      }
    },
    {
      name: 'Telegram',
      icon: <TelegramIcon />,
      color: '#0088cc',
      onClick: async () => {
        const blob = await generatePdf();
        if (blob) {
          const file = new File([blob], pdfName, { type: 'application/pdf' });
          
          if (navigator.share && navigator.canShare({ files: [file] })) {
            try {
              await navigator.share({
                files: [file],
                title: 'Shared PDF',
                text: decodeURIComponent(shareText)
              });
            } catch (err) {
              window.open(`https://t.me/share/url?text=${shareText}`);
            }
          } else {
            const shouldDownload = window.confirm(
              'Web sharing is not available. Would you like to download the PDF and share the link?'
            );
            
            if (shouldDownload) {
              const pdfUrl = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = pdfUrl;
              a.download = pdfName;
              a.click();
              URL.revokeObjectURL(pdfUrl);
              
              setTimeout(() => {
                window.open(`https://t.me/share/url?text=${shareText}`);
              }, 1000);
            }
          }
        }
      }
    },
    {
      name: 'Email',
      icon: <EmailIcon />,
      color: '#EA4335',
      onClick: async () => {
        const blob = await generatePdf();
        if (blob) {
          // Für E-Mail nur den Download und mailto Link
          const pdfUrl = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = pdfUrl;
          a.download = pdfName;
          a.click();
          URL.revokeObjectURL(pdfUrl);
          
          // Öffne E-Mail nach kurzem Delay
          setTimeout(() => {
            const mailtoLink = `mailto:?subject=${encodeURIComponent('Generated PDF')}&body=${shareText}`;
            window.location.href = mailtoLink;
          }, 500);
        }
      }
    }
  ];

  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="share-modal-title"
    >
      <Box sx={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: { xs: '90%', sm: 400 },
        bgcolor: 'background.paper',
        borderRadius: 2,
        boxShadow: 24,
        p: 4,
      }}>
        <IconButton
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
          }}
          onClick={onClose}
        >
          <CloseIcon />
        </IconButton>

        <Typography 
          id="share-modal-title" 
          variant="h6" 
          component="h2"
          sx={{ mb: 2 }}
        >
          Share PDF 🔗
        </Typography>

        <Typography 
          variant="body1" 
          color="text.secondary"
          sx={{ mb: 3 }}
        >
          Here's your generated PDF: <br />
          <strong>{pdfName}</strong> 📄✨
        </Typography>

        <Divider sx={{ mb: 3 }} />

        <Box sx={{ 
          display: 'flex',
          flexDirection: 'column',
          gap: 2 
        }}>
          {shareButtons.map((button) => (
            <Button
              key={button.name}
              variant="contained"
              startIcon={button.icon}
              onClick={button.onClick}
              sx={{
                bgcolor: button.color,
                '&:hover': {
                  bgcolor: button.color,
                  filter: 'brightness(0.9)',
                },
              }}
            >
              Share via {button.name}
            </Button>
          ))}
        </Box>
      </Box>
    </Modal>
  );
}; 