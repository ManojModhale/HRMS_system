package com.hrms.backend.controller;

import java.time.LocalDate;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.hrms.backend.config.UserDetailsImpl;
import com.hrms.backend.dto.ApplyLeaveRequest;
import com.hrms.backend.dto.AttendanceDto;
import com.hrms.backend.dto.EmployeeDetailsDto;
import com.hrms.backend.dto.LeaveApplicationDto;
import com.hrms.backend.dto.MarkAttendanceRequest;
import com.hrms.backend.dto.MessageResponse;
import com.hrms.backend.dto.PayslipDto;
import com.hrms.backend.dto.UserDto;
import com.hrms.backend.entity.Employee;
import com.hrms.backend.entity.Role;
import com.hrms.backend.entity.User;
import com.hrms.backend.service.AttendanceService;
import com.hrms.backend.service.EmployeeService;
import com.hrms.backend.service.LeaveService;
import com.hrms.backend.service.UserService;

@RestController
@RequestMapping("/api/employee")
@PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_EMPLOYEE')") // Both ADMIN and EMPLOYEE can access employee-related data
//@CrossOrigin(origins = "*", maxAge = 3600)
public class EmployeeController {
	
	private static final Logger logger = LoggerFactory.getLogger(EmployeeController.class);

	@Autowired
    private EmployeeService employeeService;
	
	@Autowired
    private UserService userService; // Inject UserService
	
	@Autowired
	private AttendanceService attendanceService;
	
	@Autowired
	private LeaveService leaveService;

	// Helper method to get the authenticated user's ID from the security context
    private Long getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof com.hrms.backend.config.UserDetailsImpl) {
            return ((com.hrms.backend.config.UserDetailsImpl) authentication.getPrincipal()).getId();
        }
        throw new IllegalStateException("User not authenticated or user ID not found in security context.");
    }

    //employee profile
    @GetMapping("/my-details")
    @PreAuthorize("hasAnyAuthority('ROLE_EMPLOYEE', 'ROLE_ADMIN', 'ROLE_HR')") // Only authenticated users can view their profile
    public ResponseEntity<?> getMyProfile() {
        try {
            Long userId = getCurrentUserId(); // Get userId from authenticated context
            logger.info("Received request to get profile for user ID: {}", userId);
            EmployeeDetailsDto profile = employeeService.getEmployeeProfileByUserId(userId); // Fetch profile using userId

            if (profile == null) {
                logger.warn("Profile not found for user ID: {}", userId);
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Employee profile not found.");
            }
            logger.info("Successfully retrieved profile for user ID: {}", userId);
            return ResponseEntity.ok(profile);
        } catch (IllegalStateException e) {
            logger.error("Authentication error: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(e.getMessage());
        } catch (Exception e) {
            logger.error("Error fetching employee profile: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error fetching profile: " + e.getMessage());
        }
    }

    @PutMapping("/update-details")
    @PreAuthorize("hasAnyAuthority('ROLE_EMPLOYEE', 'ROLE_ADMIN', 'ROLE_HR')") // Only authenticated users can update their profile
    public ResponseEntity<?> updateMyProfile(@RequestBody EmployeeDetailsDto updatedProfileDto) { // Expect UserDto from frontend
        try {
            Long userId = getCurrentUserId(); // Get userId from authenticated context
            logger.info("Received request to update profile for user ID: {}", userId);

            // Security check: Ensure the DTO's ID matches the authenticated user's ID
            // The frontend should send the user.id in the DTO payload.
            if (updatedProfileDto.getId() == null || !updatedProfileDto.getId().equals(userId)) {
                 logger.warn("Attempted to update profile for a different user ID. Authenticated: {}, DTO: {}", userId, updatedProfileDto.getId());
                 return ResponseEntity.status(HttpStatus.FORBIDDEN).body("You can only update your own profile.");
            }
            
            // Ensure the userId in the DTO matches the authenticated user's ID to prevent tampering
            updatedProfileDto.setId(userId); 

            EmployeeDetailsDto updated = employeeService.updateEmployeeProfile(userId, updatedProfileDto); // Update profile
            logger.info("Successfully updated profile for user ID: {}", userId);
            return ResponseEntity.ok(updated);
        } catch (IllegalStateException e) {
            logger.error("Authentication error: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(e.getMessage());
        } catch (IllegalArgumentException e) {
            logger.error("Validation error updating profile: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (Exception e) {
            logger.error("Error updating employee profile: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error updating profile: " + e.getMessage());
        }
    }  
    
    //attendace
    /**
     * Endpoint for an employee to mark their own attendance for today.
     * The request body only needs the status (e.g., PRESENT, HALF_DAY).
     * Employee ID and date will be derived from the authenticated user and current date.
     * @param request MarkAttendanceRequest containing the status.
     * @return ResponseEntity with AttendanceDto or error message.
     */
    @PostMapping("/attendance/mark")
    @PreAuthorize("hasAuthority('ROLE_EMPLOYEE')")
    public ResponseEntity<?> markMyAttendance(@RequestBody MarkAttendanceRequest request) {
        try {
            Long userId = getCurrentUserId();
            logger.info("Employee user ID {} attempting to mark own attendance.", userId);
            // CORRECTED: Call markAttendanceByEmployee with userId and status
            AttendanceDto attendance = attendanceService.markAttendanceByEmployee(userId, request.getStatus());
            logger.info("Attendance marked successfully for employee user ID {}.", userId);
            return ResponseEntity.status(HttpStatus.CREATED).body(attendance);
        } catch (IllegalStateException e) {
            logger.error("Authentication error marking attendance: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(e.getMessage());
        } catch (IllegalArgumentException e) {
            logger.error("Validation error marking attendance: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (Exception e) {
            logger.error("Error marking attendance: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error marking attendance: " + e.getMessage());
        }
    }

    /**
     * Endpoint for an employee to view their own attendance history.
     * @return ResponseEntity with list of AttendanceDto or error message.
     */
    @GetMapping("/attendance/my-history")
    @PreAuthorize("hasAuthority('ROLE_EMPLOYEE')")
    public ResponseEntity<?> getMyAttendanceHistory() {
        try {
            Long userId = getCurrentUserId();
            logger.info("Employee user ID {} attempting to fetch own attendance history.", userId);
            // CORRECTED: Call getEmployeeAttendanceHistory with userId
            List<AttendanceDto> attendanceHistory = attendanceService.getEmployeeAttendanceHistory(userId);
            logger.info("Attendance history fetched successfully for employee user ID {}. Records found: {}", userId, attendanceHistory.size());
            return ResponseEntity.ok(attendanceHistory);
        } catch (IllegalStateException e) {
            logger.error("Authentication error fetching attendance history: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(e.getMessage());
        } catch (IllegalArgumentException e) {
            logger.error("Data error fetching attendance history: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) {
            logger.error("Error fetching attendance history: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error fetching attendance history: " + e.getMessage());
        }
    }
    
    //leave functionality
    /**
     * Endpoint for an employee to apply for a new leave.
     * @param request ApplyLeaveRequest containing start date, end date, and reason.
     * @return ResponseEntity with LeaveApplicationDto or error message.
     */
    @PostMapping("/leaves/apply")
    @PreAuthorize("hasAuthority('ROLE_EMPLOYEE')")
    public ResponseEntity<?> applyForLeave(@RequestBody ApplyLeaveRequest request) {
        try {
            Long userId = getCurrentUserId();
            logger.info("Employee user ID {} attempting to apply for leave.", userId);
            LeaveApplicationDto leaveApplication = leaveService.applyLeave(userId, request);
            logger.info("Leave application submitted successfully for employee user ID {}.", userId);
            return ResponseEntity.status(HttpStatus.CREATED).body(leaveApplication);
        } catch (IllegalStateException e) {
            logger.error("Authentication error applying for leave: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(e.getMessage());
        } catch (IllegalArgumentException e) {
            logger.error("Validation error applying for leave: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (Exception e) {
            logger.error("Error applying for leave: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error applying for leave: " + e.getMessage());
        }
    }

    /**
     * Endpoint for an employee to view their own leave history.
     * @return ResponseEntity with list of LeaveApplicationDto or error message.
     */
    @GetMapping("/leaves/my-history")
    @PreAuthorize("hasAuthority('ROLE_EMPLOYEE')")
    public ResponseEntity<?> getMyLeaveHistory() {
        try {
            Long userId = getCurrentUserId();
            logger.info("Employee user ID {} attempting to fetch own leave history.", userId);
            List<LeaveApplicationDto> leaveHistory = leaveService.getEmployeeLeaveHistory(userId);
            logger.info("Leave history fetched successfully for employee user ID {}. Records found: {}", userId, leaveHistory.size());
            return ResponseEntity.ok(leaveHistory);
        } catch (IllegalStateException e) {
            logger.error("Authentication error fetching leave history: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(e.getMessage());
        } catch (IllegalArgumentException e) {
            logger.error("Data error fetching leave history: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) {
            logger.error("Error fetching leave history: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error fetching leave history: " + e.getMessage());
        }
    }

    
 
    // --- My Salary Slips Endpoints ---
    @GetMapping("/payslips/{year}/{month}")
    public ResponseEntity<PayslipDto> getMyPayslip(@PathVariable Integer year, @PathVariable Integer month) {
        Long userId = getCurrentUserId();
        logger.info("Employee user ID {} attempting to fetch payslip for {}-{}", userId, month, year);
        try {
            PayslipDto payslip = employeeService.getMyPayslip(userId, month, year);
            return ResponseEntity.ok(payslip);
        } catch (NoSuchElementException e) {
            logger.error("Payslip not found for user ID {} for {}-{}: {}", userId, month, year, e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        } catch (Exception e) {
            logger.error("Error fetching payslip for user ID {} for {}-{}: {}", userId, month, year, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/payslips/my-all")
    public ResponseEntity<List<PayslipDto>> getAllMyPayslips() {
        Long userId = getCurrentUserId();
        logger.info("Employee user ID {} attempting to fetch all their payslips.", userId);
        try {
            List<PayslipDto> payslips = employeeService.getAllPayslipsForEmployee(employeeService.getEmployeeByUserId(userId)
                    .orElseThrow(() -> new NoSuchElementException("Employee record not found for user ID: " + userId)).getId());
            return ResponseEntity.ok(payslips);
        } catch (NoSuchElementException e) {
            logger.error("Employee record not found for user ID {}: {}", userId, e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        } catch (Exception e) {
            logger.error("Error fetching all payslips for user ID {}: {}", userId, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    
    
    
    
    
    
    
    
    
	

    // New endpoint for admin to fetch employee details by username (for EmployeeManagementPage)
    // This endpoint will be used by the Admin frontend to load data into the form.
    @GetMapping("/details-by-username/{username}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')") // Only Admin can use this endpoint
    public ResponseEntity<?> getEmployeeDetailsByUsernameForAdmin(@PathVariable String username) {
        logger.info("Admin fetching employee details for username: {}", username);
        try {
            Optional<Employee> employee = employeeService.getEmployeeDetailsByUsername(username);
            if (employee.isPresent()) {
                // If employee details exist, return them along with the associated user's ID and username
                Employee emp = employee.get();
                return ResponseEntity.ok(new Object() { // Anonymous class for a simple DTO
                    public Long userId = emp.getUser().getId();
                    public String username = emp.getUser().getUsername();
                    public String employeeIdNumber = emp.getEmployeeIdNumber();
                    public String firstName = emp.getFirstName();
                    public String lastName = emp.getLastName();
                    public String email = emp.getEmail();
                    public String department = emp.getDepartment();
                    public String designation = emp.getDesignation();
                    public Double salary = emp.getSalary();
                    public LocalDate joinDate = emp.getJoinDate();
                });
            } else {
                // If employee details are NOT found, check if the user exists and is an EMPLOYEE
                Optional<User> user = userService.findByUsername(username);
                if (user.isPresent() && user.get().getRole() == Role.EMPLOYEE) {
                    // User exists as EMPLOYEE but no employee details are linked.
                    // Return user ID and username so Admin can pre-fill the form to create details.
                    return ResponseEntity.ok(new Object() {
                        public Long userId = user.get().getId();
                        public String username = user.get().getUsername();
                        public String message = "User found, but no employee details linked."; // Custom message for frontend
                    });
                } else if (user.isPresent() && user.get().getRole() != Role.EMPLOYEE) {
                    // User exists but is not an EMPLOYEE (e.g., another ADMIN). Admin should not create employee details for them.
                    return ResponseEntity.badRequest().body(new MessageResponse("User is not an EMPLOYEE. Cannot manage employee details for this role."));
                } else {
                    // User not found at all
                    return ResponseEntity.notFound().build();
                }
            }
        } catch (Exception e) {
            logger.error("Error fetching employee details for username {}: {}", username, e.getMessage());
            return ResponseEntity.internalServerError().body(new MessageResponse("Error fetching employee details: " + e.getMessage()));
        }
    }
    
    /*
	@GetMapping("/my-details")
    public ResponseEntity<?> getMyEmployeeDetails() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();

        logger.info("Fetching employee details for current user: {} (ID: {})", userDetails.getUsername(), userDetails.getId());

        // Handle the hardcoded admin case: Admin does not have a personal employee profile
        if (userDetails.getId() != null && userDetails.getId() == 0L && userDetails.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"))) {
            logger.info("Admin user {} requested employee details, returning appropriate message.", userDetails.getUsername());
            return ResponseEntity.ok(new MessageResponse("As an Admin, you do not have a personal employee profile. This section is for employees."));
        }

        try {
            Optional<Employee> employee = employeeService.getEmployeeDetailsByUserId(userDetails.getId());
            if (employee.isPresent()) {
                logger.debug("Employee details found for user: {}", userDetails.getUsername());
                return ResponseEntity.ok(employee.get()); // Return the full Employee object
            } else {
                logger.info("Employee details not found for user: {}", userDetails.getUsername());
                return ResponseEntity.ok(new MessageResponse("Employee details not found for your account. Please contact Admin."));
            }
        } catch (Exception e) {
            logger.error("Error fetching employee details for user {}: {}", userDetails.getUsername(), e.getMessage());
            return ResponseEntity.internalServerError().body(new MessageResponse("Error fetching employee details: " + e.getMessage()));
        }
    }*/
}
