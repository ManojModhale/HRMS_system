package com.hrms.backend.entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

@Entity
@Table(name = "payslips", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"employee_id", "pay_period_month", "pay_period_year"})
})
public class Payslip {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @Column(name = "pay_period_month", nullable = false)
    private Integer payPeriodMonth; // 1-12

    @Column(name = "pay_period_year", nullable = false)
    private Integer payPeriodYear;

    @Column(nullable = false, precision = 19, scale = 2) // Precision for currency
    private BigDecimal grossSalary;

    @Column(nullable = false, precision = 19, scale = 2)
    private BigDecimal baseMonthlySalary;

    @Column(nullable = false)
    private Integer totalWorkingDaysInMonth; // e.g., 25, can be dynamic or fixed

    @Column(nullable = false)
    private Integer daysPresent;

    @Column(nullable = false)
    private Integer daysAbsent;

    @Column(nullable = false)
    private Integer daysHalfDay;

    @Column(nullable = false)
    private Integer daysOnApprovedLeave;

    @Column(nullable = false, precision = 19, scale = 2)
    private BigDecimal attendanceDeduction;

    @Column(nullable = false, precision = 19, scale = 2)
    private BigDecimal taxDeduction;

    @Column(nullable = false, precision = 19, scale = 2)
    private BigDecimal pfDeduction;

    @Column(precision = 19, scale = 2) // Optional
    private BigDecimal otherDeductions;

    @Column(precision = 19, scale = 2) // Total bonus for this payslip period
    private BigDecimal bonusAmount;

    @Column(nullable = false, precision = 19, scale = 2)
    private BigDecimal netSalary;

    @Column(nullable = false)
    private LocalDateTime generationDate;

    // Hardcoded string for who generated it
    @Column(nullable = false, length = 100)
    private String generatedBy; // e.g., "Admin System" or "Super Admin"

    // Constructors
    public Payslip() {}

    public Payslip(Employee employee, Integer payPeriodMonth, Integer payPeriodYear, BigDecimal grossSalary,
                   BigDecimal baseMonthlySalary, Integer totalWorkingDaysInMonth, Integer daysPresent,
                   Integer daysAbsent, Integer daysHalfDay, Integer daysOnApprovedLeave,
                   BigDecimal attendanceDeduction, BigDecimal taxDeduction, BigDecimal pfDeduction,
                   BigDecimal otherDeductions, BigDecimal bonusAmount, BigDecimal netSalary,
                   LocalDateTime generationDate, String generatedBy) {
        this.employee = employee;
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
    public Employee getEmployee() { return employee; }
    public void setEmployee(Employee employee) { this.employee = employee; }
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