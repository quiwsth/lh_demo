import { useState } from 'react';
import { Box, Typography, Paper, Grid, Fade, CircularProgress } from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faMoneyBillTransfer,
  faClockRotateLeft,
  faQrcode,
  faCreditCard,
  faBell,
  faEllipsisVertical,
  faMoneyBill,
  faReceipt,
  faGift,
  faMicrophone,
  faRobot,
  faXmark,
  faHome,
  faWallet,
  faCompass,
  faUser
} from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';

// กำหนดธีมสีของ LH Bank
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
  },
  gradient: 'linear-gradient(45deg, #903f98 30%, #0086c3 90%)', // purple to blue
  background: '#F6F6F6',
  text: '#333333'
};

// เพิ่มข้อมูลบัญชีส่วนตัว
const personalAccount = {
  name: 'ธนกร ทิพย์กระโทก',
  accountNo: 'xxx-x-x4589-x',
  type: 'ออมทรัพย์',
  balance: 50000.00
};

// แก้ไขข้อมูล favorite accounts
const favoriteAccounts = [
  { 
    id: 1, 
    name: 'สมชาย ใจดี', 
    accountNo: '123-4-56789-0',
    bank: 'LH Bank',
    avatar: '👨'
  },
  { 
    id: 2, 
    name: 'สมหญิง รักดี', 
    accountNo: '098-7-65432-1',
    bank: 'LH Bank',
    avatar: '👩'
  },
  { 
    id: 3, 
    name: 'แม่', 
    accountNo: '111-2-33333-4',
    bank: 'LH Bank',
    avatar: '👩'
  },
  { 
    id: 4, 
    name: 'น้องสาว', 
    accountNo: '555-6-77777-8',
    bank: 'LH Bank',
    avatar: '👧'
  }
];

function Dashboard() {
  const navigate = useNavigate();
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [aiMessage, setAiMessage] = useState('');

  const handleVoiceAssistant = () => {
    navigate('/ai-assistant');
  };

  return (
    <Box sx={{ pb: 8, position: 'relative', minHeight: '100vh', bgcolor: theme.background }}>
      {/* Header */}
      <Box sx={{ 
        p: 2, 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        borderBottom: '1px solid #eee',
        bgcolor: 'white'
      }}>
        <img 
          src="/lh_bank_logo.png" 
          alt="LH Bank" 
          style={{ 
            height: '30px',
            objectFit: 'contain'
          }} 
        />
        <Box>
          <FontAwesomeIcon 
            icon={faBell} 
            style={{ 
              marginRight: 15, 
              cursor: 'pointer', 
              color: theme.colors.purple 
            }} 
          />
          <FontAwesomeIcon 
            icon={faEllipsisVertical} 
            style={{ 
              cursor: 'pointer', 
              color: theme.colors.purple 
            }} 
          />
        </Box>
      </Box>

      {/* Balance Card */}
      <Box sx={{ p: 2 }}>
        <Paper 
          elevation={0}
          sx={{ 
            p: 3, 
            mb: 2, 
            background: theme.gradient,
            color: 'white',
            borderRadius: 3,
            cursor: 'pointer',
            transition: 'transform 0.2s ease',
            '&:hover': {
              transform: 'scale(1.02)'
            }
          }}
        >
          <Typography variant="subtitle2" sx={{ mb: 1, opacity: 0.9 }}>
            บัญชี{personalAccount.type}
          </Typography>
          <Typography variant="subtitle2" sx={{ mb: 1, opacity: 0.9 }}>
            {personalAccount.name}
          </Typography>
          <Typography variant="subtitle2" sx={{ mb: 1, opacity: 0.9 }}>
            {personalAccount.accountNo}
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
            ฿{personalAccount.balance.toLocaleString('th-TH', {minimumFractionDigits: 2})}
          </Typography>
          <Typography variant="caption" sx={{ opacity: 0.9 }}>
            กดเพื่อดูรายละเอียดบัญชี
          </Typography>
        </Paper>
      </Box>

      {/* Favorite Accounts - เพิ่มส่วนนี้หลัง Balance Card */}
      <Box sx={{ px: 2, mb: 3 }}>
        <Typography variant="subtitle1" sx={{ 
          mb: 2, 
          fontWeight: 'bold', 
          color: theme.text,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          บัญชีที่บันทึกไว้
          <Typography 
            variant="caption" 
            sx={{ 
              color: theme.colors.purple,
              cursor: 'pointer',
              '&:hover': { textDecoration: 'underline' }
            }}
          >
            ดูทั้งหมด
          </Typography>
        </Typography>
        
        <Box sx={{ 
          display: 'flex', 
          gap: 2,
          overflowX: 'auto',
          pb: 1,
          '&::-webkit-scrollbar': {
            height: '4px',
          },
          '&::-webkit-scrollbar-track': {
            background: '#f1f1f1',
            borderRadius: '10px',
          },
          '&::-webkit-scrollbar-thumb': {
            background: '#888',
            borderRadius: '10px',
          },
        }}>
          {favoriteAccounts.map((account) => (
            <Paper
              key={account.id}
              elevation={0}
              sx={{
                p: 2,
                minWidth: 140,
                bgcolor: 'white',
                borderRadius: 2,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                '&:hover': {
                  bgcolor: '#F0EBF7',
                  transform: 'translateY(-2px)'
                }
              }}
            >
              <Box sx={{ 
                display: 'flex', 
                flexDirection: 'column',
                alignItems: 'center',
                gap: 1
              }}>
                <Box sx={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  bgcolor: `${theme.colors.purple}15`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.5rem'
                }}>
                  {account.avatar}
                </Box>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography 
                    variant="subtitle2" 
                    sx={{ 
                      fontWeight: 'bold',
                      color: theme.text,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      maxWidth: '100%'
                    }}
                  >
                    {account.name}
                  </Typography>
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      color: theme.colors.gray,
                      display: 'block'
                    }}
                  >
                    {account.accountNo}
                  </Typography>
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      color: theme.colors.purple,
                      display: 'block'
                    }}
                  >
                    {account.bank}
                  </Typography>
                </Box>
              </Box>
            </Paper>
          ))}
        </Box>
      </Box>

      {/* Quick Menu */}
      <Box sx={{ px: 2, mb: 3 }}>
        <Grid container spacing={3}>
          {[
            { icon: faMoneyBillTransfer, label: 'โอนเงิน', color: theme.colors.turquoise },
            { icon: faClockRotateLeft, label: 'รายการ', color: theme.colors.orange },
            { icon: faQrcode, label: 'สแกนจ่าย', color: theme.colors.lime },
            { icon: faCreditCard, label: 'บัญชี', color: theme.colors.coral }
          ].map((item, index) => (
            <Grid item xs={3} key={index}>
              <Box 
                sx={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center',
                  cursor: 'pointer'
                }}
              >
                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
                    borderRadius: '50%',
                    bgcolor: 'white',
                    mb: 1,
                    width: 40,
                    height: 40,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      bgcolor: '#F0EBF7',
                      transform: 'translateY(-2px)'
                    }
                  }}
                >
                  <FontAwesomeIcon 
                    icon={item.icon} 
                    size="lg" 
                    style={{ color: item.color }} 
                  />
                </Paper>
                <Typography variant="caption" align="center">{item.label}</Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Services */}
      <Box sx={{ px: 2 }}>
        <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'bold', color: theme.text }}>
          บริการอื่นๆ
        </Typography>
        <Grid container spacing={2}>
          {[
            { icon: faMoneyBill, label: 'จ่ายบิล', color: theme.colors.yellow },
            { icon: faReceipt, label: 'เติมเงิน', color: theme.colors.blue },
            { icon: faGift, label: 'สิทธิพิเศษ', color: theme.colors.purple }
          ].map((item, index) => (
            <Grid item xs={4} key={index}>
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  textAlign: 'center',
                  bgcolor: 'white',
                  borderRadius: 2,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    bgcolor: '#F0EBF7',
                    transform: 'translateY(-2px)'
                  }
                }}
              >
                <FontAwesomeIcon 
                  icon={item.icon} 
                  size="lg" 
                  style={{ 
                    color: item.color, 
                    marginBottom: 8 
                  }} 
                />
                <Typography variant="caption" display="block">{item.label}</Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Bottom Tab Menu */}
      <Paper
        sx={{
          position: 'fixed',
          bottom: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: '100%',
          maxWidth: '480px',
          zIndex: 900,
          borderRadius: '12px 12px 0 0',
          boxShadow: '0 -2px 10px rgba(0,0,0,0.1)',
          bgcolor: 'white'
        }}
        elevation={0}
      >
        <Grid container sx={{ height: '60px' }}>
          {[
            { icon: faHome, label: 'หน้าหลัก', active: true },
            { icon: faWallet, label: 'การเงิน' },
            { icon: null, label: '' },
            { icon: faCompass, label: 'ค้นพบ' },
            { icon: faUser, label: 'บัญชี' }
          ].map((item, index) => (
            <Grid 
              item 
              xs={2.4} 
              key={index}
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: item.icon ? 'pointer' : 'default',
                color: item.active ? theme.colors.purple : theme.colors.gray,
                '&:hover': item.icon ? {
                  color: theme.colors.purple
                } : {},
                transition: 'all 0.2s ease'
              }}
            >
              {item.icon && (
                <>
                  <FontAwesomeIcon icon={item.icon} size="lg" />
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      mt: 0.5,
                      fontSize: '0.7rem'
                    }}
                  >
                    {item.label}
                  </Typography>
                </>
              )}
            </Grid>
          ))}
        </Grid>
      </Paper>

      {/* AI Assistant Button */}
      <Box
        sx={{
          position: 'fixed',
          bottom: 30,
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          zIndex: 1000
        }}
      >
        {aiMessage && (
          <Fade in={true}>
            <Paper
              elevation={3}
              sx={{
                p: 2,
                mb: 2,
                borderRadius: 2,
                bgcolor: `${theme.colors.purple}F0`,
                color: 'white',
                maxWidth: 200,
                textAlign: 'center'
              }}
            >
              {aiMessage}
            </Paper>
          </Fade>
        )}

        <Box
          onClick={handleVoiceAssistant}
          className={isListening ? 'pulse' : ''}
          sx={{
            width: 65,
            height: 65,
            borderRadius: '50%',
            background: isListening 
              ? `linear-gradient(45deg, ${theme.colors.coral} 30%, ${theme.colors.orange} 90%)`
              : theme.gradient,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: `0 3px 15px ${theme.colors.purple}40`,
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'scale(1.05)',
              boxShadow: `0 5px 20px ${theme.colors.purple}60`,
            },
            '&:active': {
              transform: 'scale(0.95)',
            }
          }}
        >
          {isProcessing ? (
            <CircularProgress
              size={30}
              thickness={5}
              sx={{ color: 'white' }}
            />
          ) : (
            <FontAwesomeIcon 
              icon={isListening ? faMicrophone : faRobot} 
              size="lg" 
              style={{ color: 'white' }} 
            />
          )}
        </Box>
      </Box>
    </Box>
  );
}

export default Dashboard; 