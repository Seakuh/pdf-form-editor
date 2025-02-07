import { FC } from 'react';
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
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import 'dayjs/locale/de'; // Für deutsche Lokalisierung
import SaveIcon from '@mui/icons-material/Save';

interface FormField {
  name: string;
  type: 'text' | 'checkbox' | 'radio' | 'select' | 'date';
  value: string;
  options?: string[];
}

interface PdfFormProps {
  fields: FormField[];
  onChange: (name: string, value: string) => void;
  onSubmit: () => void;
  activeField: string;
}

export const PdfForm: FC<PdfFormProps> = ({ 
  fields, 
  onChange, 
  onSubmit,
  activeField 
}) => {
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
          <Box>
            <Typography variant="caption" color="textSecondary">
              {field.name}
            </Typography>
            <FormControlLabel
              control={
                <Radio
                  checked={field.value === 'checked'}
                  onChange={(e) => {
                    onChange(field.name, e.target.checked ? 'checked' : 'unchecked');
                  }}
                />
              }
              label="Ankreuzen"
            />
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
      default:
        return (
          <TextField
            fullWidth
            label={field.name}
            value={field.value}
            onChange={(e) => onChange(field.name, e.target.value)}
            variant="outlined"
            size="small"
          />
        );
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
        <Button 
          variant="contained" 
          color="primary" 
          onClick={onSubmit}
          startIcon={<SaveIcon />}
        >
          PDF Speichern
        </Button>
      </Box>
    </Paper>
  );
}; 