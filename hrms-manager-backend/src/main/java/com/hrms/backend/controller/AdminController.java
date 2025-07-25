package com.hrms.backend.controller;

import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.Optional;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.hrms.backend.config.UserDetailsImpl;
import com.hrms.backend.dto.AddBonusRequest;
import com.hrms.backend.dto.AdminAttendanceMarkRequest;
import com.hrms.backend.dto.AttendanceDto;
import com.hrms.backend.dto.AttendanceRecordDto;
import com.hrms.backend.dto.EmployeeCreationRequest;
import com.hrms.backend.dto.EmployeeDetailsDto;
import com.hrms.backend.dto.LeaveApplicationDto;
import com.hrms.backend.dto.LeaveResponseDto;
import com.hrms.backend.dto.LeaveUpdateStatusRequest;
import com.hrms.backend.dto.MarkAttendanceRequest;
import com.hrms.backend.dto.MessageResponse;
import com.hrms.backend.dto.PayrollProcessRequest;
import com.hrms.backend.dto.PayslipDto;
import com.hrms.backend.dto.ProcessLeaveRequest;
import com.hrms.backend.dto.UserDto;
import com.hrms.backend.entity.Attendance;
import com.hrms.backend.entity.AttendanceStatus;
import com.hrms.backend.entity.Contact;
import com.hrms.backend.entity.Employee;
import com.hrms.backend.entity.LeaveApplication;
import com.hrms.backend.entity.LeaveStatus;
import com.hrms.backend.entity.Role;
import com.hrms.backend.entity.User;
import com.hrms.backend.service.AdminService;
import com.hrms.backend.service.AttendanceService;
import com.hrms.backend.service.EmployeeService;
import com.hrms.backend.service.LeaveService;
import com.hrms.backend.service.PayrollService;
import com.hrms.backend.service.UserService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
// @CrossOrigin(origins = "*", maxAge = 3600) // <--- REMOVE THIS LINE
public class AdminController {
	
	private static final Logger logger = LoggerFactory.getLogger(AdminController.class);
	
	@Autowired
	private AdminService adminService;
	
	@Autowired
    private UserService userService;

    @Autowired
    private EmployeeService employeeService;

    @Autowired
    private LeaveService leaveService;

    @Autowired
    private AttendanceService attendanceService;

    @Autowired
    private PayrollService payrollService;
    
    
    // Helper method to get the authenticated user's ID
    private Long getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof UserDetailsImpl) {
            return ((UserDetailsImpl) authentication.getPrincipal()).getId();
        }
        throw new IllegalStateException("User not authenticated or user ID not found in security context.");
    }

    // --- User and Employee Management Endpoints ---
    /**
     * Fetches all users from the backend.
     * @return ResponseEntity with list of UserDto or error message.
     */
    @GetMapping("/users/all")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_HR')")
    public ResponseEntity<?> getAllUsers() {
        try {
            logger.info("Admin/HR user ID {} attempting to fetch all users.", getCurrentUserId());
            List<UserDto> users = userService.getAllUsers();
            logger.info("All users fetched successfully. Records found: {}", users.size());
            return ResponseEntity.ok(users);
        } catch (IllegalStateException e) {
            logger.error("Authentication error fetching all users: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(e.getMessage());
        } catch (Exception e) {
            logger.error("Error fetching all users: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error fetching all users: " + e.getMessage());
        }
    }
    
    /**
     * Fetches users with a PENDING role.
     * @return ResponseEntity with list of UserDto or error message.
     */
    @GetMapping("/pending-users")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_HR')")
    public ResponseEntity<?> getPendingUsers() { // Changed return type to ResponseEntity<?>
        try {
            logger.info("Admin/HR user ID {} attempting to fetch pending users.", getCurrentUserId());
            List<User> pendingUsers = userService.getUsersByRole(Role.PENDING);
            // Convert User entities to UserDto, populating employee details if they somehow exist (though unlikely for PENDING)
            List<UserDto> userDtos = pendingUsers.stream()
                    .map(userService::convertToUserDto) // Use UserService's helper
                    .collect(Collectors.toList());
            logger.info("Pending users fetched successfully. Records found: {}", userDtos.size());
            return ResponseEntity.ok(userDtos);
        } catch (IllegalStateException e) {
            logger.error("Authentication error fetching pending users: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(e.getMessage()); // Now returns ResponseEntity<String> which is allowed by <?>
        } catch (Exception e) {
            logger.error("Error fetching pending users: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error fetching pending users: " + e.getMessage()); // Now returns ResponseEntity<String> which is allowed by <?>
        }
    }
    
    /**
     * Deletes a user by ID.
     * @param userId The ID of the user to delete.
     * @return ResponseEntity indicating success or failure.
     */
    @DeleteMapping("/users/{userId}")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_HR')")
    public ResponseEntity<?> deleteUser(@PathVariable Long userId) {
        try {
            Long adminUserId = getCurrentUserId();
            logger.info("Admin/HR user ID {} attempting to delete user ID: {}", adminUserId, userId);
            userService.deleteUser(userId);
            logger.info("User ID {} deleted successfully by admin/HR user ID {}.", userId, adminUserId);
            return ResponseEntity.ok("User deleted successfully.");
        } catch (IllegalStateException e) {
            logger.error("Authentication error deleting user: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(e.getMessage());
        } catch (IllegalArgumentException e) {
            logger.error("Validation error deleting user: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (Exception e) {
            logger.error("Error deleting user: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error deleting user: " + e.getMessage());
        }
    }
    
    // --- Employee Management Endpoints  ---
    /**
     * Fetches all employee records.
     * @return ResponseEntity with list of EmployeeDetailsDto (employees) or error message.
     */
    @GetMapping("/employees/all")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_HR')")
    public ResponseEntity<?> getAllEmployees() {
        try {
            logger.info("Admin/HR user ID {} attempting to fetch all employees.", getCurrentUserId());
            List<EmployeeDetailsDto> employees = employeeService.getAllEmployees(); // Changed return type
            logger.info("All employees fetched successfully. Records found: {}", employees.size());
            return ResponseEntity.ok(employees);
        } catch (IllegalStateException e) {
            logger.error("Authentication error fetching all employees: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(e.getMessage());
        } catch (Exception e) {
            logger.error("Error fetching all employees: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error fetching all employees: " + e.getMessage());
        }
    }
    
    /**
     * Creates a new employee record or converts an existing PENDING user to an employee.
     * @param request EmployeeCreationRequest containing user and employee details.
     * @return ResponseEntity with EmployeeDetailsDto (new employee) or error message.
     */
    @PostMapping("/employees")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_HR')")
    public ResponseEntity<?> createEmployee(@RequestBody EmployeeCreationRequest request) { // Changed request type
        try {
            Long adminUserId = getCurrentUserId();
            logger.info("Admin/HR user ID {} attempting to create/convert employee for username: {}", adminUserId, request.getUsername());
            EmployeeDetailsDto newEmployee = employeeService.createEmployee(request, adminUserId); // Changed return type
            logger.info("Employee created/converted successfully for username: {}.", request.getUsername());
            return ResponseEntity.status(HttpStatus.CREATED).body(newEmployee);
        } catch (IllegalStateException e) {
            logger.error("Authentication error creating employee: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(e.getMessage());
        } catch (IllegalArgumentException e) {
            logger.error("Validation error creating employee: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (Exception e) {
            logger.error("Error creating employee: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error creating employee: " + e.getMessage());
        }
    }

    /**
     * Updates an existing employee record.
     * @param employeeId The ID of the employee to update.
     * @param updateRequest EmployeeDetailsDto containing fields to update.
     * @return ResponseEntity with updated EmployeeDetailsDto (employee) or error message.
     */
    @PutMapping("/employees/{employeeId}")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_HR')")
    public ResponseEntity<?> updateEmployee(@PathVariable Long employeeId, @RequestBody EmployeeDetailsDto updateRequest) { // Changed request type
        try {
            Long adminUserId = getCurrentUserId();
            logger.info("Admin/HR user ID {} attempting to update employee ID: {}", adminUserId, employeeId);
            EmployeeDetailsDto updatedEmployee = employeeService.updateEmployee(employeeId, updateRequest, adminUserId); // Changed return type
            logger.info("Employee ID {} updated successfully by admin/HR user ID {}.", employeeId, adminUserId);
            return ResponseEntity.ok(updatedEmployee);
        } catch (IllegalStateException e) {
            logger.error("Authentication error updating employee: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(e.getMessage());
        } catch (IllegalArgumentException e) {
            logger.error("Validation error updating employee: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (Exception e) {
            logger.error("Error updating employee: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error updating employee: " + e.getMessage());
        }
    }

    /**
     * Deletes an employee record by ID.
     * @param employeeId The ID of the employee to delete.
     * @return ResponseEntity indicating success or failure.
     */
    @DeleteMapping("/employees/{employeeId}")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_HR')")
    public ResponseEntity<?> deleteEmployee(@PathVariable Long employeeId) {
        try {
            Long adminUserId = getCurrentUserId();
            logger.info("Admin/HR user ID {} attempting to delete employee ID: {}", adminUserId, employeeId);
            employeeService.deleteEmployee(employeeId, adminUserId);
            logger.info("Employee ID {} deleted successfully by admin/HR user ID {}.", employeeId, adminUserId);
            return ResponseEntity.ok("Employee deleted successfully.");
        } catch (IllegalStateException e) {
            logger.error("Authentication error deleting employee: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(e.getMessage());
        } catch (IllegalArgumentException e) {
            logger.error("Validation error deleting employee: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (Exception e) {
            logger.error("Error deleting employee: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error deleting employee: " + e.getMessage());
        }
    }
    
    
    // --- Attendance Management Endpoints ---

    /**
     * Endpoint for an admin/HR to mark attendance for any employee on any date.
     * @param request MarkAttendanceRequest containing employeeId, attendanceDate, and status.
     * @return ResponseEntity with AttendanceDto or error message.
     */
    @PostMapping("/attendance/mark")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_HR')")
    public ResponseEntity<?> markEmployeeAttendance(@RequestBody MarkAttendanceRequest request) {
        try {
            Long adminUserId = getCurrentUserId();
            logger.info("Admin/HR user ID {} attempting to mark attendance for employee ID: {} on date: {}",
                        adminUserId, request.getEmployeeId(), request.getAttendanceDate());
            // CORRECTED: Call markAttendanceByAdmin with specific parameters
            AttendanceDto attendance = attendanceService.markAttendanceByAdmin(request.getEmployeeId(), request.getStatus(), request.getAttendanceDate(), adminUserId);
            logger.info("Attendance marked successfully by admin/HR for employee {}.", request.getEmployeeId());
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
     * Endpoint for an admin/HR to view all attendance records, filtered by a single date.
     * This is used by the AttendanceManagementPage when a single date is selected.
     * @param date Optional date to filter records (YYYY-MM-DD).
     * @return ResponseEntity with list of AttendanceDto or error message.
     */
    @GetMapping("/attendance/all-by-date") // NEW ENDPOINT PATH
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_HR')")
    public ResponseEntity<?> getAllAttendanceByDate(
            @RequestParam(required = false) @org.springframework.format.annotation.DateTimeFormat(iso = org.springframework.format.annotation.DateTimeFormat.ISO.DATE) LocalDate date) {
        try {
            Long adminUserId = getCurrentUserId();
            logger.info("Admin/HR user ID {} attempting to fetch all attendance records by date: {}", adminUserId, date);
            // CORRECTED: Call getAllAttendanceByDate
            List<AttendanceDto> allAttendance = attendanceService.getAllAttendanceByDate(date);
            logger.info("All attendance records fetched successfully by date. Records found: {}", allAttendance.size());
            return ResponseEntity.ok(allAttendance);
        } catch (IllegalStateException e) {
            logger.error("Authentication error fetching all attendance by date: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(e.getMessage());
        } catch (Exception e) {
            logger.error("Error fetching all attendance by date: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error fetching all attendance by date: " + e.getMessage());
        }
    }

    /**
     * Endpoint for an admin/HR to view all attendance records, with optional date range filtering.
     * This is a more general endpoint if you need to fetch by a range (e.g., for reports).
     * @param startDate Optional start date for filtering.
     * @param endDate   Optional end date for filtering.
     * @return ResponseEntity with list of AttendanceDto or error message.
     */
    @GetMapping("/attendance/all") // Existing endpoint for date range
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_HR')")
    public ResponseEntity<?> getAllAttendance(
            @RequestParam(required = false) @org.springframework.format.annotation.DateTimeFormat(iso = org.springframework.format.annotation.DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @org.springframework.format.annotation.DateTimeFormat(iso = org.springframework.format.annotation.DateTimeFormat.ISO.DATE) LocalDate endDate) {
        try {
            Long adminUserId = getCurrentUserId();
            logger.info("Admin/HR user ID {} attempting to fetch all attendance records by date range: {} to {}", adminUserId, startDate, endDate);
            // CORRECTED: Call getAllAttendance with date range
            List<AttendanceDto> allAttendance = attendanceService.getAllAttendance(startDate, endDate);
            logger.info("All attendance records fetched successfully by date range. Records found: {}", allAttendance.size());
            return ResponseEntity.ok(allAttendance);
        } catch (IllegalStateException e) {
            logger.error("Authentication error fetching all attendance by date range: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(e.getMessage());
        } catch (Exception e) {
            logger.error("Error fetching all attendance by date range: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error fetching all attendance by date range: " + e.getMessage());
        }
    }


    /**
     * Endpoint for an admin/HR to update an existing attendance record.
     * @param attendanceId The ID of the attendance record to update.
     * @param request MarkAttendanceRequest containing the new status.
     * @return ResponseEntity with updated AttendanceDto or error message.
     */
    @PutMapping("/attendance/{attendanceId}") // Corrected path variable syntax
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_HR')")
    public ResponseEntity<?> updateAttendance(
            @PathVariable Long attendanceId,
            @RequestBody MarkAttendanceRequest request) { // Request body is MarkAttendanceRequest
        try {
            Long adminUserId = getCurrentUserId();
            logger.info("Admin/HR user ID {} attempting to update attendance record ID: {}.", adminUserId, attendanceId);
            // CORRECTED: Call updateAttendance with specific parameters
            AttendanceDto updatedAttendance = attendanceService.updateAttendance(attendanceId, request.getStatus(), adminUserId);
            logger.info("Attendance record ID {} updated successfully by admin/HR.", attendanceId);
            return ResponseEntity.ok(updatedAttendance);
        } catch (IllegalStateException e) {
            logger.error("Authentication error updating attendance: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(e.getMessage());
        } catch (IllegalArgumentException e) {
            logger.error("Validation error updating attendance: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (Exception e) {
            logger.error("Error updating attendance: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error updating attendance: " + e.getMessage());
        }
    }

    // --- Leave Management Endpoints ---
    /**
     * Endpoint for an admin/HR to view all pending leave applications.
     * @return ResponseEntity with list of LeaveApplicationDto or error message.
     */
    @GetMapping("/leaves/pending")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_HR')")
    public ResponseEntity<?> getAllPendingLeaveApplications() {
        try {
            Long adminUserId = getCurrentUserId();
            logger.info("Admin/HR user ID {} attempting to fetch all pending leave applications.", adminUserId);
            List<LeaveApplicationDto> pendingLeaves = leaveService.getAllPendingLeaveApplications();
            logger.info("Pending leave applications fetched successfully. Records found: {}", pendingLeaves.size());
            return ResponseEntity.ok(pendingLeaves);
        } catch (IllegalStateException e) {
            logger.error("Authentication error fetching pending leaves: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(e.getMessage());
        } catch (Exception e) {
            logger.error("Error fetching pending leave applications: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error fetching pending leave applications: " + e.getMessage());
        }
    }

    /**
     * Endpoint for an admin/HR to process a leave application (approve or reject).
     * @param request ProcessLeaveRequest containing leaveApplicationId, status, and adminNotes.
     * @return ResponseEntity with updated LeaveApplicationDto or error message.
     */
    @PutMapping("/leaves/process")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_HR')")
    public ResponseEntity<?> processLeaveApplication(@RequestBody ProcessLeaveRequest request) {
        try {
            Long adminUserId = getCurrentUserId();
            logger.info("Admin/HR user ID {} attempting to process leave application ID: {} with status: {}",
                        adminUserId, request.getLeaveApplicationId(), request.getStatus());
            LeaveApplicationDto updatedLeave = leaveService.processLeave(request, adminUserId);
            logger.info("Leave application ID {} processed successfully by admin/HR. New status: {}",
                        request.getLeaveApplicationId(), updatedLeave.getStatus());
            return ResponseEntity.ok(updatedLeave);
        } catch (IllegalStateException e) {
            logger.error("Authentication error processing leave: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(e.getMessage());
        } catch (IllegalArgumentException e) {
            logger.error("Validation error processing leave: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (Exception e) {
            logger.error("Error processing leave: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error processing leave: " + e.getMessage());
        }
    }
    
    
    
    
    // --- Payroll Management Endpoints ---
    @PostMapping("/payroll/process")
    public ResponseEntity<MessageResponse> processMonthlyPayroll(@Valid @RequestBody PayrollProcessRequest request) {
        logger.info("Admin/HR attempting to process payroll for {}-{}", request.getMonth(), request.getYear());
        try {
            adminService.processMonthlyPayroll(request.getMonth(), request.getYear());
            return ResponseEntity.ok(new MessageResponse("Monthly payroll processing initiated."));
        } catch (IllegalArgumentException e) {
            logger.error("Error processing payroll: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new MessageResponse(e.getMessage()));
        } catch (Exception e) {
            logger.error("Unexpected error processing payroll: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new MessageResponse("Failed to process payroll: " + e.getMessage()));
        }
    }

    @PostMapping("/bonuses")
    public ResponseEntity<MessageResponse> addBonus(@Valid @RequestBody AddBonusRequest request) {
        logger.info("Admin/HR attempting to add bonus for employee ID: {}", request.getEmployeeId());
        try {
            String message = adminService.addBonusToEmployee(request);
            return ResponseEntity.ok(new MessageResponse(message));
        } catch (NoSuchElementException e) {
            logger.error("Employee not found for bonus: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new MessageResponse(e.getMessage()));
        } catch (IllegalArgumentException e) {
            logger.error("Validation error adding bonus: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new MessageResponse(e.getMessage()));
        } catch (Exception e) {
            logger.error("Unexpected error adding bonus: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new MessageResponse("Failed to add bonus: " + e.getMessage()));
        }
    }

    @GetMapping("/payslips/{year}/{month}")
    public ResponseEntity<List<PayslipDto>> getPayslipsForMonth(@PathVariable Integer year, @PathVariable Integer month) {
        logger.info("Admin/HR attempting to fetch payslips for {}-{}", month, year);
        try {
            List<PayslipDto> payslips = adminService.getPayslipsForMonth(month, year);
            return ResponseEntity.ok(payslips);
        } catch (Exception e) {
            logger.error("Error fetching payslips for {}-{}: {}", month, year, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/payslips/{payslipId}")
    public ResponseEntity<PayslipDto> getPayslipDetails(@PathVariable Long payslipId) {
        logger.info("Admin/HR attempting to fetch payslip details for ID: {}", payslipId);
        try {
            PayslipDto payslip = adminService.getPayslipDetails(payslipId);
            return ResponseEntity.ok(payslip);
        } catch (NoSuchElementException e) {
            logger.error("Payslip not found: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        } catch (Exception e) {
            logger.error("Error fetching payslip details for ID {}: {}", payslipId, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * Endpoint for admins to retrieve all contact messages.
     * Requires ADMIN role authentication (handled by your security configuration).
     * @return A list of all Contact objects.
     */
    @GetMapping("/get-contacts")
    public List<Contact> getAllContacts(){
        return adminService.getAllContacts();
    }
    
    
    
    /*@GetMapping("/users/all")
    public ResponseEntity<List<UserDto>> getAllUsers() {
        List<User> users = userService.getAllUsers();
        List<UserDto> userDtos = users.stream()
                .map(this::convertToUserDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(userDtos);
    }*/
    
    /**
     * Helper method to convert User entity to UserDto, including Employee details if available.
     * This helper is used for `getAllUsers` and `getPendingUsers`.
     */
    private UserDto convertToUserDto(User user) {
        UserDto dto = new UserDto(user.getId(), user.getUsername(), user.getRole());
        // Only attempt to set employee details if the user is an EMPLOYEE or HR
        if (user.getRole() == Role.EMPLOYEE || user.getRole() == Role.HR) {
            Optional<Employee> employeeOptional = employeeService.getEmployeeDetailsByUserId(user.getId());
            employeeOptional.ifPresent(employee -> {
                dto.setEmployeeIdNumber(employee.getEmployeeIdNumber());
                dto.setFirstName(employee.getFirstName());
                dto.setLastName(employee.getLastName());
                dto.setEmail(employee.getEmail());
                dto.setDepartment(employee.getDepartment());
                dto.setDesignation(employee.getDesignation());
                dto.setSalary(employee.getSalary());
                dto.setJoinDate(employee.getJoinDate()); // Ensure joinDate is also set
            });
        }
        return dto;
    }

    /**
     * Helper method to convert Employee entity to UserDto.
     * This is specifically for the /admin/employees endpoint to return comprehensive employee data.
     */
    private UserDto convertEmployeeToUserDto(Employee employee) {
        User user = employee.getUser();
        UserDto dto = new UserDto(user.getId(), user.getUsername(), user.getRole());
        dto.setEmployeeIdNumber(employee.getEmployeeIdNumber());
        dto.setFirstName(employee.getFirstName());
        dto.setLastName(employee.getLastName());
        dto.setEmail(employee.getEmail());
        dto.setDepartment(employee.getDepartment());
        dto.setDesignation(employee.getDesignation());
        dto.setSalary(employee.getSalary());
        dto.setJoinDate(employee.getJoinDate());
        return dto;
    }

    /**
     * Helper method to convert LeaveApplication entity to LeaveResponseDto.
     */
    /*private LeaveResponseDto convertToLeaveResponseDto(LeaveApplication leaveApplication) {
        Employee employee = leaveApplication.getEmployee();
        return new LeaveResponseDto(
                leaveApplication.getId(),
                employee.getId(),
                employee.getUser().getUsername(),
                employee.getFirstName(),
                employee.getLastName(),
                leaveApplication.getStartDate(),
                leaveApplication.getEndDate(),
                leaveApplication.getLeaveType(),
                leaveApplication.getReason(),
                leaveApplication.getStatus(),
                leaveApplication.getAppliedDate(),
                leaveApplication.getAdminComment()
        );
    }*/

    /**
     * Helper method to convert Attendance entity to AttendanceRecordDto.
     */
    /*private AttendanceRecordDto convertToAttendanceRecordDto(Attendance attendance) {
        Employee employee = attendance.getEmployee();
        return new AttendanceRecordDto(
                attendance.getId(),
                employee.getId(),
                employee.getUser().getUsername(),
                employee.getFirstName(),
                employee.getLastName(),
                attendance.getAttendanceDate(),
                attendance.getStatus(),
                attendance.getCheckInTime(),
                attendance.getCheckOutTime()
        );
    }*/
    

    

    /*@GetMapping("/pending-users")
    public ResponseEntity<List<UserDto>> getPendingUsers() {
        List<User> pendingUsers = userService.getUsersByRole(Role.PENDING);
        List<UserDto> userDtos = pendingUsers.stream()
                .map(this::convertToUserDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(userDtos);
    }*/

    /*@GetMapping("/employees")
    public ResponseEntity<List<UserDto>> getAllEmployees() {
        // Fetch all Employee entities directly from the employee table
        List<Employee> employees = employeeService.getAllEmployees();
        // Convert each Employee entity to a UserDto (which includes employee details)
        List<UserDto> employeeDtos = employees.stream()
                .map(this::convertEmployeeToUserDto) // Use the new helper method
                .collect(Collectors.toList());
        return ResponseEntity.ok(employeeDtos);
    }*/

    /*@PostMapping("/create-employee")
    public ResponseEntity<?> createEmployee(@Valid @RequestBody EmployeeCreationRequest request) {
        User user;

        if (employeeService.existsByEmployeeIdNumber(request.getEmployeeIdNumber())) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: Employee ID Number is already taken!"));
        }
        if (employeeService.existsByEmail(request.getEmail())) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: Employee email is already registered!"));
        }

        if (request.getExistingUserId() != null) {
            user = userService.getUserById(request.getExistingUserId())
                    .orElseThrow(() -> new RuntimeException("Existing user not found with ID: " + request.getExistingUserId()));

            if (user.getRole() != Role.PENDING) {
                return ResponseEntity.badRequest().body(new MessageResponse("Error: User is not in PENDING status. Current role: " + user.getRole()));
            }
            if (employeeService.existsByUserId(user.getId())) {
                   return ResponseEntity.badRequest().body(new MessageResponse("Error: Employee record already exists for this user."));
            }

            // When converting an existing user, update their password if provided
            if (request.getPassword() != null && !request.getPassword().isEmpty()) {
                user.setPassword(request.getPassword()); // Set the new plain password
            }
            user.setRole(Role.EMPLOYEE);
            userService.save(user); // Save the updated user (role and potentially password)
        } else {
            if (userService.existsByUsername(request.getUsername())) {
                return ResponseEntity.badRequest().body(new MessageResponse("Error: Username is already taken!"));
            }

            user = new User(
                    request.getUsername(),
                    request.getPassword(), // Password will be encoded by UserService.save
                    Role.EMPLOYEE
            );
            user = userService.save(user); // Save new user, password will be encoded
        }

        Employee employee = new Employee(
                user,
                request.getEmployeeIdNumber(),
                request.getFirstName(),
                request.getLastName(),
                request.getEmail(),
                request.getDepartment(),
                request.getDesignation(),
                request.getSalary(),
                LocalDate.now() // Set join date to current date
        );

        employeeService.saveEmployee(employee);

        return ResponseEntity.ok(new MessageResponse("Employee created/converted successfully!"));
    }
    
    @PutMapping("/employees/{id}")
    public ResponseEntity<?> updateEmployee(@PathVariable Long id, @Valid @RequestBody EmployeeCreationRequest request) {
        logger.info("Admin attempting to update employee with ID: {}", id);
        try {
            // Fetch the existing employee
            Employee existingEmployee = employeeService.getEmployeeById(id)
                .orElseThrow(() -> new RuntimeException("Employee not found with ID: " + id));

            // Validate unique fields if they are changed
            if (!existingEmployee.getEmployeeIdNumber().equals(request.getEmployeeIdNumber()) && employeeService.existsByEmployeeIdNumber(request.getEmployeeIdNumber())) {
                return ResponseEntity.badRequest().body(new MessageResponse("Error: Employee ID Number is already taken by another employee!"));
            }
            if (!existingEmployee.getEmail().equals(request.getEmail()) && employeeService.existsByEmail(request.getEmail())) {
                return ResponseEntity.badRequest().body(new MessageResponse("Error: Employee email is already registered by another employee!"));
            }

            // Update employee fields
            existingEmployee.setEmployeeIdNumber(request.getEmployeeIdNumber());
            existingEmployee.setFirstName(request.getFirstName());
            existingEmployee.setLastName(request.getLastName());
            existingEmployee.setEmail(request.getEmail());
            existingEmployee.setDepartment(request.getDepartment());
            existingEmployee.setDesignation(request.getDesignation());
            existingEmployee.setSalary(request.getSalary());
            // JoinDate is typically not updated via this form, but if it were, you'd add:
            // existingEmployee.setJoinDate(request.getJoinDate());

            Employee updatedEmployee = employeeService.saveEmployee(existingEmployee);

            // Optionally, if username or password could be updated via this DTO,
            // you'd fetch the user and update them.
            // For now, username and password are not updated via this endpoint as per UI design.
            // If password needs to be reset, it should be a separate admin action.

            return ResponseEntity.ok(new MessageResponse("Employee details updated successfully!"));
        } catch (RuntimeException e) {
            logger.error("Error updating employee details for ID {}: {}", id, e.getMessage());
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        } catch (Exception e) {
            logger.error("An unexpected error occurred while updating employee {}: {}", id, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new MessageResponse("Error updating employee: " + e.getMessage()));
        }
    }*/

    /**
     * Deletes an employee record by ID.
     * @param employeeId The ID of the employee to delete.
     * @return ResponseEntity indicating success or failure.
     */
    /*@DeleteMapping("/employees/{employeeId}")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_HR')")
    public ResponseEntity<?> deleteEmployee(@PathVariable Long employeeId) {
        try {
            Long adminUserId = getCurrentUserId();
            logger.info("Admin/HR user ID {} attempting to delete employee ID: {}", adminUserId, employeeId);
            employeeService.deleteEmployee(employeeId, adminUserId);
            logger.info("Employee ID {} deleted successfully by admin/HR user ID {}.", employeeId, adminUserId);
            return ResponseEntity.ok("Employee deleted successfully.");
        } catch (IllegalStateException e) {
            logger.error("Authentication error deleting employee: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(e.getMessage());
        } catch (IllegalArgumentException e) {
            logger.error("Validation error deleting employee: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (Exception e) {
            logger.error("Error deleting employee: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error deleting employee: " + e.getMessage());
        }
    }*/
    
    
    /*
    @GetMapping("/leave-applications")
    public ResponseEntity<List<LeaveResponseDto>> getAllLeaveApplications() {
        List<LeaveApplication> leaveApplications = leaveService.getAllLeaveApplications();
        List<LeaveResponseDto> dtos = leaveApplications.stream()
                .map(this::convertToLeaveResponseDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/leave-applications/pending")
    public ResponseEntity<List<LeaveResponseDto>> getPendingLeaveApplications() {
        List<LeaveApplication> pendingApplications = leaveService.getPendingLeaveApplications();
        List<LeaveResponseDto> dtos = pendingApplications.stream()
                .map(this::convertToLeaveResponseDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    @PutMapping("/leave-applications/{id}/status")
    public ResponseEntity<?> updateLeaveApplicationStatus(
            @PathVariable Long id,
            @Valid @RequestBody LeaveUpdateStatusRequest request) {
        try {
            LeaveStatus newStatus = LeaveStatus.valueOf(request.getStatus().toUpperCase());
            if (newStatus != LeaveStatus.APPROVED && newStatus != LeaveStatus.REJECTED) {
                return ResponseEntity.badRequest().body(new MessageResponse("Invalid status. Must be APPROVED or REJECTED."));
            }
            LeaveApplication updatedLeave = leaveService.updateLeaveStatus(id, newStatus, request.getAdminComment());
            return ResponseEntity.ok(convertToLeaveResponseDto(updatedLeave));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        } /*catch (RuntimeException e) {
            return ResponseEntity.notFound().body(new MessageResponse(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new MessageResponse("Error updating leave status: " + e.getMessage()));
        }
    }*/

    // --- Attendance Management Endpoints ---
    /*@GetMapping("/attendance")
    public ResponseEntity<List<AttendanceRecordDto>> getAllAttendance(
            @RequestParam(required = false) @org.springframework.format.annotation.DateTimeFormat(iso = org.springframework.format.annotation.DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam(required = false) @org.springframework.format.annotation.DateTimeFormat(iso = org.springframework.format.annotation.DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @org.springframework.format.annotation.DateTimeFormat(iso = org.springframework.format.annotation.DateTimeFormat.ISO.DATE) LocalDate endDate) {

        List<Attendance> attendanceRecords;
        if (date != null) {
            attendanceRecords = attendanceService.getAllAttendanceRecords(date);
        } else if (startDate != null && endDate != null) {
            attendanceRecords = attendanceService.getAllAttendanceRecordsForPeriod(startDate, endDate);
        } else {
            // Default to today's attendance if no date/range is provided
            attendanceRecords = attendanceService.getAllAttendanceRecords(LocalDate.now());
        }

        List<AttendanceRecordDto> dtos = attendanceRecords.stream()
                .map(this::convertToAttendanceRecordDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    @PostMapping("/attendance/mark")
    public ResponseEntity<?> markAttendanceByAdmin(@Valid @RequestBody AdminAttendanceMarkRequest request) {
        try {
            AttendanceStatus status = AttendanceStatus.valueOf(request.getStatus().toUpperCase());
            Attendance markedAttendance = attendanceService.markAttendanceByAdmin(
                    request.getEmployeeId(),
                    request.getAttendanceDate(),
                    status,
                    request.getCheckInTime(),
                    request.getCheckOutTime()
            );
            return ResponseEntity.ok(convertToAttendanceRecordDto(markedAttendance));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        } /*catch (RuntimeException e) {
            return ResponseEntity.notFound().body(new MessageResponse(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new MessageResponse("Error marking attendance: " + e.getMessage()));
        }
    }*/

    // --- Payroll Endpoints ---
    /*
    @GetMapping("/payslips")
    public ResponseEntity<List<PayslipDto>> generateAndGetAllPayslips(
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) Integer month) {
        try {
            YearMonth payPeriod;
            if (year != null && month != null) {
                payPeriod = YearMonth.of(year, month);
            } else {
                payPeriod = YearMonth.now().minusMonths(1); // Default to previous month
            }
            //List<PayslipDto> payslips = payrollService.generateAllPayslipsForMonth(payPeriod);
            return ResponseEntity.ok();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null); // Return empty list or error message
        }
    }

    @GetMapping("/payslips/{employeeId}")
    public ResponseEntity<?> getPayslipForEmployee(
            @PathVariable Long employeeId,
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) Integer month) {
        try {
            YearMonth payPeriod;
            if (year != null && month != null) {
                payPeriod = YearMonth.of(year, month);
            } else {
                payPeriod = YearMonth.now().minusMonths(1); // Default to previous month
            }
            PayslipDto payslip = payrollService.calculatePayslipForEmployee(employeeId, payPeriod);
            return ResponseEntity.ok(payslip);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new MessageResponse(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new MessageResponse("Error generating payslip: " + e.getMessage()));
        }
    }*/
    
    @PostMapping("/employee-details")
    public ResponseEntity<?> createOrUpdateEmployeeDetails(@Valid @RequestBody EmployeeDetailsDto employeeDetailsDto) {
        logger.info("Admin attempting to create/update employee details for user: {}", employeeDetailsDto.getUsername());
        try {
            //employeeService.createOrUpdateEmployeeDetails(employeeDetailsDto);
            return ResponseEntity.ok(new MessageResponse("Employee details saved successfully!"));
        } catch (RuntimeException e) {
            logger.error("Error saving employee details for user {}: {}", employeeDetailsDto.getUsername(), e.getMessage());
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }
}