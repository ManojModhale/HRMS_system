package com.hrms.backend.dto;

import java.time.LocalDate;

public class ApplyLeaveRequest {
    private LocalDate startDate;
    private LocalDate endDate;
    private String reason;

    // --- Constructors ---
    public ApplyLeaveRequest() {
    }

    public ApplyLeaveRequest(LocalDate startDate, LocalDate endDate, String reason) {
        this.startDate = startDate;
        this.endDate = endDate;
        this.reason = reason;
    }

    // --- Getters and Setters ---
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

    @Override
    public String toString() {
        return "ApplyLeaveRequest{" +
                "startDate=" + startDate +
                ", endDate=" + endDate +
                ", reason='" + reason + '\'' +
                '}';
    }
}