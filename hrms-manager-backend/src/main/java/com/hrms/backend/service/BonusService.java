package com.hrms.backend.service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.NoSuchElementException;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.hrms.backend.dto.AddBonusRequest;
import com.hrms.backend.entity.Bonus;
import com.hrms.backend.entity.Employee;
import com.hrms.backend.repository.BonusRepository;
import com.hrms.backend.repository.EmployeeRepository;

import jakarta.transaction.Transactional;

@Service
public class BonusService {
	
	private static final Logger logger = LoggerFactory.getLogger(BonusService.class);

    @Autowired
    private BonusRepository bonusRepository;

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private PayrollService payrollService; // To trigger payslip recalculation

    private static final String ADMIN_LABEL = "Admin"; // Hardcoded admin label for bonus addedBy

    // Hardcoded payroll constants for recalculation (must match PayrollService)
    private static final BigDecimal TAX_PERCENTAGE_FOR_RECALC = new BigDecimal("0.10"); // 10%
    private static final BigDecimal PF_PERCENTAGE_FOR_RECALC = new BigDecimal("0.12"); // 12%
    private static final Integer STANDARD_WORKING_DAYS_PER_MONTH_FOR_RECALC = 25; // 25 days


    @Transactional
    public String addBonus(AddBonusRequest request) {
        logger.info("Attempting to add bonus for employee ID: {} for {}-{}", request.getEmployeeId(), request.getMonth(), request.getYear());

        Employee employee = employeeRepository.findById(request.getEmployeeId())
                .orElseThrow(() -> new NoSuchElementException("Employee not found with ID: " + request.getEmployeeId()));

        Bonus bonus = new Bonus();
        bonus.setEmployee(employee);
        bonus.setAmount(request.getAmount());
        bonus.setMonth(request.getMonth());
        bonus.setYear(request.getYear());
        bonus.setDescription(request.getDescription());
        bonus.setAddedBy(ADMIN_LABEL); // Hardcoded admin label
        bonus.setAddedDate(LocalDateTime.now());

        bonusRepository.save(bonus);
        logger.info("Bonus of {} added for employee {} (ID: {}) for {}-{}",
                request.getAmount(), employee.getUser().getUsername(), employee.getId(), request.getMonth(), request.getYear());

        // Recalculate payslip for this employee for the affected month/year
        // Use the hardcoded constants defined in this service
        payrollService.calculateAndSavePayslipForEmployee(
            employee, request.getMonth(), request.getYear(),
            TAX_PERCENTAGE_FOR_RECALC, PF_PERCENTAGE_FOR_RECALC, STANDARD_WORKING_DAYS_PER_MONTH_FOR_RECALC
        );

        return "Bonus added successfully and payslip updated.";
    }

    public List<Bonus> getBonusesForEmployee(Long employeeId, Integer month, Integer year) {
        return bonusRepository.findByEmployeeIdAndMonthAndYear(employeeId, month, year);
    }
}