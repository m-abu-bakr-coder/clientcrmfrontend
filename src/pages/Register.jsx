/* eslint-disable no-unused-vars */
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { post } from '../services/ApiEndpoint';
import { toast } from 'react-hot-toast';
import { Box, TextField, Button, Typography, CircularProgress, LinearProgress, InputAdornment, IconButton } from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import UIText from '../utilities/testResource';

export default function Register() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [strength, setStrength] = useState(0);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name || !email || !password || !confirmPassword) return;

        if (password !== confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }

        setLoading(true);
        setError(''); // Reset error state

        try {
            const request = await post('/api/auth/register', { name, email, password });
            const response = request.data;

            if (request.status === 200) {
                toast.success(response.message);
            }
        } catch (error) {
            setError('Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Function to check password strength
    const checkPasswordStrength = (password) => {
        let strength = 0;
        const lengthRegex = /.{8,12}/;
        const numberRegex = /\d/;
        const specialCharRegex = /[!@#$%^&*(),.?":{}|<>]/;

        if (lengthRegex.test(password)) strength += 25; // Check length (8-12 characters)
        if (numberRegex.test(password)) strength += 25; // Check for at least 1 number
        if (specialCharRegex.test(password)) strength += 25; // Check for at least 1 special character
        if (password.length >= 8 && password.length <= 12) strength += 25; // Password within required length

        return strength;
    };

    // Update password strength
    const handlePasswordChange = (e) => {
        const newPassword = e.target.value;
        setPassword(newPassword);
        setStrength(checkPasswordStrength(newPassword));
    };

    // Toggle password visibility
    const handleClickShowPassword = () => setShowPassword(!showPassword);
    const handleClickShowConfirmPassword = () => setShowConfirmPassword(!showConfirmPassword);

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
                className='register-container'
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
                <Typography variant="h4" component="h2" sx={{ textAlign: 'center', fontWeight: "600", mb: 4 }}>{UIText.register.register_text}</Typography>
                {error && <Typography variant="body2" color="error" sx={{ mb: 2 }}>{error}</Typography>}
                <form onSubmit={handleSubmit} style={{ width: '100%' }}>
                    <Box mb={2}>
                        <TextField
                            fullWidth
                            label="Username"
                            type="text"
                            id="username"
                            onChange={(e) => setName(e.target.value)}
                            required
                            variant="outlined"
                        />
                    </Box>
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
                            type={showPassword ? 'text' : 'password'}
                            id="password"
                            onChange={handlePasswordChange}
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
                    {password && (
                        <>
                            <LinearProgress variant="determinate" value={strength} sx={{ mb: 2 }} />
                            <Typography variant="body2" align="center" sx={{ mb: 2 }}>{UIText.register.password_validation_text}</Typography>
                        </>
                    )}
                    <Box mb={2}>
                        <TextField
                            fullWidth
                            label="Confirm Password"
                            type={showConfirmPassword ? 'text' : 'password'}
                            id="confirmPassword"
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            variant="outlined"
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton onClick={handleClickShowConfirmPassword}>
                                            {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                        />
                    </Box>
                    <Button variant="contained" type='submit' fullWidth disabled={loading} sx={{ mb: 4 }}>
                        {loading ? <CircularProgress size={22} /> : 'Register'}
                    </Button>
                    <Typography variant="body2" align="center" fontWeight={600}>
                        {UIText.register.already_register} <Link to="/login">{UIText.register.register_text}</Link>
                    </Typography>
                </form>
            </Box>
        </div>
    );
}
