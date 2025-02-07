import { useEffect, useRef } from 'react';
import Typed from 'typed.js';
import { Typography } from '@mui/material';

export const AnimatedHeadline = () => {
  const el = useRef(null);
  const typed = useRef<Typed | null>(null);

  useEffect(() => {
    const options = {
      strings: ['PDF Formular Editor', 'Formularfelder ausfüllen', 'PDF herunterladen'],
      typeSpeed: 50,
      backSpeed: 50,
      loop: true,
      showCursor: true,
      cursorChar: '|'
    };

    if (el.current) {
      typed.current = new Typed(el.current, options);
    }

    return () => {
      typed.current?.destroy();
    };
  }, []);

  return (
    <Typography variant="h3" component="h1" gutterBottom>
      <span ref={el} />
    </Typography>
  );
}; 