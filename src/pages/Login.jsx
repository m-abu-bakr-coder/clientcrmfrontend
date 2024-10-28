import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { post } from '../services/ApiEndpoint';
import { toast } from 'react-hot-toast';
import { useDispatch, useSelector } from 'react-redux';
import { SetUser } from '../redux/AuthSlice';
import { TextField, Button, Typography, Box, CircularProgress, InputAdornment, IconButton, } from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import UIText from '../utilities/testResource';

export default function Login() {
    const user = useSelector((state) => state.Auth);
    console.log(user);
    const dispatch = useDispatch();
    const [email, setEmail] = useState('');
    const navigate = useNavigate();
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false); // State for password visibility

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(''); // Reset error state

        try {
            const request = await post('/api/auth/login', { email, password });
            const response = request.data;

            if (request.status === 200) {
                if (response.user.role === 'admin') {
                    navigate('/admin');
                } else if (response.user.role === 'user') {
                    navigate('/');
                }
                toast.success(response.message);
                dispatch(SetUser(response.user));
            }
            console.log(response);
        } catch (error) {
            setError('Login failed. Please check your credentials.'); // Set error message
            console.error(error);
        } finally {
            setLoading(false); // Stop loading
        }
    };

    // Toggle password visibility
    const handleClickShowPassword = () => setShowPassword(!showPassword);

    return (
        <div style={{
            height: '100vh',
            width: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '20px',
            boxSizing: 'border-box'
        }}>
            <Box
                className='login-container'
                sx={{
                    maxWidth: 400,
                    width: '100%',
                    mx: 'auto',
                    p: 3,
                    border: '1px solid #ccc',
                    borderRadius: '12px',
                    backgroundColor: '#fff',
                    boxShadow: 3,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                }}
            >
                <Typography variant="h4" component="h2" sx={{ textAlign: 'center', fontWeight: "600", mb: 4 }}>{UIText.login.login_text}</Typography>
                {error && <Typography variant="body2" color="error" sx={{ mb: 2 }}>{error}</Typography>}
                <form onSubmit={handleSubmit} style={{ width: '100%' }}>
                    <Box mb={2}>
                        <TextField
                            fullWidth
                            label="Email"
                            type="email"
                            id="email"
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            variant="outlined"
                        />
                    </Box>
                    <Box mb={2}>
                        <TextField
                            fullWidth
                            label="Password"
                            type={showPassword ? 'text' : 'password'} // Toggle password visibility
                            id="password"
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            variant="outlined"
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton onClick={handleClickShowPassword}>
                                            {showPassword ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                        />
                    </Box>
                    <Button variant="contained" type='submit' fullWidth disabled={loading} sx={{ mb: 4 }}>
                        {loading ? <CircularProgress size={22} /> : 'Login'}
                    </Button>
                    <Typography variant="body2" align="center" fontWeight={600}>
                        {UIText.login.not_register} <Link to="/register">{UIText.login.register_url}</Link>
                    </Typography>
                </form>
            </Box>
        </div>
    );
}

