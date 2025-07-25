package com.hrms.backend.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import com.hrms.backend.entity.Role;
import com.hrms.backend.service.UserDetailsServiceImpl;

@Component
public class CustomAuthenticationProvider implements AuthenticationProvider {
	
	//private final UserDetailsServiceImpl userDetailsService; // Injected but not directly used in `authenticate` for hardcoded admin
    //private final PasswordEncoder passwordEncoder; // Injected but not directly used for hardcoded admin's password check

    @Value("${app.admin.username}")
    private String adminUsername;
    @Value("${app.admin.password}")
    private String adminPassword;
    
    // No constructor injection needed for UserDetailsServiceImpl or PasswordEncoder
    // because this provider only handles the hardcoded admin's direct credentials.
    public CustomAuthenticationProvider() {
        // Default constructor
    }
    /*
    public CustomAuthenticationProvider(UserDetailsServiceImpl userDetailsService, PasswordEncoder passwordEncoder) {
        this.userDetailsService = userDetailsService;
        this.passwordEncoder = passwordEncoder;
    }*/

    @Override
    public Authentication authenticate(Authentication authentication) throws AuthenticationException {
        String username = authentication.getName();
        String rawPassword = authentication.getCredentials().toString();

        // 1. Check for the hardcoded main admin credentials
        if (username.equals(adminUsername) && rawPassword.equals(adminPassword)) {
            // Create UserDetailsImpl directly for the hardcoded admin
            // Use a placeholder ID (e.g., 0L) as it's not from the database
            UserDetails adminUserDetails = new UserDetailsImpl(
                    0L, // Placeholder ID for hardcoded admin
                    adminUsername,
                    adminPassword, // Store raw password for this specific case (it won't be hashed here)
                    Role.ADMIN.name() // Pass the role name as a string (e.g., "ADMIN")
            );
            // Return a fully authenticated token
            return new UsernamePasswordAuthenticationToken(adminUserDetails, rawPassword, adminUserDetails.getAuthorities());
        }

        // If it's not the hardcoded admin, return null.
        // This is crucial: it tells Spring Security to try the next AuthenticationProvider in the chain
        // (which will be your DaoAuthenticationProvider for database users).
        // DO NOT throw an exception here unless you want to stop the authentication process for non-admin users.
        return null;
    }

    @Override
    public boolean supports(Class<?> authentication) {
        return UsernamePasswordAuthenticationToken.class.isAssignableFrom(authentication);
    }

}
