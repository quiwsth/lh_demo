import { Dialog, Box, Typography, Button, Divider } from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWarning, faIdCard, faFileLines, faCircleInfo } from '@fortawesome/free-solid-svg-icons';

function FreezeDialog({ open, onClose, data }) {
  if (!data) return null;

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      PaperProps={{
        sx: {
          width: '100%',
          maxWidth: '360px',
          m: 2,
          borderRadius: 4,
          bgcolor: 'white',
          p: 3
        }
      }}
    >
      {/* Header */}
      <Box sx={{ textAlign: 'center', mb: 2 }}>
        <FontAwesomeIcon 
          icon={faWarning} 
          style={{ 
            fontSize: '2rem',
            color: '#f44336',
            marginBottom: '1rem'
          }}
        />
        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
          ยืนยันการอายัดบัญชี
        </Typography>
      </Box>

      {/* Account Info */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <FontAwesomeIcon icon={faCircleInfo} style={{ marginRight: '8px' }} />
        <Typography>
          บัญชีธนาคาร (บัญชีออมทรัพย์)
        </Typography>
      </Box>

      {/* Warning Message */}
      <Box sx={{ 
        bgcolor: '#ef5350',
        color: 'white',
        p: 2,
        borderRadius: 1,
        mb: 2
      }}>
        <Typography variant="body2">
          {data.reason === 'lost' ? 'บัญชีสูญหาย' : 'บัญชีถูกขโมย'}
        </Typography>
        <Typography variant="caption">
          {data.reason === 'lost' 
            ? 'กรณีทำบัตร ATM/สมุดบัญชีหาย'
            : 'กรณีบัตร ATM/สมุดบัญชีถูกขโมย'}
        </Typography>
      </Box>

      {/* Info Message */}
      <Box sx={{ 
        bgcolor: '#e3f2fd',
        p: 2,
        borderRadius: 1,
        mb: 2
      }}>
        <Typography variant="body2">
          กรุณาเตรียมเอกสารต่อไปนี้เพื่อยื่นที่สาขา
        </Typography>
      </Box>

      {/* Required Documents */}
      <Box sx={{ mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <FontAwesomeIcon icon={faIdCard} style={{ marginRight: '8px', width: '20px' }} />
          <Box>
            <Typography variant="body2">สำเนาบัตรประชาชน</Typography>
            <Typography variant="caption" color="text.secondary">
              สำเนาพร้อมรับรองสำเนาถูกต้อง
            </Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <FontAwesomeIcon icon={faFileLines} style={{ marginRight: '8px', width: '20px' }} />
          <Box>
            <Typography variant="body2">ใบแจ้งความ</Typography>
            <Typography variant="caption" color="text.secondary">
              ใบแจ้งความจากสถานีตำรวจ
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Notice */}
      <Box sx={{ 
        bgcolor: '#fff3e0',
        p: 2,
        borderRadius: 1,
        mb: 3
      }}>
        <Typography variant="body2" color="warning.main">
          หลังจากอายัดแล้ว กรุณาเอกสารมาติดต่อที่สาขาภายใน 7 วัน
          เพื่อดำเนินการขั้นตอนต่อไป
        </Typography>
      </Box>

      {/* Buttons */}
      <Box sx={{ 
        display: 'flex', 
        gap: 2, 
        justifyContent: 'center'
      }}>
        <Button 
          variant="outlined" 
          onClick={onClose}
          sx={{ width: '120px' }}
        >
          ยกเลิก
        </Button>
        <Button 
          variant="contained" 
          color="error"
          onClick={onClose}
          sx={{ width: '120px' }}
        >
          ยืนยันอายัด
        </Button>
      </Box>
    </Dialog>
  );
}

export default FreezeDialog; 