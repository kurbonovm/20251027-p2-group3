package com.hotel.reservation.security.oauth2;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import com.hotel.reservation.security.JwtTokenProvider;
import com.hotel.reservation.model.User;
import com.hotel.reservation.repository.UserRepository;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import java.io.IOException;

/**
 * Custom OAuth2 authentication success handler that generates JWT tokens.
 * <p>
 * This handler is invoked after successful OAuth2 authentication with providers
 * like Google or Okta. It retrieves the authenticated user from the database,
 * generates a JWT token, and redirects the user to the frontend with the token.
 * </p>
 *
 * @author Hotel Reservation Team
 * @version 1.0
 */
@Component
public class OAuth2AuthenticationSuccessHandler implements AuthenticationSuccessHandler {

    /**
     * JWT token provider for generating authentication tokens
     */
    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    /**
     * User repository for retrieving user details
     */
    @Autowired
    private UserRepository userRepository;

    /**
     * Frontend application URL for redirect after successful authentication
     */
    @Value("${app.frontend.url:http://localhost}")
    private String frontendUrl;

    /**
     * Handles successful OAuth2 authentication by generating a JWT token and redirecting to frontend.
     * <p>
     * This method extracts the OAuth2 provider and user information from the authentication object,
     * retrieves the corresponding user from the database, generates a JWT token, and redirects
     * the user to the frontend application with the token as a query parameter.
     * </p>
     *
     * @param request the HTTP request
     * @param response the HTTP response for sending redirect
     * @param authentication the successful authentication object containing OAuth2 user details
     * @throws IOException if an input or output error occurs during redirect
     * @throws ServletException if a servlet-related error occurs
     */
    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication) throws IOException, ServletException {
        // Get the provider from the OAuth2AuthenticationToken
        String provider = "google"; // default
        if (authentication instanceof OAuth2AuthenticationToken) {
            OAuth2AuthenticationToken oauthToken = (OAuth2AuthenticationToken) authentication;
            provider = oauthToken.getAuthorizedClientRegistrationId(); // "google" or "okta"
        }

        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();
        String providerId = oAuth2User.getAttribute("sub");

        System.out.println("OAuth2 Success Handler - Provider: " + provider + ", ProviderId: " + providerId);

        User user = userRepository.findByProviderAndProviderId(provider, providerId).orElse(null);

        if (user == null) {
            System.err.println("ERROR: User not found for provider=" + provider + ", providerId=" + providerId);
            // Try to find all users to debug
            System.out.println("Total users in database: " + userRepository.count());

            // Debug: Print all users
            userRepository.findAll().forEach(u -> {
                System.out.println("DB User: provider='" + u.getProvider() + "', providerId='" + u.getProviderId() + "', email=" + u.getEmail());
            });
        } else {
            System.out.println("User found: " + user.getEmail() + ", ID: " + user.getId());
        }

        String token = user != null ? jwtTokenProvider.generateTokenFromUserId(user.getId()) : "";

        System.out.println("Generated token length: " + token.length());

        response.sendRedirect(frontendUrl + "/oauth2/callback?token=" + token);
    }
}
