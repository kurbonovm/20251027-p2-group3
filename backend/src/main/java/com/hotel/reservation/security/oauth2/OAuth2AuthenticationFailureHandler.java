package com.hotel.reservation.security.oauth2;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.authentication.AuthenticationFailureHandler;
import org.springframework.stereotype.Component;
import org.springframework.beans.factory.annotation.Value;

import java.io.IOException;

/**
 * Custom OAuth2 authentication failure handler for handling failed OAuth2 login attempts.
 * <p>
 * This handler is invoked when OAuth2 authentication fails for any reason (provider errors,
 * network issues, invalid credentials, etc.). It redirects the user back to the frontend
 * login page with an error parameter to display an appropriate error message.
 * </p>
 *
 * @author Hotel Reservation Team
 * @version 1.0
 */
@Component
public class OAuth2AuthenticationFailureHandler implements AuthenticationFailureHandler {

    /**
     * Frontend application URL for redirect after failed authentication
     */
    @Value("${app.frontend.url:http://localhost}")
    private String frontendUrl;

    /**
     * Handles OAuth2 authentication failures by redirecting to the frontend login page with error.
     * <p>
     * This method is called when OAuth2 authentication fails. It redirects the user to
     * the frontend application's login page with an error query parameter that can be
     * used to display a user-friendly error message.
     * </p>
     *
     * @param request the HTTP request
     * @param response the HTTP response for sending redirect
     * @param exception the authentication exception that caused the failure
     * @throws IOException if an input or output error occurs during redirect
     * @throws ServletException if a servlet-related error occurs
     */
    @Override
    public void onAuthenticationFailure(HttpServletRequest request, HttpServletResponse response, AuthenticationException exception) throws IOException, ServletException {
        // Redirect to frontend with error
        response.sendRedirect(frontendUrl + "/login?error=oauth2_failed");
    }
}
