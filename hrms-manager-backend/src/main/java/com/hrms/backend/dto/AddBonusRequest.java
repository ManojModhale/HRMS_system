package com.hrms.backend.dto;

import java.math.BigDecimal;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class AddBonusRequest {
    @NotNull(message = "Employee ID is required")
    private Long employeeId;

    @NotNull(message = "Bonus amount is required")
    @DecimalMin(value = "0.01", message = "Bonus amount must be positive")
    private BigDecimal amount;

    @NotNull(message = "Month is required")
    @Min(value = 1, message = "Month must be between 1 and 12")
    private Integer month;

    @NotNull(message = "Year is required")
    @Min(value = 2000, message = "Year must be a valid year") // Adjust min year as needed
    private Integer year;

    @Size(max = 500, message = "Description cannot exceed 500 characters")
    private String description;

    // Constructors
    public AddBonusRequest() {}

    public AddBonusRequest(Long employeeId, BigDecimal amount, Integer month, Integer year, String description) {
        this.employeeId = employeeId;
        this.amount = amount;
        this.month = month;
        this.year = year;
        this.description = description;
    }

    // Getters and Setters
    public Long getEmployeeId() { return employeeId; }
    public void setEmployeeId(Long employeeId) { this.employeeId = employeeId; }
    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }
    public Integer getMonth() { return month; }
    public void setMonth(Integer month) { this.month = month; }
    public Integer getYear() { return year; }
    public void setYear(Integer year) { this.year = year; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
}