/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState, useCallback } from 'react';
import {
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Button,
  Slide,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Box
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { deleteUser, get, post } from '../services/ApiEndpoint';
import { useSelector } from 'react-redux';
import UIText from '../utilities/testResource';
import axios from 'axios';
import { useNavbarContext } from '../NavbarContext/NavbarContext';

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const Emails = () => {
  const user = useSelector((state) => state.Auth.user);
  const { search } = useNavbarContext();
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [openedEmails, setOpenedEmails] = useState(() => {
    // Retrieve the opened emails from localStorage on initial load
    const savedEmails = localStorage.getItem('openedEmails');
    return savedEmails ? JSON.parse(savedEmails) : [];
  });
  const [open, setOpen] = useState(false);
  const [selectedMail, setSelectedMail] = useState(null); // State to hold the selected item

  const handleClickOpen = (id) => {
    setSelectedMail(id); // Set the selected item when the delete button is clicked
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedMail(null); // Clear the selected item after closing the dialog
  };

  // Fetch saved emails from the backend
  const fetchSavedEmails = async () => {
    try {
      const response = await get('/api/emails/getEmails');
      const sortedEmails = response.data.sort(
        (a, b) => new Date(b.receivedDateTime) - new Date(a.receivedDateTime)
      );
      setEmails(sortedEmails);
    } catch (error) {
      console.error('Error fetching saved emails:', error);
      setError('Failed to fetch emails');
    } finally {
      setLoading(false);
    }
  };

  // Fetch emails from Microsoft Graph API
  const fetchEmails = async (accessToken) => {
    const graphAPIEndpoint = 'https://graph.microsoft.com/v1.0/me/messages';
    try {
      const response = await axios.get(graphAPIEndpoint, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      const emailData = response.data.value.map(email => ({
        subject: email.subject || 'No Subject',
        from: email.from?.emailAddress?.address || 'Unknown',
        bodyPreview: email.bodyPreview,
        receivedDateTime: email.receivedDateTime,
        isRead: email.isRead,
        toRecipients: email.toRecipients ? email.toRecipients.map(recipient => recipient.emailAddress.address) : [],
        attachments: email.attachments ? email.attachments.map(attachment => attachment.name) : [],
      }));

      await saveEmailsToBackend(emailData);
    } catch (error) {
      console.error('Error fetching emails:', error);
      setError('Failed to fetch emails. Please try again later.');
    }
  };

  // Save fetched emails to the backend
  const saveEmailsToBackend = async (emails) => {
    try {
      await post('/api/emails/saveEmails', { emails });
    } catch (error) {
      console.error('Error saving emails to backend:', error);
      setError('Failed to save emails. Please try again later.');
    }
  };

  // Get a valid access token
  const getValidAccessToken = useCallback(async () => {
    const token = localStorage.getItem("access_token");
    const refresh = localStorage.getItem("refresh_token");

    if (isAccessTokenExpired()) {
      if (!refresh) {
        console.error("No refresh token available, login required");
        initiateLogin();
        return null;
      }
      try {
        const response = await post("/api/login/auth/refresh", {
          refresh_token: refresh,
        });
        storeTokens(response.data);
        return response.data.access_token;
      } catch (error) {
        console.error("Error refreshing token:", error);
        initiateLogin();
        return null;
      }
    } else {
      return token;
    }
  }, []);

  // Check if access token is expired
  const isAccessTokenExpired = () => {
    const expiration = localStorage.getItem("access_token_expiration");
    return !expiration || new Date() > new Date(expiration);
  };

  // Store tokens in localStorage
  const storeTokens = (responseData) => {
    localStorage.setItem("access_token", responseData.access_token);
    localStorage.setItem("refresh_token", responseData.refresh_token);
    localStorage.setItem("access_token_expiration", responseData.access_token_expiration);
  };

  // Initiate login flow
  const initiateLogin = () => {
    if(user.role === "user")  return;
    const authUrl = `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?client_id=9d3eccab-85a6-4c1d-b499-b30bac866ae1&response_type=code&redirect_uri=http://localhost:5173/auth.html&scope=user.read+mail.send+Mail.ReadBasic+Mail.Read+Mail.ReadWrite+offline_access&response_mode=fragment&state=12345&nonce=678910`;
    window.location.href = authUrl;
  };

  // Auto-fetch emails using the valid access token
  const autoFetchEmails = useCallback(async () => {
    const validAccessToken = await getValidAccessToken();
    if (validAccessToken) {
      await fetchEmails(validAccessToken);
    } else {
      console.error("Unable to get a valid access token.");
    }
  }, [getValidAccessToken]);

  // Fetch data and set interval for refreshing emails
  useEffect(() => {
    const fetchData = async () => {
      await autoFetchEmails(); // Fetch emails initially
      fetchSavedEmails(); // Fetch saved emails immediately after
    };

    fetchData(); // Call the initial fetch

    const intervalId = setInterval(() => {
      autoFetchEmails(); // Fetch emails every minute
      fetchSavedEmails(); // Fetch saved emails every minute
    }, 60000);

    // Cleanup function to clear the interval when the component unmounts
    return () => clearInterval(intervalId);
  }, [autoFetchEmails]);

  // Handle email click and mark it as opened
  const handleEmailClick = (emailId) => {
    setSelectedEmail(selectedEmail === emailId ? null : emailId);

    if (!openedEmails.includes(emailId)) {
      const updatedOpenedEmails = [...openedEmails, emailId];
      setOpenedEmails(updatedOpenedEmails);
      localStorage.setItem('openedEmails', JSON.stringify(updatedOpenedEmails));
    }
  };

  // Delete Client Record
  const handleConfirmMailDelete = async () => {
    if (selectedMail) {
      await handleDeleteEmail(selectedMail._id); // Call the delete function with selected item ID
      handleClose(); // Close the dialog after deletion
    }
  };

  // Handle email deletion
  const handleDeleteEmail = async (emailId) => {
    setDeleteLoading(true);
    try {
      await deleteUser(`/api/emails/deleteEmail/${emailId}`);
      setEmails((prevEmails) => prevEmails.filter(email => email._id !== emailId));
      const updatedOpenedEmails = openedEmails.filter(id => id !== emailId);
      setOpenedEmails(updatedOpenedEmails);
      localStorage.setItem('openedEmails', JSON.stringify(updatedOpenedEmails));
    } catch (error) {
      console.error('Error deleting email:', error);
      setError('Failed to delete email');
    } finally {
      setDeleteLoading(false);
    }
  };


  const filteredEmails = emails.filter(email => {
    const searchLower = search.toLowerCase();
    return (
      email.subject.toLowerCase().includes(searchLower) ||
      email.from.toLowerCase().includes(searchLower) ||
      email.toRecipients.some(recipient => recipient.toLowerCase().includes(searchLower))
    );
  });


  return (
    <div>
      <Typography variant="h4" gutterBottom>
        All Emails
      </Typography>

      {loading && (
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

      {error && (
        <Typography color="error">
          {error}
        </Typography>
      )}

      {!loading && !error && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead sx={{ backgroundColor: '#1976d2' }}>
              <TableRow>
                <TableCell style={{ color: 'white', fontSize: '20px' }}><strong>{UIText.mail_Data.table_header.from}</strong></TableCell>
                <TableCell style={{ color: 'white', fontSize: '20px' }}><strong>{UIText.mail_Data.table_header.to}</strong></TableCell>
                <TableCell style={{ color: 'white', fontSize: '20px' }}><strong>{UIText.mail_Data.table_header.date}</strong></TableCell>
                {user && user.role === 'admin' && (
                  <TableCell style={{ color: 'white', fontSize: '20px' }}><strong>{UIText.mail_Data.table_header.action}</strong></TableCell>
                )}
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredEmails.map((email) => (
                <React.Fragment key={email._id}>
                  <TableRow
                    onClick={() => handleEmailClick(email._id)}
                    style={{
                      cursor: 'pointer',
                      backgroundColor: openedEmails.includes(email._id) ? '#ffffff' : '#e0f7fa',
                      transition: 'background-color 0.3s ease, box-shadow 0.3s ease',
                      boxShadow: openedEmails.includes(email._id) ? 'none' : '0px 4px 8px rgba(0, 0, 0, 0.1)',
                      fontWeight: openedEmails.includes(email._id) ? 'normal' : 'bold',
                    }}
                  >
                    <TableCell>{email.from}</TableCell>
                    <TableCell>
                      {email.toRecipients.length > 0
                        ? email.toRecipients.join(', ')
                        : 'N/A'}
                    </TableCell>
                    <TableCell>{new Date(email.receivedDateTime).toLocaleString()}</TableCell>
                    {user && user.role === 'admin' && (
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
                          onClick={() => { handleClickOpen(email) }} // Open dialog and pass the item to be deleted
                        >
                          {UIText.mail_Data.table_header.action}
                        </Button>
                      </TableCell>
                    )}
                  </TableRow>
                  {selectedEmail === email._id && (
                    <TableRow>
                      <TableCell colSpan={user && user.role === 'admin' ? 4 : 3}>
                        <Accordion>
                          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Typography variant="h6">Details</Typography>
                          </AccordionSummary>
                          <AccordionDetails>
                            <Typography variant="body1">
                              <strong>From:</strong> {email.from}<br />
                              <strong>To:</strong> {email.toRecipients}<br />
                              <strong>Subject:</strong> {email.subject}<br />
                              <strong>Preview:</strong> {email.bodyPreview}<br />
                              <strong>Attachments:</strong> {email.attachments.length > 0
                                ? email.attachments.join(', ')
                                : 'No attachments'}
                            </Typography>
                          </AccordionDetails>
                        </Accordion>
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Dialog Box */}
      <Dialog
        open={open}
        TransitionComponent={Transition}
        keepMounted
        onClose={handleClose}
        sx={{ '& .MuiDialog-paper': { width: '400px' } }}
        aria-describedby="alert-dialog-slide-description"
      >
        <DialogTitle sx={{ fontWeight: "600", textAlign: "center" }}>{UIText.mail_Data.confirmation_dialog.title}</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ textAlign: "center" }} id="alert-dialog-slide-description">{UIText.mail_Data.confirmation_dialog.description}</DialogContentText>
        </DialogContent>
        <DialogActions sx={{ display: "flex", justifyContent: "center", alignItems: "center", marginBottom: "16px" }}>
          <Button variant="outlined" sx={{ textTransform: "capitalize" }} onClick={handleClose}>{UIText.mail_Data.confirmation_dialog.cancel}</Button>
          <Button variant="contained" sx={{ textTransform: "capitalize" }} onClick={handleConfirmMailDelete} disabled={deleteLoading}>
            {deleteLoading ? UIText.mail_Data.confirmation_dialog.deleting : UIText.mail_Data.confirmation_dialog.delete}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default Emails;
