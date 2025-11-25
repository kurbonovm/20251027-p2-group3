import { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Link,
  Alert,
  Paper,
  Grid,
  Card,
  CardContent,
  InputAdornment,
  IconButton,
  Stepper,
  Step,
  StepLabel,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Person,
  Email,
  Phone,
  Lock,
  CheckCircle,
} from '@mui/icons-material';
import { useRegisterMutation } from '../features/auth/authApi';

/**
 * Register page component with multi-step form
 * @returns {React.ReactNode} The register page
 */
const Register = () => {
  const navigate = useNavigate();
  const [register, { isLoading }] = useRegisterMutation();

  const [activeStep, setActiveStep] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phoneNumber: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const steps = ['Personal Info', 'Account Details', 'Confirm'];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleNext = () => {
    if (activeStep === 0) {
      if (!formData.firstName || !formData.lastName || !formData.phoneNumber) {
        setError('Please fill in all personal information fields');
        return;
      }
    } else if (activeStep === 1) {
      if (!formData.email || !formData.password || !formData.confirmPassword) {
        setError('Please fill in all account details');
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match');
        return;
      }
      if (formData.password.length < 8) {
        setError('Password must be at least 8 characters long');
        return;
      }
    }
    setError('');
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setError('');
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    try {
      const { confirmPassword, ...registerData } = formData;
      await register(registerData).unwrap();
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setError(err.data?.message || 'Failed to register. Please try again.');
    }
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                id="firstName"
                label="First Name"
                name="firstName"
                autoComplete="given-name"
                value={formData.firstName}
                onChange={handleChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Person />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                id="lastName"
                label="Last Name"
                name="lastName"
                autoComplete="family-name"
                value={formData.lastName}
                onChange={handleChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Person />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                id="phoneNumber"
                label="Phone Number"
                name="phoneNumber"
                autoComplete="tel"
                value={formData.phoneNumber}
                onChange={handleChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Phone />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
          </Grid>
        );
      case 1:
        return (
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                autoComplete="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Email />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                name="password"
                label="Password"
                type={showPassword ? 'text' : 'password'}
                id="password"
                autoComplete="new-password"
                value={formData.password}
                onChange={handleChange}
                helperText="Must be at least 8 characters"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                name="confirmPassword"
                label="Confirm Password"
                type={showConfirmPassword ? 'text' : 'password'}
                id="confirmPassword"
                autoComplete="new-password"
                value={formData.confirmPassword}
                onChange={handleChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        edge="end"
                      >
                        {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
          </Grid>
        );
      case 2:
        return (
          <Card variant="outlined" sx={{ bgcolor: 'background.default', p: 2 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <CheckCircle color="success" sx={{ mr: 1, fontSize: 30 }} />
                <Typography variant="h6">Review Your Information</Typography>
              </Box>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="body1">
                    <strong>Name:</strong> {formData.firstName} {formData.lastName}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body1">
                    <strong>Email:</strong> {formData.email}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body1">
                    <strong>Phone:</strong> {formData.phoneNumber}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        );
      default:
        return null;
    }
  };

  return (
    <Box
      sx={{
        minHeight: 'calc(100vh - 200px)',
        display: 'flex',
        alignItems: 'center',
        py: 4,
      }}
    >
      <Container component="main" maxWidth="md">
        <Paper
          elevation={6}
          sx={{
            p: { xs: 3, md: 5 },
            borderRadius: 2,
            background: 'linear-gradient(to bottom, #ffffff 0%, #f5f5f5 100%)',
          }}
        >
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography component="h1" variant="h3" fontWeight="bold" color="primary" gutterBottom>
              Create Your Account
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Join us and start booking your perfect stay
            </Typography>
          </Box>

          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mb: 3 }}>
              Registration successful! Redirecting to login...
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            {renderStepContent(activeStep)}

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
              <Button
                disabled={activeStep === 0}
                onClick={handleBack}
                variant="outlined"
              >
                Back
              </Button>
              <Box sx={{ flex: '1 1 auto' }} />
              {activeStep === steps.length - 1 ? (
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={isLoading}
                >
                  {isLoading ? 'Creating Account...' : 'Create Account'}
                </Button>
              ) : (
                <Button variant="contained" onClick={handleNext} size="large">
                  Next
                </Button>
              )}
            </Box>
          </Box>

          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Already have an account?{' '}
              <Link component={RouterLink} to="/login" fontWeight="bold">
                Sign In
              </Link>
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default Register;
