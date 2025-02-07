import { Box, Typography } from '@mui/material';

export const AnimatedHeadline = () => {
  return (
    <Box 
      sx={{ 
        textAlign: 'center',
        animation: 'fadeIn 1s ease-out',
      }}
    >
      <Box
        component="img"
        src="/pdfformapplogo.png"
        alt="PDF Form App Logo"
        sx={{
          width: '200px',
          height: 'auto',
          marginBottom: 3,
          animation: 'slideUp 1s ease-out',
        }}
      />
      <Typography
        variant="h4"
        component="h1"
        sx={{
          color: 'primary.main',
          fontWeight: 'bold',
          mb: 2,
        }}
      >
        PDF Form Filler
      </Typography>
      <Typography
        variant="subtitle1"
        color="text.secondary"
      >
        Fill your PDF forms easily and quickly
      </Typography>
    </Box>
  );
}; 