import { PDFDocument } from 'pdf-lib';

interface FormField {
  name: string;
  type: 'text' | 'checkbox' | 'radio' | 'select' | 'date';
  value: string;
  options?: string[];
  bounds?: {
    x: number;
    y: number;
    width: number;
    height: number;
    page: number;
  };
}

function isDateField(fieldName: string, value: string): boolean {
  const datePatterns = [
    // Deutsche Muster
    /datum/i,
    /geb(urts)?[_.-]?(datum|tag)/i,
    /geburt/i,
    /ausstellungs[_.-]?datum/i,
    /eingangs[_.-]?datum/i,
    
    // Englische Muster
    /date/i,
    /dob/i,
    /birth[_.-]?date/i,
    /issue[_.-]?date/i,
    /entry[_.-]?date/i,
    /start[_.-]?date/i,
    /end[_.-]?date/i,
    
    // Abkürzungen
    /dt\./i,
    /geb\./i,
    /dob/i,
    
    // Datumsformate
    /^\d{1,2}[./-]\d{1,2}[./-]\d{2,4}$/,
    /^\d{4}[./-]\d{1,2}[./-]\d{1,2}$/,
    /^\d{1,2}[.]\d{1,2}[.]$/
  ];

  return datePatterns.some(pattern => 
    pattern.test(fieldName.toLowerCase()) || 
    pattern.test(value.toLowerCase())
  );
}

function isCheckboxField(fieldName: string, value: string): boolean {
  const checkPatterns = [
    // Deutsche Muster
    /\[[ _]*\]/,  // [ ] oder [_]
    /\([ _]*\)/,  // ( ) oder (_)
    /□/,          // Leeres Quadrat
    /\bx\b/i,     // X-Markierung
    /kreuz/i,
    /ankreuzen/i,
    /markieren/i,
    /auswahl/i,
    /ja\/nein/i,
    /j\/n/i,
    /checkbox/i,
    
    // Englische Muster
    /check/i,
    /tick/i,
    /mark/i,
    /select/i,
    /yes\/no/i,
    /y\/n/i,
  ];

  return checkPatterns.some(pattern => 
    pattern.test(fieldName) || pattern.test(value)
  );
}

export async function analyzePdf(file: File): Promise<FormField[]> {
  try {
    // PDF als ArrayBuffer laden
    const pdfBytes = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const form = pdfDoc.getForm();
    const fields: FormField[] = [];

    // Alle Formularfelder durchgehen
    const pdfFields = form.getFields();
    console.log('Found PDF fields:', pdfFields); // Debug

    for (const pdfField of pdfFields) {
      const name = pdfField.getName();
      console.log('Processing field:', name); // Debug

      // Feldtyp bestimmen
      const fieldType = pdfField.constructor.name;
      console.log('Field type:', fieldType); // Debug

      switch (fieldType) {
        case 'PDFTextField':
          try {
            const textField = form.getTextField(name);
            const currentValue = textField.getText() || '';
            
            // Feldtyp bestimmen
            let type: FormField['type'];
            if (isDateField(name, currentValue)) {
              type = 'date';
            } else if (isCheckboxField(name, currentValue)) {
              type = 'radio';  // Wir verwenden radio für Checkbox-ähnliche Felder
            } else {
              type = 'text';
            }
            
            // Hole die Feldposition
            const annotations = await getFieldAnnotations(textField);
            const bounds = annotations ? {
              x: annotations.x,
              y: annotations.y,
              width: annotations.width,
              height: annotations.height,
              page: annotations.page
            } : undefined;
            
            fields.push({
              name,
              type,
              value: type === 'radio' ? '' : currentValue, // Leerer Wert für Radio-Buttons
              options: type === 'radio' ? ['checked', 'unchecked'] : undefined,
              bounds
            });
          } catch (e) {
            console.warn(`Error processing field ${name}:`, e);
          }
          break;

        case 'PDFCheckBox':
          try {
            const checkBox = form.getCheckBox(name);
            fields.push({
              name,
              type: 'checkbox',
              value: checkBox.isChecked() ? 'checked' : ''
            });
          } catch (e) {
            console.warn(`Error processing checkbox ${name}:`, e);
          }
          break;

        case 'PDFRadioGroup':
          try {
            const radioGroup = form.getRadioGroup(name);
            fields.push({
              name,
              type: 'radio',
              value: radioGroup.getValue() || '',
              options: radioGroup.getOptions()
            });
          } catch (e) {
            console.warn(`Error processing radio group ${name}:`, e);
          }
          break;

        case 'PDFDropdown':
          try {
            const dropdown = form.getDropdown(name);
            fields.push({
              name,
              type: 'select',
              value: dropdown.getSelected()[0] || '',
              options: dropdown.getOptions()
            });
          } catch (e) {
            console.warn(`Error processing dropdown ${name}:`, e);
          }
          break;

        default:
          console.log(`Unknown field type for ${name}:`, fieldType);
          // Versuche als Textfeld zu behandeln
          try {
            const textField = form.getTextField(name);
            if (textField) {
              fields.push({
                name,
                type: 'text',
                value: textField.getText() || ''
              });
            }
          } catch (e) {
            console.warn(`Could not process field ${name} as text field:`, e);
          }
      }
    }

    console.log('Extracted fields:', fields); // Debug

    if (fields.length === 0) {
      throw new Error('Keine Formularfelder gefunden');
    }

    return fields;
  } catch (error) {
    console.error('PDF Analyse Fehler:', error);
    throw error;
  }
}

export async function fillPdfForm(pdfBytes: ArrayBuffer, fields: FormField[]): Promise<Uint8Array> {
  try {
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const form = pdfDoc.getForm();

    for (const field of fields) {
      try {
        switch (field.type) {
          case 'text':
            const textField = form.getTextField(field.name);
            textField.setText(field.value);
            break;

          case 'checkbox':
            const checkBox = form.getCheckBox(field.name);
            if (field.value === 'checked') {
              checkBox.check();
            } else {
              checkBox.uncheck();
            }
            break;

          case 'radio':
            const radioGroup = form.getRadioGroup(field.name);
            if (field.value) {
              radioGroup.select(field.value);
            }
            break;

          case 'select':
            const dropdown = form.getDropdown(field.name);
            if (field.value) {
              dropdown.select(field.value);
            }
            break;
        }
      } catch (error) {
        console.warn(`Fehler beim Ausfüllen von Feld ${field.name}:`, error);
      }
    }

    return await pdfDoc.save();
  } catch (error) {
    console.error('Fehler beim Ausfüllen des PDFs:', error);
    throw error;
  }
}

export function downloadPdf(pdfBytes: Uint8Array) {
  const blob = new Blob([pdfBytes], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  
  link.href = url;
  link.download = `ausgefuelltes-formular-${timestamp}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Neue Hilfsfunktion für Feldpositionen
async function getFieldAnnotations(field: any) {
  try {
    const widget = field.acroField.getWidgets()[0];
    if (!widget) return null;

    const rect = widget.getRectangle();
    return {
      x: rect.x,
      y: rect.y,
      width: rect.width,
      height: rect.height,
      page: widget.P().numberValue
    };
  } catch (e) {
    console.warn('Could not get field annotations:', e);
    return null;
  }
} 