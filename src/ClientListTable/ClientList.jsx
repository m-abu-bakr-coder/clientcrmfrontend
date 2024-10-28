/* eslint-disable react/prop-types */
import React, { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import { MdDelete } from 'react-icons/md';
import { deleteUser } from '../services/ApiEndpoint';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Button,
  TablePagination,
  Box,
  Paper,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Slide,
  Typography,
  CircularProgress
} from '@mui/material';
import toast from 'react-hot-toast';
import UIText from '../utilities/testResource';
import { useSelector } from 'react-redux';
import { useNavbarContext } from '../NavbarContext/NavbarContext';

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const ClientList = () => {
  const user = useSelector((state) => state.Auth.user);
  const { search, data, setData, clientListLoading } = useNavbarContext();
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [open, setOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null); // State to hold the selected item

  const handleClickOpen = (item) => {
    setSelectedItem(item); // Set the selected item when the delete button is clicked
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedItem(null); // Clear the selected item after closing the dialog
  };

  const handleChangePage = (event, newPage) => {
    setCurrentPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setCurrentPage(0);
  };

  // Reset page to 1 when search term changes
  useEffect(() => {
    setCurrentPage(0);
  }, [search]);

  // Delete Client Record
  const confirmDelete = async () => {
    if (selectedItem) {
      await handleDelete(selectedItem._id); // Call the delete function with selected item ID
      handleClose(); // Close the dialog after deletion
    }
  };

  const handleDelete = async (id) => {
    if (user.role === 'admin') {

      setLoading(true);
      try {
        await deleteUser(`/api/clients/${id}`);
        setData((prevData) => prevData.filter((item) => item._id !== id));
        toast.success('Client record deleted');
      } catch (error) {
        console.error('Error deleting client:', error);
        toast.error('Failed to delete client record');
      } finally {
        setLoading(false);
      }
    }
  }

  // Filter client data based on search term
  const filteredData = data
    .filter(
      (item) =>
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.email.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => dayjs(b.date).diff(dayjs(a.date))); // Sort by date descending

  // Pagination logic
  const paginatedData = filteredData.slice(
    currentPage * rowsPerPage,
    currentPage * rowsPerPage + rowsPerPage
  );

  return (
    <>
      {clientListLoading && (
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

      {user && user.role === 'admin' &&
        <Typography variant="h4" gutterBottom>
          Manage Clients
        </Typography>
      }

      {user && user.role === 'user' &&
        <Typography variant="h4" gutterBottom>
          Client List
        </Typography>
      }

      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ backgroundColor: '#1976d2' }}>
            <TableRow>
              <TableCell>
                <TableSortLabel>
                  <strong style={{ color: 'white', fontSize: '20px' }}>{UIText.table_data.table_header.name}</strong>
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel>
                  <strong style={{ color: 'white', fontSize: '20px' }}>{UIText.table_data.table_header.email}</strong>
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel>
                  <strong style={{ color: 'white', fontSize: '20px' }}>{UIText.table_data.table_header.date}</strong>
                </TableSortLabel>
              </TableCell>
              {user && user.role === 'admin' && (
                <TableCell>
                  <strong style={{ color: 'white', fontSize: '20px' }}>{UIText.table_data.table_header.delete}</strong>
                </TableCell>
              )}
            </TableRow>
          </TableHead>

          <TableBody>
            {paginatedData.map((item) => (
              <TableRow
                key={item._id}
                sx={{
                  '&:hover': {
                    backgroundColor: 'rgba(0, 0, 0, 0.05)',
                    cursor: 'pointer',
                  },
                }}
              >
                <TableCell>{item.name}</TableCell>
                <TableCell>{item.email}</TableCell>
                <TableCell>{dayjs(item.date).format('MMM DD, YYYY')}</TableCell>
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
                      startIcon={<MdDelete />}
                      onClick={() => handleClickOpen(item)} // Open dialog and pass the item to be deleted
                    >
                      {UIText.table_data.confirmation_dialog.delete}
                    </Button>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {filteredData.length > 0 && (
        <Box display="flex" justifyContent="center" sx={{ padding: '20px 0' }}>
          <TablePagination
            component="div"
            count={filteredData.length}
            page={currentPage}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[5, 10, 25, 50, 100]}
          />
        </Box>
      )}

      {/* Display message when no results are found */}
      {!clientListLoading && filteredData.length === 0 && (
        <Box display="flex" justifyContent="center" sx={{ paddingTop: '6%', fontWeight: "bold", fontFamily: "sans-serif" }}>
          <p>{UIText.table_data.not_found}</p>
        </Box>
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
        <DialogTitle sx={{ fontWeight: "600", textAlign: "center" }}>{UIText.table_data.confirmation_dialog.title}</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ textAlign: "center" }} id="alert-dialog-slide-description">{UIText.table_data.confirmation_dialog.description}</DialogContentText>
        </DialogContent>
        <DialogActions sx={{ display: "flex", justifyContent: "center", alignItems: "center", marginBottom: "16px" }}>
          <Button variant="outlined" sx={{ textTransform: "capitalize" }} onClick={handleClose}>{UIText.table_data.confirmation_dialog.cancel}</Button>
          <Button variant="contained" sx={{ textTransform: "capitalize" }} onClick={confirmDelete} disabled={loading}>
            {loading ? UIText.table_data.confirmation_dialog.deleting : UIText.table_data.confirmation_dialog.delete}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ClientList;
