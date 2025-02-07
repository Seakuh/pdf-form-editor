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
  const shareText = encodeURIComponent(`Here's the generated PDF: ${pdfName} 📄✨`);

  const generatePdf = async () => {
    if (!pdfUrl) return null;
    try {
      const response = await fetch(pdfUrl);
      const pdfBytes = await response.arrayBuffer();
      const filledPdfBytes = await fillPdfForm(pdfBytes, fields);
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
                text: decodeURIComponent(shareText)
              });
            } catch (err) {
              window.open(`https://wa.me/?text=${shareText}`);
            }
          } else {
            window.open(`https://wa.me/?text=${shareText}`);
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
          // Telegram erlaubt keine direkten Dateianhänge über URL
          // Wir speichern die Datei und teilen den Link
          const downloadLink = URL.createObjectURL(blob);
          const shareLink = `https://t.me/share/url?url=${encodeURIComponent(downloadLink)}&text=${shareText}`;
          window.open(shareLink);
          // Cleanup nach kurzer Verzögerung
          setTimeout(() => URL.revokeObjectURL(downloadLink), 1000);
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
          // Email mit Anhang
          const mailtoLink = `mailto:?subject=${encodeURIComponent('Generated PDF')}&body=${shareText}`;
          window.location.href = mailtoLink;
          
          // PDF herunterladen
          const downloadUrl = URL.createObjectURL(blob);
          const downloadLink = document.createElement('a');
          downloadLink.href = downloadUrl;
          downloadLink.download = pdfName;
          document.body.appendChild(downloadLink);
          downloadLink.click();
          document.body.removeChild(downloadLink);
          URL.revokeObjectURL(downloadUrl);
        }
      }
    },
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