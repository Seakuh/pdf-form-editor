import { useEffect, useRef } from 'react';
import Typed from 'typed.js';
import { Box, Typography } from '@mui/material';

export const AnimatedHeadline = () => {
  const el = useRef(null);
  const typed = useRef<Typed | null>(null);

  useEffect(() => {
    const options = {
      strings: [
        'Fill PDF Forms ^1000 <span style="color: #42a5f5">Effortlessly</span>',
        'Edit Forms ^1000 <span style="color: #42a5f5">Instantly</span>',
        'Download PDFs ^1000 <span style="color: #42a5f5">Securely</span>'
      ],
      typeSpeed: 50,
      backSpeed: 30,
      backDelay: 2000,
      loop: true,
      cursorChar: '|',
      smartBackspace: true,
      autoInsertCss: true,
      showCursor: true,
      html: true
    };

    typed.current = new Typed(el.current!, options);

    return () => {
      typed.current?.destroy();
    };
  }, []);

  return (
    <Box sx={{ 
      textAlign: 'center',
      mb: 4,
      height: 120, // Fixed height to prevent layout shift
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center'
    }}>
      <Typography 
        variant="h2" 
        component="h1"
        sx={{ 
          fontWeight: 700,
          '& .typed-cursor': {
            color: 'primary.main',
          }
        }}
      >
        <span ref={el}></span>
      </Typography>
    </Box>
  );
}; 