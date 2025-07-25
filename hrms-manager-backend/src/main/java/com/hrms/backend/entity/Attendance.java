package com.hrms.backend.entity;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

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
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

@Entity
@Table(name = "attendance",
        uniqueConstraints = {
            @UniqueConstraint(columnNames = {"employee_id", "attendance_date"}) // Ensures one attendance record per employee per day
        })
public class Attendance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER) // Many attendance records for one employee
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee; // Link to the Employee entity

    @Column(name = "attendance_date", nullable = false)
    private LocalDate attendanceDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AttendanceStatus status;

    @ManyToOne(fetch = FetchType.LAZY) // Who marked this attendance (can be employee themselves or an admin)
    @JoinColumn(name = "marked_by_user_id") // Nullable if employee marks their own and we don't track the user_id
    private User markedBy;
    //private String markedBy;
    
    // New field to store display label when markedBy is null (e.g., "Employee Self-Marked", "Admin Marked (System)")
    @Column(name = "marked_by_label_override", length = 100)
    private String markedByLabelOverride;

    @Column(nullable = false)
    private LocalDateTime timestamp; // When the record was created or last updated

    // --- Constructors ---
    public Attendance() {
    }

    public Attendance(Employee employee, LocalDate attendanceDate, AttendanceStatus status, User markedBy, LocalDateTime timestamp) {
        this.employee = employee;
        this.attendanceDate = attendanceDate;
        this.status = status;
        this.markedBy = markedBy;
        this.timestamp = timestamp;
    }
    
 // Updated constructor to include markedByLabelOverride
    public Attendance(Employee employee, LocalDate attendanceDate, AttendanceStatus status, User markedBy, String markedByLabelOverride, LocalDateTime timestamp) {
        this.employee = employee;
        this.attendanceDate = attendanceDate;
        this.status = status;
        this.markedBy = markedBy;
        this.markedByLabelOverride = markedByLabelOverride;
        this.timestamp = timestamp;
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

    public LocalDate getAttendanceDate() {
        return attendanceDate;
    }

    public void setAttendanceDate(LocalDate attendanceDate) {
        this.attendanceDate = attendanceDate;
    }

    public AttendanceStatus getStatus() {
        return status;
    }

    public void setStatus(AttendanceStatus status) {
        this.status = status;
    }

    public User getMarkedBy() {
        return markedBy;
    }

    public void setMarkedBy(User markedBy) {
        this.markedBy = markedBy;
    }
    
    public String getMarkedByLabelOverride() {
        return markedByLabelOverride;
    }

    public void setMarkedByLabelOverride(String markedByLabelOverride) {
        this.markedByLabelOverride = markedByLabelOverride;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }

    @PrePersist
    @PreUpdate
    public void setTimestampOnPersistAndUpdate() {
        this.timestamp = LocalDateTime.now();
    }

    @Override
    public String toString() {
        return "Attendance{" +
                "id=" + id +
                ", employee=" + (employee != null ? employee.getFirstName() + " " + employee.getLastName() : "null") +
                ", attendanceDate=" + attendanceDate +
                ", status=" + status +
                ", markedBy=" + (markedBy != null ? markedBy.getUsername() : "null") +
                ", markedByLabelOverride='" + markedByLabelOverride + '\'' +
                ", timestamp=" + timestamp +
                '}';
    }
}
