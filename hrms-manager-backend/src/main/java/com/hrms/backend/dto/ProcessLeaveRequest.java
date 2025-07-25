package com.hrms.backend.dto;

import com.hrms.backend.entity.LeaveStatus;

public class ProcessLeaveRequest {
    private Long leaveApplicationId;
    private LeaveStatus status; // APPROVED or REJECTED
    private String adminNotes; // Required if rejecting

    // --- Constructors ---
    public ProcessLeaveRequest() {
    }

    public ProcessLeaveRequest(Long leaveApplicationId, LeaveStatus status, String adminNotes) {
        this.leaveApplicationId = leaveApplicationId;
        this.status = status;
        this.adminNotes = adminNotes;
    }

    // --- Getters and Setters ---
    public Long getLeaveApplicationId() {
        return leaveApplicationId;
    }

    public void setLeaveApplicationId(Long leaveApplicationId) {
        this.leaveApplicationId = leaveApplicationId;
    }

    public LeaveStatus getStatus() {
        return status;
    }

    public void setStatus(LeaveStatus status) {
        this.status = status;
    }

    public String getAdminNotes() {
        return adminNotes;
    }

    public void setAdminNotes(String adminNotes) {
        this.adminNotes = adminNotes;
    }

    @Override
    public String toString() {
        return "ProcessLeaveRequest{" +
                "leaveApplicationId=" + leaveApplicationId +
                ", status=" + status +
                ", adminNotes='" + adminNotes + '\'' +
                '}';
    }
}
