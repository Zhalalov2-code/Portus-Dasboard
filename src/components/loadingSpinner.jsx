import { Box, CircularProgress, Typography } from '@mui/material';
import '../css/loadingSpinner.css';

function LoadingSpinner({ message = 'Загрузка...', size = 60 }) {
    return (
        <Box className="loading-container">
            <div className="loading-spinner-wrapper">
                <CircularProgress 
                    size={size}
                    thickness={4}
                    sx={{
                        color: 'var(--primary-color)',
                        '& .MuiCircularProgress-circle': {
                            strokeLinecap: 'round',
                        }
                    }}
                />
                <div className="loading-pulse"></div>
            </div>
            <Typography 
                variant="body1" 
                sx={{ 
                    mt: 3, 
                    color: 'var(--text-color-secondary)',
                    fontWeight: 500,
                    letterSpacing: '0.5px'
                }}
            >
                {message}
            </Typography>
        </Box>
    );
}

export default LoadingSpinner;
