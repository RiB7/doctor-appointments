'use client';

import React, { useEffect, useState } from 'react';
import { Container, Grid, Card, CardContent, Typography, CardMedia, Button, Box } from '@mui/material';
import { Dayjs } from 'dayjs';
import { useRouter } from 'next/navigation';
import CalendarDialog from './components/calendar';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import axios from 'axios';

interface Doctor {
    docId: string;
    docName: string;
    speciality: string;
    price: number;
    image: string;
}

export default function DoctorsPage() {
    const router = useRouter();
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [openCalendar, setOpenCalendar] = useState(false);
    const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null);
    const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);

    const handleBookNow = (doctor: Doctor) => {
        setSelectedDoctor(doctor);
        setOpenCalendar(true);
    };

    const handleCloseCalendar = () => {
        setOpenCalendar(false);
        setSelectedDate(null);
        setSelectedDoctor(null);
    };

    const handleViewAppointments = () => {
        router.push('/appointment');
    };

    useEffect(() => {
        axios.get('http://localhost:5000/doctors')
            .then(response => {
                setDoctors(response.data); 
            })
            .catch(error => {
                console.error('Error fetching doctors:', error);
            });
    }, []);
    return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Container sx={{ py: 4 }}>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h4" gutterBottom>Our Doctors</Typography>
                    <Button variant="outlined" color="secondary" onClick={handleViewAppointments}>
                        View Appointments
                    </Button>
                </Box>
                <Grid container spacing={4}>
                    {doctors.map((doctor) => (
                        <Grid key={doctor.docId}>
                            <Card>
                                <CardMedia component="img" alt={doctor.docName} image={doctor.image}
                                    sx={{
                                        height: 200,
                                        width: 200,
                                        objectFit: 'cover',
                                    }}
                                />
                                <CardContent>
                                    <Typography variant="h6">{doctor.docName}</Typography>
                                    <Typography color="text.secondary">{doctor.speciality}</Typography>
                                    <Typography fontWeight="bold">${doctor.price} / 30 min</Typography>
                                    <Button variant="contained" color="primary" onClick={() => handleBookNow(doctor)} sx={{
                                        mt: 2, height: 40,
                                        width: '100%',
                                        objectFit: 'cover',
                                    }}>
                                        Book Now
                                    </Button>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
                <CalendarDialog open={openCalendar} selectedDoctor={selectedDoctor} selectedDate={selectedDate} onClose={handleCloseCalendar} onDateChange={setSelectedDate} />
            </Container>
        </LocalizationProvider>
    );
}
