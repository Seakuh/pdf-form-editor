import { FC, useEffect, useRef, useState } from 'react';
import { Paper, Box, TextField, Popper } from '@mui/material';
import * as pdfjsLib from 'pdfjs-dist';

interface PdfPreviewProps {
  pdfUrl: string;
  activeField: string;
  onFieldAdd: (field: { name: string; value: string; position: { x: number; y: number } }) => void;
  onFieldSelect: (fieldName: string) => void;
}

export const PdfPreview: FC<PdfPreviewProps> = ({ 
  pdfUrl, 
  activeField,
  onFieldAdd,
  onFieldSelect 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1.5);
  const [isAddingText, setIsAddingText] = useState(false);
  const [newTextPosition, setNewTextPosition] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const renderPdf = async () => {
      if (!canvasRef.current) return;

      try {
        const loadingTask = pdfjsLib.getDocument(pdfUrl);
        const pdf = await loadingTask.promise;
        const page = await pdf.getPage(1);
        
        // Berechne optimale Skalierung
        if (containerRef.current) {
          const viewport = page.getViewport({ scale: 1 });
          const containerWidth = containerRef.current.clientWidth - 40;
          const optimalScale = containerWidth / viewport.width;
          setScale(optimalScale);
        }

        const canvas = canvasRef.current;
        const viewport = page.getViewport({ scale });
        canvas.width = viewport.width;
        canvas.height = viewport.height;

        const context = canvas.getContext('2d')!;
        await page.render({
          canvasContext: context,
          viewport,
        }).promise;

        // Zeichne aktives Feld hervor
        if (activeField) {
          // Hier kommt die Hervorhebungslogik
        }
      } catch (error) {
        console.error('Error rendering PDF:', error);
      }
    };

    renderPdf();
  }, [pdfUrl, scale, activeField]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setIsAddingText(true);
    setNewTextPosition({ x, y });
  };

  return (
    <Paper sx={{ 
      width: '100%',
      height: '800px',
      overflow: 'auto',
      bgcolor: '#f5f5f5',
      p: 2
    }}>
      <Box 
        ref={containerRef}
        sx={{ 
          position: 'relative',
          width: '100%',
          height: '100%',
          display: 'flex',
          justifyContent: 'center'
        }}
      >
        <canvas
          ref={canvasRef}
          onClick={handleCanvasClick}
          style={{ 
            maxWidth: '100%',
            height: 'auto',
            cursor: 'crosshair',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}
        />
        
        {isAddingText && newTextPosition && (
          <Popper
            open={true}
            anchorEl={containerRef.current}
            placement="top"
            style={{
              position: 'absolute',
              left: `${newTextPosition.x}px`,
              top: `${newTextPosition.y}px`,
              zIndex: 1000
            }}
          >
            <TextField
              autoFocus
              variant="outlined"
              size="small"
              placeholder="Text eingeben..."
              onBlur={(e) => {
                if (e.target.value) {
                  onFieldAdd({
                    name: `field_${Date.now()}`,
                    value: e.target.value,
                    position: newTextPosition
                  });
                }
                setIsAddingText(false);
                setNewTextPosition(null);
              }}
              sx={{ bgcolor: 'white' }}
            />
          </Popper>
        )}
      </Box>
    </Paper>
  );
}; 