package com.hotel.reservation.security.oauth2;

import com.hotel.reservation.model.User;
import com.hotel.reservation.repository.UserRepository;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

/**
 * Custom OAuth2 user service for processing standard OAuth2 user information.
 * <p>
 * This service extends Spring Security's DefaultOAuth2UserService to handle
 * OAuth2 providers (like Google and Okta). It loads user information from the
 * OAuth2 provider, maps provider-specific attributes to the User model, and
 * creates or updates the user in the database. The service handles different
 * attribute mappings for various OAuth2 providers.
 * </p>
 *
 * @author Hotel Reservation Team
 * @version 1.0
 */
@Service
public class CustomOAuth2UserService extends DefaultOAuth2UserService {
    /**
     * User repository for storing and retrieving user data
     */
    private final UserRepository userRepository;

    /**
     * Constructs a new CustomOAuth2UserService with the specified user repository.
     *
     * @param userRepository the user repository for database operations
     */
    public CustomOAuth2UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    /**
     * Loads and processes OAuth2 user information from the OAuth2 provider.
     * <p>
     * This method retrieves user attributes from OAuth2 providers (Google, Okta),
     * maps provider-specific attributes to our User model, and either creates a new
     * user or updates an existing user's profile. Provider-specific attribute mappings
     * are applied (e.g., Google uses "given_name"/"family_name", Okta uses "name").
     * All users are assigned the GUEST role by default.
     * </p>
     *
     * @param userRequest the OAuth2 user request containing provider information
     * @return the OAuth2 user object with authorities and attributes
     */
    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) {
        System.out.println("=== CustomOAuth2UserService.loadUser called ===");
        OAuth2User oAuth2User = super.loadUser(userRequest);

        String provider = userRequest.getClientRegistration().getRegistrationId(); // "google" or "okta"
        System.out.println("Provider: " + provider);

        // Extract user attributes based on provider
        String providerId;
        String email;
        String firstName;
        String lastName;
        String avatar;

        if ("okta".equals(provider)) {
            // Okta attribute mapping
            providerId = oAuth2User.getAttribute("sub");
            email = oAuth2User.getAttribute("email");
            String name = oAuth2User.getAttribute("name");
            // Okta provides "name" as full name, split it
            if (name != null && name.contains(" ")) {
                String[] nameParts = name.split(" ", 2);
                firstName = nameParts[0];
                lastName = nameParts.length > 1 ? nameParts[1] : "";
            } else {
                firstName = name != null ? name : "";
                lastName = "";
            }
            // Okta may provide preferred_username or picture
            avatar = oAuth2User.getAttribute("picture");
        } else {
            // Google attribute mapping (default)
            providerId = oAuth2User.getAttribute("sub");
            email = oAuth2User.getAttribute("email");
            firstName = oAuth2User.getAttribute("given_name");
            lastName = oAuth2User.getAttribute("family_name");
            avatar = oAuth2User.getAttribute("picture");
        }

        User user = userRepository.findByProviderAndProviderId(provider, providerId)
                .orElseGet(() -> {
                    User newUser = new User();
                    newUser.setProvider(provider);
                    newUser.setProviderId(providerId);
                    newUser.setEmail(email);
                    newUser.setFirstName(firstName);
                    newUser.setLastName(lastName);
                    newUser.setAvatar(avatar);
                    newUser.setEnabled(true);
                    newUser.getRoles().add(User.Role.GUEST);
                    return newUser;
                });

        // Update user info if changed
        user.setEmail(email);
        user.setFirstName(firstName);
        user.setLastName(lastName);
        user.setAvatar(avatar);
        user.setProvider(provider);
        user.setProviderId(providerId);
        user.setEnabled(true);

        User savedUser = userRepository.save(user);
        System.out.println("User saved: ID=" + savedUser.getId() + ", provider=" + savedUser.getProvider() + ", providerId=" + savedUser.getProviderId());

        // Return a principal for Spring Security
        return new org.springframework.security.oauth2.core.user.DefaultOAuth2User(
                oAuth2User.getAuthorities(),
                oAuth2User.getAttributes(),
                "sub"
        );
    }
}
