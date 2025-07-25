package com.hrms.backend.dto;

import java.time.LocalDate;

import com.hrms.backend.entity.LeaveStatus;

public class LeaveResponseDto {
	private Long id;
    private Long employeeId;
    private String employeeUsername;
    private String employeeFirstName;
    private String employeeLastName;
    private LocalDate startDate;
    private LocalDate endDate;
    private String leaveType;
    private String reason;
    private LeaveStatus status;
    private LocalDate appliedDate;
    private String adminComment;

    // --- Constructors ---
    public LeaveResponseDto() {
    }

    public LeaveResponseDto(Long id, Long employeeId, String employeeUsername, String employeeFirstName, String employeeLastName,
                            LocalDate startDate, LocalDate endDate, String leaveType, String reason,
                            LeaveStatus status, LocalDate appliedDate, String adminComment) {
        this.id = id;
        this.employeeId = employeeId;
        this.employeeUsername = employeeUsername;
        this.employeeFirstName = employeeFirstName;
        this.employeeLastName = employeeLastName;
        this.startDate = startDate;
        this.endDate = endDate;
        this.leaveType = leaveType;
        this.reason = reason;
        this.status = status;
        this.appliedDate = appliedDate;
        this.adminComment = adminComment;
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

    public String getEmployeeUsername() {
        return employeeUsername;
    }

    public void setEmployeeUsername(String employeeUsername) {
        this.employeeUsername = employeeUsername;
    }

    public String getEmployeeFirstName() {
        return employeeFirstName;
    }

    public void setEmployeeFirstName(String employeeFirstName) {
        this.employeeFirstName = employeeFirstName;
    }

    public String getEmployeeLastName() {
        return employeeLastName;
    }

    public void setEmployeeLastName(String employeeLastName) {
        this.employeeLastName = employeeLastName;
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

    public String getLeaveType() {
        return leaveType;
    }

    public void setLeaveType(String leaveType) {
        this.leaveType = leaveType;
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

    public String getAdminComment() {
        return adminComment;
    }

    public void setAdminComment(String adminComment) {
        this.adminComment = adminComment;
    }
}
