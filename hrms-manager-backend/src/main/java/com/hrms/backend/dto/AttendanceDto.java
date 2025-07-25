package com.hrms.backend.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

import com.hrms.backend.entity.AttendanceStatus;

public class AttendanceDto {
    private Long id;
    private Long employeeId;
    private String employeeName; // For display purposes
    private LocalDate attendanceDate;
    private AttendanceStatus status;
    private String markedByUsername; // Optional, to show who marked it
    private LocalDateTime timestamp;

    // --- Constructors ---
    public AttendanceDto() {
    }

    public AttendanceDto(Long id, Long employeeId, String employeeName, LocalDate attendanceDate, AttendanceStatus status, String markedByUsername, LocalDateTime timestamp) {
        this.id = id;
        this.employeeId = employeeId;
        this.employeeName = employeeName;
        this.attendanceDate = attendanceDate;
        this.status = status;
        this.markedByUsername = markedByUsername;
        this.timestamp = timestamp;
    }

    // --- Getters and Setters ---
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getEmployeeId() {
        return employeeId;
    }

    public void setEmployeeId(Long employeeId) {
        this.employeeId = employeeId;
    }

    public String getEmployeeName() {
        return employeeName;
    }

    public void setEmployeeName(String employeeName) {
        this.employeeName = employeeName;
    }

    public LocalDate getAttendanceDate() {
        return attendanceDate;
    }

    public void setAttendanceDate(LocalDate attendanceDate) {
        this.attendanceDate = attendanceDate;
    }

    public AttendanceStatus getStatus() {
        return status;
    }

    public void setStatus(AttendanceStatus status) {
        this.status = status;
    }

    public String getMarkedByUsername() {
        return markedByUsername;
    }

    public void setMarkedByUsername(String markedByUsername) {
        this.markedByUsername = markedByUsername;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }

    @Override
    public String toString() {
        return "AttendanceDto{" +
                "id=" + id +
                ", employeeId=" + employeeId +
                ", employeeName='" + employeeName + '\'' +
                ", attendanceDate=" + attendanceDate +
                ", status=" + status +
                ", markedByUsername='" + markedByUsername + '\'' +
                ", timestamp=" + timestamp +
                '}';
    }
}
