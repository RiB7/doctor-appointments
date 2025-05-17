'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Grid,
  TextField,
  Snackbar,
  Alert,
  Slide,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import axios from 'axios';

interface Appointment {
  time: string;
  issue: string;
}

interface Doctor {
  docId: string;
  docName: string;
  speciality: string;
  price: number;
  image: string;
  appointments?: Record<string, Appointment[]>;
}

interface Props {
  open: boolean;
  selectedDoctor: Doctor | null;
  selectedDate: Dayjs | null;
  onDateChange: (date: Dayjs | null) => void;
  onClose: () => void;
}

const CalendarDialog: React.FC<Props> = ({
  open,
  selectedDoctor,
  selectedDate,
  onDateChange,
  onClose,
}) => {
  const [issue, setIssue] = useState('');
  const [bookedTimes, setBookedTimes] = useState<string[]>([]);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({
    open: false,
    message: '',
    severity: 'success',
  });

  useEffect(() => {
    if (selectedDoctor && selectedDate) {
      const dateKey = selectedDate.format('YYYY-MM-DD');
      const appointments = selectedDoctor.appointments?.[dateKey] || [];
      const booked = appointments.map((a) => a.time);
      setBookedTimes(booked);
    }
  }, [selectedDoctor, selectedDate]);

  const isWeekend = (date: Dayjs | null) => {
    if (!date) return false;
    const day = date.day();
    return day === 0 || day === 6;
  };

  const generateTimeSlots = () => {
    const slots = [];
    let hour = 10;
    for (let i = 0; i < 14; i++) {
      const time = dayjs().hour(hour).minute((i % 2) * 30).format('hh:mm A');
      slots.push(time);
      if (i % 2 === 1) hour++;
    }
    return slots;
  };

  const handleBooking = async (time: string) => {
    
    if (!selectedDoctor || !selectedDate || !issue.trim()) {
      setSnackbar({
        open: true,
        message: 'Please select a date and enter the issue.',
        severity: 'error',
      });
      return;
    }

    const formattedDate = selectedDate.format('YYYY-MM-DD');

    try {
      await axios.post(`http://localhost:5000/doctors/${selectedDoctor.docId}/appointments`, {
        date: formattedDate,
        time,
        issue,
        status: 0
      });

      setBookedTimes((prev) => [...prev, time]);
      setIssue('');
      setSnackbar({
        open: true,
        message: `Appointment booked on ${formattedDate} at ${time}`,
        severity: 'success',
      });
    } catch (error) {
      console.error('Failed to book appointment:', error);
      setSnackbar({
        open: true,
        message: 'Booking failed. Please try again.',
        severity: 'error',
      });
    }
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
        <DialogTitle>
          Book an Appointment with {selectedDoctor?.docName}
        </DialogTitle>
        <DialogContent>
          <DatePicker
            label="Select Date"
            value={selectedDate}
            onChange={onDateChange}
            shouldDisableDate={isWeekend}
            slotProps={{ textField: { fullWidth: true } }}
          />
          {selectedDate && !isWeekend(selectedDate) && (
            <>
              <TextField
                label="Describe your issue"
                fullWidth
                required
                margin="normal"
                value={issue}
                onChange={(e) => setIssue(e.target.value)}
              />
              <Typography variant="h6" sx={{ mt: 2 }}>
                Available Time Slots:
              </Typography>
              <Grid container spacing={1}>
                {generateTimeSlots().map((slot, index) => {
                  const isBooked = bookedTimes.includes(slot);
                  return (
                    <Grid key={index}>
                      <Button
                        variant={isBooked ? 'contained' : 'outlined'}
                        color={isBooked ? 'primary' : 'inherit'}
                        disabled={isBooked}
                        fullWidth
                        onClick={() => handleBooking(slot)}
                      >
                        {slot}
                      </Button>
                    </Grid>
                  );
                })}
              </Grid>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        TransitionComponent={(props) => <Slide {...props} direction="left" />}
        sx={{
          '& .MuiAlert-root': {
            border: '1px solid #333',
            boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.3)',
            borderRadius: '8px',
            backgroundColor: '#fff',
            color: '#000',
          },
        }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          sx={{ fontWeight: 500 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default CalendarDialog;
