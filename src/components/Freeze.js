import { useState } from 'react';
import { Box, Typography, Button, Container, Paper } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';

function Freeze() {
  const location = useLocation();
  const navigate = useNavigate();
  const { reason, type, accountInfo } = location.state || {};

  const handleConfirm = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/notification/freeze-success', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason, type, accountInfo })
      });

      const data = await response.json();
      
      const audio = new Audio(`data:audio/mp3;base64,${data.audio}`);
      await audio.play();

      audio.addEventListener('ended', () => {
        navigate('/');
      });

    } catch (error) {
      console.error('Error:', error);
      navigate('/');
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Paper elevation={3} sx={{ p: 4, borderRadius: 2, width: '100%', maxWidth: 500 }}>
          <Typography variant="h5" gutterBottom sx={{ color: 'error.main', fontWeight: 'bold', textAlign: 'center' }}>
            ยืนยันการอายัดบัญชี
          </Typography>
          
          <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
            <Typography variant="subtitle1" gutterBottom>
              ข้อมูลบัญชี:
            </Typography>
            <Typography variant="body2">
              ชื่อบัญชี: {accountInfo?.owner_name}
            </Typography>
            <Typography variant="body2">
              เลขบัญชี: {accountInfo?.account_number}
            </Typography>
            <Typography variant="body2">
              ประเภทบัญชี: {accountInfo?.account_type}
            </Typography>
          </Box>

          <Typography sx={{ mt: 2, p: 2, bgcolor: 'error.light', color: 'error.dark', borderRadius: 1 }}>
            สาเหตุ: {reason}
          </Typography>

          <Typography sx={{ mt: 2, color: 'text.secondary', textAlign: 'center' }}>
            เอกสารที่ต้องใช้:
          </Typography>
          <Typography variant="body2" sx={{ textAlign: 'center' }}>
            • บัตรประชาชนตัวจริง
            <br />
            • ใบแจ้งความ
          </Typography>

          <Typography sx={{ mt: 2, color: 'text.secondary', textAlign: 'center' }}>
            หลังจากอายัดบัญชีแล้ว กรุณาติดต่อสาขาเพื่อดำเนินการต่อ
          </Typography>

          <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'center' }}>
            <Button variant="outlined" onClick={() => navigate('/')} sx={{ width: 200 }}>
              ยกเลิก
            </Button>
            <Button variant="contained" color="error" onClick={handleConfirm} sx={{ width: 200 }}>
              ยืนยันการอายัดบัญชี
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
}

export default Freeze; 