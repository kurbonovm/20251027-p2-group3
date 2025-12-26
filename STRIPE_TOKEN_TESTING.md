# Stripe Token-Based Payment Testing Guide

## Overview

The Manager-Assisted Booking feature now uses **secure, token-based payments** instead of handling raw card data server-side. This approach is **PCI-compliant** and significantly reduces security risk.

---

## What Changed?

### Before (❌ Insecure)
- Card data (number, CVC, expiry) sent directly to server
- Required PCI-DSS Level 1 compliance
- High security risk if breached
- Raw card data handled in [ManagerBookingRequest.java](backend/src/main/java/com/hotel/reservation/dto/ManagerBookingRequest.java)

### After (✅ Secure)
- Only Stripe payment method tokens sent to server
- Card data never touches our server
- Minimal PCI compliance requirements (SAQ-A)
- Tokens handled in [TokenBookingRequest.java](backend/src/main/java/com/hotel/reservation/dto/TokenBookingRequest.java)

---

## How It Works

### Flow Diagram
```
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│   Browser   │         │  Our Server  │         │   Stripe    │
└──────┬──────┘         └──────┬───────┘         └──────┬──────┘
       │                       │                        │
       │  1. Select test       │                        │
       │     payment token     │                        │
       │                       │                        │
       │  2. POST /bookings/   │                        │
       │     assisted-token    │                        │
       │     {paymentMethodId} │                        │
       ├──────────────────────>│                        │
       │                       │                        │
       │                       │  3. Create Payment     │
       │                       │     Intent with token  │
       │                       ├───────────────────────>│
       │                       │                        │
       │                       │  4. Charge succeeded   │
       │                       │<───────────────────────┤
       │                       │                        │
       │  5. Success response  │                        │
       │<──────────────────────┤                        │
       │                       │                        │
```

---

## Available Test Payment Methods

When testing the Manager-Assisted Booking feature, use these Stripe test tokens:

| Token ID | Card Type | Card Number | Description |
|----------|-----------|-------------|-------------|
| `pm_card_visa` | Visa | 4242 4242 4242 4242 | Always succeeds |
| `pm_card_visa_debit` | Visa Debit | 4000 0566 5566 5556 | Always succeeds |
| `pm_card_mastercard` | Mastercard | 5555 5555 5555 4444 | Always succeeds |
| `pm_card_amex` | American Express | 3782 822463 10005 | Always succeeds |
| `pm_card_discover` | Discover | 6011 1111 1111 1117 | Always succeeds |
| `pm_card_diners` | Diners Club | 3056 9300 0902 0004 | Always succeeds |
| `pm_card_jcb` | JCB | 3566 0020 2036 0505 | Always succeeds |

### Special Test Tokens (For Error Testing)

| Token ID | Behavior |
|----------|----------|
| `pm_card_chargeDeclined` | Charge will be declined |
| `pm_card_chargeDeclinedInsufficientFunds` | Insufficient funds error |
| `pm_card_chargeDeclinedFraudulent` | Fraudulent charge error |

---

## Testing Instructions

### 1. Access the Manager-Assisted Booking Page

Navigate to: `/admin/assisted-booking`

### 2. Fill Out the Form

#### Customer Information
```
Email: test@example.com
First Name: John
Last Name: Doe
Phone: +1 (555) 123-4567
```

#### Booking Details
```
Room: Select any available room
Check-in: Tomorrow's date
Check-out: Date after check-in
Guests: 2
Special Requests: (optional)
```

#### Payment Method
```
Test Payment Method: pm_card_visa (Test Visa)
```

### 3. Submit the Form

Click **"Create Booking & Charge Card"**

### 4. Expected Result

✅ **Success Response:**
```json
{
  "reservation": {
    "id": "abc123...",
    "status": "CONFIRMED",
    ...
  },
  "payment": {
    "id": "pay_xyz...",
    "amount": 299.99,
    "status": "SUCCEEDED",
    "cardBrand": "visa",
    "cardLast4": "4242"
  },
  "customerId": "user_abc...",
  "message": "Booking created successfully and payment processed securely"
}
```

---

## Code Implementation

### Backend Files

#### 1. [TokenBookingRequest.java](backend/src/main/java/com/hotel/reservation/dto/TokenBookingRequest.java)
```java
public class TokenBookingRequest {
    @NotBlank(message = "Payment method token is required")
    @Pattern(regexp = "^pm_[a-zA-Z0-9_]+$", message = "Invalid payment method ID format")
    private String paymentMethodId;
    // ... other fields
}
```

#### 2. [PaymentService.java:207-271](backend/src/main/java/com/hotel/reservation/service/PaymentService.java#L207-L271)
```java
@Transactional
public Payment processTokenPayment(Reservation reservation, String paymentMethodId)
    throws StripeException {

    PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
        .setAmount(amountInCents)
        .setCurrency("usd")
        .setPaymentMethod(paymentMethodId)  // SECURE: Token instead of card data
        .setConfirm(true)
        .build();

    PaymentIntent paymentIntent = PaymentIntent.create(params);
    // ... create payment record
}
```

#### 3. [AdminController.java:276-379](backend/src/main/java/com/hotel/reservation/controller/AdminController.java#L276-L379)
```java
@PostMapping("/bookings/assisted-token")
@PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
public ResponseEntity<?> createAssistedBookingWithToken(
    @Valid @RequestBody TokenBookingRequest request) {

    // Process payment with token (card data never touched server)
    Payment payment = paymentService.processTokenPayment(
        reservation,
        request.getPaymentMethodId()
    );
    // ...
}
```

### Frontend Files

#### 1. [AssistedBooking.tsx:201-209](frontend/src/pages/admin/AssistedBooking.tsx#L201-L209)
```typescript
const testPaymentMethods = [
  { value: 'pm_card_visa', label: 'Test Visa (4242 4242 4242 4242)' },
  { value: 'pm_card_mastercard', label: 'Test Mastercard (5555 5555 5555 4444)' },
  { value: 'pm_card_amex', label: 'Test American Express (3782 822463 10005)' },
  // ...
];
```

#### 2. [adminApi.ts:148-155](frontend/src/features/admin/adminApi.ts#L148-L155)
```typescript
createAssistedBookingToken: builder.mutation<ManagerBookingResponse, TokenBookingRequest>({
  query: (bookingData) => ({
    url: '/admin/bookings/assisted-token',
    method: 'POST',
    body: bookingData,
  }),
  invalidatesTags: ['Reservation', 'Room', 'Admin'],
}),
```

---

## Security Benefits

### ✅ What's Protected

1. **No Card Data Exposure**: Card numbers, CVC, expiry never sent to our server
2. **PCI Compliance**: Reduced scope from Level 1 to SAQ-A (simplest questionnaire)
3. **Data Breach Protection**: Even if our database is breached, no card data is exposed
4. **Stripe's Security**: Leverages Stripe's PCI-certified infrastructure
5. **Token Validation**: Backend validates token format with regex pattern

### 🔒 Additional Security Layers

- Jakarta Bean Validation on all fields
- Business logic validation (dates, amounts)
- Role-based access control (ADMIN/MANAGER only)
- HTTPS encryption in transit
- Webhook signature verification for Stripe events

---

## Production Implementation

For production use, replace the test token dropdown with **Stripe.js client-side tokenization**:

### Option 1: Stripe Elements (Recommended)

```javascript
import { loadStripe } from '@stripe/stripe-js';
import { CardElement, Elements, useStripe, useElements } from '@stripe/react-stripe-js';

const stripePromise = loadStripe('pk_live_YOUR_PUBLIC_KEY');

function CheckoutForm() {
  const stripe = useStripe();
  const elements = useElements();

  const handleSubmit = async (event) => {
    event.preventDefault();

    // Create payment method from card element
    const {error, paymentMethod} = await stripe.createPaymentMethod({
      type: 'card',
      card: elements.getElement(CardElement),
    });

    if (error) {
      console.error(error);
    } else {
      // Send paymentMethod.id to your server
      const response = await fetch('/api/admin/bookings/assisted-token', {
        method: 'POST',
        body: JSON.stringify({
          ...bookingData,
          paymentMethodId: paymentMethod.id  // SECURE TOKEN
        })
      });
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <CardElement />
      <button type="submit" disabled={!stripe}>Pay</button>
    </form>
  );
}
```

### Option 2: Stripe Checkout (Easiest)

For the simplest integration, use [Stripe Checkout](https://stripe.com/docs/payments/checkout) which handles the entire payment UI:

```java
// Backend: Create checkout session
SessionCreateParams params = SessionCreateParams.builder()
  .setMode(SessionCreateParams.Mode.PAYMENT)
  .setSuccessUrl("https://example.com/success")
  .setCancelUrl("https://example.com/cancel")
  .addLineItem(
    SessionCreateParams.LineItem.builder()
      .setQuantity(1L)
      .setPriceData(
        SessionCreateParams.LineItem.PriceData.builder()
          .setCurrency("usd")
          .setUnitAmount(totalAmountInCents)
          .setProductData(
            SessionCreateParams.LineItem.PriceData.ProductData.builder()
              .setName("Hotel Reservation")
              .build())
          .build())
      .build())
  .build();

Session session = Session.create(params);
// Return session.getId() to frontend
```

---

## Troubleshooting

### Issue: "Invalid payment method ID format"

**Cause**: Payment method token doesn't match pattern `^pm_[a-zA-Z0-9_]+$`

**Solution**: Ensure you're using a valid Stripe test token from the list above

---

### Issue: "Payment failed with status: requires_action"

**Cause**: Payment requires 3D Secure authentication

**Solution**: Use test tokens without 3DS (e.g., `pm_card_visa`) or implement 3DS flow

---

### Issue: "Stripe API key not configured"

**Cause**: Missing `STRIPE_API_KEY` in environment variables

**Solution**:
```bash
# backend/.env
STRIPE_API_KEY=sk_test_YOUR_SECRET_KEY
STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET
```

---

## References

- [Stripe Test Cards](https://stripe.com/docs/testing)
- [Stripe Payment Methods](https://stripe.com/docs/payments/payment-methods)
- [PCI Compliance Guide](https://stripe.com/docs/security/guide)
- [Stripe Elements Documentation](https://stripe.com/docs/stripe-js)

---

## Summary

✅ **Implemented**: Token-based payment processing
✅ **Security**: PCI-compliant, no raw card data on server
✅ **Testing**: Use `pm_card_*` tokens for testing
✅ **Production**: Integrate Stripe.js or Checkout for real payments

**Implementation Date**: 2025-12-26
**Status**: ✅ Complete and Ready for Testing
