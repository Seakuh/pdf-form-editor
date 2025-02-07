import { PDFDocument } from 'pdf-lib';
import type { FormField } from '../types/types';

declare module 'pdf-lib' {
  interface PDFRadioGroup {
    getValue(): string;
  }
}

async function getFieldAnnotations(field: any): Promise<FormField['bounds']> {
  try {
    const widget = field.acroField.getWidgets()[0];
    if (!widget) return undefined;

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
    return undefined;
  }
}

export async function analyzePdf(file: File): Promise<FormField[]> {
  try {
    const pdfBytes = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const form = pdfDoc.getForm();
    const fields: FormField[] = [];

    const pdfFields = form.getFields();
    console.log('Found PDF fields:', pdfFields);

    for (const pdfField of pdfFields) {
      const name = pdfField.getName();
      const fieldType = pdfField.constructor.name;

      switch (fieldType) {
        case 'PDFTextField': {
          const textField = form.getTextField(name);
          const currentValue = textField.getText() || '';
          const bounds = await getFieldAnnotations(textField);
          
          fields.push({
            name: `${name}_text`,
            type: 'text',
            value: currentValue,
            bounds
          });

          fields.push({
            name: `${name}_choice`,
            type: 'radio',
            value: '',
            options: ['Ja', 'Nein'],
            bounds
          });
          break;
        }

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

    console.log('Extracted fields:', fields);
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

export function downloadPdf(pdfBytes: Uint8Array, customName: string) {
  const blob = new Blob([pdfBytes], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  
  // Stelle sicher, dass der Name mit .pdf endet
  const fileName = customName.toLowerCase().endsWith('.pdf') 
    ? customName 
    : `${customName}.pdf`;
  
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
} 