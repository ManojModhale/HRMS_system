package com.hrms.backend.entity;

import java.time.LocalDate;
import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "leave_applications")
public class LeaveApplication {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER) // Many leave applications for one employee
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee; // Link to the Employee entity

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "end_date", nullable = false)
    private LocalDate endDate;

    @Column(nullable = false, length = 1000) // Reason can be longer
    private String reason;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private LeaveStatus status;

    @Column(name = "applied_date", nullable = false)
    private LocalDate appliedDate;

    @Column(name = "admin_notes", length = 1000) // Optional notes from admin
    private String adminNotes;

    @ManyToOne(fetch = FetchType.LAZY) // Who processed this leave
    @JoinColumn(name = "processed_by_user_id") // Nullable until processed
    private User processedBy;
    //private String processedBy;

    @Column(name = "processed_date") // Nullable until processed
    private LocalDateTime processedDate;

    // --- Constructors ---
    public LeaveApplication() {
    }

    public LeaveApplication(Employee employee, LocalDate startDate, LocalDate endDate, String reason, LeaveStatus status, LocalDate appliedDate) {
        this.employee = employee;
        this.startDate = startDate;
        this.endDate = endDate;
        this.reason = reason;
        this.status = status;
        this.appliedDate = appliedDate;
    }

    // --- Getters and Setters ---
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Employee getEmployee() {
        return employee;
    }

    public void setEmployee(Employee employee) {
        this.employee = employee;
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

    public User getProcessedBy() {
        return processedBy;
    }

    public void setProcessedBy(User processedBy) {
        this.processedBy = processedBy;
    }

    public LocalDateTime getProcessedDate() {
        return processedDate;
    }

    public void setProcessedDate(LocalDateTime processedDate) {
        this.processedDate = processedDate;
    }

    @Override
    public String toString() {
        return "LeaveApplication{" +
                "id=" + id +
                ", employee=" + (employee != null ? employee.getFirstName() + " " + employee.getLastName() : "null") +
                ", startDate=" + startDate +
                ", endDate=" + endDate +
                ", reason='" + reason + '\'' +
                ", status=" + status +
                ", appliedDate=" + appliedDate +
                ", adminNotes='" + adminNotes + '\'' +
                ", processedBy=" + (processedBy != null ? processedBy.getUsername() : "null") +
                ", processedDate=" + processedDate +
                '}';
    }
}
