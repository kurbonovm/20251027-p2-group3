import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  ArrowForward as ArrowForwardIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material';
import { useGetTodaysPulseQuery } from '../features/admin/adminApi';
import Loading from './Loading';
import type { TodaysPulseEvent } from '../types';

/**
 * TodaysPulse component displays today's check-in and check-out events
 * in a timeline format with icons and status indicators.
 */
const TodaysPulse: React.FC = () => {
  const { data: events, isLoading, error } = useGetTodaysPulseQuery();

  if (isLoading) {
    return (
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h5"
          sx={{
            color: '#ffffff',
            fontWeight: 600,
            mb: 2,
          }}
        >
          Today's Pulse
        </Typography>
        <Loading message="Loading today's events..." />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h5"
          sx={{
            color: '#ffffff',
            fontWeight: 600,
            mb: 2,
          }}
        >
          Today's Pulse
        </Typography>
        <Typography color="error">Failed to load today's events</Typography>
      </Box>
    );
  }

  // Helper function to determine icon based on event type and status
  const getEventIcon = (event: TodaysPulseEvent) => {
    if (event.type === 'CHECK_OUT') {
      if (event.status === 'CHECKED_OUT') {
        return {
          icon: <CheckCircleIcon sx={{ fontSize: 20 }} />,
          bgColor: 'rgba(76, 175, 80, 0.2)',
          color: '#4caf50',
        };
      }
      return {
        icon: <CheckCircleIcon sx={{ fontSize: 20 }} />,
        bgColor: 'rgba(76, 175, 80, 0.2)',
        color: '#4caf50',
      };
    }

    if (event.type === 'CHECK_IN') {
      if (event.status === 'CHECKED_IN') {
        return {
          icon: <ArrowForwardIcon sx={{ fontSize: 20 }} />,
          bgColor: 'rgba(33, 150, 243, 0.2)',
          color: '#2196f3',
        };
      }
      return {
        icon: <ScheduleIcon sx={{ fontSize: 20 }} />,
        bgColor: 'rgba(158, 158, 158, 0.2)',
        color: '#9e9e9e',
      };
    }

    return {
      icon: <ScheduleIcon sx={{ fontSize: 20 }} />,
      bgColor: 'rgba(158, 158, 158, 0.2)',
      color: '#9e9e9e',
    };
  };

  return (
    <Box sx={{ mb: 4 }}>
      {/* Title */}
      <Typography
        variant="h5"
        sx={{
          color: '#ffffff',
          fontWeight: 600,
          mb: 2,
        }}
      >
        Today's Pulse
      </Typography>

      {/* Content Area - Timeline Container */}
      <Paper
        elevation={0}
        sx={{
          backgroundColor: '#1a1a1a',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: 2,
          p: 3,
        }}
      >
        {!events || events.length === 0 ? (
          <Typography
            sx={{
              color: 'rgba(255, 255, 255, 0.6)',
              textAlign: 'center',
              py: 4,
            }}
          >
            No events scheduled for today
          </Typography>
        ) : (
          <Box sx={{ position: 'relative' }}>
            {events.map((event, index) => {
              const iconConfig = getEventIcon(event);
              const isLastItem = index === events.length - 1;

              return (
                <Box
                  key={event.id}
                  sx={{
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 2,
                    pb: isLastItem ? 0 : 3,
                  }}
                >
                  {/* Left: Icon with Vertical Connector */}
                  <Box
                    sx={{
                      position: 'relative',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      minWidth: 40,
                    }}
                  >
                    {/* Circular Icon */}
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: '50%',
                        backgroundColor: iconConfig.bgColor,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: iconConfig.color,
                        position: 'relative',
                        zIndex: 2,
                      }}
                    >
                      {iconConfig.icon}
                    </Box>

                    {/* Vertical Line Connector */}
                    {!isLastItem && (
                      <Box
                        sx={{
                          position: 'absolute',
                          top: 40,
                          left: '50%',
                          transform: 'translateX(-50%)',
                          width: 2,
                          height: 'calc(100% + 24px)',
                          backgroundColor: 'rgba(255, 255, 255, 0.1)',
                          zIndex: 1,
                        }}
                      />
                    )}
                  </Box>

                  {/* Center: Event Details */}
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    {/* Primary Text - Event Type and Guest Name */}
                    <Typography
                      sx={{
                        color: '#ffffff',
                        fontWeight: 600,
                        fontSize: '1rem',
                        mb: 0.5,
                      }}
                    >
                      {event.type === 'CHECK_OUT' ? 'Check-out' : 'Check-in'}:{' '}
                      {event.guestName}
                    </Typography>

                    {/* Secondary Text - Room and Status */}
                    <Typography
                      sx={{
                        color: 'rgba(255, 255, 255, 0.6)',
                        fontSize: '0.875rem',
                      }}
                    >
                      {event.roomNumber} • {event.additionalStatus}
                    </Typography>
                  </Box>

                  {/* Right: Time Indicator */}
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      minWidth: 'fit-content',
                    }}
                  >
                    <Typography
                      sx={{
                        color: 'rgba(255, 255, 255, 0.5)',
                        fontSize: '0.875rem',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {event.time}
                    </Typography>
                  </Box>
                </Box>
              );
            })}
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default TodaysPulse;

