package com.hrms.backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class EmployeeCreationRequest {
	// For creating a brand new user as an employee
    @NotBlank(message = "Username is required")
    @Size(min = 3, max = 50, message = "Username must be between 3 and 50 characters")
    private String username;

    @NotBlank(message = "Password is required")
    @Size(min = 6, max = 100, message = "Password must be at least 6 characters")
    private String password;

    @NotBlank(message = "Employee ID number is required")
    private String employeeIdNumber; // New field

    @NotBlank(message = "First name is required")
    private String firstName;

    @NotBlank(message = "Last name is required")
    private String lastName;

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    @NotBlank(message = "Department is required")
    private String department; // New field

    @NotBlank(message = "Designation is required")
    private String designation;

    @NotNull(message = "Salary is required")
    private Double salary; // Renamed from baseSalary to salary

    // Optional: If converting an existing PENDING user, provide their userId
    private Long existingUserId;

    // --- Constructors ---
    public EmployeeCreationRequest() {
    }

    // Constructor for creating a new employee with existing user
    public EmployeeCreationRequest(String employeeIdNumber, String firstName, String lastName, String email,
                                   String department, String designation, Double salary, Long existingUserId) {
        this.employeeIdNumber = employeeIdNumber;
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.department = department;
        this.designation = designation;
        this.salary = salary;
        this.existingUserId = existingUserId;
    }

    // Constructor for creating a new user and employee
    public EmployeeCreationRequest(String username, String password, String employeeIdNumber, String firstName,
                                   String lastName, String email, String department, String designation, Double salary) {
        this.username = username;
        this.password = password;
        this.employeeIdNumber = employeeIdNumber;
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.department = department;
        this.designation = designation;
        this.salary = salary;
    }

    // --- Getters and Setters ---
    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getEmployeeIdNumber() {
        return employeeIdNumber;
    }

    public void setEmployeeIdNumber(String employeeIdNumber) {
        this.employeeIdNumber = employeeIdNumber;
    }

    public String getFirstName() {
        return firstName;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getDepartment() {
        return department;
    }

    public void setDepartment(String department) {
        this.department = department;
    }

    public String getDesignation() {
        return designation;
    }

    public void setDesignation(String designation) {
        this.designation = designation;
    }

    public Double getSalary() {
        return salary;
    }

    public void setSalary(Double salary) {
        this.salary = salary;
    }

    public Long getExistingUserId() {
        return existingUserId;
    }

    public void setExistingUserId(Long existingUserId) {
        this.existingUserId = existingUserId;
    }
}
