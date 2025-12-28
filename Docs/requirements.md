# Project Two: Reservation System

You’ve made it to the next step in your quest for knowledge in full-stack Java development! In this challenge, you will develop and present a development project. Below you'll be given project requirements and will need to design and develop an enterprise solution. This exercise will better prepare you for the real-world project!

**Note:** You must upload your project artifacts in a link to your publicly-accessible GitHub URL on this assignment page to earn credit.

## What We're Looking For

* Technical Architecture and Design
* User Interface and Experience
* Functional and Non-Functional Requirements Met
* Structured Development Approach

---

## Hotel Reservation System

### Objective

Develop a hotel reservation platform that streamlines the booking process for guests while providing hotel administrators and employees with tools for managing room availability, reservations, and amenities. The system should feature a secure and responsive user interface for both guests and employees. This platform should provide secure authentication for users with effective role-based access. This frontend, backend, and database should all be deployed to AWS.

### Functional Requirements

#### User Management

* **Authentication & Authorization:** Implement OAuth2-based authentication using Spring Security. Users can sign in via third-party providers (Google, Okta). The system supports both standard OAuth2 (Google) and OpenID Connect/OIDC (Okta) for enterprise authentication.
* **Role-Based Access Control:** Define roles such as Guest, Administrator, and Hotel Manager, with each role having distinct permissions (e.g., guests can book rooms, while administrators can manage room inventory and reservations).
* **User Profiles:** Enable users to view and update their personal information, including saved bookings, payment details, and preferences.

#### Room Management

* **Add/Edit/Delete Rooms:** Hotel managers can define room types, pricing, amenities, and availability. Changes should reflect dynamically on the frontend.
* **Room Availability:** Ensure that guests can view real-time room availability during their reservation process.
* **Capacity Limits:** Rooms should have maximum guest capacities, and the system should enforce these constraints when processing bookings.

#### Reservation Management

* **Room Booking:** Allow users to select dates, room type, and number of guests. Prevent overbooking by validating availability.
* **Reservation Details:** Guests can view upcoming and past reservations, cancel bookings within policy limits, and receive confirmation emails.
* **Modify Reservations:** Implement functionality for guests to modify reservation details (e.g., change dates or room type) based on availability.
* **Reservation Search:** Provide a dashboard for admins to search, filter, and manage all hotel reservations.

#### Payment Processing

* Simulate guest payments with transaction IDs, secure payment method storage, and payment status updates.
* **Alternatively, use Stripe API to manage and process payments.** * **Integration with Stripe:** Securely process payments, support multiple payment methods (ie. credit cards, digital wallets), and implement payment notifications, refunds, and receipts using Stripe.
* **Transaction Management:** Allow admins to view transaction history, payment statuses, and generate financial reports.
* **Capacity Reports:** Generate reports on warehouse utilization, showing trends in capacity usage over time.

#### User Interface (UI) & User Experience (UX)

* **Responsive Design:** Ensure the system is fully functional across desktop, tablet, and mobile devices.
* **Intuitive Navigation:** Ensure that the UI is easy to navigate, with clearly labeled sections and buttons. Utilize breadcrumbs, collapsible menus, and tabs where appropriate.
* **Search and Filter:** Provide advanced search and filter options across room listings to help users quickly find the room they're searching for.
* **Error Handling:** Display user-friendly error messages for common edge cases (ie. room overbooking, invalid payment details).

#### Edge Case Handling

* **Overbooking Prevention:** Handle multiple guests attempting to book the same room at the same time.
* **Payment Failures:** Provide retry options and fallback mechanisms for failed payment attempts.
* **Session Expiration:** Notify users of session timeouts during reservation to prevent data loss.

### Technical Requirements

Must be a full-stack solution consisting of:

* Java with Spring Boot
* MongoDB with DocumentDb on AWS
* React with Redux and RTK Query
* Project should be fully deployed to AWS
* Code should be available to a public GitHub repository
* Possesses all required CRUD functionality
* Handles edge cases effectively

### Non-Functional Requirements

* Well documented code (JavaDocs/JSDoc)
* Code upholds industry best practices (SOLID/DRY)
* Industry-Grade UI (User Interface)
* Intuitive UX (User Experience)