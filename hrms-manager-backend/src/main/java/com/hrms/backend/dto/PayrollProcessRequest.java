package com.hrms.backend.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public class PayrollProcessRequest {
    @NotNull(message = "Month is required")
    @Min(value = 1, message = "Month must be between 1 and 12")
    private Integer month;

    @NotNull(message = "Year is required")
    @Min(value = 2000, message = "Year must be a valid year") // Adjust min year as needed
    private Integer year;

    // Constructors
    public PayrollProcessRequest() {}

    public PayrollProcessRequest(Integer month, Integer year) {
        this.month = month;
        this.year = year;
    }

    // Getters and Setters
    public Integer getMonth() { return month; }
    public void setMonth(Integer month) { this.month = month; }
    public Integer getYear() { return year; }
    public void setYear(Integer year) { this.year = year; }
}