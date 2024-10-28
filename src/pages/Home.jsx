/* eslint-disable no-unused-vars */
import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { post } from '../services/ApiEndpoint';
import { Logout } from '../redux/AuthSlice';
import { Box, Button, Typography, CircularProgress } from '@mui/material';
import { toast } from 'react-hot-toast';

export default function Home() {
  const user = useSelector((state) => state.Auth.user);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');

  const gotoAdmin = () => {
    navigate('/admin');
  };

  const goToUserDashboard = () =>{
    navigate('/user');
  }

  const handleLogout = async () => {
    setLoading(true);
    setError(''); // Reset error state
    try {
      const request = await post('/api/auth/logout');
      const response = request.data;

      if (request.status === 200) {
        dispatch(Logout());
        navigate('/login');
        toast.success(response.message); // Optional success message
      }
    } catch (error) {
      setError('Logout failed. Please try again.'); // Set error message
      console.error(error);
    } finally {
      setLoading(false); // Stop loading
    }
  };

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
        className='home-container'
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
        <Typography variant="h4" component="h2" sx={{ textAlign: 'center', mb: 2 }}>
          Welcome, {user && user.name}
        </Typography>
        {error && <Typography variant="body2" color="error" sx={{ mb: 2 }}>{error}</Typography>}
        <Button 
          variant="contained" 
          onClick={handleLogout} 
          fullWidth 
          disabled={loading} 
          sx={{ mb: 2 }}
        >
          {loading ? <CircularProgress size={24} /> : 'Logout'}
        </Button>
        {user && user.role === 'user' && (
          <Button 
            variant="contained" 
            onClick={goToUserDashboard} 
            fullWidth 
            disabled={loading} 
            sx={{ mb: 2 }}
          >
            {loading ? <CircularProgress size={24} /> : 'Go to User Page'}
          </Button>
        )}

        
        {user && user.role === 'admin' && (
          <Button 
            variant="contained" 
            onClick={gotoAdmin} 
            fullWidth 
            sx={{ mb: 2 }}
          >
            Go To Admin Panel
          </Button>
        )}
      </Box>
    </div>
  );
}
