/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react/prop-types */
import { useState } from 'react';
import { styled, alpha } from '@mui/material/styles';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import InputBase from '@mui/material/InputBase';
import MenuIcon from '@mui/icons-material/Menu';
import SearchIcon from '@mui/icons-material/Search';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Logo from '../assets/white-logo.png'; // Ensure the path is correct
import { useEffect } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import toast from 'react-hot-toast';
import Divider from '@mui/material/Divider';
import { get, post, put } from '../services/ApiEndpoint';
import { InputAdornment, TextField } from '@mui/material';
import DialogContentText from '@mui/material/DialogContentText';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Logout } from '../redux/AuthSlice';
import UIText from '../utilities/testResource';
import Papa from 'papaparse';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { useNavbarContext } from '../NavbarContext/NavbarContext';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});

// Styled Components for Search
const Search = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
  },
  marginLeft: 0,
  width: '100%',
  [theme.breakpoints.up('sm')]: {
    marginLeft: theme.spacing(1),
    width: 'auto',
  },
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: 'inherit',
  width: '100%',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create('width'),
    [theme.breakpoints.up('sm')]: {
      width: '17ch',
      '&:focus': {
        width: '30ch',
      },
    },
  },
}));

export default function Navbar() {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const user = useSelector((state) => state.Auth.user);
  const {
    setSearch,
    data, setData,
    newRecord, setNewRecord,
    anchorEl, setAnchorEl,
    createClientPopup, setCreateClientPopup,
    uploadCSVFilePopup, setUploadCSVFilePopup,
    profilePopup, setProfilePopup,
    adminSettingPopup, setAdminSettingPopup,
    csvFileFiltedData, setCsvFileFiltedData,
    csvFileName, setCsvFileName,
    updateAdminSetting, setUpdateAdminSetting,
    loading, setLoading,
    setClientListLoading
  } = useNavbarContext();

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const open = Boolean(anchorEl);

  const handleOpenProfilePopup = () => {
    handleClose();
    setProfilePopup(true);
  };

  // Function to close the dialog
  const handleCloseProfilePopup = () => {
    setProfilePopup(false);
  };

  const handleAdminSettingOpenPopup = () => {
    handleClose();
    setAdminSettingPopup(true);
  };

  // Function to close the dialog
  const handleCloseAdminSettingPopup = () => {
    setAdminSettingPopup(false);
  };


  const handleChange = (e) => {
    const { name, value } = e.target;
    setUpdateAdminSetting({
      ...updateAdminSetting,
      [name]: value
    });
  };


  const handleUpdateAdminSetting = async (e) => {
    setLoading(true);

    if (user.role === 'admin') {
      e.preventDefault()

      const adminDetails = {
        name: updateAdminSetting.newName,
        email: updateAdminSetting.newEmail,
        password: updateAdminSetting.currentPassword,
        newPassword: updateAdminSetting.newPassword
      };

      try {
        const response = await put(`/api/admin/update/${user._id}`, adminDetails)
        toast.success(response.data.message);
        handleCloseAdminSettingPopup();
      } catch (error) {
        if (error.response) {
          toast.error(error.response.data.message)
        } else {
          toast.error('Something went wrong!')
        }
      } finally {
        setLoading(false);
      }
    }
  }

  // Menu Handlers
  const handleClick = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);
  const handleCreateClient = () => {
    handleClose();
    setCreateClientPopup(true);
  };
  const handleCloseCreateClientPopup = () => setCreateClientPopup(false);

  const handleUploadCSVFile = (e) => {
    setUploadCSVFilePopup(true);
    handleClose();
    try {
      setLoading(true);
      const file = e.target.files?.[0];
      if (file) {
        setCsvFileName(file.name)
        Papa.parse(file, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            const filteredData = results.data.map((row) => ({
              name: row['Client Name'],
              email: row['Email'],
            }));

            // Check for invalid data (optional)
            const isValid = filteredData.every((item) => item.name && item.email);
            if (!isValid) {
              console.error('Invalid data:', filteredData);
              return; // Do not proceed if invalid
            }

            // Update the state with filteredData
            setCsvFileFiltedData(filteredData);
          },
        });
      }
    } catch (error) {
      toast.error('Error during CSV file upload:');
      console.error('Error during CSV file upload:', error);
    } finally {
      setLoading(false);
    }
  }

  const sendCSVFileDataToBackend = async () => {
    // Check existing emails in the data state
    const existingEmails = new Set(data.map(client => client.email));
    let hasErrors = false;

    setLoading(true);
    try {
      for (const client of csvFileFiltedData) {
        if (existingEmails.has(client.email)) {
          toast.error(`Already exists: ${client.email}.`);
          continue;
        }

        try {
          const response = await post('/api/clients', client);
          console.log('Data sent successfully:', response.data);

          setData((prevData) => [...prevData, response.data]);
        } catch (error) {
          console.error('Error sending data:', error);
          hasErrors = true;
        }
      }
    } catch (error) {
      console.error('Error during processing:', error);
      hasErrors = true;
    } finally {
      setLoading(false);
      if (!hasErrors) {
        handleCloseUploadCSVPopup();
        setCsvFileName('');
        toast.success("File uploaded successfully");
      }
    }
  };


  const handleCloseUploadCSVPopup = () => {
    setCsvFileName('');
    return setUploadCSVFilePopup(false);
  };

  // Input Change Handler
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewRecord((prev) => ({ ...prev, [name]: value }));
  };

  // Add New Client Record
  const handleAddRecord = async () => {
    if (!newRecord.name || !newRecord.email) {
      toast.error('Please enter both name and email');
      return;
    }

    // Check if the email already exists in the client data
    const emailExists = data.some(client => client.email === newRecord.email);
    if (emailExists) {
      toast.error('Client with this email already exists');
      return; // Exit the function if the email exists
    }

    setLoading(true);
    try {
      const response = await post('/api/clients', newRecord);
      setData((prevData) => [...prevData, response.data]);
      setNewRecord({ name: '', email: '' });
      toast.success('Client record added');
      setCreateClientPopup(false); // Close popup after success
    } catch (error) {
      console.error('Error adding client:', error);
      toast.error('Failed to add client record');
    } finally {
      setLoading(false);
      handleCloseCreateClientPopup();
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await get('/api/clients'); // Assuming this is the correct API route
        if (response.status === 200) {
          const result = await response.data; // No need for `json()` since Axios parses it automatically
          setData(result); // Update state with the fetched data
        } else {
          throw new Error('Failed to fetch client data');
        }
      } catch (error) {
        console.error('Error fetching clients:', error);
        setData([]); // Fallback to empty array in case of error
        toast.error('Failed to load client data');
      } finally {
        setClientListLoading(false);
      }
    };
    fetchData(); // Fetch clients on component load
  }, []);

  const handleLogout = async () => {
    setLoading(true);
    try {
      const request = await post('/api/auth/logout');
      const response = request.data;

      if (request.status === 200) {
        dispatch(Logout());
        navigate('/');
        toast.success(response.message); // Optional success message
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false); // Stop loading
    }
  };

  const handleClickShowCurrentPassword = () => setShowCurrentPassword(!showCurrentPassword);
  const handleClickShowNewPassword = () => setShowNewPassword(!showNewPassword);

  return (
    <>
      <Box sx={{ flexGrow: 1 }}>
        <AppBar position="static">
          <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex' }}>
              <img src={Logo} alt="Logo" style={{ width: '140px', minWidth: '50px', height: 'auto', marginRight: '20px' }} />
              <Search>
                <SearchIconWrapper>
                  <SearchIcon />
                </SearchIconWrapper>
                <StyledInputBase
                  placeholder="Search…"
                  inputProps={{ 'aria-label': 'search' }}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </Search>
            </Box>

            <div>
              <IconButton
                aria-controls={open ? 'menu-appbar' : undefined}
                aria-haspopup="true"
                onClick={handleClick}
                color="inherit"
              >
                <MenuIcon />
              </IconButton>

              <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
                transformOrigin={{ vertical: 'top', horizontal: 'left' }}
              >
                <MenuItem onClick={handleOpenProfilePopup}>{UIText.navabr.menu_dropdown.profile}</MenuItem>
                {user && user.role === 'admin' && [
                  <MenuItem key="create_client" onClick={handleCreateClient}>
                    {UIText.navabr.menu_dropdown.create_client}
                  </MenuItem>,
                  <MenuItem key="add_csv_file_1" onClick={handleUploadCSVFile}>
                    {UIText.navabr.menu_dropdown.add_csv_file}
                  </MenuItem>,
                  <MenuItem key="admin_setting" onClick={handleAdminSettingOpenPopup}>
                    {UIText.navabr.menu_dropdown.admin_setting}
                  </MenuItem>
                ]}
                <Divider />
                <MenuItem onClick={handleLogout}>{UIText.navabr.menu_dropdown.logout}</MenuItem>
              </Menu>
            </div>
          </Toolbar>
        </AppBar>

        {/* Profile Popup */}
        <Dialog open={profilePopup} onClose={handleCloseProfilePopup} fullWidth maxWidth="xs">
          <DialogTitle>{UIText.profile.profile_text}</DialogTitle>
          <DialogContent>
            <DialogContentText>{user.role === "admin" ? "Admin" : "User"}</DialogContentText>
            <DialogContentText>{user.name}</DialogContentText>
            <DialogContentText>{user.email}</DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseProfilePopup} color="primary" sx={{ textTransform: "capitalize" }}>
              {UIText.profile.close}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Client Creation Popup */}
        {user && user.role === 'admin' && (
          <Dialog
            open={createClientPopup}
            onClose={handleCloseCreateClientPopup}
            fullWidth
            maxWidth="xs"
          >
            <DialogContent>
              <DialogTitle sx={{ fontWeight: '600', fontSize: "22px", paddingLeft: "0", marginTop: "-22px" }}>{UIText.create_client.add_Client}</DialogTitle>
              <DialogContentText sx={{ marginTop: "-12px", marginBottom: "4px" }} id="alert-dialog-slide-description">{UIText.create_client.description}</DialogContentText>
              <TextField
                fullWidth
                size='medium'
                margin="dense"
                label="Client Name"
                name="name"
                required
                value={newRecord.name}
                onChange={handleInputChange}
              />
              <TextField
                fullWidth
                size='medium'
                margin="dense"
                label="Client Email"
                name="email"
                type="email"
                required
                value={newRecord.email}
                onChange={handleInputChange}
              />
            </DialogContent>
            <DialogActions sx={{ marginRight: "16px", paddingBottom: "25px" }}>
              <Button variant='outlined' sx={{ textTransform: "capitalize" }} onClick={handleCloseCreateClientPopup}>Cancel</Button>
              <Button sx={{ textTransform: "capitalize" }} onClick={handleAddRecord} variant="contained" color="primary" disabled={loading}>
                {loading ? UIText.create_client.adding : UIText.create_client.add_Client}
              </Button>
            </DialogActions>
          </Dialog>
        )}

        {/* upload csv file popup */}
        {user && user.role === 'admin' && (
          <Dialog open={uploadCSVFilePopup} onClose={handleCloseUploadCSVPopup} fullWidth maxWidth="xs">
            <DialogContent>
              <DialogTitle sx={{ fontWeight: '600', fontSize: "22px", paddingLeft: "0", marginTop: "-22px" }}>{UIText.navabr.csv_file_Dialog.title}</DialogTitle>
              <DialogContentText sx={{ marginTop: "-12px", marginBottom: "4px" }} id="alert-dialog-slide-description">{UIText.navabr.csv_file_Dialog.description}</DialogContentText>
              <Button
                type="file"
                accept='.csv'
                onChange={handleUploadCSVFile}
                component="label"
                role={undefined}
                variant="contained"
                tabIndex={-1}
                sx={{ marginTop: "16px", textTransform: "capitalize" }}
                startIcon={<CloudUploadIcon />}
              >
                {UIText.navabr.csv_file_Dialog.upload_file}
                <VisuallyHiddenInput
                  type="file"
                  onChange={(event) => console.log(event.target.files)}
                  multiple
                />
              </Button>
              <Box sx={{ overflow: 'hidden' }}>
                {csvFileName}
              </Box>
            </DialogContent>
            <DialogActions sx={{ marginRight: "16px", paddingBottom: "25px" }}>
              <Button variant='outlined' sx={{ textTransform: "capitalize" }} onClick={handleCloseUploadCSVPopup}>{UIText.navabr.csv_file_Dialog.cancel}</Button>
              <Button sx={{ textTransform: "capitalize" }} onClick={sendCSVFileDataToBackend} variant="contained" color="primary" disabled={loading}>
                {loading ? UIText.navabr.csv_file_Dialog.uploading : UIText.navabr.csv_file_Dialog.upload_file}
              </Button>
            </DialogActions>
          </Dialog>
        )}

        {/* admin setting popup */}
        {user && user.role === 'admin' && (
          <Dialog open={adminSettingPopup} onClose={handleCloseAdminSettingPopup} fullWidth maxWidth="xs">
            <DialogContent>
              <DialogTitle sx={{ fontWeight: '600', fontSize: "22px", paddingLeft: "0", marginTop: "-22px" }}>Setting</DialogTitle>
              <DialogContentText sx={{ marginTop: "-12px", marginBottom: "4px" }} id="alert-dialog-slide-description">
                {UIText.update_admin_credentials.update_admin_password}
              </DialogContentText>

              <Box sx={{ overflow: 'hidden' }}>
                <TextField
                  fullWidth
                  size='medium'
                  margin="dense"
                  label="Current Password"
                  name="currentPassword"
                  type={showCurrentPassword ? "text" : "password"} // Dynamic type based on state
                  required
                  value={updateAdminSetting.currentPassword}
                  onChange={handleChange}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={handleClickShowCurrentPassword}>
                          {showCurrentPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
                <TextField
                  fullWidth
                  size='medium'
                  margin="dense"
                  label="Admin Name"
                  name="newName"
                  required
                  value={updateAdminSetting.newName}
                  onChange={handleChange}
                />
                <TextField
                  fullWidth
                  size='medium'
                  margin="dense"
                  label="Admin Email"
                  name="newEmail"
                  required
                  value={updateAdminSetting.newEmail}
                  onChange={handleChange}
                />
                <TextField
                  fullWidth
                  size='medium'
                  margin="dense"
                  label="New Password"
                  name="newPassword"
                  type={showNewPassword ? "text" : "password"} // Dynamic type based on state
                  required
                  value={updateAdminSetting.newPassword}
                  onChange={handleChange}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={handleClickShowNewPassword}>
                          {showNewPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Box>
            </DialogContent>

            <DialogActions sx={{ marginRight: "16px", paddingBottom: "25px" }}>
              <Button variant='outlined' sx={{ textTransform: "capitalize" }} onClick={handleCloseAdminSettingPopup}>
                {UIText.update_admin_credentials.cancel}
              </Button>
              <Button
                onClick={handleUpdateAdminSetting}
                sx={{ textTransform: "capitalize" }}
                variant="contained"
                color="primary"
                disabled={loading}
              >
                {loading ? UIText.update_admin_credentials.updating : UIText.update_admin_credentials.update}
              </Button>
            </DialogActions>
          </Dialog>
        )}
      </Box>
    </>
  );
}
