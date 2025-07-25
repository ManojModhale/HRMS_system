package com.hrms.backend.dto;

import java.time.LocalDate;
import java.time.LocalTime;

import jakarta.validation.constraints.NotNull;

public class AttendanceMarkRequest {
	@NotNull(message = "Attendance date is required")
    private LocalDate attendanceDate;

    private LocalTime checkInTime; // Optional, for marking check-in
    private LocalTime checkOutTime; // Optional, for marking check-out

    // --- Constructors ---
    public AttendanceMarkRequest() {
    }

    public AttendanceMarkRequest(LocalDate attendanceDate, LocalTime checkInTime, LocalTime checkOutTime) {
        this.attendanceDate = attendanceDate;
        this.checkInTime = checkInTime;
        this.checkOutTime = checkOutTime;
    }

    // --- Getters and Setters ---
    public LocalDate getAttendanceDate() {
        return attendanceDate;
    }

    public void setAttendanceDate(LocalDate attendanceDate) {
        this.attendanceDate = attendanceDate;
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
