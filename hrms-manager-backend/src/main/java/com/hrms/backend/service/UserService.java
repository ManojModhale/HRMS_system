
package com.hrms.backend.service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.hrms.backend.dto.UserDto;
import com.hrms.backend.entity.Contact;
import com.hrms.backend.entity.Employee;
import com.hrms.backend.entity.Role;
import com.hrms.backend.entity.User;
import com.hrms.backend.repository.ContactRepository;
import com.hrms.backend.repository.EmployeeRepository;
import com.hrms.backend.repository.UserRepository;

import jakarta.transaction.Transactional;

@Service
public class UserService {
	
	private static final Logger logger = LoggerFactory.getLogger(UserService.class);

    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private EmployeeRepository employeeRepository;
    
    @Autowired
    private EmailService emailService;

    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @Autowired
    @Lazy
    private EmployeeService employeeService;
    
    @Autowired
    private ContactRepository contactRepository;

    // Method to register a new user (public registration, always PENDING)
    public User registerNewUser(String username, String password, Role role) {
        logger.info("Attempting to register user: {} with role: {}", username, role);
        if (userRepository.existsByUsername(username)) {
            logger.warn("Registration failed: Username {} already exists!", username);
            throw new IllegalArgumentException("Username already exists!");
        }

        User newUser = new User();
        newUser.setUsername(username);
        newUser.setPassword(passwordEncoder.encode(password)); // Hash the password
        newUser.setRole(Role.PENDING); // Always set to PENDING for public registration

        User savedUser = userRepository.save(newUser);
        logger.info("User registered successfully with PENDING role: {}", username);
        return savedUser;
    }
    
    // Generic save method for User, handles password encoding if not already encoded
    @Transactional
    public User save(User user) {
        // Only encode password if it's not already encoded (e.g., for new users or password updates)
        if (user.getPassword() != null && !user.getPassword().startsWith("$2a$") && !user.getPassword().startsWith("$2b$") && !user.getPassword().startsWith("$2y$")) {
             user.setPassword(passwordEncoder.encode(user.getPassword()));
        }
        return userRepository.save(user);
    }
    
    // Forgot Password - Step 1: Verify User and Send OTP
    // This method now returns the generated OTP to the caller (frontend)
    @Transactional
    public int verifyUserForForgotPassword(String username, String email) {
        logger.info("Attempting to verify user for forgot password: username={}, email={}", username, email);

        Optional<User> userOptional = userRepository.findByUsername(username);
        if (userOptional.isEmpty()) {
            logger.warn("Forgot password failed: User not found for username: {}", username);
            throw new IllegalArgumentException("User not found. Please check your username.");
        }

        User user = userOptional.get();

        // Now, find the associated Employee to get the email using EmployeeRepository directly
        Optional<Employee> employeeOptional = employeeRepository.findByUserId(user.getId());
        if (employeeOptional.isEmpty()) {
            logger.warn("Forgot password failed: Employee record not found for user: {}", username);
            throw new IllegalArgumentException("No employee record found for this user. Please contact support.");
        }

        Employee employee = employeeOptional.get();

        // Compare the provided email with the employee's email (case-insensitive)
        if (!employee.getEmail().equalsIgnoreCase(email)) {
            logger.warn("Forgot password failed: Provided email does not match for user: {}", username);
            throw new IllegalArgumentException("Provided email does not match our records for this username.");
        }
        
        // Generate OTP
        //int otp = emailService.generateOTP(6); // Use the generateOTP from EmailService

        // Send OTP via email
        int otp = emailService.sendOtpMail(employee.getEmail(), employee.getFirstName(), employee.getLastName());
        logger.info("OTP email sent to {} for user: {}", employee.getEmail(), username);
        
        return otp; // Return OTP to frontend for client-side verification
    }

    // Forgot Password - Step 3: Reset Password
    @Transactional
    public void resetPassword(String username, String newPassword) {
        logger.info("Attempting to reset password for user: {}", username);
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> {
                    logger.warn("Password reset failed: User not found for username: {}", username);
                    return new IllegalArgumentException("User not found.");
                });

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        logger.info("Password successfully reset for user: {}", username);
    }
    
    
 // You might have other user-related methods here

    /**
     * Saves a contact message to the database.
     * @param name The name of the sender.
     * @param email The email of the sender.
     * @param mobile The mobile number (or repurposed for subject) of the sender.
     * @param message The message content.
     * @return The saved Contact entity.
     * @throws IllegalArgumentException if any required field is null or empty.
     */
    public Contact contactUs(String name, String email, String mobile, String message) {

        Contact contact = new Contact(name, email, mobile, message);
        return contactRepository.save(contact);
    }
    
    // Helper method to convert User entity to UserDto (basic)
    /*public UserDto convertToUserDto(User user) {
        return new UserDto(user.getId(), user.getUsername(), user.getRole());
    }*/
    
    /**
     * Retrieves all users.
     * @return List of UserDto.
     */
    public List<UserDto> getAllUsers() {
        logger.info("Fetching all users.");
        return userRepository.findAll().stream()
                .map(this::convertToUserDto)
                .collect(Collectors.toList());
    }

    /**
     * Retrieves users by their role.
     * @param role The role to filter by.
     * @return List of User entities with the specified role.
     */
    public List<User> getUsersByRole(Role role) {
        logger.info("Fetching users by role: {}", role);
        return userRepository.findByRole(role);
    }
    
    /**
     * Deletes a user by ID.
     * If the user is an EMPLOYEE, deletion is not allowed.
     * @param userId The ID of the user to delete.
     * @throws IllegalArgumentException if user not found or is an EMPLOYEE.
     */
    @Transactional
    public void deleteUser(Long userId) {
        logger.info("Attempting to delete user with ID: {}", userId);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found with ID: " + userId));

        // Prevent deletion of ADMIN or HR roles for safety, or if they are the hardcoded superadmin
        if (user.getRole() == Role.ADMIN || user.getRole() == Role.HR) {
            throw new IllegalArgumentException("Cannot delete ADMIN or HR users through this endpoint.");
        }

        // Check if the user is associated with an employee record
        Optional<Employee> employeeOptional = employeeRepository.findByUserId(userId);
        if (employeeOptional.isPresent()) {
            // If the user is an EMPLOYEE, prevent deletion.
            // This aligns with your frontend logic to disable the delete button for employees.
            throw new IllegalArgumentException("Cannot delete user as they are associated with an employee record. Delete the employee record first if necessary.");
        }

        userRepository.delete(user);
        logger.info("User with ID {} deleted successfully.", userId);
    }
    
    /**
     * Helper method to convert User entity to UserDto, including Employee details if available.
     * This helper is used for `getAllUsers` and `getPendingUsers` (via AdminController).
     */
    public UserDto convertToUserDto(User user) {
        UserDto dto = new UserDto(user.getId(), user.getUsername(), user.getRole());
        // Only attempt to set employee details if the user is an EMPLOYEE or HR
        if (user.getRole() == Role.EMPLOYEE || user.getRole() == Role.HR) {
            Optional<Employee> employeeOptional = employeeService.getEmployeeDetailsByUserId(user.getId()); // Call EmployeeService
            employeeOptional.ifPresent(employee -> {
                dto.setEmployeeIdNumber(employee.getEmployeeIdNumber());
                dto.setFirstName(employee.getFirstName());
                dto.setLastName(employee.getLastName());
                dto.setEmail(employee.getEmail());
                dto.setDepartment(employee.getDepartment());
                dto.setDesignation(employee.getDesignation());
                dto.setSalary(employee.getSalary());
                dto.setJoinDate(employee.getJoinDate());
            });
        }
        return dto;
    }
    
    
    
    
    

    // Method to find user by username (can be used by other services if needed)
    public Optional<User> findByUsername(String username) {
        return userRepository.findByUsername(username);
    }

    // Method to check if a user exists
    public boolean existsByUsername(String username) {
        return userRepository.existsByUsername(username);
    }

    /*public List<User> getUsersByRole(Role role) {
        return userRepository.findByRole(role);
    }*/

    public List<User> getUsersByRoles(List<Role> roles) {
        return userRepository.findByRoleIn(roles);
    }

    public Optional<User> getUserById(Long id) {
        return userRepository.findById(id);
    }
    
    // Method to find user by ID (renamed from findUserById to avoid confusion with getUserById, keeping both for now)
    public Optional<User> findUserById(Long id) {
        return userRepository.findById(id);
    }
    
    @Transactional // Ensure this method is transactional
    public User updateUserRole(Long userId, Role newRole) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));
        user.setRole(newRole);
        return userRepository.save(user);
    }
    
    // Removed verifyOTP method as per user request for client-side verification.
    /*
    @Transactional
    public void verifyOTP(String username, int otp) {
        logger.info("Attempting to verify OTP for user: {}", username);
        OtpEntry storedOtpEntry = otpStorage.get(username);

        if (storedOtpEntry == null) {
            logger.warn("OTP verification failed: No OTP found for user: {}", username);
            throw new IllegalArgumentException("No OTP requested or OTP expired. Please request a new OTP.");
        }

        if (storedOtpEntry.isExpired()) {
            otpStorage.remove(username); // Remove expired OTP
            logger.warn("OTP verification failed: OTP expired for user: {}", username);
            throw new IllegalArgumentException("OTP has expired. Please request a new OTP.");
        }

        if (storedOtpEntry.getOtp() != otp) { // Compare integer OTPs
            logger.warn("OTP verification failed: Invalid OTP provided for user: {}", username);
            throw new IllegalArgumentException("Invalid OTP. Please try again.");
        }

        // OTP is valid and not expired, remove it to prevent reuse
        otpStorage.remove(username);
        logger.info("OTP successfully verified and removed for user: {}", username);
    }
    */
    
    /*public List<User> getAllUsers() {
    	return userRepository.findAll();
	}*/

    // New method to delete a user
    /*@Transactional // Ensure this method is transactional
    public void deleteUser(Long userId) {
        logger.info("Attempting to delete user with ID: {}", userId);
        if (userRepository.existsById(userId)) {
            userRepository.deleteById(userId);
            logger.info("User with ID {} deleted successfully.", userId);
        } else {
            logger.warn("Attempted to delete non-existent user with ID: {}", userId);
            throw new RuntimeException("User not found with ID: " + userId);
        }
    }*/  
    
    /*
    // New method to find users who are EMPLOYEE role but have no employee details
    public List<User> findUsersWithoutEmployeeDetails() {
        logger.info("Fetching users with EMPLOYEE role and no associated employee details.");
        return userRepository.findByRoleAndEmployeeIsNull(Role.EMPLOYEE);
    }*/

}
