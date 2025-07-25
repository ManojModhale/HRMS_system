package com.hrms.backend.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.hrms.backend.config.JwtUtils;
import com.hrms.backend.config.UserDetailsImpl;
import com.hrms.backend.dto.LoginRequest;
import com.hrms.backend.dto.LoginResponse;
import com.hrms.backend.dto.MessageResponse;
import com.hrms.backend.dto.RegisterRequest;
import com.hrms.backend.dto.RegisterResponse;
import com.hrms.backend.entity.Contact;
import com.hrms.backend.entity.Role;
import com.hrms.backend.entity.User;
import com.hrms.backend.service.UserService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "https://hrms-system-frontend.onrender.com", maxAge = 3600)
public class AuthController {
	
	private static final Logger logger = LoggerFactory.getLogger(AuthController.class);

    @Autowired
    AuthenticationManager authenticationManager; // From SecurityConfig

    @Autowired
    UserService userService; // Our custom UserService

    @Autowired
    JwtUtils jwtUtils; // Our JWT utility

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        logger.info("Attempting login for user: {}", loginRequest.getUsername());
        try {
        	// 1. Authenticate user credentials
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(loginRequest.getUsername(), loginRequest.getPassword()));

            // 2. Set authentication in Security Context
            SecurityContextHolder.getContext().setAuthentication(authentication);
            
            // 3. Generate JWT token
            String jwt = jwtUtils.generateJwtToken(authentication);

            // 4. Extract user details and role for response
            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();

            // Get the single role string for LoginResponse
            String role = userDetails.getAuthorities().stream()
                                        .findFirst() // Get the first (and only) authority
                                        //.map(GrantedAuthority::getAuthority)
                                        .map(grantedAuthority -> grantedAuthority.getAuthority().replace("ROLE_", ""))
                                        .orElse("UNKNOWN_ROLE"); // Default if no role found

            // Remove "ROLE_" prefix for frontend consumption if desired, or keep it.
            // For simplicity, let's remove it for the DTO but keep it in JWT claims.
            //String cleanedRole = role.startsWith("ROLE_") ? role.substring(5) : role;
            
            // Explicitly check for PENDING role and deny login
            if (role.equals(Role.PENDING.name())) {
                logger.warn("Login attempt by PENDING user: {}", userDetails.getUsername());
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new MessageResponse("Your account is pending approval. Please contact the administrator."));
            }

            logger.info("User {} logged in successfully with role: {}", userDetails.getUsername(), role);
            // 5. Return JWT and user info in LoginResponse
            return ResponseEntity.ok(new LoginResponse(jwt, "Bearer",
                                                    userDetails.getId(),
                                                    userDetails.getUsername(),
                                                    role)); // Pass cleaned role as a String
        } catch (Exception e) {
            logger.error("Authentication failed for user {}: {}", loginRequest.getUsername(), e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new MessageResponse("Authentication failed: " + e.getMessage()));
        }
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@Valid @RequestBody RegisterRequest registerRequest) {
        logger.info("Attempting to register new user: {}, {}", registerRequest.getUsername(), registerRequest.getPassword());

        if (userService.existsByUsername(registerRequest.getUsername())) {
            logger.warn("Registration failed: Username {} already exists.", registerRequest.getUsername());
            return ResponseEntity
                    .badRequest()
                    .body(new MessageResponse("Error: Username is already taken!"));
        }

        try {
            // Default role to EMPLOYEE. Admin users should only be created by an existing admin.
        	Role role = Role.PENDING; //Role.EMPLOYEE;
            // If a role is explicitly provided and is "ADMIN", only allow if there's an existing ADMIN user
            // or if it's the very first user (for initial setup). This is a security decision.
            // For a simpler approach, you might let anyone register as EMPLOYEE and an admin promotes them.
            // For now, let's keep it simple: register always as EMPLOYEE, unless an ADMIN explicitly registers another ADMIN.
            // For this example, we will default all registrations to EMPLOYEE.
            // An admin user would typically be created via a different, more secure process or through direct DB insertion.
            // If you want to allow self-registration for ADMIN for initial setup, you'd add logic here.
        	
        	/*
            // If you want to allow users to specify their role, you'd do:
            if (registerRequest.getRole() != null) {
                try {
                    Role requestedRole = Role.valueOf(registerRequest.getRole().toUpperCase());
                    // Additional logic could go here: e.g., only allow ADMIN role if current user is ADMIN, etc.
                    // For a public registration endpoint, it's safer to always assign EMPLOYEE role.
                    // For HRMS, often Admin creates all users.
                    if(requestedRole == Role.ADMIN) {
                        logger.warn("Attempt to register as ADMIN for user {}. Auto-assigning EMPLOYEE role for public registration.", registerRequest.getUsername());
                        role = Role.EMPLOYEE; // Force EMPLOYEE role for public registration
                    } else {
                        role = requestedRole; // Allow other non-admin roles if needed
                    }

                } catch (IllegalArgumentException e) {
                    logger.warn("Invalid role specified during registration: {}. Defaulting to EMPLOYEE.", registerRequest.getRole());
                    // Keep default role as EMPLOYEE
                }
            }*/
        	
            
            User newUser = userService.registerNewUser(
                    registerRequest.getUsername(),
                    registerRequest.getPassword(),
                    role // Use the determined role
            );
            //logger.info("User {} registered successfully with ID: {}", newUser.getUsername(), newUser.getId());
            //return ResponseEntity.status(HttpStatus.CREATED).body(new RegisterResponse("User registered successfully!", newUser.getId()));
            logger.info("User {} registered successfully with ID: {} and role: {}", newUser.getUsername(), newUser.getId(), newUser.getRole());
            return ResponseEntity.status(HttpStatus.CREATED).body(new MessageResponse("User registered successfully! Awaiting admin approval."));
        } catch (IllegalArgumentException e) {
            logger.error("Registration failed for user {}: {}", registerRequest.getUsername(), e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new MessageResponse("Error: " + e.getMessage()));
        } catch (Exception e) {
            logger.error("An unexpected error occurred during registration for user {}: {}", registerRequest.getUsername(), e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new MessageResponse("Error: An unexpected error occurred."));
        }
    }

    // Example protected endpoint (for demonstration/testing)
    @GetMapping("/test/user")
    @PreAuthorize("hasAnyAuthority('ROLE_EMPLOYEE', 'ROLE_ADMIN', 'ROLE_HR')") // PENDING users cannot access
    public String userAccess(Authentication authentication) {
        String username = authentication.getName();
        List<String> roles = authentication.getAuthorities().stream()
                                 .map(GrantedAuthority::getAuthority)
                                 .collect(Collectors.toList());
        logger.info("User {} accessed protected user endpoint with roles: {}", username, roles);
        return "User Content. Username: " + username + ", Roles: " + roles;
    }

    // Example protected endpoint for Admin only
    @GetMapping("/test/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public String adminAccess(Authentication authentication) {
        String username = authentication.getName();
        logger.info("Admin {} accessed protected admin endpoint.", username);
        return "Admin Content. Username: " + username;
    }
    
    // Forgot Password - Step 1: Verify User and Send OTP
    @PostMapping("/verify-forgotpass-user")
    public ResponseEntity<Map<String, Object>> verifyUserForForgotPassword(@RequestBody Map<String, Object> request) {
        try {
            String username = (String) request.get("username");
            String email = (String) request.get("email");
            // Role is no longer needed for this verification
            
            logger.info("Received forgot password verification request for username: {}, email: {}", username, email);
            
            // The OTP is generated and sent within the service method
            int otp = userService.verifyUserForForgotPassword(username, email);
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "User verified. OTP sent to email.");
            response.put("otp", otp); // Return OTP for development/testing, remove in production
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            logger.error("Forgot password verification failed: {}", e.getMessage());
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("message", e.getMessage());
            if (e.getMessage().contains("register")) {
                errorResponse.put("redirect", true); // Add a redirect flag
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
            }
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        } catch (Exception e) {
            logger.error("An unexpected error occurred during forgot password verification: {}", e.getMessage(), e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("message", "An unexpected error occurred during verification.");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    /*// Forgot Password - Step 2: Verify OTP
    @PostMapping("/verify-otp")
    public ResponseEntity<MessageResponse> verifyOtp(@RequestBody Map<String, Object> request) {
        try {
            String username = (String) request.get("username");
            // OTP is expected as an integer, not string
            int otp = (Integer) request.get("otp"); 
            
            logger.info("Received OTP verification request for username: {}, OTP: {}", username, otp);
            userService.verifyOTP(username, otp);
            return ResponseEntity.ok(new MessageResponse("OTP verified successfully."));
        } catch (IllegalArgumentException e) {
            logger.error("OTP verification failed: {}", e.getMessage());
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        } catch (ClassCastException e) {
            logger.error("OTP format error: {}", e.getMessage());
            return ResponseEntity.badRequest().body(new MessageResponse("Invalid OTP format. OTP should be a number."));
        } catch (Exception e) {
            logger.error("An unexpected error occurred during OTP verification: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new MessageResponse("An unexpected error occurred during OTP verification."));
        }
    }*/

    // Forgot Password - Step 3: Reset Password
    @PostMapping("/reset-password")
    public ResponseEntity<MessageResponse> resetPassword(@RequestBody Map<String, Object> request) {
        try {
            String username = (String) request.get("username");
            String newPassword = (String) request.get("newPassword");
            
            logger.info("Received password reset request for username: {}", username);
            userService.resetPassword(username, newPassword);
            return ResponseEntity.ok(new MessageResponse("Password reset successfully. Please login with your new password."));
        } catch (IllegalArgumentException e) {
            logger.error("Password reset failed: {}", e.getMessage());
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        } catch (Exception e) {
            logger.error("An unexpected error occurred during password reset: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new MessageResponse("An unexpected error occurred during password reset."));
        }
    }
    
    /**
     * Endpoint for users to submit contact messages.
     * @param request A map containing name, email, mobile (used for subject), and message.
     * @return ResponseEntity with success message and Contact object, or error message.
     */
    @PostMapping("/contact-us")
    public ResponseEntity<Map<String, Object>> contactus(@RequestBody Map<String, Object> request){
        try {
            String name= (String) request.get("name");
            String email= (String) request.get("email");
            String mobile= (String) request.get("mobile"); // This is for mobile number
            String message= (String) request.get("message");
            System.out.println(name+"-"+email+"-"+mobile+"-"+message);
            Contact contact= userService.contactUs(name, email, mobile, message);
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Contact Message Stored successfully");
            response.put("contact", contact);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (IllegalArgumentException e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }
    }

}
