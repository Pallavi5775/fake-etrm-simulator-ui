import React, { useEffect, useState } from 'react';
import { getCommodities, createCommodity } from '../../api/commoditiesApi';
import DataTable from '../../components/shared/DataTable';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import Toast from '../../components/shared/Toast';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Box, Typography, Paper, Stack, Card, CardContent, useMediaQuery, useTheme } from '@mui/material';

const defaultCommodity = { name: '' };

const CommoditiesConfig = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [commodities, setCommodities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState(defaultCommodity);

  const fetchCommodities = async () => {
    setLoading(true);
    try {
      const res = await getCommodities();
      setCommodities(res.data || []);
    } catch (e) {
      setToast({ open: true, message: 'Failed to load commodities', severity: 'error' });
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCommodities();
  }, []);

  const handleOpenDialog = () => {
    setForm(defaultCommodity);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => setDialogOpen(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      await createCommodity(form);
      setToast({ open: true, message: 'Commodity created', severity: 'success' });
      fetchCommodities();
      handleCloseDialog();
    } catch (e) {
      setToast({ open: true, message: 'Failed to save commodity', severity: 'error' });
    }
  };

  const columns = [
    { field: 'id', headerName: 'ID', flex: 1 },
    { field: 'name', headerName: 'Name', flex: 2 },
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>Commodities Management</Typography>
      <Box sx={{ mb: 3, display: "flex", justifyContent: "flex-end" }}>
        <Button variant="contained" color="primary" onClick={handleOpenDialog} fullWidth={isMobile}>
          Add Commodity
        </Button>
      </Box>
      {loading ? <LoadingSpinner /> : (
        <Paper
          sx={{
            background: "linear-gradient(135deg, #16182E 0%, #1B1F3B 100%)",
            border: "1px solid #252862",
            overflow: "hidden"
          }}
        >
          {commodities.length === 0 ? (
            <Box sx={{ p: 4 }}>
              <Typography>No commodities found.</Typography>
            </Box>
          ) : isMobile ? (
            // Mobile: Card layout
            <Stack spacing={2} sx={{ p: 2 }}>
              {commodities.map((commodity) => (
                <Card key={commodity.id} sx={{ backgroundColor: "#1B1F3B", border: "1px solid #252862" }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ color: "#EDE7F6", mb: 1 }}>{commodity.name}</Typography>
                    <Typography variant="caption" color="text.secondary">ID: {commodity.id}</Typography>
                  </CardContent>
                </Card>
              ))}
            </Stack>
          ) : (
            // Desktop: Table layout
            <DataTable rows={commodities} columns={columns} autoHeight pageSize={10} />
          )}
        </Paper>
      )}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth fullScreen={isMobile}>
        <DialogTitle sx={{ background: "linear-gradient(135deg, #16182E 0%, #1B1F3B 100%)", color: "#EDE7F6" }}>Add Commodity</DialogTitle>
        <DialogContent sx={{ backgroundColor: "#16182E" }}>
          <TextField margin="dense" label="Name" name="name" value={form.name} onChange={handleChange} fullWidth />
        </DialogContent>
        <DialogActions sx={{ backgroundColor: "#16182E", p: 2 }}>
          <Button onClick={handleCloseDialog} fullWidth={isMobile}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary" fullWidth={isMobile}>Save</Button>
        </DialogActions>
      </Dialog>
      <Toast open={toast.open} message={toast.message} severity={toast.severity} onClose={() => setToast({ ...toast, open: false })} />
    </Box>
  );
};

export default CommoditiesConfig;
