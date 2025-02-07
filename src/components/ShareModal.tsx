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

interface ShareModalProps {
  open: boolean;
  onClose: () => void;
  pdfName: string;
}

export const ShareModal: FC<ShareModalProps> = ({ open, onClose, pdfName }) => {
  const shareText = encodeURIComponent(`Here's the generated PDF: ${pdfName} 📄✨`);
  const shareUrl = encodeURIComponent(window.location.href);

  const shareButtons = [
    {
      name: 'WhatsApp',
      icon: <WhatsAppIcon />,
      color: '#25D366',
      url: `https://wa.me/?text=${shareText}`,
    },
    {
      name: 'Telegram',
      icon: <TelegramIcon />,
      color: '#0088cc',
      url: `https://t.me/share/url?url=${shareUrl}&text=${shareText}`,
    },
    {
      name: 'Email',
      icon: <EmailIcon />,
      color: '#EA4335',
      url: `mailto:?subject=${encodeURIComponent('Generated PDF')}&body=${shareText}`,
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
              href={button.url}
              target="_blank"
              rel="noopener noreferrer"
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