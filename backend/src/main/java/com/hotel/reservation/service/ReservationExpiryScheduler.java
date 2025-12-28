package com.hotel.reservation.service;

import com.hotel.reservation.model.Reservation;
import com.hotel.reservation.repository.ReservationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Scheduled service to automatically cancel expired pending reservations.
 * Runs every minute to check for and cancel reservations that have exceeded
 * their 5-minute payment window.
 *
 * @author Hotel Reservation Team
 * @version 1.0
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ReservationExpiryScheduler {

    private final ReservationRepository reservationRepository;

    /**
     * Scheduled task to cancel expired pending reservations.
     * Runs every minute (60000 milliseconds).
     *
     * This ensures that pending reservations without payment are automatically
     * cancelled after 5 minutes, freeing up rooms for other guests.
     */
    @Scheduled(fixedRate = 60000) // Run every 60 seconds
    @Transactional
    public void cancelExpiredReservations() {
        LocalDateTime now = LocalDateTime.now();

        // Find all pending reservations that have expired
        List<Reservation> expiredReservations = reservationRepository.findAll().stream()
                .filter(reservation ->
                    reservation.getStatus() == Reservation.ReservationStatus.PENDING &&
                    reservation.getExpiresAt() != null &&
                    reservation.getExpiresAt().isBefore(now))
                .toList();

        if (!expiredReservations.isEmpty()) {
            log.info("Found {} expired pending reservation(s) to cancel", expiredReservations.size());

            for (Reservation reservation : expiredReservations) {
                reservation.setStatus(Reservation.ReservationStatus.CANCELLED);
                reservation.setCancellationReason("Reservation expired - payment not completed within 5 minutes");
                reservation.setCancelledAt(now);
                reservationRepository.save(reservation);

                log.info("Auto-cancelled reservation {} for user {} (expired at {})",
                    reservation.getId(),
                    reservation.getUser().getEmail(),
                    reservation.getExpiresAt());
            }
        }
    }
}
