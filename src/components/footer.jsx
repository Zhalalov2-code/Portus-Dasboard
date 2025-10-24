import { Box, Container, Typography, Link, Divider } from '@mui/material';
import '../css/footer.css';

function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="footer">
            <Container maxWidth="lg">
                <Box className="footer-content">
                    <Box className="footer-section">
                        <Typography variant="h6" className="footer-title">
                            Portus Logistics GmbH
                        </Typography>
                        <Typography variant="body2" className="footer-description">
                            Управление автопарком и логистическими операциями
                        </Typography>
                    </Box>

                    <Box className="footer-section">
                        <Typography variant="subtitle2" className="footer-subtitle">
                            Контакты
                        </Typography>
                        <Typography variant="body2" className="footer-text">
                            Email: info@portuslogistics.de
                        </Typography>
                        <Typography variant="body2" className="footer-text">
                            Телефон: +49 (0) 123 456 789
                        </Typography>
                    </Box>

                    <Box className="footer-section">
                        <Typography variant="subtitle2" className="footer-subtitle">
                            Система
                        </Typography>
                        <Link href="/chassi" className="footer-link">
                            Управление прицепами
                        </Link>
                        <Link href="/fahrer" className="footer-link">
                            Управление водителями
                        </Link>
                    </Box>
                </Box>

                <Divider className="footer-divider" />

                <Box className="footer-bottom">
                    <Typography variant="body2" className="footer-copyright">
                        © {currentYear} Portus Logistics GmbH. Все права защищены.
                    </Typography>
                    <Box className="footer-links">
                        <Link href="#" className="footer-bottom-link">
                            Политика конфиденциальности
                        </Link>
                        <Link href="#" className="footer-bottom-link">
                            Условия использования
                        </Link>
                    </Box>
                </Box>
            </Container>
        </footer>
    );
}

export default Footer;
