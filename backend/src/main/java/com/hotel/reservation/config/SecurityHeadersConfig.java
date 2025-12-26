package com.hotel.reservation.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * Security headers filter to add protective HTTP headers.
 * Implements OWASP recommended security headers.
 *
 * @author Hotel Reservation Team
 * @version 1.0
 */
@Component
public class SecurityHeadersConfig extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        // Prevent clickjacking attacks
        response.setHeader("X-Frame-Options", "DENY");

        // Prevent MIME type sniffing
        response.setHeader("X-Content-Type-Options", "nosniff");

        // Enable XSS protection in browsers
        response.setHeader("X-XSS-Protection", "1; mode=block");

        // Strict Transport Security (HSTS) - enforce HTTPS
        // Note: Only enable in production with HTTPS
        if (request.isSecure()) {
            response.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
        }

        // Content Security Policy - restrict resource loading
        response.setHeader("Content-Security-Policy",
            "default-src 'self'; " +
            "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com; " +
            "style-src 'self' 'unsafe-inline'; " +
            "img-src 'self' data: https:; " +
            "font-src 'self' data:; " +
            "connect-src 'self' https://api.stripe.com; " +
            "frame-src 'self' https://js.stripe.com https://hooks.stripe.com;");

        // Referrer Policy - control referrer information
        response.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");

        // Permissions Policy - control browser features
        response.setHeader("Permissions-Policy",
            "geolocation=(), microphone=(), camera=(), payment=(self)");

        filterChain.doFilter(request, response);
    }
}
