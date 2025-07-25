package com.hrms.backend.repository;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.hrms.backend.entity.Employee;
import com.hrms.backend.entity.LeaveApplication;
import com.hrms.backend.entity.LeaveStatus;

@Repository
public interface LeaveApplicationRepository extends JpaRepository<LeaveApplication, Long> {
	
	// Find all leave applications for a specific employee
    List<LeaveApplication> findByEmployee(Employee employee);

    // Find all leave applications with a specific status
    List<LeaveApplication> findByStatus(LeaveStatus status);

    // Find leave applications for an employee within a date range
    List<LeaveApplication> findByEmployeeAndStartDateBetweenOrEmployeeAndEndDateBetween(
            Employee employee1, LocalDate startDate1, LocalDate endDate1,
            Employee employee2, LocalDate startDate2, LocalDate endDate2);

    // Find overlapping leaves for an employee
    List<LeaveApplication> findByEmployeeAndStartDateLessThanEqualAndEndDateGreaterThanEqual(
            Employee employee, LocalDate endDate, LocalDate startDate);
    
 // Find all leave applications for a specific employee, ordered by applied date descending
    List<LeaveApplication> findByEmployeeOrderByAppliedDateDesc(Employee employee);

    // Find all leave applications with a specific status, ordered by applied date ascending
    List<LeaveApplication> findByStatusOrderByAppliedDateAsc(LeaveStatus status);

    // Find all leave applications, ordered by applied date descending
    List<LeaveApplication> findAllByOrderByAppliedDateDesc();

	List<LeaveApplication> findByStatusOrderByAppliedDateDesc(LeaveStatus leaveStatus);

	List<LeaveApplication> findByEmployeeIdAndStatusAndStartDateLessThanEqualAndEndDateGreaterThanEqual(Long id,
			LeaveStatus approved, LocalDate atEndOfMonth, LocalDate atDay);
}
