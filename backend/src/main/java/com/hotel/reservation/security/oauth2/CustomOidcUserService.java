package com.hotel.reservation.security.oauth2;

import com.hotel.reservation.model.User;
import com.hotel.reservation.repository.UserRepository;
import org.springframework.security.oauth2.client.oidc.userinfo.OidcUserRequest;
import org.springframework.security.oauth2.client.oidc.userinfo.OidcUserService;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.stereotype.Service;

/**
 * Custom OIDC user service for processing OpenID Connect user information.
 * <p>
 * This service extends Spring Security's OidcUserService to handle OIDC-compliant
 * OAuth2 providers (like Okta). It loads user information from the OIDC provider,
 * creates or updates the user in the database, and ensures the user's profile
 * is synchronized with the provider's data.
 * </p>
 *
 * @author Hotel Reservation Team
 * @version 1.0
 */
@Service
public class CustomOidcUserService extends OidcUserService {
    /**
     * User repository for storing and retrieving user data
     */
    private final UserRepository userRepository;

    /**
     * Constructs a new CustomOidcUserService with the specified user repository.
     *
     * @param userRepository the user repository for database operations
     */
    public CustomOidcUserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    /**
     * Loads and processes OIDC user information from the OAuth2 provider.
     * <p>
     * This method retrieves user attributes from the OIDC provider (like Okta),
     * checks if the user exists in the database, and either creates a new user
     * or updates the existing user's profile. All users are assigned the GUEST role by default.
     * </p>
     *
     * @param userRequest the OIDC user request containing provider information
     * @return the OIDC user object with claims and attributes
     */
    @Override
    public OidcUser loadUser(OidcUserRequest userRequest) {
        System.out.println("=== CustomOidcUserService.loadUser called ===");
        OidcUser oidcUser = super.loadUser(userRequest);

        String provider = userRequest.getClientRegistration().getRegistrationId(); // "okta"
        System.out.println("Provider: " + provider);

        // Extract user attributes
        String providerId = oidcUser.getAttribute("sub");
        String email = oidcUser.getAttribute("email");
        String givenName = oidcUser.getAttribute("given_name");
        String familyName = oidcUser.getAttribute("family_name");
        String avatar = oidcUser.getAttribute("picture");

        System.out.println("User info: email=" + email + ", givenName=" + givenName + ", familyName=" + familyName);

        User user = userRepository.findByProviderAndProviderId(provider, providerId)
                .orElseGet(() -> {
                    User newUser = new User();
                    newUser.setProvider(provider);
                    newUser.setProviderId(providerId);
                    newUser.setEmail(email);
                    newUser.setFirstName(givenName != null ? givenName : "");
                    newUser.setLastName(familyName != null ? familyName : "");
                    newUser.setAvatar(avatar);
                    newUser.setEnabled(true);
                    newUser.getRoles().add(User.Role.GUEST);
                    return newUser;
                });

        // Update user info if changed
        user.setEmail(email);
        user.setFirstName(givenName != null ? givenName : "");
        user.setLastName(familyName != null ? familyName : "");
        user.setAvatar(avatar);
        user.setProvider(provider);
        user.setProviderId(providerId);
        user.setEnabled(true);

        User savedUser = userRepository.save(user);
        System.out.println("User saved: ID=" + savedUser.getId() + ", provider=" + savedUser.getProvider() + ", providerId=" + savedUser.getProviderId());

        return oidcUser;
    }
}
