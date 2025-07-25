package com.hrms.backend.repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.hrms.backend.entity.Attendance;
import com.hrms.backend.entity.AttendanceStatus;
import com.hrms.backend.entity.Employee;

@Repository
public interface AttendanceRepository extends JpaRepository<Attendance, Long> {
	// Find attendance records for a specific employee
    List<Attendance> findByEmployee(Employee employee);

    // Find attendance for a specific employee on a specific date
    Optional<Attendance> findByEmployeeAndAttendanceDate(Employee employee, LocalDate attendanceDate);

    // Find attendance for an employee within a date range
    List<Attendance> findByEmployeeAndAttendanceDateBetween(Employee employee, LocalDate startDate, LocalDate endDate);

    // Count attendance by status for an employee within a date range
    long countByEmployeeAndAttendanceDateBetweenAndStatus(Employee employee, LocalDate startDate, LocalDate endDate, AttendanceStatus status);

    // Find all attendance records for a specific date
    List<Attendance> findByAttendanceDate(LocalDate attendanceDate);
    

    // Find all attendance records for a specific employee, ordered by date descending
    List<Attendance> findByEmployeeOrderByAttendanceDateDesc(Employee employee);

    // Find all attendance records within a date range
    List<Attendance> findByAttendanceDateBetweenOrderByAttendanceDateAsc(LocalDate startDate, LocalDate endDate);

    // Find all attendance records for a specific employee within a date range
    List<Attendance> findByEmployeeAndAttendanceDateBetweenOrderByAttendanceDateAsc(Employee employee, LocalDate startDate, LocalDate endDate);

	List<Attendance> findByAttendanceDateOrderByEmployeeFirstNameAsc(LocalDate date);

	List<Attendance> findAllByOrderByAttendanceDateDescEmployeeFirstNameAsc();

	List<Attendance> findByEmployeeIdAndAttendanceDateBetween(Long id, LocalDate atDay, LocalDate atEndOfMonth);
}
