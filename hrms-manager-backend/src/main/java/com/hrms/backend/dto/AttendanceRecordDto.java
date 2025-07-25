package com.hrms.backend.dto;

import java.time.LocalDate;
import java.time.LocalTime;

import com.hrms.backend.entity.AttendanceStatus;

public class AttendanceRecordDto {
	private Long id;
    private Long employeeId;
    private String employeeUsername;
    private String employeeFirstName;
    private String employeeLastName;
    private LocalDate attendanceDate;
    private AttendanceStatus status;
    private LocalTime checkInTime;
    private LocalTime checkOutTime;

    // --- Constructors ---
    public AttendanceRecordDto() {
    }

    public AttendanceRecordDto(Long id, Long employeeId, String employeeUsername, String employeeFirstName, String employeeLastName,
                               LocalDate attendanceDate, AttendanceStatus status, LocalTime checkInTime, LocalTime checkOutTime) {
        this.id = id;
        this.employeeId = employeeId;
        this.employeeUsername = employeeUsername;
        this.employeeFirstName = employeeFirstName;
        this.employeeLastName = employeeLastName;
        this.attendanceDate = attendanceDate;
        this.status = status;
        this.checkInTime = checkInTime;
        this.checkOutTime = checkOutTime;
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

    public LocalTime getCheckInTime() {
        return checkInTime;
    }

    public void setCheckInTime(LocalTime checkInTime) {
        this.checkInTime = checkInTime;
    }

    public LocalTime getCheckOutTime() {
        return checkOutTime;
    }

    public void setCheckOutTime(LocalTime checkOutTime) {
        this.checkOutTime = checkOutTime;
    }
}
