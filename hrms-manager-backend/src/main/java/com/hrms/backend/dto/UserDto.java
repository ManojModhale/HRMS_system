package com.hrms.backend.dto;

import java.time.LocalDate;

import com.hrms.backend.entity.Role;

public class UserDto {
	private Long id;
    private String username;
    private Role role;
    // Fields from Employee entity, will be null if user is not an EMPLOYEE
    private String employeeIdNumber;
    private String firstName;
    private String lastName;
    private String email;
    private String department;
    private String designation;
    private Double salary;
    private LocalDate joinDate;

    // --- Constructors ---
    public UserDto() {
    }

    // Constructor for basic user info
    public UserDto(Long id, String username, Role role) {
        this.id = id;
        this.username = username;
        this.role = role;
    }

    // Full constructor including employee details
    public UserDto(Long id, String username, Role role, String employeeIdNumber, String firstName, String lastName,
			String email, String department, String designation, Double salary, LocalDate joinDate) {
		super();
		this.id = id;
		this.username = username;
		this.role = role;
		this.employeeIdNumber = employeeIdNumber;
		this.firstName = firstName;
		this.lastName = lastName;
		this.email = email;
		this.department = department;
		this.designation = designation;
		this.salary = salary;
		this.joinDate = joinDate;
	}

	// --- Getters and Setters ---
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
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

	public LocalDate getJoinDate() {
		return joinDate;
	}

	public void setJoinDate(LocalDate joinDate) {
		this.joinDate = joinDate;
	}
}
