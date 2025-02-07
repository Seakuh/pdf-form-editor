export interface FormField {
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