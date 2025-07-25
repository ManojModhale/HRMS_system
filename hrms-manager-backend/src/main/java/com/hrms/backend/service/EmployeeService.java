package com.hrms.backend.service;

import java.time.LocalDate;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.Optional;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.hrms.backend.dto.EmployeeCreationRequest;
import com.hrms.backend.dto.EmployeeDetailsDto;
import com.hrms.backend.dto.PayslipDto;
import com.hrms.backend.dto.UserDto;
import com.hrms.backend.entity.Employee;
import com.hrms.backend.entity.Payslip;
import com.hrms.backend.entity.Role;
import com.hrms.backend.entity.User;
import com.hrms.backend.repository.EmployeeRepository;
import com.hrms.backend.repository.PayslipRepository;
import com.hrms.backend.repository.UserRepository;

@Service
public class EmployeeService {
	
	private static final Logger logger = LoggerFactory.getLogger(EmployeeService.class);

	@Autowired
    private EmployeeRepository employeeRepository;
	
	@Autowired
    private UserRepository userRepository;
	
	@Autowired
	private UserService userService;
	
	@Autowired
    private PasswordEncoder passwordEncoder;
	
	@Autowired
	private PayslipRepository payslipRepository;
	
	/**
     * Retrieves an employee's profile by their associated user ID.
     * Used by employees to view their own profile.
     * @param userId The ID of the user associated with the employee.
     * @return EmployeeDetailsDto of the employee.
     * @throws IllegalArgumentException if employee not found for the given user ID.
     */
    public EmployeeDetailsDto getEmployeeProfileByUserId(Long userId) {
        logger.info("Fetching employee profile for user ID: {}", userId);
        Employee employee = employeeRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("Employee not found for user ID: " + userId));
        return convertToEmployeeDetailsDto(employee); // Convert to EmployeeDetailsDto
    }

    /**
     * Updates an employee's own profile details.
     * @param userId The ID of the user associated with the employee.
     * @param updateData EmployeeDetailsDto containing fields to update.
     * @return Updated EmployeeDetailsDto.
     * @throws IllegalArgumentException if employee not found or email/employeeIdNumber already exists.
     */
    @Transactional
    public EmployeeDetailsDto updateEmployeeProfile(Long userId, EmployeeDetailsDto updateData) { // Accepts EmployeeDetailsDto
        logger.info("Updating employee profile for user ID: {}", userId);
        Employee employee = employeeRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("Employee not found for user ID: " + userId));

        // Validate uniqueness of employeeIdNumber if changed
        if (updateData.getEmployeeIdNumber() != null && !updateData.getEmployeeIdNumber().equals(employee.getEmployeeIdNumber())) {
            if (employeeRepository.findByEmployeeIdNumber(updateData.getEmployeeIdNumber()).isPresent()) {
                throw new IllegalArgumentException("Employee ID Number already exists.");
            }
            employee.setEmployeeIdNumber(updateData.getEmployeeIdNumber());
        }

        // Validate uniqueness of email if changed
        if (updateData.getEmail() != null && !updateData.getEmail().equals(employee.getEmail())) {
            if (employeeRepository.findByEmail(updateData.getEmail()).isPresent()) {
                throw new IllegalArgumentException("Email already exists.");
            }
            employee.setEmail(updateData.getEmail());
        }

        // Update fields if provided in the request
        if (updateData.getFirstName() != null) employee.setFirstName(updateData.getFirstName());
        if (updateData.getLastName() != null) employee.setLastName(updateData.getLastName());
        if (updateData.getDepartment() != null) employee.setDepartment(updateData.getDepartment());
        if (updateData.getDesignation() != null) employee.setDesignation(updateData.getDesignation());
        if (updateData.getSalary() != null) employee.setSalary(updateData.getSalary());

        Employee updatedEmployee = employeeRepository.save(employee);
        logger.info("Employee profile updated successfully for user ID: {}", userId);
        return convertToEmployeeDetailsDto(updatedEmployee); // Convert to EmployeeDetailsDto
    }
	
	
	// --- Admin/HR initiated Employee Management Methods ---
    /**
     * Fetches all employee records. Accessible by ADMIN or HR.
     * @return List of EmployeeDetailsDto (representing employees).
     */
    public List<EmployeeDetailsDto> getAllEmployees() { // Returns List<EmployeeDetailsDto>
        logger.info("Fetching all employee records for admin/HR.");
        return employeeRepository.findAllByOrderByFirstNameAscLastNameAsc().stream()
                .map(this::convertToEmployeeDetailsDto) // Convert to EmployeeDetailsDto
                .collect(Collectors.toList());
    }
    
    /**
     * Creates a new employee record. Can either create a new user or convert an existing PENDING user.
     * Accessible by ADMIN or HR.
     * @param request EmployeeCreationRequest containing details for the new employee/user.
     * @param adminUserId The ID of the admin/HR user performing the action.
     * @return EmployeeDetailsDto of the newly created employee.
     * @throws IllegalArgumentException if username/email/employeeIdNumber already exists or user not found for conversion.
     */
    @Transactional
    public EmployeeDetailsDto createEmployee(EmployeeCreationRequest request, Long adminUserId) { // Accepts EmployeeCreationRequest
        logger.info("Admin user ID {} attempting to create/convert employee for username: {}", adminUserId, request.getUsername());

        User user;
        if (request.getExistingUserId() != null) { // Access existingUserId from EmployeeCreationRequest
            // Convert existing PENDING user
            user = userRepository.findById(request.getExistingUserId())
                    .orElseThrow(() -> new IllegalArgumentException("Existing user not found with ID: " + request.getExistingUserId()));

            if (user.getRole() != Role.PENDING) {
                throw new IllegalArgumentException("User with ID " + request.getExistingUserId() + " is not in PENDING status and cannot be converted.");
            }
            user.setRole(Role.EMPLOYEE); // Change role to EMPLOYEE
            // Ensure password is provided for conversion
            if (request.getPassword() == null || request.getPassword().isEmpty()) {
                throw new IllegalArgumentException("Password must be provided for converting an existing user to an employee.");
            }
            user.setPassword(passwordEncoder.encode(request.getPassword())); // Set password for the converted user
            userRepository.save(user); // Save updated user
            logger.info("Converted PENDING user {} to EMPLOYEE.", user.getUsername());
        } else {
            // Create a brand new user and employee
            if (userRepository.findByUsername(request.getUsername()).isPresent()) {
                throw new IllegalArgumentException("Username is already taken!");
            }
            // Ensure password is provided for new user creation
            if (request.getPassword() == null || request.getPassword().isEmpty()) {
                throw new IllegalArgumentException("Password must be provided for creating a new employee.");
            }
            user = new User(request.getUsername(), passwordEncoder.encode(request.getPassword()), Role.EMPLOYEE);
            user = userRepository.save(user); // Save new user
            logger.info("Created new user {} with EMPLOYEE role.", user.getUsername());
        }

        // Check for duplicate employee ID number
        if (employeeRepository.findByEmployeeIdNumber(request.getEmployeeIdNumber()).isPresent()) {
            throw new IllegalArgumentException("Employee ID Number already exists.");
        }
        // Check for duplicate email
        if (employeeRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new IllegalArgumentException("Email already exists.");
        }

        Employee employee = new Employee();
        employee.setUser(user); // Link to the User entity
        employee.setEmployeeIdNumber(request.getEmployeeIdNumber());
        employee.setFirstName(request.getFirstName());
        employee.setLastName(request.getLastName());
        employee.setEmail(request.getEmail());
        employee.setDepartment(request.getDepartment());
        employee.setDesignation(request.getDesignation());
        employee.setSalary(request.getSalary());
        employee.setJoinDate(LocalDate.now()); // Set join date to today

        Employee savedEmployee = employeeRepository.save(employee);
        logger.info("Employee record created successfully for user {}.", user.getUsername());
        return convertToEmployeeDetailsDto(savedEmployee); // Convert to EmployeeDetailsDto
    }

    /**
     * Updates an existing employee record. Accessible by ADMIN or HR.
     * @param employeeId The ID of the employee record to update.
     * @param updateData EmployeeDetailsDto containing fields to update.
     * @param adminUserId The ID of the admin/HR user performing the action.
     * @return Updated EmployeeDetailsDto.
     * @throws IllegalArgumentException if employee not found or email/employeeIdNumber already exists.
     */
    @Transactional
    public EmployeeDetailsDto updateEmployee(Long employeeId, EmployeeDetailsDto updateData, Long adminUserId) { // Accepts EmployeeDetailsDto
        logger.info("Admin user ID {} attempting to update employee record ID: {}", adminUserId, employeeId);
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new IllegalArgumentException("Employee not found with ID: " + employeeId));

        // Validate uniqueness of employeeIdNumber if changed
        if (updateData.getEmployeeIdNumber() != null && !updateData.getEmployeeIdNumber().equals(employee.getEmployeeIdNumber())) {
            if (employeeRepository.findByEmployeeIdNumber(updateData.getEmployeeIdNumber()).isPresent()) {
                throw new IllegalArgumentException("Employee ID Number already exists.");
            }
            employee.setEmployeeIdNumber(updateData.getEmployeeIdNumber());
        }

        // Validate uniqueness of email if changed
        if (updateData.getEmail() != null && !updateData.getEmail().equals(employee.getEmail())) {
            if (employeeRepository.findByEmail(updateData.getEmail()).isPresent()) {
                throw new IllegalArgumentException("Email already exists.");
            }
            employee.setEmail(updateData.getEmail());
        }

        // Update fields if provided in the request (excluding password here)
        if (updateData.getFirstName() != null) employee.setFirstName(updateData.getFirstName());
        if (updateData.getLastName() != null) employee.setLastName(updateData.getLastName());
        if (updateData.getDepartment() != null) employee.setDepartment(updateData.getDepartment());
        if (updateData.getDesignation() != null) employee.setDesignation(updateData.getDesignation());
        if (updateData.getSalary() != null) employee.setSalary(updateData.getSalary());

        Employee updatedEmployee = employeeRepository.save(employee);
        logger.info("Employee record ID {} updated successfully by admin user ID {}.", employeeId, adminUserId);
        return convertToEmployeeDetailsDto(updatedEmployee); // Convert to EmployeeDetailsDto
    }

    /**
     * Deletes an employee record and its associated user account. Accessible by ADMIN or HR.
     * @param employeeId The ID of the employee record to delete.
     * @param adminUserId The ID of the admin/HR user performing the action.
     * @throws IllegalArgumentException if employee not found or associated user cannot be deleted.
     */
    @Transactional
    public void deleteEmployee(Long employeeId, Long adminUserId) {
        logger.info("Admin user ID {} attempting to delete employee record ID: {}", adminUserId, employeeId);
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new IllegalArgumentException("Employee not found with ID: " + employeeId));

        User associatedUser = employee.getUser();
        if (associatedUser == null) {
            throw new IllegalArgumentException("Employee has no associated user account.");
        }

        // Delete the employee record first to remove foreign key constraint
        employeeRepository.delete(employee);
        logger.info("Employee record ID {} deleted.", employeeId);

        // Then delete the associated user account
        // Ensure the user is not an ADMIN or HR themselves before deleting their user account
        if (associatedUser.getRole() == Role.ADMIN || associatedUser.getRole() == Role.HR) {
            throw new IllegalArgumentException("Cannot delete the user account of an ADMIN or HR through employee deletion.");
        }
        userRepository.delete(associatedUser);
        logger.info("Associated user account ID {} (username: {}) deleted.", associatedUser.getId(), associatedUser.getUsername());
    }


    /**
     * Retrieves employee details by user ID. Used by UserService to populate UserDto.
     * @param userId The ID of the user associated with the employee.
     * @return Optional<Employee> if found.
     */
    public Optional<Employee> getEmployeeDetailsByUserId(Long userId) {
        logger.debug("Attempting to get employee details for user ID: {}", userId);
        return employeeRepository.findByUserId(userId);
    }
    
    
    /**
     * Retrieves a single employee's details by their ID.
     * @param id The ID of the employee.
     * @return EmployeeDetailsDto.
     * @throws NoSuchElementException if employee not found.
     */
    public EmployeeDetailsDto getEmployeeById(Long id) {
        logger.info("Fetching employee details for ID: {}", id);
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Employee not found with ID: " + id));
        return convertToDto(employee);
    }

    /**
     * Retrieves an employee's details by their associated user ID.
     * @param userId The ID of the user associated with the employee.
     * @return Optional EmployeeDetailsDto.
     */
    public Optional<EmployeeDetailsDto> getEmployeeByUserId(Long userId) {
        logger.info("Fetching employee details for User ID: {}", userId);
        return employeeRepository.findByUserId(userId)
                .map(this::convertToDto);
    }

    // New method to get a specific payslip for an employee
    public PayslipDto getEmployeePayslip(Long employeeId, Integer month, Integer year) {
        logger.info("Fetching payslip for employee ID: {} for {}-{}", employeeId, month, year);
        Payslip payslip = payslipRepository.findByEmployeeIdAndPayPeriodMonthAndPayPeriodYear(employeeId, month, year)
                .orElseThrow(() -> new NoSuchElementException("Payslip not found for employee ID: " + employeeId + " for " + month + "-" + year));
        return convertToPayslipDto(payslip);
    }

    // New method for an employee to get their own payslip
    public PayslipDto getMyPayslip(Long userId, Integer month, Integer year) {
        logger.info("Fetching payslip for user ID: {} for {}-{}", userId, month, year);
        Employee employee = employeeRepository.findByUserId(userId)
                .orElseThrow(() -> new NoSuchElementException("Employee record not found for user ID: " + userId));
        
        Payslip payslip = payslipRepository.findByEmployeeIdAndPayPeriodMonthAndPayPeriodYear(employee.getId(), month, year)
                .orElseThrow(() -> new NoSuchElementException("Payslip not found for you for " + month + "-" + year));
        return convertToPayslipDto(payslip);
    }

    // New method to get all payslips for a specific employee
    public List<PayslipDto> getAllPayslipsForEmployee(Long employeeId) {
        logger.info("Fetching all payslips for employee ID: {}", employeeId);
        List<Payslip> payslips = payslipRepository.findByEmployeeIdOrderByPayPeriodYearDescPayPeriodMonthDesc(employeeId);
        return payslips.stream()
                .map(this::convertToPayslipDto)
                .collect(Collectors.toList());
    }

    // Helper method to convert Employee entity to EmployeeDetailsDto
    private EmployeeDetailsDto convertToDto(Employee employee) {
        String username = (employee.getUser() != null) ? employee.getUser().getUsername() : "N/A";
        Long userId = (employee.getUser() != null) ? employee.getUser().getId() : null;

        return new EmployeeDetailsDto(
                employee.getId(),
                userId,
                username,
                employee.getEmployeeIdNumber(),
                employee.getFirstName(),
                employee.getLastName(),
                employee.getEmail(),
                employee.getDepartment(),
                employee.getDesignation(),
                employee.getSalary(),
                employee.getJoinDate()
        );
    }

    // Helper method to convert Payslip entity to PayslipDto
    private PayslipDto convertToPayslipDto(Payslip payslip) {
        String employeeName = (payslip.getEmployee() != null) ?
                payslip.getEmployee().getFirstName() + " " + payslip.getEmployee().getLastName() : "N/A";
        String employeeIdNumber = (payslip.getEmployee() != null) ? payslip.getEmployee().getEmployeeIdNumber() : "N/A";

        return new PayslipDto(
                payslip.getId(),
                payslip.getEmployee().getId(),
                employeeName,
                employeeIdNumber,
                payslip.getPayPeriodMonth(),
                payslip.getPayPeriodYear(),
                payslip.getGrossSalary(),
                payslip.getBaseMonthlySalary(),
                payslip.getTotalWorkingDaysInMonth(),
                payslip.getDaysPresent(),
                payslip.getDaysAbsent(),
                payslip.getDaysHalfDay(),
                payslip.getDaysOnApprovedLeave(),
                payslip.getAttendanceDeduction(),
                payslip.getTaxDeduction(),
                payslip.getPfDeduction(),
                payslip.getOtherDeductions(),
                payslip.getBonusAmount(),
                payslip.getNetSalary(),
                payslip.getGenerationDate(),
                payslip.getGeneratedBy()
        );
    }

    // Helper method to convert Employee entity to EmployeeDetailsDto
    private EmployeeDetailsDto convertToEmployeeDetailsDto(Employee employee) {
        return new EmployeeDetailsDto(
                employee.getId(), // Employee ID
                employee.getUser() != null ? employee.getUser().getId() : null, // User ID
                employee.getUser() != null ? employee.getUser().getUsername() : null, // Username
                employee.getEmployeeIdNumber(),
                employee.getFirstName(),
                employee.getLastName(),
                employee.getEmail(),
                employee.getDepartment(),
                employee.getDesignation(),
                employee.getSalary(),
                employee.getJoinDate()
        );
    }
    
 
    
    
    
    
    
	
	
	/*public List<Employee> getAllEmployees() {
        return employeeRepository.findAll();
    }*/

    /*public Optional<Employee> getEmployeeById(Long id) {
        return employeeRepository.findById(id);
    }*/
    
    @Transactional
    public Employee saveEmployee(Employee employee) {
        return employeeRepository.save(employee);
    }

    @Transactional
    public void deleteEmployee(Long employeeId) {
        logger.info("Attempting to delete employee with ID: {}", employeeId);
        Optional<Employee> employeeOptional = employeeRepository.findById(employeeId);

        if (employeeOptional.isPresent()) {
            Employee employeeToDelete = employeeOptional.get();
            User associatedUser = employeeToDelete.getUser();

            // Delete the employee record
            employeeRepository.delete(employeeToDelete);
            logger.info("Employee record with ID {} deleted.", employeeId);

            // Check if the associated user has the EMPLOYEE role and delete them
            // This prevents deleting ADMIN or HR users who might also have an employee record (though unlikely with current setup)
            // and ensures only users linked solely as employees are removed.
            if (associatedUser.getRole() == Role.EMPLOYEE) {
                // Before deleting the user, ensure no other entities (e.g., LeaveApplication, Attendance)
                // have foreign key constraints preventing user deletion.
                // If there are such constraints, you might need to:
                // 1. Delete related records first (e.g., employee's leaves, attendance)
                // 2. Or, change the user's role to INACTIVE instead of full deletion.
                // For simplicity, assuming cascade delete is handled or no other FKs prevent it for now.
                // If you get a constraint violation, you'll need to implement cascading deletes or change user role.
                userService.deleteUser(associatedUser.getId()); // Call UserService to delete the user
                logger.info("Associated user with ID {} (username: {}) and role EMPLOYEE deleted.", associatedUser.getId(), associatedUser.getUsername());
            } else {
                logger.info("Associated user with ID {} (username: {}) has role {}, not deleting user account.", associatedUser.getId(), associatedUser.getUsername(), associatedUser.getRole());
            }
        } else {
            logger.warn("Attempted to delete non-existent employee with ID: {}", employeeId);
            throw new RuntimeException("Employee not found with ID: " + employeeId);
        }
    }
    
    // Get employee details by the associated User's ID
    /*public Optional<Employee> getEmployeeDetailsByUserId(Long userId) {
        logger.info("Fetching employee details for user ID: {}", userId);
        return employeeRepository.findByUserId(userId);
    }*/

    // Get employee details by the associated User's username
    public Optional<Employee> getEmployeeDetailsByUsername(String username) {
        logger.info("Fetching employee details for username: {}", username);
        Optional<User> userOptional = userRepository.findByUsername(username);
        if (userOptional.isPresent()) {
            return employeeRepository.findByUserId(userOptional.get().getId());
        }
        return Optional.empty();
    }

    public boolean existsByUserId(Long userId) {
        return employeeRepository.existsByUserId(userId);
    }

    public boolean existsByEmployeeIdNumber(String employeeIdNumber) {
        return employeeRepository.existsByEmployeeIdNumber(employeeIdNumber);
    }

    public boolean existsByEmail(String email) {
        return employeeRepository.existsByEmail(email);
    }
    
    
    // Fetch employee profile by user ID and return as UserDto
    /*public UserDto getEmployeeProfileByUserId(Long userId) {
        logger.info("Fetching employee profile for user ID: {}", userId);
        Optional<Employee> employeeOptional = employeeRepository.findByUserId(userId);

        if (employeeOptional.isEmpty()) {
            logger.warn("Employee profile not found for user ID: {}", userId);
            return null; // Or throw an exception
        }

        Employee employee = employeeOptional.get();
        User user = employee.getUser(); // Get the associated User entity

        // Map Employee and User data to UserDto
        UserDto dto = new UserDto();
        dto.setId(user.getId()); // User ID
        dto.setUsername(user.getUsername());
        dto.setRole(user.getRole());
        dto.setEmployeeIdNumber(employee.getEmployeeIdNumber());
        dto.setFirstName(employee.getFirstName());
        dto.setLastName(employee.getLastName());
        dto.setEmail(employee.getEmail());
        dto.setDepartment(employee.getDepartment());
        dto.setDesignation(employee.getDesignation());
        // Handle BigDecimal to Double conversion if Employee.salary is BigDecimal
        dto.setSalary(employee.getSalary() != null ? employee.getSalary().doubleValue() : null);
        dto.setJoinDate(employee.getJoinDate());

        logger.info("Successfully fetched employee profile for user ID: {}", userId);
        return dto;
    }

    // Update employee profile using UserDto
    @Transactional
    public UserDto updateEmployeeProfile(Long userId, UserDto updatedDto) {
        logger.info("Updating employee profile for user ID: {}", userId);
        Optional<Employee> employeeOptional = employeeRepository.findByUserId(userId);

        if (employeeOptional.isEmpty()) {
            logger.warn("Cannot update: Employee profile not found for user ID: {}", userId);
            throw new IllegalArgumentException("Employee profile not found.");
        }

        Employee employee = employeeOptional.get();
        // User user = employee.getUser(); // User entity is already linked via employee

        // Only update editable fields (firstName, lastName, email)
        employee.setFirstName(updatedDto.getFirstName());
        employee.setLastName(updatedDto.getLastName());
        employee.setEmail(updatedDto.getEmail());

        // Save the updated employee
        Employee savedEmployee = employeeRepository.save(employee);

        // Re-map and return the updated DTO
        // Fetch the user again to ensure latest data is used for DTO construction
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found after employee update."));

        UserDto resultDto = new UserDto();
        resultDto.setId(user.getId()); // User ID
        resultDto.setUsername(user.getUsername());
        resultDto.setRole(user.getRole());
        resultDto.setEmployeeIdNumber(savedEmployee.getEmployeeIdNumber());
        resultDto.setFirstName(savedEmployee.getFirstName());
        resultDto.setLastName(savedEmployee.getLastName());
        resultDto.setEmail(savedEmployee.getEmail());
        resultDto.setDepartment(savedEmployee.getDepartment());
        resultDto.setDesignation(savedEmployee.getDesignation());
        resultDto.setSalary(savedEmployee.getSalary() != null ? savedEmployee.getSalary().doubleValue() : null);
        resultDto.setJoinDate(savedEmployee.getJoinDate());

        logger.info("Successfully updated employee profile for user ID: {}", userId);
        return resultDto;
    }*/
    
    /*
    @Transactional
    public Employee createOrUpdateEmployeeDetails(EmployeeDetailsDto dto) {
        logger.info("Attempting to create or update employee details for user: {}", dto.getUsername());

        User user;
        // Find user by ID first if provided, otherwise by username
        if (dto.getUserId() != null) {
            user = userRepository.findById(dto.getUserId())
                    .orElseThrow(() -> new RuntimeException("User not found with ID: " + dto.getUserId()));
        } else if (dto.getUsername() != null && !dto.getUsername().isEmpty()) {
            user = userRepository.findByUsername(dto.getUsername())
                    .orElseThrow(() -> new RuntimeException("User not found with username: " + dto.getUsername()));
        } else {
            throw new IllegalArgumentException("Either userId or username must be provided to identify the user.");
        }

        // Ensure the user is an EMPLOYEE before linking employee details
        if (user.getRole() != Role.EMPLOYEE) {
            logger.warn("Attempt to add employee details to non-EMPLOYEE user: {} (Role: {})", user.getUsername(), user.getRole());
            throw new RuntimeException("Cannot add employee details for non-EMPLOYEE role users.");
        }

        Employee employee = user.getEmployee();
        boolean isNewEmployee = (employee == null);

        if (isNewEmployee) {
            employee = new Employee();
            user.setEmployee(employee); // Link user to new employee
            employee.setUser(user); // Link employee back to user
            logger.info("Creating new employee record for user: {}", user.getUsername());
        } else {
            logger.info("Updating existing employee record for user: {}", user.getUsername());
        }

        // Populate employee fields from DTO
        employee.setEmployeeIdNumber(dto.getEmployeeIdNumber());
        employee.setFirstName(dto.getFirstName());
        employee.setLastName(dto.getLastName());
        employee.setEmail(dto.getEmail());
        employee.setDepartment(dto.getDepartment());
        employee.setDesignation(dto.getDesignation());
        employee.setSalary(dto.getSalary());
        employee.setJoinDate(dto.getJoinDate());

        // Save employee, which will cascade save to user if it's a new employee due to CascadeType.ALL on mappedBy side
        Employee savedEmployee = employeeRepository.save(employee);
        // Explicitly save user to ensure the link is persisted if it was a new assignment
        userRepository.save(user);

        logger.info("Employee details saved successfully for user: {} (Employee ID: {})", user.getUsername(), savedEmployee.getEmployeeIdNumber());
        return savedEmployee;
    }*/
}
