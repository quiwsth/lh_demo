import { Dialog, Box, Typography, IconButton, Fade } from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleCheck, faXmark } from '@fortawesome/free-solid-svg-icons';

const theme = {
  colors: {
    purple: '#903f98',
    gray: '#9b9f94',
    green: '#4CAF50'
  }
};

const SuccessDialog = ({ open, onClose, recipientName, amount }) => {
  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      TransitionComponent={Fade}
      PaperProps={{
        sx: {
          width: '100%',
          maxWidth: '360px',
          m: 2,
          borderRadius: 3,
          bgcolor: 'white',
          overflow: 'hidden'
        }
      }}
      sx={{
        '& .MuiBackdrop-root': {
          backdropFilter: 'blur(5px)',
          backgroundColor: 'rgba(0, 0, 0, 0.6)'
        }
      }}
    >
      <Box sx={{ p: 3, textAlign: 'center' }}>
        {/* Close Button */}
        <IconButton 
          onClick={onClose}
          sx={{ 
            position: 'absolute',
            right: 8,
            top: 8,
            color: theme.colors.gray
          }}
        >
          <FontAwesomeIcon icon={faXmark} />
        </IconButton>

        {/* Success Icon */}
        <FontAwesomeIcon 
          icon={faCircleCheck} 
          style={{ 
            fontSize: '4rem',
            color: theme.colors.green,
            marginBottom: '1rem'
          }}
        />

        {/* Success Message */}
        <Typography variant="h6" sx={{ 
          color: theme.colors.green,
          fontWeight: 'bold',
          mb: 2
        }}>
          โอนเงินสำเร็จ
        </Typography>

        <Typography variant="body1" sx={{ mb: 1 }}>
          โอนเงินให้ {recipientName}
        </Typography>

        <Typography variant="h5" sx={{ 
          color: theme.colors.purple,
          fontWeight: 'bold',
          mb: 2
        }}>
          ฿{amount.toLocaleString()}
        </Typography>

        <Typography variant="caption" sx={{ color: theme.colors.gray }}>
          {new Date().toLocaleDateString('th-TH', { 
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </Typography>
      </Box>
    </Dialog>
  );
};

export default SuccessDialog; 