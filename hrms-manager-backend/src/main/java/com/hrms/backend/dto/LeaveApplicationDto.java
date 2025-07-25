package com.hrms.backend.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

import com.hrms.backend.entity.LeaveStatus;

public class LeaveApplicationDto {
    private Long id;
    private Long employeeId;
    private String employeeName; // For display purposes
    private LocalDate startDate;
    private LocalDate endDate;
    private String reason;
    private LeaveStatus status;
    private LocalDate appliedDate;
    private String adminNotes;
    private String processedByUsername; // Optional, to show who processed it
    private LocalDateTime processedDate;

    // --- Constructors ---
    public LeaveApplicationDto() {
    }

    public LeaveApplicationDto(Long id, Long employeeId, String employeeName, LocalDate startDate, LocalDate endDate, String reason, LeaveStatus status, LocalDate appliedDate, String adminNotes, String processedByUsername, LocalDateTime processedDate) {
        this.id = id;
        this.employeeId = employeeId;
        this.employeeName = employeeName;
        this.startDate = startDate;
        this.endDate = endDate;
        this.reason = reason;
        this.status = status;
        this.appliedDate = appliedDate;
        this.adminNotes = adminNotes;
        this.processedByUsername = processedByUsername;
        this.processedDate = processedDate;
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

    public LocalDate getStartDate() {
        return startDate;
    }

    public void setStartDate(LocalDate startDate) {
        this.startDate = startDate;
    }

    public LocalDate getEndDate() {
        return endDate;
    }

    public void setEndDate(LocalDate endDate) {
        this.endDate = endDate;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }

    public LeaveStatus getStatus() {
        return status;
    }

    public void setStatus(LeaveStatus status) {
        this.status = status;
    }

    public LocalDate getAppliedDate() {
        return appliedDate;
    }

    public void setAppliedDate(LocalDate appliedDate) {
        this.appliedDate = appliedDate;
    }

    public String getAdminNotes() {
        return adminNotes;
    }

    public void setAdminNotes(String adminNotes) {
        this.adminNotes = adminNotes;
    }

    public String getProcessedByUsername() {
        return processedByUsername;
    }

    public void setProcessedByUsername(String processedByUsername) {
        this.processedByUsername = processedByUsername;
    }

    public LocalDateTime getProcessedDate() {
        return processedDate;
    }

    public void setProcessedDate(LocalDateTime processedDate) {
        this.processedDate = processedDate;
    }

    @Override
    public String toString() {
        return "LeaveApplicationDto{" +
                "id=" + id +
                ", employeeId=" + employeeId +
                ", employeeName='" + employeeName + '\'' +
                ", startDate=" + startDate +
                ", endDate=" + endDate +
                ", reason='" + reason + '\'' +
                ", status=" + status +
                ", appliedDate=" + appliedDate +
                ", adminNotes='" + adminNotes + '\'' +
                ", processedByUsername='" + processedByUsername + '\'' +
                ", processedDate=" + processedDate +
                '}';
    }
}