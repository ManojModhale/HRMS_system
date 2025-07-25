package com.hrms.backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.hrms.backend.entity.Employee;

@Repository
public interface EmployeeRepository extends JpaRepository<Employee, Long> {
	
	Optional<Employee> findByEmployeeIdNumber(String employeeIdNumber);
	
    boolean existsByEmail(String email);
    
    boolean existsByEmployeeIdNumber(String employeeIdNumber);

    // Find an employee by the ID of their associated user
    Optional<Employee> findByUserId(Long userId);

    // Check if an employee exists for a given user ID
    boolean existsByUserId(Long userId);
    
    Optional<Employee> findByEmail(String email);

    List<Employee> findAllByOrderByFirstNameAscLastNameAsc();
    
}
