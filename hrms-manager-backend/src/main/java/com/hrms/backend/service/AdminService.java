package com.hrms.backend.service;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.hrms.backend.dto.AddBonusRequest;
import com.hrms.backend.dto.PayslipDto;
import com.hrms.backend.entity.Contact;
import com.hrms.backend.repository.ContactRepository;
import com.hrms.backend.repository.EmployeeRepository;
import com.hrms.backend.repository.UserRepository;

import jakarta.transaction.Transactional;

@Service
public class AdminService {
	
	private static final Logger logger = LoggerFactory.getLogger(EmployeeService.class);

	@Autowired
    private EmployeeRepository employeeRepository;
	
	@Autowired
    private UserRepository userRepository;
	
	@Autowired
    private PayrollService payrollService; // Inject PayrollService
	
    @Autowired
    private BonusService bonusService; // Inject BonusService
    
    @Autowired
    private EmployeeService employeeService; // To get all employees for payroll processing
    
    @Autowired
    private ContactRepository contactRepository;
    
    /**
     * Fetches all contact messages from the database.
     * @return A list of all Contact entities.
     */
    public List<Contact> getAllContacts(){
        return contactRepository.findAll();
    }
    
    // New method to process payroll
    @Transactional
    public String processMonthlyPayroll(Integer month, Integer year) {
        // This method will likely just delegate to PayrollService
        // and handle any specific admin-level logging or pre-checks.
        // The actual calculation and saving is in PayrollService.
        payrollService.processMonthlyPayroll(month, year);
        return "Payroll processing initiated successfully for " + month + "-" + year;
    }

    // New method to add bonus
    @Transactional
    public String addBonusToEmployee(AddBonusRequest request) {
        // This method delegates to BonusService
        return bonusService.addBonus(request);
    }

    // New method to get all payslips for a specific month/year for admin view
    public List<PayslipDto> getPayslipsForMonth(Integer month, Integer year) {
        return payrollService.getPayslipsByMonthAndYear(month, year);
    }

    // New method to get a specific payslip by ID for admin view
    public PayslipDto getPayslipDetails(Long payslipId) {
        return payrollService.getPayslipById(payslipId);
    }
}
