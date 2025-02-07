import { FC, useState } from 'react';
import { 
  TextField, 
  Box, 
  Button, 
  Paper,
  Checkbox,
  FormControlLabel,
  Radio,
  RadioGroup,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Typography
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import dayjs from 'dayjs';
import 'dayjs/locale/de'; // Für deutsche Lokalisierung
import SaveIcon from '@mui/icons-material/Save';
import ShareIcon from '@mui/icons-material/Share';
import DriveFileRenameOutlineIcon from '@mui/icons-material/DriveFileRenameOutline';
import type { FormField } from '../types/types';
import { ShareModal } from './ShareModal';

interface PdfFormProps {
  fields: FormField[];
  onChange: (name: string, value: string) => void;
  onSubmit: (pdfName: string) => void;
  activeField: string;
}

export const PdfForm: FC<PdfFormProps> = ({ 
  fields, 
  onChange, 
  onSubmit: parentOnSubmit,
  activeField 
}) => {
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [pdfName, setPdfName] = useState('form.pdf');

  const handleSubmit = () => {
    parentOnSubmit(pdfName);
  };

  const renderField = (field: FormField) => {
    switch (field.type) {
      case 'checkbox':
        return (
          <FormControlLabel
            control={
              <Checkbox
                checked={field.value === 'checked'}
                onChange={(e) => onChange(field.name, e.target.checked ? 'checked' : '')}
              />
            }
            label={field.name}
          />
        );
      case 'radio':
        return (
          <Box sx={{ 
            display: 'flex',
            flexDirection: 'column',
            gap: 1,
            p: 1,
            borderRadius: 1,
            bgcolor: field.name === activeField ? 'action.hover' : 'transparent'
          }}>
            <Typography variant="body2" color="text.secondary">
              {field.name.replace('_choice', '')}
            </Typography>
            <RadioGroup
              row
              value={field.value}
              onChange={(e) => onChange(field.name, e.target.value)}
            >
              <FormControlLabel 
                value="Ja" 
                control={<Radio size="small" />} 
                label="Ja"
              />
              <FormControlLabel 
                value="Nein" 
                control={<Radio size="small" />} 
                label="Nein"
              />
            </RadioGroup>
          </Box>
        );
      case 'select':
        return (
          <FormControl fullWidth>
            <InputLabel>{field.name}</InputLabel>
            <Select
              value={field.value}
              onChange={(e) => onChange(field.name, e.target.value)}
              label={field.name}
            >
              {field.options?.map(option => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        );
      case 'date':
        return (
          <DatePicker
            label={field.name}
            value={field.value ? dayjs(field.value) : null}
            onChange={(newValue) => {
              onChange(field.name, newValue ? newValue.format('DD.MM.YYYY') : '');
            }}
          />
        );
      case 'text':
        return (
          <TextField
            fullWidth
            label={field.name.replace('_text', '')}
            value={field.value}
            onChange={(e) => onChange(field.name, e.target.value)}
            variant="outlined"
            size="small"
          />
        );
      default:
        return null;
    }
  };

  return (
    <Paper sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {fields.map((field) => (
          <Box key={field.name}>
            {renderField(field)}
          </Box>
        ))}
        
        <Box 
          sx={{ 
            mt: 2,
            p: 3, 
            borderRadius: 2,
            color: 'white',
            boxShadow: 2,
            background: 'linear-gradient(135deg, #DC2626 0%, #991B1B 100%)',
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'radial-gradient(circle at top right, rgba(255,255,255,0.1) 0%, transparent 60%)',
              pointerEvents: 'none',
            }
          }}
        >
          <Typography 
            variant="subtitle1" 
            sx={{ 
              mb: 2, 
              display: 'flex', 
              alignItems: 'center', 
              gap: 1,
              textShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}
          >
            <DriveFileRenameOutlineIcon />
            Name your PDF
          </Typography>
          
          <TextField
            fullWidth
            value={pdfName}
            onChange={(e) => setPdfName(e.target.value)}
            variant="outlined"
            size="small"
            sx={{
              mb: 3,
              '& .MuiOutlinedInput-root': {
                bgcolor: 'white',
                '&:hover fieldset': {
                  borderColor: 'rgba(255,255,255,0.8)',
                },
                '&.Mui-focused fieldset': {
                  borderColor: 'white',
                },
              },
            }}
            InputProps={{
              endAdornment: <Box component="span" sx={{ color: 'text.secondary' }}>.pdf</Box>,
            }}
          />

          <Box sx={{ 
            display: 'flex', 
            gap: 2,
            flexWrap: 'wrap'
          }}>
            <Button 
              variant="contained" 
              color="secondary"
              onClick={handleSubmit}
              startIcon={<SaveIcon />}
              sx={{
                bgcolor: 'white',
                color: '#DC2626',
                '&:hover': {
                  bgcolor: 'rgba(255,255,255,0.9)',
                },
                transition: 'all 0.2s ease',
              }}
            >
              Save PDF
            </Button>
            <Button
              variant="outlined"
              onClick={() => setShareModalOpen(true)}
              startIcon={<ShareIcon />}
              sx={{
                borderColor: 'white',
                color: 'white',
                '&:hover': {
                  borderColor: 'white',
                  bgcolor: 'rgba(255,255,255,0.1)',
                },
                transition: 'all 0.2s ease',
              }}
            >
              Share
            </Button>
          </Box>
        </Box>
      </Box>
      <ShareModal 
        open={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        pdfName={pdfName}
      />
    </Paper>
  );
}; 