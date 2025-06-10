import { 
  Box, 
  Typography, 
  Button, 
  IconButton,
  Slide,
  Paper
} from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faLink, 
  faTimes,
  faExternalLink
} from '@fortawesome/free-solid-svg-icons';

const theme = {
  colors: {
    purple: '#903f98',
    gray: '#9b9f94'
  }
};

function LinkDialog({ open, onClose, links }) {
  if (!links?.length) return null;

  const handleClick = (url) => {
    window.open(url, '_blank');
  };

  return (
    <Slide direction="down" in={open} mountOnEnter unmountOnExit>
      <Paper
        elevation={3}
        sx={{
          position: 'absolute',
          top: '50%',
          right: 0,
          left: 0,
          margin: 'auto',
          width: '85%',
          maxWidth: '300px',
          zIndex: 1300,
          borderRadius: 2,
          overflow: 'hidden',
          bgcolor: 'rgba(255, 255, 255, 0.98)',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          transform: 'translateY(-50%)'
        }}
      >
        {/* Header */}
        <Box sx={{ 
          bgcolor: theme.colors.purple,
          p: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <FontAwesomeIcon
              icon={faLink}
              style={{
                fontSize: '0.9rem',
                color: 'white'
              }}
            />
            <Typography variant="body2" sx={{ 
              color: 'white',
              fontWeight: 500
            }}>
              ข้อมูลเพิ่มเติม
            </Typography>
          </Box>
          <IconButton 
            onClick={onClose}
            size="small"
            sx={{ 
              color: 'white',
              padding: 0.5
            }}
          >
            <FontAwesomeIcon icon={faTimes} size="xs" />
          </IconButton>
        </Box>

        {/* Content */}
        <Box sx={{ p: 1 }}>
          {links.map((link, index) => (
            <Button
              key={index}
              fullWidth
              variant="text"
              onClick={() => handleClick(link.url)}
              startIcon={
                <FontAwesomeIcon 
                  icon={faExternalLink} 
                  size="sm"
                />
              }
              sx={{
                justifyContent: 'flex-start',
                color: theme.colors.purple,
                textAlign: 'left',
                py: 0.5,
                fontSize: '0.85rem',
                '&:hover': {
                  bgcolor: `${theme.colors.purple}10`
                }
              }}
            >
              {link.title}
            </Button>
          ))}
        </Box>
      </Paper>
    </Slide>
  );
}

export default LinkDialog; 