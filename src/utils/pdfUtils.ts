import { PDFDocument } from 'pdf-lib';

interface FormField {
  name: string;
  type: 'text' | 'checkbox' | 'radio' | 'select';
  value: string;
  options?: string[];
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
            fields.push({
              name,
              type: 'text',
              value: textField.getText() || ''
            });
          } catch (e) {
            console.warn(`Error processing text field ${name}:`, e);
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