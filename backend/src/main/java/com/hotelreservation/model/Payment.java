package com.hotelreservation.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

/**
 * Payment model representing payment transactions.
 * Tracks payment status, method, and transaction details.
 */
@Document(collection = "payments")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Payment {

    @Id
    private String id;

    private String reservationId;

    private String guestId;

    private double amount;

    private PaymentMethod paymentMethod;

    private PaymentStatus status;

    private String transactionId;

    private String stripePaymentIntentId;

    private String currency;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    private LocalDateTime paidAt;

    private String failureReason;

    private int retryCount;

    /**
     * Supported payment methods
     */
    public enum PaymentMethod {
        CREDIT_CARD,
        DEBIT_CARD,
        DIGITAL_WALLET,
        SIMULATED
    }

    /**
     * Payment status tracking
     */
    public enum PaymentStatus {
        PENDING,
        PROCESSING,
        SUCCESS,
        FAILED,
        REFUNDED,
        CANCELLED
    }
}
