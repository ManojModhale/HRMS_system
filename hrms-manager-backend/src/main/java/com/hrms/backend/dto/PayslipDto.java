package com.hrms.backend.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.Map;

public class PayslipDto {
    private Long id;
    private Long employeeId;
    private String employeeName;
    private String employeeIdNumber; // Added for convenience
    private Integer payPeriodMonth;
    private Integer payPeriodYear;
    private BigDecimal grossSalary;
    private BigDecimal baseMonthlySalary;
    private Integer totalWorkingDaysInMonth;
    private Integer daysPresent;
    private Integer daysAbsent;
    private Integer daysHalfDay;
    private Integer daysOnApprovedLeave;
    private BigDecimal attendanceDeduction;
    private BigDecimal taxDeduction;
    private BigDecimal pfDeduction;
    private BigDecimal otherDeductions;
    private BigDecimal bonusAmount;
    private BigDecimal netSalary;
    private LocalDateTime generationDate;
    private String generatedBy;

    // Constructors
    public PayslipDto() {}

    public PayslipDto(Long id, Long employeeId, String employeeName, String employeeIdNumber, Integer payPeriodMonth,
                      Integer payPeriodYear, BigDecimal grossSalary, BigDecimal baseMonthlySalary,
                      Integer totalWorkingDaysInMonth, Integer daysPresent, Integer daysAbsent, Integer daysHalfDay,
                      Integer daysOnApprovedLeave, BigDecimal attendanceDeduction, BigDecimal taxDeduction,
                      BigDecimal pfDeduction, BigDecimal otherDeductions, BigDecimal bonusAmount,
                      BigDecimal netSalary, LocalDateTime generationDate, String generatedBy) {
        this.id = id;
        this.employeeId = employeeId;
        this.employeeName = employeeName;
        this.employeeIdNumber = employeeIdNumber;
        this.payPeriodMonth = payPeriodMonth;
        this.payPeriodYear = payPeriodYear;
        this.grossSalary = grossSalary;
        this.baseMonthlySalary = baseMonthlySalary;
        this.totalWorkingDaysInMonth = totalWorkingDaysInMonth;
        this.daysPresent = daysPresent;
        this.daysAbsent = daysAbsent;
        this.daysHalfDay = daysHalfDay;
        this.daysOnApprovedLeave = daysOnApprovedLeave;
        this.attendanceDeduction = attendanceDeduction;
        this.taxDeduction = taxDeduction;
        this.pfDeduction = pfDeduction;
        this.otherDeductions = otherDeductions;
        this.bonusAmount = bonusAmount;
        this.netSalary = netSalary;
        this.generationDate = generationDate;
        this.generatedBy = generatedBy;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getEmployeeId() { return employeeId; }
    public void setEmployeeId(Long employeeId) { this.employeeId = employeeId; }
    public String getEmployeeName() { return employeeName; }
    public void setEmployeeName(String employeeName) { this.employeeName = employeeName; }
    public String getEmployeeIdNumber() { return employeeIdNumber; }
    public void setEmployeeIdNumber(String employeeIdNumber) { this.employeeIdNumber = employeeIdNumber; }
    public Integer getPayPeriodMonth() { return payPeriodMonth; }
    public void setPayPeriodMonth(Integer payPeriodMonth) { this.payPeriodMonth = payPeriodMonth; }
    public Integer getPayPeriodYear() { return payPeriodYear; }
    public void setPayPeriodYear(Integer payPeriodYear) { this.payPeriodYear = payPeriodYear; }
    public BigDecimal getGrossSalary() { return grossSalary; }
    public void setGrossSalary(BigDecimal grossSalary) { this.grossSalary = grossSalary; }
    public BigDecimal getBaseMonthlySalary() { return baseMonthlySalary; }
    public void setBaseMonthlySalary(BigDecimal baseMonthlySalary) { this.baseMonthlySalary = baseMonthlySalary; }
    public Integer getTotalWorkingDaysInMonth() { return totalWorkingDaysInMonth; }
    public void setTotalWorkingDaysInMonth(Integer totalWorkingDaysInMonth) { this.totalWorkingDaysInMonth = totalWorkingDaysInMonth; }
    public Integer getDaysPresent() { return daysPresent; }
    public void setDaysPresent(Integer daysPresent) { this.daysPresent = daysPresent; }
    public Integer getDaysAbsent() { return daysAbsent; }
    public void setDaysAbsent(Integer daysAbsent) { this.daysAbsent = daysAbsent; }
    public Integer getDaysHalfDay() { return daysHalfDay; }
    public void setDaysHalfDay(Integer daysHalfDay) { this.daysHalfDay = daysHalfDay; }
    public Integer getDaysOnApprovedLeave() { return daysOnApprovedLeave; }
    public void setDaysOnApprovedLeave(Integer daysOnApprovedLeave) { this.daysOnApprovedLeave = daysOnApprovedLeave; }
    public BigDecimal getAttendanceDeduction() { return attendanceDeduction; }
    public void setAttendanceDeduction(BigDecimal attendanceDeduction) { this.attendanceDeduction = attendanceDeduction; }
    public BigDecimal getTaxDeduction() { return taxDeduction; }
    public void setTaxDeduction(BigDecimal taxDeduction) { this.taxDeduction = taxDeduction; }
    public BigDecimal getPfDeduction() { return pfDeduction; }
    public void setPfDeduction(BigDecimal pfDeduction) { this.pfDeduction = pfDeduction; }
    public BigDecimal getOtherDeductions() { return otherDeductions; }
    public void setOtherDeductions(BigDecimal otherDeductions) { this.otherDeductions = otherDeductions; }
    public BigDecimal getBonusAmount() { return bonusAmount; }
    public void setBonusAmount(BigDecimal bonusAmount) { this.bonusAmount = bonusAmount; }
    public BigDecimal getNetSalary() { return netSalary; }
    public void setNetSalary(BigDecimal netSalary) { this.netSalary = netSalary; }
    public LocalDateTime getGenerationDate() { return generationDate; }
    public void setGenerationDate(LocalDateTime generationDate) { this.generationDate = generationDate; }
    public String getGeneratedBy() { return generatedBy; }
    public void setGeneratedBy(String generatedBy) { this.generatedBy = generatedBy; }
}