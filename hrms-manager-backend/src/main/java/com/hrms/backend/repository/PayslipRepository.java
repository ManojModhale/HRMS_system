package com.hrms.backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.hrms.backend.entity.Payslip;

@Repository
public interface PayslipRepository extends JpaRepository<Payslip, Long> {
	
	//Optional<Payslip> findByEmployeeIdAndPayPeriodMonthAndPayPeriodYear(Long employeeId, Integer month, Integer year);
    
	//List<Payslip> findByEmployeeIdOrderByPayPeriodYearDescPayPeriodMonthDesc(Long employeeId);
    
	//List<Payslip> findByPayPeriodMonthAndPayPeriodYear(Integer month, Integer year);

	// This method already fetches a single payslip, so it's likely fine with LAZY as the session might still be open
    // when converting to DTO, but for consistency and safety, we can add JOIN FETCH here too if needed.
    // For now, leaving as is, as the primary error is with list fetching.
    Optional<Payslip> findByEmployeeIdAndPayPeriodMonthAndPayPeriodYear(Long employeeId, Integer month, Integer year);

    // Modified to eagerly fetch employee to avoid LazyInitializationException
    @Query("SELECT p FROM Payslip p JOIN FETCH p.employee e WHERE p.payPeriodMonth = ?1 AND p.payPeriodYear = ?2")
    List<Payslip> findByPayPeriodMonthAndPayPeriodYear(Integer month, Integer year);

    // Modified to eagerly fetch employee for the employee's own payslip history
    @Query("SELECT p FROM Payslip p JOIN FETCH p.employee e WHERE p.employee.id = ?1 ORDER BY p.payPeriodYear DESC, p.payPeriodMonth DESC")
    List<Payslip> findByEmployeeIdOrderByPayPeriodYearDescPayPeriodMonthDesc(Long employeeId);

}

