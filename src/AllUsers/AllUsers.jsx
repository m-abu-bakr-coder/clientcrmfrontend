/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from 'react';
import { deleteUser, get, post } from '../services/ApiEndpoint';
import { toast } from 'react-hot-toast';
import {
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Button,
  Typography,
  Paper,
  Slide,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Box,
  TextField,
  CircularProgress
} from '@mui/material';
import UIText from '../utilities/testResource';
import axios from 'axios';

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const AllUsers = () => {
  const [users, setUsers] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [invitedUserName, setInvitedUserName] = useState('');
  const [invitedUserEmail, setInvitedUserEmail] = useState('');

  const handleClickOpen = (id) => {
    setSelectedUser(id); // Set the selected item when the delete button is clicked
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedUser(null); // Clear the selected item after closing the dialog
  };

  const GetUsers = async () => {
    setIsLoading(true);
    try {
      const request = await get('/api/admin/getuser');
      const response = request.data;
      console.log(response)

      if (request.status === 200) {
        setUsers(response.users);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    GetUsers();
  }, []);

  // Delete Client Record
  const handleConfirmUserDelete = async () => {
    if (selectedUser) {
      await handleDeleteUser(selectedUser._id); // Call the delete function with selected item ID
      handleClose(); // Close the dialog after deletion
    }
  };

  const handleDeleteUser = async (id) => {
    setLoading(true);
    try {
      const request = await deleteUser(`/api/admin/delete/${id}`);
      const response = request.data;
      if (request.status === 200) {
        toast.success(response.message);
        setUsers(users.filter((user) => user._id !== id)); // Remove the deleted user from the state
      }
    } catch (error) {
      if (error.response) {
        toast.error(error.response.data.message);
        GetUsers()
      }
    } finally {
      setLoading(false);
    }
  };

  const sendMail = async () => {
    setLoading(true);
    const accessToken = localStorage.getItem("access_token");
  
    // Step 1: Generate a random number and convert it to a string (password)
    const password = Math.floor(100000 + Math.random() * 90000000).toString();
  
    // Step 2: Check if the user already exists
    const userExists = users.some((user) => user.email === invitedUserEmail);
    if (userExists) {
      toast.error('User already exists'); // Show toast message
      setLoading(false);
      return; // Return early if user already exists
    }
  
    // Step 3: Create the email data with the random number in the body
    const emailData = {
      message: {
        subject: "Your Verification Code",
        body: {
          contentType: "Text",
          content: `Your verification code is: ${password}` // Send random number to recipient
        },
        toRecipients: [
          {
            emailAddress: {
              address: invitedUserEmail
            }
          }
        ]
      }
    };
  
    // Step 4: Send the email using Microsoft Graph API
    try {
      const response = await axios.post('https://graph.microsoft.com/v1.0/me/sendMail', emailData, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });
  
      // If email is sent successfully (status 202)
      if (response.status === 202) {
        // Step 5: Save the user to MongoDB via backend API
        try {
          await post('/api/auth/register', { name: invitedUserName, password, email: invitedUserEmail }, {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
          });
  
          // Clear the inputs and refresh the users list after saving
          setInvitedUserEmail('');
          setInvitedUserName('');
          GetUsers();
          toast.success('Mail sent successfully!');
        } catch (error) {
          console.error('Error saving user to backend:', error);
          toast.error('Error saving user');
        }
      } else {
        toast.error('Failed to send email');
      }
    } catch (error) {
      toast.error('Error sending email');
      console.error('Error sending email:', error.response ? error.response.data : error.message);
    } finally {
      setLoading(false);
    }
  };
  


  return (
    <>
      {isLoading && (
        <Box
          sx={{
            position: "absolute",
            top: "0",
            left: "0",
            width: '100%',
            height: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
          }}
        >
          <CircularProgress />
        </Box>
      )}

      <Typography variant="h4" gutterBottom>
        {UIText.all_users.manage_users}
      </Typography>
      <Box sx={{ display: 'flex', gap: 2, width: '50%', justifyContent: 'center', alignItems: 'center', marginBottom: '20px' }}>

        <TextField
          fullWidth
          label="User Name"
          value={invitedUserName}
          onChange={(e) => setInvitedUserName(e.target.value)}
          type='name'
          size="small"
          variant="outlined"
        />

        <TextField
          fullWidth
          label="User Email"
          value={invitedUserEmail}
          onChange={(e) => setInvitedUserEmail(e.target.value)}
          type='email'
          size="small"
          variant="outlined"
        />

        <Button
          variant="contained"
          color="primary"
          sx={{
            fontSize: '17px',
            textTransform: 'capitalize',
            px: 3,
            backgroundColor: '#1976d2',
            '&:hover': {
              backgroundColor: '#D83570',
            },
          }}
          onClick={sendMail}
          disabled={loading}
        >
          {loading ? 'inviting...' : 'invite'}
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ backgroundColor: '#1976d2' }}>
            <TableRow>
              <TableCell style={{ color: 'white', fontSize: '20px' }}>{UIText.all_users.table_header.name}</TableCell>
              <TableCell style={{ color: 'white', fontSize: '20px' }}>{UIText.all_users.table_header.email}</TableCell>
              <TableCell style={{ color: 'white', fontSize: '20px' }}>{UIText.all_users.table_header.createdat}</TableCell>
              <TableCell style={{ color: 'white', fontSize: '20px' }}>{UIText.all_users.table_header.action}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users &&
              users.map((user, index) => (
                <TableRow key={index}>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{new Date(user.createdAt).toLocaleString()}</TableCell>
                  <TableCell>
                    <Button
                      variant="contained"
                      color="primary"
                      sx={{
                        textTransform: 'capitalize',
                        '&:hover': {
                          backgroundColor: '#EC3F83',
                        },
                      }}
                      onClick={() => { handleClickOpen(user) }}
                    >
                      {UIText.all_users.table_header.action}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Dialog Box */}
      <Dialog
        open={open}
        TransitionComponent={Transition}
        keepMounted
        onClose={handleClose}
        sx={{ '& .MuiDialog-paper': { width: '400px' } }}
        aria-describedby="alert-dialog-slide-description"
      >
        <DialogTitle sx={{ fontWeight: "600", textAlign: "center" }}>
          {UIText.all_users.confirmation_dialog.title}
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ textAlign: "center" }} id="alert-dialog-slide-description">
            {UIText.all_users.confirmation_dialog.description}
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ display: "flex", justifyContent: "center", alignItems: "center", marginBottom: "16px" }}>
          <Button variant="outlined" sx={{ textTransform: "capitalize" }} onClick={handleClose}>
            {UIText.all_users.confirmation_dialog.cancel}
          </Button>
          <Button variant="contained" sx={{ textTransform: "capitalize" }} onClick={handleConfirmUserDelete} disabled={loading}>
            {loading ? UIText.all_users.confirmation_dialog.deleting : UIText.all_users.confirmation_dialog.delete}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default AllUsers;