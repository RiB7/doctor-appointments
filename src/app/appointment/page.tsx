'use client';

import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Card,
    CardMedia,
    Button
} from '@mui/material';
import dayjs from 'dayjs';
import axios from 'axios';

interface AppointmentDetail {
    time: string;
    issue: string;
    _id: string;
}

interface Doctor {
    _id: string;
    docId: string;
    docName: string;
    image: string;
    __v: number;
    price: number;
    speciality: string;
    appointments: {
        [date: string]: AppointmentDetail[];
    };
}

interface FlattenedAppointment {
    _id: string;
    docId: string;
    docName: string;
    image: string;
    __v: number;
    price: number;
    speciality: string;
    appointments: {
        [date: string]: AppointmentDetail;
    };
}

export default function DoctorAppointment() {
    const [appointments, setAppointments] = useState<FlattenedAppointment[]>([]);
    function flattenDoctorAppointments(doctors: Doctor[]): FlattenedAppointment[] {
        const result: FlattenedAppointment[] = [];
        doctors.forEach((doctor) => {
            const { appointments, ...rest } = doctor;
            for (const date in appointments) {
                appointments[date].forEach((appointment) => {
                    result.push({
                        ...rest,
                        appointments: {
                            [date]: appointment
                        }
                    });
                });
            }
        });
        return result;
    }
      
    useEffect(() => {
        axios.get('http://localhost:5000/doctors')
            .then(response => {
                setAppointments(flattenDoctorAppointments(response.data)); 
            })
            .catch(error => {
                console.error('Error fetching doctors:', error);
            });
    }, []);

    return (
        <section style={{ padding: '20px' }}>
            <Typography variant="h4" gutterBottom>Appointments</Typography>
            <Box display="flex" flexDirection="column" gap={2}>
                {appointments.map((appointment) => {
                    const date = Object.keys(appointment.appointments)[0];
                    const detail = appointment.appointments[date];
                    const appointmentDateTime = dayjs(`${date} ${detail.time}`, "YYYY-MM-DD hh:mm A");
                    const isCompleted = appointmentDateTime.isBefore(dayjs());
                    return (
                        <Card key={detail._id} sx={{ display: 'flex', alignItems: 'center', padding: 1 }}>
                            <CardMedia component="img" image={appointment.image} alt={appointment.docName}
                                sx={{
                                    width: 150,
                                    height: 170,
                                    borderRadius: 2,
                                    objectFit: 'cover',
                                    mr: 2,
                                }}/>
                            <Box flex="1">
                                <Typography variant="h5">{appointment.docName}</Typography>
                                <Typography variant="body1" color="text.secondary">{date} at {detail.time}</Typography>
                                <Typography variant="body2" color="text.secondary">Reason: {detail.issue}</Typography>
                            </Box>
                            <Button variant="contained" color={isCompleted ? 'success' : 'warning'}sx={{ height: 'fit-content', ml: 2 }}>
                                {isCompleted ? 'Completed' : 'Upcoming'}
                            </Button>
                        </Card>
                    );
                })}
            </Box>
        </section>
    );
}
