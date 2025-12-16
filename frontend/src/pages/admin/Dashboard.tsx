import React from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
} from '@mui/material';
import {
  People,
  CalendarMonth,
  AttachMoney,
  MeetingRoom,
  Login,
  TrendingUp,
  TrendingDown,
} from '@mui/icons-material';
import { useGetDashboardOverviewQuery, useGetAllReservationsAdminQuery } from '../../features/admin/adminApi';
import AdminLayout from '../../layouts/AdminLayout';
import Loading from '../../components/Loading';

interface StatCard {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

/**
 * Admin Dashboard page
 */
const AdminDashboard: React.FC = () => {
  const { data: overview, isLoading: overviewLoading, error: overviewError } = useGetDashboardOverviewQuery();
  const { data: reservations, isLoading: reservationsLoading } = useGetAllReservationsAdminQuery();

  if (overviewLoading || reservationsLoading) return <Loading message="Loading dashboard..." />;

  if (overviewError || !overview) {
    return (
      <AdminLayout>
        <Typography color="error">Failed to load dashboard data</Typography>
      </AdminLayout>
    );
  }

  // Calculate check-ins (CHECKED_IN status reservations)
  const checkIns = reservations?.filter(r => r.status === 'CHECKED_IN').length || 0;

  // Calculate occupancy trend (simulated - in production, this would come from historical data)
  // For demo purposes, we'll generate a trend based on current occupancy rate
  const calculateOccupancyTrend = (currentRate: number): { value: number; isPositive: boolean } => {
    // Simulate trend: if occupancy is high (>70%), show positive trend; if low (<50%), show negative
    // In production, this should compare with previous day/week data from backend
    const trendValue = currentRate > 70 ? Math.random() * 10 + 2 : -(Math.random() * 5 + 1);
    return {
      value: Math.abs(parseFloat(trendValue.toFixed(1))),
      isPositive: trendValue > 0,
    };
  };

  const occupancyTrend = calculateOccupancyTrend(overview.occupancyRate);

  const stats: StatCard[] = [
    {
      title: 'Occupancy',
      value: `${overview.occupancyRate.toFixed(0)}%`,
      icon: <MeetingRoom sx={{ fontSize: 32 }} />,
      color: '#1976d2',
      bgColor: 'rgba(25, 118, 210, 0.15)',
      trend: occupancyTrend,
    },
    {
      title: 'Check-Ins',
      value: checkIns,
      icon: <Login sx={{ fontSize: 32 }} />,
      color: '#ff9800',
      bgColor: 'rgba(255, 152, 0, 0.15)',
    },
    {
      title: 'Active Reservations',
      value: overview.activeReservations,
      icon: <CalendarMonth sx={{ fontSize: 32 }} />,
      color: '#9c27b0',
      bgColor: 'rgba(156, 39, 176, 0.15)',
    },
    {
      title: 'Total Users',
      value: overview.totalUsers,
      icon: <People sx={{ fontSize: 32 }} />,
      color: '#00bcd4',
      bgColor: 'rgba(0, 188, 212, 0.15)',
    },
    {
      title: 'Monthly Revenue',
      value: `$${overview.monthlyRevenue.toFixed(2)}`,
      icon: <AttachMoney sx={{ fontSize: 32 }} />,
      color: '#4caf50',
      bgColor: 'rgba(76, 175, 80, 0.15)',
    },
  ];

  return (
    <AdminLayout>
      {/* Daily Stats Section */}
      <Box sx={{ mb: 5 }}>
        <Typography
          variant="h4"
          sx={{
            color: '#ffffff',
            fontWeight: 700,
            mb: 4,
          }}
        >
          Daily Stats
        </Typography>

        <Grid container spacing={3}>
          {stats.map((stat, index) => (
            <Grid key={index} size={{ xs: 12, sm: 6, md: 4 }}>
              <Card
                sx={{
                  backgroundColor: '#1a1a1a',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: 2,
                  transition: 'all 0.3s ease',
                  cursor: 'pointer',
                  height: '100%',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
                    borderColor: 'rgba(255, 255, 255, 0.3)',
                    backgroundColor: '#1f1f1f',
                  },
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  {/* Icon and Title Row */}
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      mb: 2,
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{
                        color: 'rgba(255, 255, 255, 0.7)',
                        fontSize: '0.875rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        fontWeight: 500,
                      }}
                    >
                      {stat.title}
                    </Typography>
                    <Box
                      sx={{
                        width: 48,
                        height: 48,
                        borderRadius: 2,
                        backgroundColor: stat.bgColor,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: stat.color,
                      }}
                    >
                      {stat.icon}
                    </Box>
                  </Box>
                  
                  {/* Value and Trend */}
                  <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
                    <Typography
                      variant="h3"
                      sx={{
                        color: '#ffffff',
                        fontWeight: 700,
                        fontSize: '2.5rem',
                        lineHeight: 1,
                      }}
                    >
                      {stat.value}
                    </Typography>
                    
                    {/* Trend Indicator (only for Occupancy) */}
                    {stat.trend && (
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 0.5,
                          px: 1,
                          py: 0.5,
                          borderRadius: 1,
                          backgroundColor: stat.trend.isPositive 
                            ? 'rgba(76, 175, 80, 0.15)' 
                            : 'rgba(244, 67, 54, 0.15)',
                        }}
                      >
                        {stat.trend.isPositive ? (
                          <TrendingUp 
                            sx={{ 
                              fontSize: 18, 
                              color: '#4caf50',
                            }} 
                          />
                        ) : (
                          <TrendingDown 
                            sx={{ 
                              fontSize: 18, 
                              color: '#f44336',
                            }} 
                          />
                        )}
                        <Typography
                          variant="body2"
                          sx={{
                            color: stat.trend.isPositive ? '#4caf50' : '#f44336',
                            fontWeight: 600,
                            fontSize: '0.875rem',
                          }}
                        >
                          {stat.trend.isPositive ? '+' : '-'}{stat.trend.value}%
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    </AdminLayout>
  );
};

export default AdminDashboard;
