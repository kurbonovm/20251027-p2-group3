// User and Auth Types
export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  roles: Role[];
  avatar?: string;
  provider?: string;
  enabled: boolean;
}

export type Role = 'ADMIN' | 'MANAGER' | 'GUEST';

export interface AuthResponse {
  token: string;
  user: User;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phoneNumber?: string;
}

// Room Types
export interface Room {
  id: string;
  name: string;
  type: RoomType;
  description: string;
  pricePerNight: number;
  capacity: number;
  amenities: string[];
  imageUrl: string;
  additionalImages: string[];
  totalRooms: number;
  availableRooms: number;
  available: boolean;
  floorNumber: number;
  size: number;
  bedType?: string;
  viewType?: string;
  wheelchairAccessible?: boolean;
  hearingAccessible?: boolean;
  visualAccessible?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export type RoomType = 'STANDARD' | 'DELUXE' | 'SUITE' | 'PRESIDENTIAL';

// Reservation Types
export interface Reservation {
  id: string;
  user: User;
  room: Room;
  checkInDate: string;
  checkInTime?: string;
  checkOutDate: string;
  checkOutTime?: string;
  numberOfGuests: number;
  totalAmount: number;
  status: ReservationStatus;
  paymentIntentId?: string;
  paymentLinkToken?: string;
  cancellationReason?: string;
  cancelledAt?: string;
  expiresAt?: string;
  createdAt: string;
  updatedAt?: string;
}

export type ReservationStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'CHECKED_IN'
  | 'CHECKED_OUT'
  | 'CANCELLED';

// Cancellation Types
export interface CancellationRequest {
  reason: string;
  acknowledgePolicy: boolean;
}

export interface RefundCalculation {
  originalAmount: number;
  refundAmount: number;
  cancellationFee: number;
  refundPercentage: number;
  daysUntilCheckIn: number;
  policyDescription: string;
  isFullRefund: boolean;
  isNoRefund: boolean;
  explanation: string;
}

export interface CancellationResponse {
  reservationId: string;
  status: string;
  originalAmount: number;
  refundAmount: number;
  cancellationFee: number;
  refundPercentage: number;
  daysBeforeCheckIn: number;
  refundStatus: string;
  estimatedRefundTime: string;
  cancelledAt: string;
  message: string;
}

// Transaction/Payment Types
export interface Transaction {
  id: string;
  reservation: Reservation;
  amount: number;
  currency: string;
  status: PaymentStatus;
  paymentMethod?: string;
  stripePaymentIntentId?: string;
  createdAt: string;
  updatedAt?: string;
}

export type PaymentStatus = 'PENDING' | 'SUCCEEDED' | 'FAILED' | 'REFUNDED';

// Statistics Types
export interface RoomStatistics {
  totalRooms: number;
  availableRooms: number;
  occupiedRooms: number;
  occupancyRate: number;
  roomsByType: Record<string, number>;
}

export interface ReservationStatistics {
  totalReservations: number;
  reservationsByStatus: Record<string, number>;
  totalRevenue: number;
}

export interface DashboardOverview {
  totalRooms: number;
  availableRooms: number;
  occupancyRate: number;
  activeReservations: number;
  totalUsers: number;
  monthlyRevenue: number;
}

// Redux State Types
export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

export interface RootState {
  auth: AuthState;
}

// API Request/Response Types
export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  avatar?: string;
}

export interface RoomQueryParams {
  type?: RoomType;
  minPrice?: number;
  maxPrice?: number;
  capacity?: number;
  available?: boolean;
}

export interface AvailableRoomsQuery {
  startDate: string;
  endDate: string;
  guests: number;
}

export interface CreateRoomRequest extends Omit<Room, 'id' | 'createdAt' | 'updatedAt'> {}

export interface UpdateRoomRequest extends Partial<CreateRoomRequest> {
  id: string;
}

export interface CreateReservationRequest {
  roomId: string;
  checkInDate: string;
  checkInTime?: string;
  checkOutDate: string;
  checkOutTime?: string;
  numberOfGuests: number;
  specialRequests?: string;
}

export interface UpdateReservationRequest extends Partial<CreateReservationRequest> {
  id: string;
}

export interface CreatePaymentIntentRequest {
  reservationId: string;
  amount: number;
}

export interface ConfirmPaymentRequest {
  paymentIntentId: string;
  reservationId: string;
}

export interface PaymentIntentResponse {
  clientSecret: string;
  paymentIntentId: string;
}

export interface RefundRequest {
  paymentId: string;
  amount?: number;
}

// User Preferences Types
export interface UserPreferences {
  id?: string;
  userId?: string;

  // Notification Preferences
  emailNotificationsEnabled: boolean;
  smsNotificationsEnabled: boolean;
  bookingConfirmationEmails: boolean;
  promotionalEmails: boolean;
  bookingReminderEmails: boolean;

  // Room Preferences
  preferredBedType?: string;
  preferredFloorLevel?: string;
  preferredRoomView?: string;
  preferredRoomType?: string;
  preferQuietRoom: boolean;
  preferredCheckInTime?: string;
  preferredCheckOutTime?: string;

  // Accessibility Preferences
  wheelchairAccessible: boolean;
  hearingAccessible: boolean;
  visualAccessible: boolean;
  otherAccessibilityNeeds?: string;

  // Dietary & Special Requests
  dietaryRestrictions: string[];
  allergies: string[];
  defaultSpecialRequests?: string;

  // Language & Regional Preferences
  preferredLanguage: string;
  preferredCurrency: string;
  preferredDateFormat: string;
  preferredTimeFormat: string;

  // UI/UX Preferences
  themeMode: string;

  // Timestamps
  createdAt?: string;
  updatedAt?: string;
}

export type BedType = 'KING' | 'QUEEN' | 'DOUBLE' | 'TWIN' | 'SINGLE';
export type FloorLevel = 'HIGH' | 'MIDDLE' | 'LOW' | 'GROUND';
export type RoomView = 'OCEAN' | 'CITY' | 'GARDEN' | 'MOUNTAIN' | 'POOL' | 'COURTYARD';

export interface UpdatePreferencesRequest extends Partial<UserPreferences> {}
