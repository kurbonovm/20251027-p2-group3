import React, { useState } from 'react';
import {
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  Box,
  TextField,
  InputAdornment,
  Grid,
  SelectChangeEvent,
  Avatar,
  Card,
  CardContent,
  IconButton,
  Divider,
} from '@mui/material';
import { 
  Search, 
  FilterList, 
  Login, 
  Logout, 
  CheckCircle, 
  Cancel, 
  MoreVert, 
  Edit, 
  ArrowForward,
  Hotel,
  CalendarToday,
  AttachMoney,
} from '@mui/icons-material';
import {
  useGetAllReservationsAdminQuery,
  useGetReservationStatisticsQuery,
  useUpdateReservationStatusMutation,
  useUpdateReservationDatesMutation,
} from '../../features/admin/adminApi';
import AdminLayout from '../../layouts/AdminLayout';
import Loading from '../../components/Loading';
import { Reservation, ReservationStatus } from '../../types';

/**
 * Helper function to parse date string without timezone conversion
 */
const parseDate = (dateStr: string): Date => {
  if (!dateStr) return new Date();
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
};

const AdminReservations: React.FC = () => {
  const { data: reservations, isLoading: reservationsLoading } = useGetAllReservationsAdminQuery();
  const { data: stats, isLoading: statsLoading } = useGetReservationStatisticsQuery();
  const [updateStatus] = useUpdateReservationStatusMutation();
  const [updateDates] = useUpdateReservationDatesMutation();

  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [statusDialogOpen, setStatusDialogOpen] = useState<boolean>(false);
  const [editDialogOpen, setEditDialogOpen] = useState<boolean>(false);
  const [newStatus, setNewStatus] = useState<ReservationStatus>('PENDING');
  const [editCheckInDate, setEditCheckInDate] = useState<string>('');
  const [editCheckOutDate, setEditCheckOutDate] = useState<string>('');
  const [editNumberOfGuests, setEditNumberOfGuests] = useState<number>(1);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  if (reservationsLoading || statsLoading) return <Loading message="Loading reservations..." />;

  const filteredReservations = reservations
    ?.filter((reservation: Reservation) => {
      const matchesSearch = searchTerm === '' ||
        reservation.user?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reservation.user?.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reservation.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reservation.room?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reservation.id?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === 'ALL' || reservation.status === statusFilter;

      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      // Sort by createdAt in descending order (most recent first)
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return dateB - dateA;
    });

  const handleStatusChange = async () => {
    if (selectedReservation && newStatus) {
      try {
        await updateStatus({ id: selectedReservation.id, status: newStatus }).unwrap();
        setStatusDialogOpen(false);
        setSelectedReservation(null);
      } catch (err) {
        console.error('Failed to update status:', err);
      }
    }
  };

  const handleEditDates = async () => {
    if (selectedReservation && editCheckInDate && editCheckOutDate && editNumberOfGuests) {
      try {
        await updateDates({
          id: selectedReservation.id,
          checkInDate: editCheckInDate,
          checkOutDate: editCheckOutDate,
          numberOfGuests: editNumberOfGuests,
        }).unwrap();
        setEditDialogOpen(false);
        setSelectedReservation(null);
      } catch (err) {
        console.error('Failed to update reservation dates:', err);
      }
    }
  };

  const openEditDialog = (reservation: Reservation) => {
    setSelectedReservation(reservation);
    setEditCheckInDate(reservation.checkInDate);
    setEditCheckOutDate(reservation.checkOutDate);
    setEditNumberOfGuests(reservation.numberOfGuests);
    setEditDialogOpen(true);
  };

  const handleQuickStatusChange = async (reservation: Reservation, status: ReservationStatus) => {
    try {
      await updateStatus({ id: reservation.id, status }).unwrap();
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const getStatusColor = (status: string | undefined): 'success' | 'warning' | 'error' | 'info' | 'default' => {
    switch (status) {
      case 'CONFIRMED':
        return 'success';
      case 'PENDING':
        return 'warning';
      case 'CANCELLED':
        return 'error';
      case 'CHECKED_IN':
        return 'info';
      case 'CHECKED_OUT':
        return 'default';
      default:
        return 'default';
    }
  };

  return (
    <AdminLayout>
      <Typography variant="h4" gutterBottom>
        Reservation Management
      </Typography>

      {stats && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Box>
              <Typography variant="h6">Total Reservations</Typography>
              <Typography variant="h4">{stats.totalReservations}</Typography>
            </Box>
            <Box>
              <Typography variant="h6">Total Revenue</Typography>
              <Typography variant="h4" color="success.main">
                ${stats.totalRevenue?.toFixed(2)}
              </Typography>
            </Box>
          </Box>
        </Paper>
      )}

      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: { xs: 'wrap', md: 'nowrap' } }}>
          <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 auto' }, minWidth: 0 }}>
            <TextField
              fullWidth
              placeholder="Search by name or email"
              value={searchTerm}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiInputBase-root': {
                  width: '100%',
                },
              }}
            />
          </Box>
          <Box sx={{ flex: { xs: '1 1 100%', md: '0 0 auto' }, minWidth: { xs: '100%', md: '200px' } }}>
            <FormControl fullWidth>
              <InputLabel>Filter by Status</InputLabel>
              <Select
                value={statusFilter}
                label="Filter by Status"
                onChange={(e: SelectChangeEvent) => setStatusFilter(e.target.value)}
                startAdornment={
                  <InputAdornment position="start">
                    <FilterList />
                  </InputAdornment>
                }
              >
                <MenuItem value="ALL">All Statuses</MenuItem>
                <MenuItem value="PENDING">Pending</MenuItem>
                <MenuItem value="CONFIRMED">Confirmed</MenuItem>
                <MenuItem value="CHECKED_IN">Checked In</MenuItem>
                <MenuItem value="CHECKED_OUT">Checked Out</MenuItem>
                <MenuItem value="CANCELLED">Cancelled</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Box>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {filteredReservations?.map((reservation: Reservation) => (
          <Paper 
            key={reservation.id}
            sx={{
              p: 3,
            }}
          >
              {/* Header: Avatar, Name, ID, and Status */}
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar
                    src={reservation.user?.avatar}
                    sx={{
                      width: 56,
                      height: 56,
                      backgroundColor: '#1976d2',
                    }}
                  >
                    {!reservation.user?.avatar && 
                      `${reservation.user?.firstName?.charAt(0) || ''}${reservation.user?.lastName?.charAt(0) || ''}`
                    }
                  </Avatar>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {reservation.user?.firstName} {reservation.user?.lastName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      #{reservation.id.substring(0, 6)}
                    </Typography>
                  </Box>
                </Box>
                <Chip
                  label={reservation.status === 'CHECKED_IN' ? 'Checked-in' : 
                         reservation.status === 'CHECKED_OUT' ? 'Checked-out' :
                         reservation.status.charAt(0) + reservation.status.slice(1).toLowerCase()}
                  sx={{
                    backgroundColor: 
                      reservation.status === 'CONFIRMED' ? 'rgba(46, 125, 50, 0.2)' :
                      reservation.status === 'PENDING' ? 'rgba(237, 108, 2, 0.2)' :
                      reservation.status === 'CHECKED_IN' ? 'rgba(2, 136, 209, 0.2)' :
                      reservation.status === 'CHECKED_OUT' ? 'rgba(117, 117, 117, 0.2)' :
                      'rgba(211, 47, 47, 0.2)',
                    color: 
                      reservation.status === 'CONFIRMED' ? '#4caf50' :
                      reservation.status === 'PENDING' ? '#ff9800' :
                      reservation.status === 'CHECKED_IN' ? '#2196f3' :
                      reservation.status === 'CHECKED_OUT' ? '#9e9e9e' :
                      '#f44336',
                    fontWeight: 600,
                    fontSize: '0.75rem',
                    height: 28,
                  }}
                />
              </Box>

              {/* Room Info and Total Amount */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                    Room Info
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {reservation.room?.name?.split(' ')[0] || 'N/A'} • {reservation.room?.type?.replace('_', ' ') || 'N/A'}
                  </Typography>
                </Box>
                <Box sx={{ textAlign: 'right' }}>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                    Total Amount
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    ${reservation.totalAmount?.toFixed(2) || '0.00'}
                  </Typography>
                </Box>
              </Box>

              {/* Reservation Dates */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                  Reservation Dates
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {parseDate(reservation.checkInDate).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric', 
                      year: 'numeric' 
                    })}
                  </Typography>
                  <ArrowForward color="action" sx={{ fontSize: 20 }} />
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {parseDate(reservation.checkOutDate).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric', 
                      year: 'numeric' 
                    })}
                  </Typography>
                </Box>
              </Box>

              {/* Action Buttons - Only show for active reservations */}
              {(reservation.status !== 'CHECKED_OUT' && reservation.status !== 'CANCELLED') && (
                <Box sx={{ display: 'flex', gap: 2 }}>
                  {/* CONFIRMED Status: Check-in, Update, Cancel */}
                  {reservation.status === 'CONFIRMED' && (
                    <>
                      <Button
                        variant="contained"
                        startIcon={<Login />}
                        onClick={() => handleQuickStatusChange(reservation, 'CHECKED_IN')}
                        sx={{
                          backgroundColor: '#2196f3',
                          color: '#fff',
                          textTransform: 'none',
                          fontWeight: 600,
                          '&:hover': {
                            backgroundColor: '#1976d2',
                          },
                        }}
                      >
                        Check-in
                      </Button>
                      <Button
                        variant="outlined"
                        startIcon={<Edit />}
                        onClick={() => openEditDialog(reservation)}
                        sx={{
                          textTransform: 'none',
                          fontWeight: 600,
                        }}
                      >
                        Update
                      </Button>
                      <Button
                        variant="outlined"
                        startIcon={<Cancel />}
                        onClick={() => handleQuickStatusChange(reservation, 'CANCELLED')}
                        sx={{
                          borderColor: 'error.main',
                          color: 'error.main',
                          textTransform: 'none',
                          fontWeight: 600,
                          '&:hover': {
                            borderColor: 'error.dark',
                            backgroundColor: 'error.light',
                          },
                        }}
                      >
                        Cancel
                      </Button>
                    </>
                  )}

                  {/* PENDING Status: Update, Cancel */}
                  {reservation.status === 'PENDING' && (
                    <>
                      <Button
                        variant="outlined"
                        startIcon={<Edit />}
                        onClick={() => openEditDialog(reservation)}
                        sx={{
                          textTransform: 'none',
                          fontWeight: 600,
                        }}
                      >
                        Update
                      </Button>
                      <Button
                        variant="outlined"
                        startIcon={<Cancel />}
                        onClick={() => handleQuickStatusChange(reservation, 'CANCELLED')}
                        sx={{
                          borderColor: 'error.main',
                          color: 'error.main',
                          textTransform: 'none',
                          fontWeight: 600,
                          '&:hover': {
                            borderColor: 'error.dark',
                            backgroundColor: 'error.light',
                          },
                        }}
                      >
                        Cancel
                      </Button>
                    </>
                  )}

                  {/* CHECKED_IN Status: Check-out, Update, Cancel */}
                  {reservation.status === 'CHECKED_IN' && (
                    <>
                      <Button
                        variant="contained"
                        startIcon={<Logout />}
                        onClick={() => handleQuickStatusChange(reservation, 'CHECKED_OUT')}
                        sx={{
                          backgroundColor: '#d32f2f',
                          color: '#fff',
                          textTransform: 'none',
                          fontWeight: 600,
                          '&:hover': {
                            backgroundColor: '#c62828',
                          },
                        }}
                      >
                        Check-out
                      </Button>
                      <Button
                        variant="outlined"
                        startIcon={<Edit />}
                        onClick={() => openEditDialog(reservation)}
                        sx={{
                          textTransform: 'none',
                          fontWeight: 600,
                        }}
                      >
                        Update
                      </Button>
                      <Button
                        variant="outlined"
                        startIcon={<Cancel />}
                        onClick={() => handleQuickStatusChange(reservation, 'CANCELLED')}
                        sx={{
                          borderColor: 'error.main',
                          color: 'error.main',
                          textTransform: 'none',
                          fontWeight: 600,
                          '&:hover': {
                            borderColor: 'error.dark',
                            backgroundColor: 'error.light',
                          },
                        }}
                      >
                        Cancel
                      </Button>
                    </>
                  )}
                </Box>
              )}
          </Paper>
        ))}
      </Box>

      <Dialog open={statusDialogOpen} onClose={() => setStatusDialogOpen(false)}>
        <DialogTitle>Update Reservation Status</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={newStatus}
              onChange={(e: SelectChangeEvent<ReservationStatus>) => setNewStatus(e.target.value as ReservationStatus)}
              label="Status"
            >
              <MenuItem value="PENDING">Pending</MenuItem>
              <MenuItem value="CONFIRMED">Confirmed</MenuItem>
              <MenuItem value="CHECKED_IN">Checked In</MenuItem>
              <MenuItem value="CHECKED_OUT">Checked Out</MenuItem>
              <MenuItem value="CANCELLED">Cancelled</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStatusDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleStatusChange} variant="contained">
            Update
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Update Reservation Dates</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              label="Check-in Date"
              type="date"
              value={editCheckInDate}
              onChange={(e) => setEditCheckInDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
            <TextField
              label="Check-out Date"
              type="date"
              value={editCheckOutDate}
              onChange={(e) => setEditCheckOutDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
            <TextField
              label="Number of Guests"
              type="number"
              value={editNumberOfGuests}
              onChange={(e) => setEditNumberOfGuests(parseInt(e.target.value))}
              inputProps={{ min: 1 }}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleEditDates} variant="contained" color="primary">
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminReservations;
