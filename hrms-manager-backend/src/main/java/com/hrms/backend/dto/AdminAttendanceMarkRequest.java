package com.hrms.backend.dto;

import java.time.LocalDate;
import java.time.LocalTime;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class AdminAttendanceMarkRequest {
	@NotNull(message = "Employee ID is required")
    private Long employeeId; // The ID of the employee whose attendance is being marked

    @NotNull(message = "Attendance date is required")
    private LocalDate attendanceDate;

    @NotBlank(message = "Status is required")
    private String status; // e.g., "PRESENT", "ABSENT", "HALF_DAY", "ON_LEAVE"

    private LocalTime checkInTime;
    private LocalTime checkOutTime;

    // --- Constructors ---
    public AdminAttendanceMarkRequest() {
    }

    public AdminAttendanceMarkRequest(Long employeeId, LocalDate attendanceDate, String status, LocalTime checkInTime, LocalTime checkOutTime) {
        this.employeeId = employeeId;
        this.attendanceDate = attendanceDate;
        this.status = status;
        this.checkInTime = checkInTime;
        this.checkOutTime = checkOutTime;
    }

    // --- Getters and Setters ---
    public Long getEmployeeId() {
        return employeeId;
    }

    public void setEmployeeId(Long employeeId) {
        this.employeeId = employeeId;
    }

    public LocalDate getAttendanceDate() {
        return attendanceDate;
    }

    public void setAttendanceDate(LocalDate attendanceDate) {
        this.attendanceDate = attendanceDate;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalTime getCheckInTime() {
        return checkInTime;
    }

    public void setCheckInTime(LocalTime checkInTime) {
        this.checkInTime = checkInTime;
    }

    public LocalTime getCheckOutTime() {
        return checkOutTime;
    }

    public void setCheckOutTime(LocalTime checkOutTime) {
        this.checkOutTime = checkOutTime;
    }
}
