package com.hrms.backend.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.hrms.backend.dto.PayslipDto;
import com.hrms.backend.entity.Attendance;
import com.hrms.backend.entity.AttendanceStatus;
import com.hrms.backend.entity.Bonus;
import com.hrms.backend.entity.Employee;
import com.hrms.backend.entity.LeaveApplication;
import com.hrms.backend.entity.LeaveStatus;
import com.hrms.backend.entity.Payslip;
import com.hrms.backend.repository.AttendanceRepository;
import com.hrms.backend.repository.BonusRepository;
import com.hrms.backend.repository.EmployeeRepository;
import com.hrms.backend.repository.LeaveApplicationRepository;
import com.hrms.backend.repository.PayslipRepository;

import jakarta.transaction.Transactional;


@Service
public class PayrollService {

    private static final Logger logger = LoggerFactory.getLogger(PayrollService.class);
    
    @Autowired
    private EmployeeRepository employeeRepository;
    
    @Autowired
    private AttendanceRepository attendanceRepository;
    
    @Autowired
    private LeaveApplicationRepository leaveApplicationRepository;
    
    @Autowired
    private BonusRepository bonusRepository;
    
    @Autowired
    private PayslipRepository payslipRepository;
    
    private static final String ADMIN_SYSTEM_LABEL = "Admin System"; // Hardcoded admin label

    // Hardcoded payroll constants as per your request
    private static final BigDecimal TAX_PERCENTAGE = new BigDecimal("0.10"); // 10%
    private static final BigDecimal PF_PERCENTAGE = new BigDecimal("0.12"); // 12%
    private static final Integer STANDARD_WORKING_DAYS_PER_MONTH = 25; // 25 days

    @Transactional
    public List<PayslipDto> processMonthlyPayroll(Integer month, Integer year) {
        logger.info("Initiating monthly payroll processing for {}-{}", month, year);

        // Check if payroll for this month/year has already been processed
        List<Payslip> existingPayslips = payslipRepository.findByPayPeriodMonthAndPayPeriodYear(month, year);
        if (!existingPayslips.isEmpty()) {
            logger.warn("Payroll for {}-{} has already been processed. Re-processing will overwrite existing payslips.", month, year);
            // Option: delete existing payslips before re-processing, or throw an error
            // For simplicity, we will allow re-processing and update existing.
        }

        List<Employee> employees = employeeRepository.findAll();
        if (employees.isEmpty()) {
            logger.warn("No employees found to process payroll for {}-{}", month, year);
            return List.of();
        }

        List<PayslipDto> generatedPayslips = employees.stream().map(employee -> {
            // Pass the hardcoded constants directly
            return calculateAndSavePayslipForEmployee(employee, month, year, TAX_PERCENTAGE, PF_PERCENTAGE, STANDARD_WORKING_DAYS_PER_MONTH);
        }).collect(Collectors.toList());

        logger.info("Successfully processed payroll for {}-{} for {} employees.", month, year, generatedPayslips.size());
        return generatedPayslips;
    }

    @Transactional
    public PayslipDto calculateAndSavePayslipForEmployee(Employee employee, Integer month, Integer year,
                                                          BigDecimal taxPercentage, BigDecimal pfPercentage, Integer standardWorkingDaysPerMonth) {
        
        logger.info("Calculating payslip for employee: {} (ID: {}) for {}-{}", employee.getUser().getUsername(), employee.getId(), month, year);

        BigDecimal baseMonthlySalary = BigDecimal.valueOf(employee.getSalary())
                .divide(BigDecimal.valueOf(12), 2, RoundingMode.HALF_UP);

        // Calculate actual working days in the month (excluding weekends by default)
        YearMonth yearMonth = YearMonth.of(year, month);
        int totalDaysInMonth = yearMonth.lengthOfMonth();
        int weekendDays = 0;
        for (int i = 1; i <= totalDaysInMonth; i++) {
            LocalDate date = yearMonth.atDay(i);
            if (date.getDayOfWeek() == DayOfWeek.SATURDAY || date.getDayOfWeek() == DayOfWeek.SUNDAY) {
                weekendDays++;
            }
        }
        // Assuming public holidays are not tracked in Attendance or Leave for simplicity,
        // so totalWorkingDaysInMonth will be total days - weekends.
        // If you track public holidays, you'd subtract them here.
        int actualPossibleWorkingDays = totalDaysInMonth - weekendDays;
        
        // Ensure standardWorkingDaysPerMonth is not zero to avoid division by zero
        if (standardWorkingDaysPerMonth <= 0) {
            logger.error("STANDARD_WORKING_DAYS_PER_MONTH is zero or negative. Using default 25.");
            standardWorkingDaysPerMonth = 25; // Fallback
        }

        // Attendance Data
        List<Attendance> attendanceRecords = attendanceRepository.findByEmployeeIdAndAttendanceDateBetween(
                employee.getId(), yearMonth.atDay(1), yearMonth.atEndOfMonth());

        int daysPresent = (int) attendanceRecords.stream()
                .filter(a -> a.getStatus() == AttendanceStatus.PRESENT)
                .count();
        int daysAbsent = (int) attendanceRecords.stream()
                .filter(a -> a.getStatus() == AttendanceStatus.ABSENT)
                .count();
        int daysHalfDay = (int) attendanceRecords.stream()
                .filter(a -> a.getStatus() == AttendanceStatus.HALF_DAY)
                .count();

        // Approved Leaves
        List<LeaveApplication> approvedLeaves = leaveApplicationRepository.findByEmployeeIdAndStatusAndStartDateLessThanEqualAndEndDateGreaterThanEqual(
                employee.getId(), LeaveStatus.APPROVED, yearMonth.atEndOfMonth(), yearMonth.atDay(1));

        int daysOnApprovedLeave = approvedLeaves.stream()
                .mapToInt(leave -> {
                    LocalDate start = leave.getStartDate().isBefore(yearMonth.atDay(1)) ? yearMonth.atDay(1) : leave.getStartDate();
                    LocalDate end = leave.getEndDate().isAfter(yearMonth.atEndOfMonth()) ? yearMonth.atEndOfMonth() : leave.getEndDate();
                    int days = 0;
                    for (LocalDate d = start; !d.isAfter(end); d = d.plusDays(1)) {
                        if (!(d.getDayOfWeek() == DayOfWeek.SATURDAY || d.getDayOfWeek() == DayOfWeek.SUNDAY)) { // Only count working days
                            days++;
                        }
                    }
                    return days;
                }).sum();

        // Calculate attendance deduction
        BigDecimal dailyRate = baseMonthlySalary.divide(BigDecimal.valueOf(standardWorkingDaysPerMonth), 2, RoundingMode.HALF_UP);
        BigDecimal attendanceDeduction = (dailyRate.multiply(BigDecimal.valueOf(daysAbsent)))
                .add(dailyRate.multiply(BigDecimal.valueOf(daysHalfDay)).divide(BigDecimal.valueOf(2), 2, RoundingMode.HALF_UP));

        // Tax and PF Deduction (from base monthly salary)
        BigDecimal taxDeduction = baseMonthlySalary.multiply(taxPercentage).setScale(2, RoundingMode.HALF_UP);
        BigDecimal pfDeduction = baseMonthlySalary.multiply(pfPercentage).setScale(2, RoundingMode.HALF_UP);
        
        // Other deductions (if any, from Payslip entity, currently not calculated here)
        BigDecimal otherDeductions = BigDecimal.ZERO; // Placeholder

        // Bonus Amount
        BigDecimal bonusAmount = bonusRepository.findByEmployeeIdAndMonthAndYear(employee.getId(), month, year)
                .stream()
                .map(Bonus::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add)
                .setScale(2, RoundingMode.HALF_UP);

        // Gross Salary (Base + Bonus)
        BigDecimal grossSalary = baseMonthlySalary.add(bonusAmount).setScale(2, RoundingMode.HALF_UP);

        // Net Salary (Gross - Deductions)
        BigDecimal netSalary = grossSalary.subtract(attendanceDeduction)
                .subtract(taxDeduction)
                .subtract(pfDeduction)
                .subtract(otherDeductions)
                .setScale(2, RoundingMode.HALF_UP);

        // Create or Update Payslip
        Optional<Payslip> existingPayslip = payslipRepository.findByEmployeeIdAndPayPeriodMonthAndPayPeriodYear(employee.getId(), month, year);
        Payslip payslip;
        if (existingPayslip.isPresent()) {
            payslip = existingPayslip.get();
            logger.info("Updating existing payslip for employee {} for {}-{}", employee.getUser().getUsername(), month, year);
        } else {
            payslip = new Payslip();
            payslip.setEmployee(employee);
            payslip.setPayPeriodMonth(month);
            payslip.setPayPeriodYear(year);
            logger.info("Creating new payslip for employee {} for {}-{}", employee.getUser().getUsername(), month, year);
        }

        payslip.setGrossSalary(grossSalary);
        payslip.setBaseMonthlySalary(baseMonthlySalary);
        payslip.setTotalWorkingDaysInMonth(actualPossibleWorkingDays); // Store actual possible working days
        payslip.setDaysPresent(daysPresent);
        payslip.setDaysAbsent(daysAbsent);
        payslip.setDaysHalfDay(daysHalfDay);
        payslip.setDaysOnApprovedLeave(daysOnApprovedLeave);
        payslip.setAttendanceDeduction(attendanceDeduction);
        payslip.setTaxDeduction(taxDeduction);
        payslip.setPfDeduction(pfDeduction);
        payslip.setOtherDeductions(otherDeductions);
        payslip.setBonusAmount(bonusAmount);
        payslip.setNetSalary(netSalary);
        payslip.setGenerationDate(LocalDateTime.now());
        payslip.setGeneratedBy(ADMIN_SYSTEM_LABEL); // Hardcoded admin label

        Payslip savedPayslip = payslipRepository.save(payslip);
        logger.info("Payslip saved/updated for employee: {} (ID: {}), Net Salary: {}", employee.getUser().getUsername(), employee.getId(), savedPayslip.getNetSalary());
        return convertToPayslipDto(savedPayslip);
    }

    public List<PayslipDto> getPayslipsByMonthAndYear(Integer month, Integer year) {
        List<Payslip> payslips = payslipRepository.findByPayPeriodMonthAndPayPeriodYear(month, year);
        return payslips.stream()
                .map(this::convertToPayslipDto)
                .collect(Collectors.toList());
    }

    public PayslipDto getPayslipById(Long payslipId) {
        Payslip payslip = payslipRepository.findById(payslipId)
                .orElseThrow(() -> new RuntimeException("Payslip not found with ID: " + payslipId));
        return convertToPayslipDto(payslip);
    }

    // Helper method to convert Entity to DTO
    private PayslipDto convertToPayslipDto(Payslip payslip) {
        String employeeName = (payslip.getEmployee() != null) ?
                payslip.getEmployee().getFirstName() + " " + payslip.getEmployee().getLastName() : "N/A";
        String employeeIdNumber = (payslip.getEmployee() != null) ? payslip.getEmployee().getEmployeeIdNumber() : "N/A";

        return new PayslipDto(
                payslip.getId(),
                payslip.getEmployee().getId(),
                employeeName,
                employeeIdNumber,
                payslip.getPayPeriodMonth(),
                payslip.getPayPeriodYear(),
                payslip.getGrossSalary(),
                payslip.getBaseMonthlySalary(),
                payslip.getTotalWorkingDaysInMonth(),
                payslip.getDaysPresent(),
                payslip.getDaysAbsent(),
                payslip.getDaysHalfDay(),
                payslip.getDaysOnApprovedLeave(),
                payslip.getAttendanceDeduction(),
                payslip.getTaxDeduction(),
                payslip.getPfDeduction(),
                payslip.getOtherDeductions(),
                payslip.getBonusAmount(),
                payslip.getNetSalary(),
                payslip.getGenerationDate(),
                payslip.getGeneratedBy()
        );
    }
}