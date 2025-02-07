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

function isCheckboxField(field: any, fieldName: string, value: string): boolean {
  // Konvertiere zu Kleinbuchstaben für besseren Vergleich
  const nameLower = fieldName.toLowerCase();
  const valueLower = value.toLowerCase().trim();

  // Prüfe die Größe des Feldes
  const isSmallField = () => {
    try {
      const widget = field.acroField.getWidgets()[0];
      if (widget) {
        const rect = widget.getRectangle();
        // Erweiterte Größenprüfung für Checkboxen
        const isSquare = Math.abs(rect.width - rect.height) < 8; // Toleranter
        const isSmall = rect.width < 30 && rect.height < 30;     // Größerer Bereich
        console.log(`Field ${fieldName} size check:`, {
          width: rect.width,
          height: rect.height,
          isSquare,
          isSmall
        });
        return isSquare && isSmall;
      }
    } catch (e) {
      console.warn('Could not check field size:', e);
    }
    return false;
  };

  // Erweiterte Checkbox-Indikatoren
  const namePatterns = [
    // Klammern und Boxen
    /[\[\(\{\s_]*[xX\u2713\u2714]?[\]\)\}\s_]*/,  // [], (), {}, mit X oder ✓
    /□|■|○|●|\u2610|\u2611|\u2612/,               // Unicode Checkbox Symbole
    /\[\s*\]/,                                     // Leere eckige Klammern
    /\(\s*\)/,                                     // Leere runde Klammern
    
    // Deutsche Begriffe (erweitert)
    /\b(ankreuz|kreuz|markier|auswahl|check|häkchen)/i,
    /\b(ja|nein|j\/n)\b/i,
    /\bzutreffend(es)?\b/i,
    /\bwählen?\b/i,
    /\boptionen?\b/i,
    /\bauswahlfeld\b/i,
    /\bkästchen\b/i,
    
    // Englische Begriffe (erweitert)
    /\b(tick|mark|check|select|choice|box)\b/i,
    /\b(yes|no|y\/n)\b/i,
    /\boption\b/i,
    /\bselection\b/i
  ];

  // Erweiterte Wertmuster
  const valuePatterns = [
    /^[xX\u2713\u2714]$/,                    // X oder ✓
    /^(ja|nein|yes|no)$/i,                   // Ja/Nein Werte
    /^(true|false|0|1|on|off)$/i,            // Boolean-ähnliche Werte
    /^(checked|unchecked|selected|none)$/i,   // Status-Werte
    /^\s*[■●\u2611\u2612]\s*$/,              // Gefüllte Symbole
    /^\s*$/                                   // Leerer Wert (oft bei Checkboxen)
  ];

  // Prüfe auf maximale Textlänge (Checkboxen haben meist kurzen/keinen Text)
  const hasShortValue = valueLower.length <= 3;

  const hasCheckboxName = namePatterns.some(pattern => pattern.test(nameLower));
  const hasCheckboxValue = valuePatterns.some(pattern => pattern.test(valueLower));
  const isSmall = isSmallField();

  // Debug-Ausgabe
  console.log(`Analyzing field "${fieldName}":`, {
    hasCheckboxName,
    hasCheckboxValue,
    isSmall,
    hasShortValue,
    value: valueLower,
    fieldType: field.constructor.name
  });

  // Ein Feld wird als Checkbox erkannt, wenn:
  // 1. Es einen Checkbox-Namen hat ODER
  // 2. Es einen typischen Checkbox-Wert hat ODER
  // 3. Es klein und quadratisch ist UND einen kurzen/leeren Wert hat
  return hasCheckboxName || hasCheckboxValue || (isSmall && hasShortValue);
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
        case 'PDFTextField':
          try {
            const textField = form.getTextField(name);
            const currentValue = textField.getText() || '';
            
            // Für jedes Textfeld erstellen wir zwei Einträge:
            // 1. Das originale Textfeld
            fields.push({
              name: `${name}_text`,
              type: 'text',
              value: currentValue,
              bounds: await getFieldAnnotations(textField)
            });

            // 2. Ein Radio-Button-Feld für Ja/Nein Auswahl
            fields.push({
              name: `${name}_choice`,
              type: 'radio',
              value: '',
              options: ['Ja', 'Nein'],
              bounds: await getFieldAnnotations(textField)
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