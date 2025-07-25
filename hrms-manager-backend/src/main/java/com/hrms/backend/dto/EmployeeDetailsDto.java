package com.hrms.backend.dto;

import java.time.LocalDate;
import java.util.Objects;

public class EmployeeDetailsDto {
	
	private Long id; // This will be the Employee entity's ID
    private Long userId; // To link to the associated User by ID
    private String username; // To link to the associated User by username

    private String employeeIdNumber;
    private String firstName;
    private String lastName;
    private String email;
    private String department;
    private String designation;
    private Double salary;
    private LocalDate joinDate; // Use LocalDate for dates
    
	public EmployeeDetailsDto() {
		super();
		// TODO Auto-generated constructor stub
	}
	public EmployeeDetailsDto(Long id, Long userId, String username, String employeeIdNumber, String firstName, String lastName,
            String email, String department, String designation, Double salary, LocalDate joinDate) {
		super();
		this.id = id;
		this.userId = userId;
		this.username = username;
		this.employeeIdNumber = employeeIdNumber;
		this.firstName = firstName;
		this.lastName = lastName;
		this.email = email;
		this.department = department;
		this.designation = designation;
		this.salary = salary;
		this.joinDate = joinDate;
	}
	public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
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

    @Override
    public int hashCode() {
        return Objects.hash(department, designation, email, employeeIdNumber, firstName, joinDate, lastName, salary,
                userId, username, id); // Include 'id' in hashCode
    }

    @Override
    public boolean equals(Object obj) {
        if (this == obj)
            return true;
        if (obj == null)
            return false;
        if (getClass() != obj.getClass())
            return false;
        EmployeeDetailsDto other = (EmployeeDetailsDto) obj;
        return Objects.equals(department, other.department) && Objects.equals(designation, other.designation)
                && Objects.equals(email, other.email) && Objects.equals(employeeIdNumber, other.employeeIdNumber)
                && Objects.equals(firstName, other.firstName) && Objects.equals(joinDate, other.joinDate)
                && Objects.equals(lastName, other.lastName) && Objects.equals(salary, other.salary)
                && Objects.equals(userId, other.userId) && Objects.equals(username, other.username)
                && Objects.equals(id, other.id); // Include 'id' in equals
    }

    @Override
    public String toString() {
        return "EmployeeDetailsDto [id=" + id + ", userId=" + userId + ", username=" + username + ", employeeIdNumber="
                + employeeIdNumber + ", firstName=" + firstName + ", lastName=" + lastName + ", email=" + email
                + ", department=" + department + ", designation=" + designation + ", salary=" + salary + ", joinDate="
                + joinDate + "]";
    }
}