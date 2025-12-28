package com.hotel.reservation.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

/**
 * Global exception handler for REST API.
 * Provides consistent error responses across the application.
 *
 * @author Hotel Reservation Team
 * @version 1.0
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    /**
     * Handle validation errors.
     *
     * @param ex validation exception
     * @return error response with field-specific messages
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidationExceptions(
            MethodArgumentNotValidException ex) {

        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getAllErrors().forEach((error) -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            errors.put(fieldName, errorMessage);
        });

        Map<String, Object> response = new HashMap<>();
        response.put("timestamp", LocalDateTime.now());
        response.put("status", HttpStatus.BAD_REQUEST.value());
        response.put("errors", errors);
        response.put("message", "Validation failed");

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }

    /**
     * Handle bad credentials exception.
     *
     * @param ex bad credentials exception
     * @return error response
     */
    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<Map<String, Object>> handleBadCredentials(BadCredentialsException ex) {
        return buildErrorResponse(HttpStatus.UNAUTHORIZED, "Invalid email or password");
    }

    /**
     * Handle user not found exception.
     *
     * @param ex username not found exception
     * @return error response
     */
    @ExceptionHandler(UsernameNotFoundException.class)
    public ResponseEntity<Map<String, Object>> handleUserNotFound(UsernameNotFoundException ex) {
        return buildErrorResponse(HttpStatus.NOT_FOUND, ex.getMessage());
    }

    /**
     * Handle access denied exception (403 Forbidden).
     *
     * @param ex access denied exception
     * @return error response
     */
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<Map<String, Object>> handleAccessDenied(AccessDeniedException ex) {
        return buildErrorResponse(HttpStatus.FORBIDDEN, "Access denied");
    }

    /**
     * Handle authentication exception (401 Unauthorized).
     *
     * @param ex authentication exception
     * @return error response
     */
    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<Map<String, Object>> handleAuthenticationException(AuthenticationException ex) {
        return buildErrorResponse(HttpStatus.UNAUTHORIZED, "Authentication failed");
    }

    /**
     * Handle illegal argument exception (400 Bad Request).
     *
     * @param ex illegal argument exception
     * @return error response
     */
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, Object>> handleIllegalArgumentException(IllegalArgumentException ex) {
        return buildErrorResponse(HttpStatus.BAD_REQUEST, ex.getMessage());
    }

    /**
     * Handle room not available exception (409 Conflict).
     * This occurs when attempting to book a room that's already booked or being booked.
     *
     * @param ex room not available exception
     * @return error response
     */
    @ExceptionHandler(RoomNotAvailableException.class)
    public ResponseEntity<Map<String, Object>> handleRoomNotAvailableException(RoomNotAvailableException ex) {
        return buildErrorResponse(HttpStatus.CONFLICT, ex.getMessage());
    }

    /**
     * Handle pending reservation exists exception (409 Conflict).
     * This occurs when a user tries to create a new reservation while they already have a pending one.
     * Returns the existing reservation ID so the client can redirect to payment.
     *
     * @param ex pending reservation exists exception
     * @return error response with existing reservation ID
     */
    @ExceptionHandler(PendingReservationExistsException.class)
    public ResponseEntity<Map<String, Object>> handlePendingReservationExistsException(PendingReservationExistsException ex) {
        Map<String, Object> response = new HashMap<>();
        response.put("timestamp", LocalDateTime.now());
        response.put("status", HttpStatus.CONFLICT.value());
        response.put("message", ex.getMessage());
        response.put("existingReservationId", ex.getExistingReservationId());

        return ResponseEntity.status(HttpStatus.CONFLICT).body(response);
    }

    /**
     * Handle generic runtime exceptions.
     *
     * @param ex runtime exception
     * @return error response
     */
    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Map<String, Object>> handleRuntimeException(RuntimeException ex) {
        // Log full error for debugging but don't expose to client
        org.slf4j.LoggerFactory.getLogger(GlobalExceptionHandler.class)
            .error("Runtime exception occurred", ex);
        return buildErrorResponse(HttpStatus.INTERNAL_SERVER_ERROR,
            "An error occurred while processing your request. Please try again later.");
    }

    /**
     * Handle all other exceptions.
     *
     * @param ex exception
     * @return error response
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleGenericException(Exception ex) {
        // Log full error for debugging but don't expose to client
        org.slf4j.LoggerFactory.getLogger(GlobalExceptionHandler.class)
            .error("Unexpected exception occurred", ex);
        return buildErrorResponse(HttpStatus.INTERNAL_SERVER_ERROR,
                "An unexpected error occurred. Please contact support if this persists.");
    }

    /**
     * Build a standardized error response.
     *
     * @param status HTTP status
     * @param message error message
     * @return error response map
     */
    private ResponseEntity<Map<String, Object>> buildErrorResponse(HttpStatus status, String message) {
        Map<String, Object> response = new HashMap<>();
        response.put("timestamp", LocalDateTime.now());
        response.put("status", status.value());
        response.put("message", message);

        return ResponseEntity.status(status).body(response);
    }
}
