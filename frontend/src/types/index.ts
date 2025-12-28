/**
 * Type definitions for the Hotel Reservation System.
 * Contains interfaces and types for users, authentication, rooms, reservations,
 * payments, and user preferences.
 *
 * @module types
 */

// ============================================================================
// User and Auth Types
// ============================================================================

/**
 * Represents a user in the system.
 */
export interface User {
  /** Unique identifier for the user */
  id: string;
  /** User's first name */
  firstName: string;
  /** User's last name */
  lastName: string;
  /** User's email address */
  email: string;
  /** User's phone number (optional) */
  phoneNumber?: string;
  /** User's roles in the system */
  roles: Role[];
  /** URL to user's profile picture (optional) */
  avatar?: string;
  /** OAuth2 provider (e.g., 'google', 'okta') if applicable */
  provider?: string;
  /** Whether the user account is enabled */
  enabled: boolean;
}

/**
 * User role type.
 * - ADMIN: Full system access
 * - MANAGER: Hotel management access
 * - GUEST: Basic user access
 */
export type Role = 'ADMIN' | 'MANAGER' | 'GUEST';

/**
 * Response from authentication endpoints containing JWT token and user data.
 */
export interface AuthResponse {
  /** JWT authentication token */
  token: string;
  /** Authenticated user information */
  user: User;
}

/**
 * Login credentials for email/password authentication.
 */
export interface LoginRequest {
  /** User's email address */
  email: string;
  /** User's password */
  password: string;
}

/**
 * User registration data for creating a new account.
 */
export interface RegisterRequest {
  /** User's first name */
  firstName: string;
  /** User's last name */
  lastName: string;
  /** User's email address */
  email: string;
  /** User's password */
  password: string;
  /** User's phone number (optional) */
  phoneNumber?: string;
}

// ============================================================================
// Room Types
// ============================================================================

/**
 * Represents a hotel room with all its properties and availability status.
 */
export interface Room {
  /** Unique identifier for the room */
  id: string;
  /** Display name of the room */
  name: string;
  /** Category/tier of the room */
  type: RoomType;
  /** Detailed description of the room */
  description: string;
  /** Nightly rate in USD */
  pricePerNight: number;
  /** Maximum number of guests the room can accommodate */
  capacity: number;
  /** List of amenities available in the room (e.g., WiFi, TV, Mini-bar) */
  amenities: string[];
  /** Primary image URL for the room */
  imageUrl: string;
  /** Additional image URLs for the room gallery */
  additionalImages: string[];
  /** Total number of this room type in the hotel */
  totalRooms: number;
  /** Number of rooms currently available for booking */
  availableRooms: number;
  /** Whether the room is currently available for booking */
  available: boolean;
  /** Floor number where the room is located */
  floorNumber: number;
  /** Room size in square feet */
  size: number;
  /** Type of bed(s) in the room (optional) */
  bedType?: string;
  /** Type of view from the room (optional) */
  viewType?: string;
  /** Whether the room has wheelchair accessibility features */
  wheelchairAccessible?: boolean;
  /** Whether the room has hearing accessibility features */
  hearingAccessible?: boolean;
  /** Whether the room has visual accessibility features */
  visualAccessible?: boolean;
  /** ISO 8601 timestamp of when the room was created */
  createdAt?: string;
  /** ISO 8601 timestamp of when the room was last updated */
  updatedAt?: string;
}

/**
 * Room category type.
 * - STANDARD: Basic room with standard amenities
 * - DELUXE: Enhanced room with additional amenities
 * - SUITE: Large room with separate living area
 * - PRESIDENTIAL: Top-tier luxury suite
 */
export type RoomType = 'STANDARD' | 'DELUXE' | 'SUITE' | 'PRESIDENTIAL';

// ============================================================================
// Reservation Types
// ============================================================================

/**
 * Represents a hotel room reservation made by a user.
 */
export interface Reservation {
  /** Unique identifier for the reservation */
  id: string;
  /** User who made the reservation */
  user: User;
  /** Room that was reserved */
  room: Room;
  /** Check-in date in ISO 8601 format */
  checkInDate: string;
  /** Preferred check-in time (optional) */
  checkInTime?: string;
  /** Check-out date in ISO 8601 format */
  checkOutDate: string;
  /** Preferred check-out time (optional) */
  checkOutTime?: string;
  /** Number of guests for the reservation */
  numberOfGuests: number;
  /** Total amount to be paid in USD */
  totalAmount: number;
  /** Current status of the reservation */
  status: ReservationStatus;
  /** Associated payment ID (optional) */
  paymentId?: string;
  /** Stripe payment intent ID (optional) */
  paymentIntentId?: string;
  /** Token for public payment link for assisted bookings (optional) */
  paymentLinkToken?: string;
  /** Reason provided for cancellation (optional) */
  cancellationReason?: string;
  /** ISO 8601 timestamp of when the reservation was cancelled (optional) */
  cancelledAt?: string;
  /** ISO 8601 timestamp of when the reservation expires if unpaid (optional) */
  expiresAt?: string;
  /** ISO 8601 timestamp of when the reservation was created */
  createdAt: string;
  /** ISO 8601 timestamp of when the reservation was last updated */
  updatedAt?: string;
}

/**
 * Reservation lifecycle status.
 * - PENDING: Reservation created but payment not completed
 * - CONFIRMED: Payment completed, reservation confirmed
 * - CHECKED_IN: Guest has checked in
 * - CHECKED_OUT: Guest has checked out
 * - CANCELLED: Reservation was cancelled
 */
export type ReservationStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'CHECKED_IN'
  | 'CHECKED_OUT'
  | 'CANCELLED';

// ============================================================================
// Cancellation Types
// ============================================================================

/**
 * Request payload for cancelling a reservation.
 */
export interface CancellationRequest {
  /** Reason for cancelling the reservation */
  reason: string;
  /** Acknowledgement that user understands the cancellation policy */
  acknowledgePolicy: boolean;
}

/**
 * Calculated refund details based on cancellation policy and timing.
 */
export interface RefundCalculation {
  /** Original reservation amount in USD */
  originalAmount: number;
  /** Amount to be refunded in USD */
  refundAmount: number;
  /** Cancellation fee charged in USD */
  cancellationFee: number;
  /** Percentage of original amount being refunded (0-100) */
  refundPercentage: number;
  /** Number of days until check-in date */
  daysUntilCheckIn: number;
  /** Human-readable description of the policy applied */
  policyDescription: string;
  /** Whether this is a full refund (100%) */
  isFullRefund: boolean;
  /** Whether no refund will be issued */
  isNoRefund: boolean;
  /** Detailed explanation of the refund calculation */
  explanation: string;
}

/**
 * Response received after successfully cancelling a reservation.
 */
export interface CancellationResponse {
  /** ID of the cancelled reservation */
  reservationId: string;
  /** New status of the reservation (should be 'CANCELLED') */
  status: string;
  /** Original reservation amount in USD */
  originalAmount: number;
  /** Amount refunded in USD */
  refundAmount: number;
  /** Cancellation fee charged in USD */
  cancellationFee: number;
  /** Percentage of original amount refunded (0-100) */
  refundPercentage: number;
  /** Number of days before check-in the cancellation occurred */
  daysBeforeCheckIn: number;
  /** Status of the refund process */
  refundStatus: string;
  /** Estimated time for refund to be processed */
  estimatedRefundTime: string;
  /** ISO 8601 timestamp of when the cancellation occurred */
  cancelledAt: string;
  /** Additional message about the cancellation */
  message: string;
}

// ============================================================================
// Transaction/Payment Types
// ============================================================================

/**
 * Represents a payment transaction for a reservation.
 */
export interface Transaction {
  /** Unique identifier for the transaction */
  id: string;
  /** Associated reservation for this payment */
  reservation: Reservation;
  /** Transaction amount */
  amount: number;
  /** Currency code (e.g., 'USD') */
  currency: string;
  /** Current status of the payment */
  status: PaymentStatus;
  /** Payment method used (e.g., 'card', 'bank_transfer') */
  paymentMethod?: string;
  /** Stripe payment intent ID for tracking */
  stripePaymentIntentId?: string;
  /** ISO 8601 timestamp of when the transaction was created */
  createdAt: string;
  /** ISO 8601 timestamp of when the transaction was last updated */
  updatedAt?: string;
}

/**
 * Payment transaction status.
 * - PENDING: Payment initiated but not completed
 * - SUCCEEDED: Payment completed successfully
 * - FAILED: Payment attempt failed
 * - REFUNDED: Payment was refunded to the customer
 */
export type PaymentStatus = 'PENDING' | 'SUCCEEDED' | 'FAILED' | 'REFUNDED';

// ============================================================================
// Statistics Types
// ============================================================================

/**
 * Aggregated statistics about hotel rooms and occupancy.
 */
export interface RoomStatistics {
  /** Total number of rooms in the hotel */
  totalRooms: number;
  /** Number of rooms currently available for booking */
  availableRooms: number;
  /** Number of rooms currently occupied */
  occupiedRooms: number;
  /** Occupancy rate as a percentage (0-100) */
  occupancyRate: number;
  /** Breakdown of rooms by type (e.g., { STANDARD: 20, DELUXE: 15 }) */
  roomsByType: Record<string, number>;
}

/**
 * Aggregated statistics about reservations and revenue.
 */
export interface ReservationStatistics {
  /** Total number of reservations in the system */
  totalReservations: number;
  /** Breakdown of reservations by status (e.g., { CONFIRMED: 50, PENDING: 10 }) */
  reservationsByStatus: Record<string, number>;
  /** Total revenue from all reservations in USD */
  totalRevenue: number;
}

/**
 * High-level overview statistics for the admin dashboard.
 */
export interface DashboardOverview {
  /** Total number of rooms in the hotel */
  totalRooms: number;
  /** Number of rooms currently available for booking */
  availableRooms: number;
  /** Current occupancy rate as a percentage (0-100) */
  occupancyRate: number;
  /** Number of active (non-cancelled) reservations */
  activeReservations: number;
  /** Total number of registered users */
  totalUsers: number;
  /** Revenue generated in the current month in USD */
  monthlyRevenue: number;
}

// ============================================================================
// Redux State Types
// ============================================================================

/**
 * Authentication state slice in the Redux store.
 */
export interface AuthState {
  /** Currently authenticated user, null if not logged in */
  user: User | null;
  /** JWT authentication token, null if not logged in */
  token: string | null;
  /** Whether a user is currently authenticated */
  isAuthenticated: boolean;
}

/**
 * Root Redux store state shape.
 */
export interface RootState {
  /** Authentication state slice */
  auth: AuthState;
}

// ============================================================================
// API Request/Response Types
// ============================================================================

/**
 * Request payload for updating a user's profile information.
 */
export interface UpdateProfileRequest {
  /** Updated first name (optional) */
  firstName?: string;
  /** Updated last name (optional) */
  lastName?: string;
  /** Updated phone number (optional) */
  phoneNumber?: string;
  /** Updated avatar URL (optional) */
  avatar?: string;
}

/**
 * Query parameters for filtering/searching rooms.
 */
export interface RoomQueryParams {
  /** Filter by room type */
  type?: RoomType;
  /** Minimum price per night filter */
  minPrice?: number;
  /** Maximum price per night filter */
  maxPrice?: number;
  /** Minimum guest capacity filter */
  capacity?: number;
  /** Filter for availability status */
  available?: boolean;
}

/**
 * Query parameters for checking room availability in a date range.
 */
export interface AvailableRoomsQuery {
  /** Check-in date in ISO 8601 format */
  startDate: string;
  /** Check-out date in ISO 8601 format */
  endDate: string;
  /** Number of guests */
  guests: number;
}

/**
 * Request payload for creating a new room.
 * Excludes auto-generated fields (id, createdAt, updatedAt).
 */
export interface CreateRoomRequest extends Omit<Room, 'id' | 'createdAt' | 'updatedAt'> {}

/**
 * Request payload for updating an existing room.
 * All room fields are optional except id.
 */
export interface UpdateRoomRequest extends Partial<CreateRoomRequest> {
  /** ID of the room to update */
  id: string;
}

/**
 * Request payload for creating a new reservation.
 */
export interface CreateReservationRequest {
  /** ID of the room to reserve */
  roomId: string;
  /** Check-in date in ISO 8601 format */
  checkInDate: string;
  /** Preferred check-in time (optional) */
  checkInTime?: string;
  /** Check-out date in ISO 8601 format */
  checkOutDate: string;
  /** Preferred check-out time (optional) */
  checkOutTime?: string;
  /** Number of guests for the reservation */
  numberOfGuests: number;
  /** Any special requests or notes (optional) */
  specialRequests?: string;
}

/**
 * Request payload for updating an existing reservation.
 * All fields are optional except id.
 */
export interface UpdateReservationRequest extends Partial<CreateReservationRequest> {
  /** ID of the reservation to update */
  id: string;
}

/**
 * Request payload for creating a Stripe payment intent.
 */
export interface CreatePaymentIntentRequest {
  /** ID of the reservation to create payment for */
  reservationId: string;
  /** Amount to charge in USD */
  amount: number;
}

/**
 * Request payload for confirming a payment.
 */
export interface ConfirmPaymentRequest {
  /** Stripe payment intent ID */
  paymentIntentId: string;
  /** Associated reservation ID */
  reservationId: string;
}

/**
 * Response containing Stripe payment intent details.
 */
export interface PaymentIntentResponse {
  /** Stripe client secret for completing the payment */
  clientSecret: string;
  /** Stripe payment intent ID */
  paymentIntentId: string;
}

/**
 * Request payload for initiating a refund.
 */
export interface RefundRequest {
  /** ID of the payment to refund */
  paymentId: string;
  /** Amount to refund (optional, defaults to full amount) */
  amount?: number;
}

// ============================================================================
// User Preferences Types
// ============================================================================

/**
 * Comprehensive user preferences for personalized booking experience.
 * Includes notification settings, room preferences, accessibility needs,
 * dietary restrictions, and UI preferences.
 */
export interface UserPreferences {
  /** Unique identifier for the preferences record */
  id?: string;
  /** ID of the user these preferences belong to */
  userId?: string;

  // Notification Preferences
  /** Whether to send email notifications */
  emailNotificationsEnabled: boolean;
  /** Whether to send SMS notifications */
  smsNotificationsEnabled: boolean;
  /** Send email confirmation for new bookings */
  bookingConfirmationEmails: boolean;
  /** Opt-in to receive promotional emails */
  promotionalEmails: boolean;
  /** Send email reminders before check-in */
  bookingReminderEmails: boolean;

  // Room Preferences
  /** Preferred bed type (e.g., 'KING', 'QUEEN') */
  preferredBedType?: string;
  /** Preferred floor level (e.g., 'HIGH', 'LOW') */
  preferredFloorLevel?: string;
  /** Preferred room view (e.g., 'OCEAN', 'CITY') */
  preferredRoomView?: string;
  /** Preferred room type (e.g., 'DELUXE', 'SUITE') */
  preferredRoomType?: string;
  /** Preference for quiet rooms away from elevators/ice machines */
  preferQuietRoom: boolean;
  /** Preferred check-in time */
  preferredCheckInTime?: string;
  /** Preferred check-out time */
  preferredCheckOutTime?: string;

  // Accessibility Preferences
  /** Requires wheelchair accessibility features */
  wheelchairAccessible: boolean;
  /** Requires hearing accessibility features */
  hearingAccessible: boolean;
  /** Requires visual accessibility features */
  visualAccessible: boolean;
  /** Additional accessibility requirements */
  otherAccessibilityNeeds?: string;

  // Dietary & Special Requests
  /** List of dietary restrictions (e.g., ['Vegetarian', 'Gluten-Free']) */
  dietaryRestrictions: string[];
  /** List of allergies (e.g., ['Peanuts', 'Shellfish']) */
  allergies: string[];
  /** Default special requests for reservations */
  defaultSpecialRequests?: string;

  // Language & Regional Preferences
  /** Preferred language code (e.g., 'en', 'es') */
  preferredLanguage: string;
  /** Preferred currency code (e.g., 'USD', 'EUR') */
  preferredCurrency: string;
  /** Preferred date format (e.g., 'MM/DD/YYYY', 'DD/MM/YYYY') */
  preferredDateFormat: string;
  /** Preferred time format (e.g., '12h', '24h') */
  preferredTimeFormat: string;

  // UI/UX Preferences
  /** Theme mode preference ('light', 'dark', 'auto') */
  themeMode: string;

  // Timestamps
  /** ISO 8601 timestamp of when preferences were created */
  createdAt?: string;
  /** ISO 8601 timestamp of when preferences were last updated */
  updatedAt?: string;
}

/**
 * Bed type options for room preferences.
 */
export type BedType = 'KING' | 'QUEEN' | 'DOUBLE' | 'TWIN' | 'SINGLE';

/**
 * Floor level preference options.
 */
export type FloorLevel = 'HIGH' | 'MIDDLE' | 'LOW' | 'GROUND';

/**
 * Room view type options.
 */
export type RoomView = 'OCEAN' | 'CITY' | 'GARDEN' | 'MOUNTAIN' | 'POOL' | 'COURTYARD';

/**
 * Request payload for updating user preferences.
 * All fields are optional.
 */
export interface UpdatePreferencesRequest extends Partial<UserPreferences> {}
