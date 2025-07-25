package com.hrms.backend.dto;

import java.time.LocalDate;

import com.hrms.backend.entity.AttendanceStatus;

public class MarkAttendanceRequest {
    private Long employeeId; // Optional for employee self-mark, required for admin
    private LocalDate attendanceDate; // Optional for employee self-mark (defaults to today), required for admin
    private AttendanceStatus status; // Required

    // --- Constructors ---
    public MarkAttendanceRequest() {
    }

    public MarkAttendanceRequest(Long employeeId, LocalDate attendanceDate, AttendanceStatus status) {
        this.employeeId = employeeId;
        this.attendanceDate = attendanceDate;
        this.status = status;
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

    public AttendanceStatus getStatus() {
        return status;
    }

    public void setStatus(AttendanceStatus status) {
        this.status = status;
    }

    @Override
    public String toString() {
        return "MarkAttendanceRequest{" +
                "employeeId=" + employeeId +
                ", attendanceDate=" + attendanceDate +
                ", status=" + status +
                '}';
    }
}