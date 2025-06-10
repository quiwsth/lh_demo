import { useState, useEffect } from 'react';
import { 
  Box, Typography, Paper, Grid, IconButton, 
  Dialog, Fade, CircularProgress 
} from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faCircle, 
  faCircleDot,
  faDeleteLeft,
  faXmark 
} from '@fortawesome/free-solid-svg-icons';

const theme = {
  colors: {
    lime: '#d6dc29',
    turquoise: '#49bfc7',
    purple: '#903f98',
    coral: '#f58468',
    blue: '#0086c3',
    yellow: '#fbc410',
    gray: '#9b9f94',
    orange: '#f7941e'
  }
};

const PinScreen = ({ 
  open, 
  onClose, 
  onSuccess, 
  recipientName,
  title = 'ยืนยัน PIN',
  transactionType
}) => {
  const [pin, setPin] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Reset PIN เมื่อ dialog เปิดใหม่หรือปิด
  useEffect(() => {
    if (!open) {
      setPin('');
    }
  }, [open]);

  const handleNumberClick = (number) => {
    if (pin.length < 6) {
      setPin(prev => prev + number);
    }
  };

  const handleDelete = () => {
    setPin(prev => prev.slice(0, -1));
  };

  // Reset PIN หลังจาก success
  const handleSuccess = () => {
    onSuccess();
    setPin('');
  };

  // Reset PIN เมื่อกดปิด
  const handleClose = () => {
    onClose();
    setPin('');
  };

  // เช็ค PIN เมื่อกดครบ 6 หลัก
  useEffect(() => {
    if (pin.length === 6) {
      setIsProcessing(true);
      // จำลองการตรวจสอบ PIN
      setTimeout(() => {
        setIsProcessing(false);
        handleSuccess(); // เรียกใช้ handleSuccess แทน onSuccess โดยตรง
      }, 1500);
    }
  }, [pin, onSuccess]);

  // ฟังก์ชันสำหรับแสดงข้อความอธิบาย
  const getTransactionDescription = () => {
    switch (transactionType) {
      case 'transfer':
        return {
          label: 'โอนเงินให้',
          value: recipientName
        };
      case 'statement':
        return {
          label: 'ขอข้อมูล',
          value: 'Statement ย้อนหลัง 6 เดือน'
        };
      default:
        return null;
    }
  };

  const description = getTransactionDescription();

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      TransitionComponent={Fade}
      PaperProps={{
        sx: {
          width: '100%',
          maxWidth: '400px',
          height: '80vh',
          m: 2,
          borderRadius: 3,
          bgcolor: 'white',
          overflow: 'hidden'
        }
      }}
      sx={{
        '& .MuiDialog-paper': {
          margin: 2
        },
        '& .MuiBackdrop-root': {
          backdropFilter: 'blur(5px)',
          backgroundColor: 'rgba(0, 0, 0, 0.6)'
        }
      }}
    >
      <Box sx={{ 
        height: '100%',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Header */}
        <Box sx={{ 
          p: 2, 
          display: 'flex', 
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid #eee'
        }}>
          <IconButton onClick={handleClose}>
            <FontAwesomeIcon icon={faXmark} />
          </IconButton>
          <Typography variant="subtitle1" sx={{ 
            fontWeight: 'bold',
            color: theme.colors.purple 
          }}>
            {title}
          </Typography>
          <Box sx={{ width: 40 }} />
        </Box>

        {/* Transaction Info - แสดงทั้งกรณีโอนเงินและขอ Statement */}
        {description && (
          <Box sx={{ 
            p: 3, 
            textAlign: 'center',
            flex: '0 0 auto'
          }}>
            <Typography variant="body2" sx={{ 
              color: theme.colors.gray,
              mb: 1
            }}>
              {description.label}
            </Typography>
            <Typography variant="h6" sx={{ 
              color: theme.colors.purple,
              fontWeight: 'bold',
              mb: 1
            }}>
              {description.value}
            </Typography>
          </Box>
        )}

        {/* PIN Dots */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center',
          gap: 2,
          mb: 4,
          flex: '0 0 auto'
        }}>
          {[...Array(6)].map((_, index) => (
            <FontAwesomeIcon 
              key={index}
              icon={index < pin.length ? faCircleDot : faCircle}
              style={{ 
                color: index < pin.length ? theme.colors.purple : '#ddd',
                fontSize: '1rem'
              }}
            />
          ))}
        </Box>

        {/* Number Pad */}
        <Box sx={{ 
          flex: 1,
          display: 'flex',
          alignItems: 'flex-end',
          p: 2
        }}>
          <Grid container spacing={1.5}>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, '', 0, 'delete'].map((num, index) => (
              <Grid item xs={4} key={index}>
                {num === 'delete' ? (
                  <IconButton 
                    onClick={handleDelete}
                    disabled={isProcessing}
                    sx={{ 
                      width: '100%',
                      height: 60,
                      color: theme.colors.gray,
                      '&:hover': {
                        color: theme.colors.purple
                      }
                    }}
                  >
                    <FontAwesomeIcon icon={faDeleteLeft} size="lg" />
                  </IconButton>
                ) : num === '' ? (
                  <Box sx={{ height: 60 }} />
                ) : (
                  <Paper
                    elevation={0}
                    onClick={() => !isProcessing && handleNumberClick(num)}
                    sx={{
                      height: 60,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: 'transparent',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      '&:hover': {
                        bgcolor: `${theme.colors.purple}10`
                      },
                      '&:active': {
                        bgcolor: `${theme.colors.purple}20`
                      }
                    }}
                  >
                    {isProcessing ? (
                      <CircularProgress 
                        size={20} 
                        sx={{ color: theme.colors.purple }}
                      />
                    ) : (
                      <Typography 
                        variant="h5"
                        sx={{ 
                          fontWeight: 'bold',
                          color: theme.colors.purple 
                        }}
                      >
                        {num}
                      </Typography>
                    )}
                  </Paper>
                )}
              </Grid>
            ))}
          </Grid>
        </Box>
      </Box>
    </Dialog>
  );
};

export default PinScreen; 