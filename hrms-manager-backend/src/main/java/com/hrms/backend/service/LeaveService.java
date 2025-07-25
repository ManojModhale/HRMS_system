package com.hrms.backend.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.hrms.backend.dto.ApplyLeaveRequest;
import com.hrms.backend.dto.LeaveApplicationDto;
import com.hrms.backend.dto.ProcessLeaveRequest;
import com.hrms.backend.entity.Employee;
import com.hrms.backend.entity.LeaveApplication;
import com.hrms.backend.entity.LeaveStatus;
import com.hrms.backend.entity.Role;
import com.hrms.backend.entity.User;
import com.hrms.backend.repository.EmployeeRepository;
import com.hrms.backend.repository.LeaveApplicationRepository;
import com.hrms.backend.repository.UserRepository;

import jakarta.transaction.Transactional;

@Service
public class LeaveService {

    private static final Logger logger = LoggerFactory.getLogger(LeaveService.class);

    @Autowired
    private LeaveApplicationRepository leaveApplicationRepository;

    @Autowired
    private EmployeeRepository employeeRepository; // Needed to find employee by ID
    
    @Autowired
    private UserRepository userRepository;

    /**
     * Allows an employee to apply for leave.
     *
     * @param employeeUserId The ID of the authenticated employee user.
     * @param request        The ApplyLeaveRequest containing start date, end date, and reason.
     * @return LeaveApplicationDto of the newly created leave application.
     * @throws IllegalArgumentException if validation fails (e.g., dates are in the past, end date before start date).
     */
    @Transactional
    public LeaveApplicationDto applyLeave(Long employeeUserId, ApplyLeaveRequest request) {
        logger.info("Employee user ID {} attempting to apply for leave from {} to {}",
                    employeeUserId, request.getStartDate(), request.getEndDate());

        if (request.getStartDate().isBefore(LocalDate.now())) {
            throw new IllegalArgumentException("Start date cannot be in the past.");
        }
        if (request.getEndDate().isBefore(request.getStartDate())) {
            throw new IllegalArgumentException("End date cannot be before start date.");
        }
        if (request.getReason() == null || request.getReason().trim().isEmpty()) {
            throw new IllegalArgumentException("Reason for leave is required.");
        }

        Employee employee = employeeRepository.findByUserId(employeeUserId)
                .orElseThrow(() -> new IllegalArgumentException("Employee record not found for user ID: " + employeeUserId));

        LeaveApplication leaveApplication = new LeaveApplication();
        leaveApplication.setEmployee(employee);
        leaveApplication.setStartDate(request.getStartDate());
        leaveApplication.setEndDate(request.getEndDate());
        leaveApplication.setReason(request.getReason());
        leaveApplication.setStatus(LeaveStatus.PENDING); // Always PENDING initially
        leaveApplication.setAppliedDate(LocalDate.now());

        LeaveApplication savedApplication = leaveApplicationRepository.save(leaveApplication);
        logger.info("Leave application created successfully for employee {} (ID: {}) from {} to {}",
                    employee.getFirstName(), employee.getId(), request.getStartDate(), request.getEndDate());
        return convertToDto(savedApplication);
    }

    /**
     * Retrieves the leave history for a specific employee.
     *
     * @param employeeUserId The user ID of the employee whose leave history is to be retrieved.
     * @return List of LeaveApplicationDto.
     * @throws IllegalArgumentException if employee not found.
     */
    public List<LeaveApplicationDto> getEmployeeLeaveHistory(Long employeeUserId) {
        logger.info("Fetching leave history for employee user ID: {}", employeeUserId);
        Employee employee = employeeRepository.findByUserId(employeeUserId)
                .orElseThrow(() -> new IllegalArgumentException("Employee not found for user ID: " + employeeUserId));

        List<LeaveApplication> leaveApplications = leaveApplicationRepository.findByEmployeeOrderByAppliedDateDesc(employee);
        return leaveApplications.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    /**
     * Retrieves all pending leave applications. Accessible by ADMIN or HR.
     *
     * @return List of LeaveApplicationDto.
     */
    public List<LeaveApplicationDto> getAllPendingLeaveApplications() {
        logger.info("Fetching all pending leave applications.");
        List<LeaveApplication> pendingLeaves = leaveApplicationRepository.findByStatusOrderByAppliedDateAsc(LeaveStatus.PENDING);
        return pendingLeaves.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    /**
     * Processes a leave application (approves or rejects it). Accessible by ADMIN or HR.
     *
     * @param processRequest The ProcessLeaveRequest containing leave ID, new status, and admin notes.
     * @param adminUserId    The ID of the authenticated admin/HR user.
     * @return LeaveApplicationDto of the updated leave application.
     * @throws IllegalArgumentException if application not found, unauthorized access, or validation fails.
     */
    @Transactional
    public LeaveApplicationDto processLeave(ProcessLeaveRequest processRequest, Long adminUserId) {
        logger.info("Admin user {} attempting to process leave application ID: {} with status {}",
                    adminUserId, processRequest.getLeaveApplicationId(), processRequest.getStatus());

        /*User adminUser = userRepository.findById(adminUserId)
                .orElseThrow(() -> new IllegalArgumentException("Admin user not found."));

        if (adminUser.getRole() != Role.ADMIN && adminUser.getRole() != Role.HR) {
            throw new IllegalArgumentException("Unauthorized: Only ADMIN or HR can process leave applications.");
        }*/
        User processingUser = null;
        if (adminUserId == 0L) {
            // Special handling for hardcoded 'superadmin' not in DB
            // Create a synthetic User object for the purpose of setting 'processedBy'
            // Ensure the User entity has a constructor that allows setting ID, username, and role
            //processingUser = new User(0L, "superadmin", null, Role.ADMIN); // Password can be null for this purpose
            logger.info("Using synthetic superadmin user for processing leave.");
        } else {
            // For regular admin/HR users stored in the database
            processingUser = userRepository.findById(adminUserId)
                    .orElseThrow(() -> new IllegalArgumentException("Admin user not found with ID: " + adminUserId));

            if (processingUser.getRole() != Role.ADMIN && processingUser.getRole() != Role.HR) {
                throw new IllegalArgumentException("Unauthorized: Only ADMIN or HR can process leave applications.");
            }
        }

        LeaveApplication leaveApplication = leaveApplicationRepository.findById(processRequest.getLeaveApplicationId())
                .orElseThrow(() -> new IllegalArgumentException("Leave application not found with ID: " + processRequest.getLeaveApplicationId()));

        // Validate status transition (e.g., cannot process an already processed leave)
        if (leaveApplication.getStatus() != LeaveStatus.PENDING) {
            throw new IllegalArgumentException("Leave application has already been processed.");
        }

        // Update status and notes
        leaveApplication.setStatus(processRequest.getStatus());
        leaveApplication.setAdminNotes(processRequest.getAdminNotes());
        leaveApplication.setProcessedBy(processingUser); // Set the synthetic or DB-fetched user
        leaveApplication.setProcessedDate(LocalDateTime.now());

        // Additional validation for rejection notes
        if (processRequest.getStatus() == LeaveStatus.REJECTED && (processRequest.getAdminNotes() == null || processRequest.getAdminNotes().trim().isEmpty())) {
            throw new IllegalArgumentException("Admin notes are required when rejecting a leave application.");
        }

        LeaveApplication updatedApplication = leaveApplicationRepository.save(leaveApplication);
        logger.info("Leave application ID {} processed successfully by admin/HR. New status: {}",
                    updatedApplication.getId(), updatedApplication.getStatus());
        return convertToDto(updatedApplication);
    }
    
    /**
     * Admin/HR gets all leave applications, optionally filtered by status.
     * @param status Optional status to filter by (e.g., "PENDING", "APPROVED", "REJECTED").
     * @return List of LeaveApplicationDto.
     */
    public List<LeaveApplicationDto> getAllLeaveApplications(String status) {
        logger.info("Fetching all leave applications with status: {}", status != null ? status : "ALL");
        List<LeaveApplication> applications;
        if (status != null && !status.isEmpty()) {
            try {
                LeaveStatus leaveStatus = LeaveStatus.valueOf(status.toUpperCase());
                applications = leaveApplicationRepository.findByStatusOrderByAppliedDateDesc(leaveStatus);
            } catch (IllegalArgumentException e) {
                throw new IllegalArgumentException("Invalid leave status provided for filtering: " + status);
            }
        } else {
            applications = leaveApplicationRepository.findAllByOrderByAppliedDateDesc();
        }
        return applications.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    // Helper method to convert Entity to DTO
    private LeaveApplicationDto convertToDto(LeaveApplication leaveApplication) {
        String employeeName = (leaveApplication.getEmployee() != null) ?
                leaveApplication.getEmployee().getFirstName() + " " + leaveApplication.getEmployee().getLastName() : "N/A";
        String processedByUsername = (leaveApplication.getProcessedBy() != null) ?
                leaveApplication.getProcessedBy().getUsername() : null; // Null if not yet processed

        return new LeaveApplicationDto(
                leaveApplication.getId(),
                leaveApplication.getEmployee().getId(),
                employeeName,
                leaveApplication.getStartDate(),
                leaveApplication.getEndDate(),
                leaveApplication.getReason(),
                leaveApplication.getStatus(),
                leaveApplication.getAppliedDate(),
                leaveApplication.getAdminNotes(),
                processedByUsername,
                leaveApplication.getProcessedDate()
        );
    }
}