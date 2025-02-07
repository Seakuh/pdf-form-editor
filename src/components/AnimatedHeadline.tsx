import { useEffect, useRef } from 'react';
import { Box, Typography } from '@mui/material';
import Typed from 'typed.js';

export const AnimatedHeadline = () => {
  const el = useRef(null);
  const typed = useRef<Typed | null>(null);

  useEffect(() => {
    const options = {
      strings: [
        'Intelligentes PDF Formular',
        'Einfach. Schnell. Digital.',
      ],
      typeSpeed: 50,
      backSpeed: 30,
      backDelay: 2000,
      loop: true,
    };

    if (el.current) {
      typed.current = new Typed(el.current, options);
    }

    return () => {
      typed.current?.destroy();
    };
  }, []);

  return (
    <Box sx={{ 
      minHeight: '120px',  // Reserviere Platz für 2 Zeilen
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <Typography
        variant="h3"
        component="h1"
        align="center"
        sx={{
          fontWeight: 600,
          color: 'primary.main',
          minHeight: '2.4em',  // Etwa 2 Zeilen
          display: 'flex',
          alignItems: 'center'
        }}
      >
        <span ref={el} />
      </Typography>
    </Box>
  );
}; 