package com.hrms.backend.dto;

import jakarta.validation.constraints.NotBlank;

public class LeaveUpdateStatusRequest {
	@NotBlank(message = "Status is required")
    private String status; // Should be "APPROVED" or "REJECTED"

    private String adminComment; // Optional comment from admin

    // --- Constructors ---
    public LeaveUpdateStatusRequest() {
    }

    public LeaveUpdateStatusRequest(String status, String adminComment) {
        this.status = status;
        this.adminComment = adminComment;
    }

    // --- Getters and Setters ---
    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getAdminComment() {
        return adminComment;
    }

    public void setAdminComment(String adminComment) {
        this.adminComment = adminComment;
    }
}
