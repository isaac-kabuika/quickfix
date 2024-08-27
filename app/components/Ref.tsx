import { styled } from '@stitches/react';

const Card = styled('div', {
  // ... existing code ...

  variants: {
    color: {
      default: {
        // ... existing code ...
      },
      purple: {
        // ... existing code ...
      },
    },
    illustration: {
      true: {
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          opacity: 0.5,
          '@media (prefers-color-scheme: light)': {
            opacity: 0.15, // Significantly reduced opacity for light mode
          },
          // ... existing background properties ...
        },
      },
    },
  },

  // ... existing code ...
});