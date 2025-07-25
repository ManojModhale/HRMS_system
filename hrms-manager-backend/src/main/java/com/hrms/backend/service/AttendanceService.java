package com.hrms.backend.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.hrms.backend.dto.AttendanceDto;
import com.hrms.backend.dto.MarkAttendanceRequest;
import com.hrms.backend.entity.Attendance;
import com.hrms.backend.entity.AttendanceStatus;
import com.hrms.backend.entity.Employee;
import com.hrms.backend.entity.Role;
import com.hrms.backend.entity.User;
import com.hrms.backend.repository.AttendanceRepository;
import com.hrms.backend.repository.EmployeeRepository;
import com.hrms.backend.repository.UserRepository;

import jakarta.transaction.Transactional;

@Service
public class AttendanceService {

    private static final Logger logger = LoggerFactory.getLogger(AttendanceService.class);

    @Autowired
    private AttendanceRepository attendanceRepository;

    @Autowired
    private EmployeeRepository employeeRepository;
    
    @Autowired
    private UserRepository userRepository;

    /**
     * Marks attendance for an employee. Can be used by an employee for self-marking
     * (for today only) or by an admin/HR for any employee on any date.
     *
     * @param currentUserId The ID of the currently authenticated user.
     * @param request       The MarkAttendanceRequest containing employeeId (optional),
     * attendanceDate (optional), and status.
     * @return AttendanceDto of the marked/updated attendance.
     * @throws IllegalArgumentException if validation fails or user is unauthorized.
     */
    /*@Transactional
    public AttendanceDto markAttendance(Long currentUserId, MarkAttendanceRequest request) {
        logger.info("Attempting to mark attendance by user ID: {}", currentUserId);

        User currentUser = userRepository.findById(currentUserId)
                .orElseThrow(() -> new IllegalArgumentException("Authenticated user not found."));

        Employee targetEmployee;
        LocalDate effectiveAttendanceDate;
        User markedBy = currentUser; // Default to current user marking it

        // Determine target employee and attendance date based on role and request
        if (currentUser.getRole() == Role.EMPLOYEE) {
            // Employee marking their own attendance
            if (request.getEmployeeId() != null && !employeeRepository.findByUserId(currentUserId).map(Employee::getId).orElseThrow().equals(request.getEmployeeId())) {
                throw new IllegalArgumentException("Employees can only mark their own attendance.");
            }
            targetEmployee = employeeRepository.findByUserId(currentUserId)
                    .orElseThrow(() -> new IllegalArgumentException("Employee record not found for authenticated user."));
            effectiveAttendanceDate = LocalDate.now(); // Employee can only mark for today
            if (request.getAttendanceDate() != null && !request.getAttendanceDate().isEqual(effectiveAttendanceDate)) {
                 throw new IllegalArgumentException("Employees can only mark attendance for today.");
            }
            if (request.getStatus() != AttendanceStatus.PRESENT && request.getStatus() != AttendanceStatus.HALF_DAY) {
                // Employees can only mark PRESENT or HALF_DAY for themselves
                throw new IllegalArgumentException("Employees can only mark themselves as PRESENT or HALF_DAY.");
            }
            markedBy = null; // If employee marks, markedBy can be null or self-reference. Let's keep it null for simplicity.
                             // Or set to current user if you want to explicitly track self-marking.
                             // For now, setting to null if employee marks themselves, otherwise it's admin.

        } else if (currentUser.getRole() == Role.ADMIN || currentUser.getRole() == Role.HR) {
            // Admin/HR marking attendance for any employee on any date
            if (request.getEmployeeId() == null) {
                throw new IllegalArgumentException("Employee ID is required for admin/HR to mark attendance.");
            }
            if (request.getAttendanceDate() == null) {
                throw new IllegalArgumentException("Attendance date is required for admin/HR to mark attendance.");
            }
            targetEmployee = employeeRepository.findById(request.getEmployeeId())
                    .orElseThrow(() -> new IllegalArgumentException("Target employee not found."));
            effectiveAttendanceDate = request.getAttendanceDate();
            markedBy = currentUser; // Admin/HR explicitly marks it
        } else {
            throw new IllegalArgumentException("Unauthorized role to mark attendance.");
        }

        // Check for existing attendance for the same employee and date
        Optional<Attendance> existingAttendance = attendanceRepository.findByEmployeeAndAttendanceDate(targetEmployee, effectiveAttendanceDate);
        Attendance attendance;

        if (existingAttendance.isPresent()) {
            attendance = existingAttendance.get();
            attendance.setStatus(request.getStatus());
            attendance.setMarkedBy(markedBy); // Update who marked it if it's an admin
            logger.info("Updating existing attendance record for employee {} on {}: New status {}",
                        targetEmployee.getId(), effectiveAttendanceDate, request.getStatus());
        } else {
            attendance = new Attendance();
            attendance.setEmployee(targetEmployee);
            attendance.setAttendanceDate(effectiveAttendanceDate);
            attendance.setStatus(request.getStatus());
            attendance.setMarkedBy(markedBy);
            logger.info("Creating new attendance record for employee {} on {}: Status {}",
                        targetEmployee.getId(), effectiveAttendanceDate, request.getStatus());
        }

        Attendance savedAttendance = attendanceRepository.save(attendance);
        return convertToDto(savedAttendance);
    }*/
    
    /**
     * Employee marks their own attendance.
     * @param employeeUserId The ID of the authenticated employee user.
     * @param status The attendance status (e.g., PRESENT, ABSENT, LEAVE).
     * @return AttendanceDto of the marked attendance.
     * @throws IllegalArgumentException if employee not found or attendance already marked for today.
     */
    @Transactional
    public AttendanceDto markAttendanceByEmployee(Long employeeUserId, AttendanceStatus status) {
        logger.info("Employee user ID {} attempting to mark attendance as {}", employeeUserId, status);

        Employee employee = employeeRepository.findByUserId(employeeUserId)
                .orElseThrow(() -> new IllegalArgumentException("Employee record not found for user ID: " + employeeUserId));

        LocalDate today = LocalDate.now();
        Optional<Attendance> existingAttendance = attendanceRepository.findByEmployeeAndAttendanceDate(employee, today);

        if (existingAttendance.isPresent()) {
            throw new IllegalArgumentException("Attendance already marked for today for employee: " + employee.getFirstName());
        }
        
        // Employees can only mark PRESENT or HALF_DAY for themselves
        if (status != AttendanceStatus.PRESENT && status != AttendanceStatus.HALF_DAY) {
            throw new IllegalArgumentException("Employees can only mark themselves as PRESENT or HALF_DAY.");
        }

        Attendance attendance = new Attendance();
        attendance.setEmployee(employee);
        attendance.setAttendanceDate(today);
        attendance.setStatus(status);
        // MarkedBy can be null if employee marks their own attendance, or set to employee's user if desired
        // For simplicity, leaving as null here, as it's implied by the endpoint.
        attendance.setMarkedBy(null); // Employee marks their own, no specific admin user
        attendance.setMarkedByLabelOverride("Employee Self-Marked"); // Custom label for UI
        attendance.setTimestamp(LocalDateTime.now());

        Attendance savedAttendance = attendanceRepository.save(attendance);
        logger.info("Attendance marked successfully for employee {} (ID: {}) as {} by Employee Self-Marked.",
                employee.getFirstName(), employee.getId(), status);
        return convertToDto(savedAttendance);
    }

    /**
     * Admin/HR marks attendance for a specific employee.
     * @param employeeId The ID of the employee whose attendance is being marked.
     * @param status The attendance status.
     * @param adminUserId The ID of the authenticated admin/HR user performing the action.
     * @return AttendanceDto of the marked attendance.
     * @throws IllegalArgumentException if employee not found, attendance already marked, or admin user not found/unauthorized.
     */
    @Transactional
    public AttendanceDto markAttendanceByAdmin(Long employeeId, AttendanceStatus status, LocalDate attendanceDate, Long adminUserId) {
        logger.info("Admin user ID {} attempting to mark attendance for employee ID: {} as {}",
                    adminUserId, employeeId, status);

        User markingUser = null;
        String markedByLabel = null;
        if (adminUserId == 0L) {
            // Special handling for hardcoded 'superadmin' not in DB
            //markingUser = new User(0L, "superadmin", null, Role.ADMIN); // Password can be null for this purpose
        	logger.warn("Synthetic superadmin (ID 0) is marking attendance. 'marked_by_user_id' will be null in DB.");
            markedByLabel = "Admin Marked (System)"; // Custom label for UI
        } else {
            // For regular admin/HR users stored in the database
            markingUser = userRepository.findById(adminUserId)
                    .orElseThrow(() -> new IllegalArgumentException("Admin user not found with ID: " + adminUserId));

            if (markingUser.getRole() != Role.ADMIN && markingUser.getRole() != Role.HR) {
                throw new IllegalArgumentException("Unauthorized: Only ADMIN or HR can mark attendance for others.");
            }
        }

        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new IllegalArgumentException("Employee not found with ID: " + employeeId));

        //LocalDate today = LocalDate.now(); // Assuming admin marks for today, or adjust if date is in request
        // If the request for admin marking includes a date, use that instead of LocalDate.now()
        // For this method, let's assume it's for marking today's attendance by admin.
        // If you need to mark for a past/future date, the MarkAttendanceRequest DTO needs to include it.
        // For now, I'll use `today` as the default, similar to employee self-marking.
        // If the MarkAttendanceRequest used for admin marking includes `attendanceDate`,
        // you should use `request.getAttendanceDate()` here.
        // Based on your MarkAttendanceModal, it sends `attendanceDate`. Let's use that.
        //LocalDate attendanceDateofEmp = attendanceDate; // Default to today if not provided in request
        // If MarkAttendanceRequest has getAttendanceDate(), use it
        // Example: if (request.getAttendanceDate() != null) attendanceDate = request.getAttendanceDate();


        Optional<Attendance> existingAttendance = attendanceRepository.findByEmployeeAndAttendanceDate(employee, attendanceDate); // Use attendanceDate

        if (existingAttendance.isPresent()) {
            throw new IllegalArgumentException("Attendance already marked for this date for employee: " + employee.getFirstName());
        }

        Attendance attendance = new Attendance();
        attendance.setEmployee(employee);
        attendance.setAttendanceDate(attendanceDate); // Use attendanceDate
        attendance.setStatus(status);
        attendance.setMarkedBy(markingUser); // Set the synthetic or DB-fetched user
        attendance.setMarkedByLabelOverride(markedByLabel); // Will be "Admin Marked (System)" for synthetic admin, or null for real admin
        attendance.setTimestamp(LocalDateTime.now());

        Attendance savedAttendance = attendanceRepository.save(attendance);
        logger.info("Attendance marked successfully for employee {} (ID: {}) on {} as {} by {}.",
                    employee.getFirstName(), employee.getId(), attendanceDate, status,
                    (markedByLabel != null ? markedByLabel : (markingUser != null ? markingUser.getUsername() : "Unknown Admin")));
        return convertToDto(savedAttendance);
    }


    /**
     * Retrieves attendance history for a specific employee.
     *
     * @param employeeUserId The user ID of the employee whose attendance is to be retrieved.
     * @return List of AttendanceDto.
     * @throws IllegalArgumentException if employee not found.
     */
    public List<AttendanceDto> getEmployeeAttendanceHistory(Long employeeUserId) {
        logger.info("Fetching attendance history for employee user ID: {}", employeeUserId);
        Employee employee = employeeRepository.findByUserId(employeeUserId)
                .orElseThrow(() -> new IllegalArgumentException("Employee not found for user ID: " + employeeUserId));

        List<Attendance> attendanceList  = attendanceRepository.findByEmployeeOrderByAttendanceDateDesc(employee);
        return attendanceList .stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    /**
     * Retrieves all attendance records, optionally filtered by date range.
     * Requires ADMIN or HR role.
     *
     * @param startDate Optional start date for filtering.
     * @param endDate   Optional end date for filtering.
     * @return List of AttendanceDto.
     */
    public List<AttendanceDto> getAllAttendance(LocalDate startDate, LocalDate endDate) {
        logger.info("Fetching all attendance records with date range: {} to {}", startDate, endDate);
        List<Attendance> attendanceRecords;
        if (startDate != null && endDate != null) {
            attendanceRecords = attendanceRepository.findByAttendanceDateBetweenOrderByAttendanceDateAsc(startDate, endDate);
        } else {
            attendanceRecords = attendanceRepository.findAllByOrderByAttendanceDateDescEmployeeFirstNameAsc(); // Default to all if no range
        }
        return attendanceRecords.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }
    
    /**
     * Retrieves all attendance records, optionally filtered by a single date.
     * @param date Optional date to filter records.
     * @return List of AttendanceDto.
     */
    public List<AttendanceDto> getAllAttendanceByDate(LocalDate date) {
        logger.info("Fetching all attendance records. Filter date: {}", date);
        List<Attendance> attendanceList;
        if (date != null) {
            attendanceList = attendanceRepository.findByAttendanceDateOrderByEmployeeFirstNameAsc(date);
        } else {
            attendanceList = attendanceRepository.findAllByOrderByAttendanceDateDescEmployeeFirstNameAsc();
        }
        return attendanceList.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    /**
     * Updates an existing attendance record. Requires ADMIN or HR role.
     *
     * @param attendanceId  The ID of the attendance record to update.
     * @param newStatus The new attendance status (directly passed).
     * @param adminUserId   The ID of the authenticated admin/HR user.
     * @return AttendanceDto of the updated record.
     * @throws IllegalArgumentException if record not found or unauthorized access.
     */
    @Transactional
    public AttendanceDto updateAttendance(Long attendanceId, AttendanceStatus newStatus, Long adminUserId) { // Changed request to newStatus
        logger.info("Admin user {} attempting to update attendance record ID: {} to status {}",
                    adminUserId, attendanceId, newStatus);

        User updatingUser = null;
        String markedByLabel = null;
        if (adminUserId == 0L) {
            // Special handling for hardcoded 'superadmin' not in DB
            //updatingUser = new User(0L, "superadmin", null, Role.ADMIN); // Password can be null for this purpose
        	logger.warn("Synthetic superadmin (ID 0) is updating attendance. 'marked_by_user_id' will be null in DB.");
            markedByLabel = "Admin Marked (System)"; // Custom label for UI
        } else {
            // For regular admin/HR users stored in the database
            updatingUser = userRepository.findById(adminUserId)
                    .orElseThrow(() -> new IllegalArgumentException("Admin user not found with ID: " + adminUserId));

            if (updatingUser.getRole() != Role.ADMIN && updatingUser.getRole() != Role.HR) {
                throw new IllegalArgumentException("Unauthorized: Only ADMIN or HR can update attendance.");
            }
        }

        Attendance attendance = attendanceRepository.findById(attendanceId)
                .orElseThrow(() -> new IllegalArgumentException("Attendance record not found with ID: " + attendanceId));

        // Update fields based on the newStatus
        if (newStatus != null) {
            attendance.setStatus(newStatus);
        }
        
        attendance.setMarkedBy(updatingUser); // Admin explicitly updates it
        attendance.setMarkedByLabelOverride(markedByLabel);
        attendance.setTimestamp(LocalDateTime.now()); // Update timestamp

        Attendance updatedAttendance = attendanceRepository.save(attendance);
        logger.info("Successfully updated attendance record ID: {} to status {}", attendanceId, updatedAttendance.getStatus());
        return convertToDto(updatedAttendance);
    }

    // Helper method to convert Entity to DTO
    private AttendanceDto convertToDto(Attendance attendance) {
        String employeeName = (attendance.getEmployee() != null) ?
                attendance.getEmployee().getFirstName() + " " + attendance.getEmployee().getLastName() : "N/A";
        /*String markedByUsername = (attendance.getMarkedBy() != null) ?
                attendance.getMarkedBy().getUsername() : "Employee Self-Marked"; // Default for employee self-marked*/
        
        String markedByUsername;
        if (attendance.getMarkedByLabelOverride() != null) {
            // Use the override label if present (e.g., "Employee Self-Marked", "Admin Marked (System)")
            markedByUsername = attendance.getMarkedByLabelOverride();
        } else if (attendance.getMarkedBy() != null) {
            // Otherwise, use the actual username if a User entity is linked
            markedByUsername = attendance.getMarkedBy().getUsername();
        } else {
            // Fallback for any other case where markedBy is null and no override is set
            // This might happen for older records or if logic was different.
            markedByUsername = "Unknown Source"; 
        }

        return new AttendanceDto(
                attendance.getId(),
                attendance.getEmployee().getId(),
                employeeName,
                attendance.getAttendanceDate(),
                attendance.getStatus(),
                markedByUsername,
                attendance.getTimestamp()
        );
    }
}