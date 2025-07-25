// src/main/java/com/hrms/backend/entity/Employee.java
package com.hrms.backend.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

import java.time.LocalDate;

@Entity
@Table(name = "employees",
        uniqueConstraints = {
                @UniqueConstraint(columnNames = "employeeIdNumber"),
                @UniqueConstraint(columnNames = "email")
        })
public class Employee {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Employee owns the foreign key to User
    @OneToOne
    @JoinColumn(name = "user_id", referencedColumnName = "id", unique = true, nullable = false)
    private User user; // This is the link to the User account

    @Column(unique = true, nullable = false)
    private String employeeIdNumber;

    @Column(nullable = false)
    private String firstName;

    @Column(nullable = false)
    private String lastName;

    @Column(unique = true, nullable = false)
    private String email;

    private String department;
    private String designation;
    private Double salary;
    private LocalDate joinDate;

    // --- Constructors ---
    public Employee() {
        // Default constructor
    }

    public Employee(User user, String employeeIdNumber, String firstName, String lastName, String email,
                    String department, String designation, Double salary, LocalDate joinDate) {
        this.user = user;
        this.employeeIdNumber = employeeIdNumber;
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.department = department;
        this.designation = designation;
        this.salary = salary;
        this.joinDate = joinDate;
    }

    // Full constructor
    public Employee(Long id, User user, String employeeIdNumber, String firstName, String lastName, String email,
                    String department, String designation, Double salary, LocalDate joinDate) {
        this.id = id;
        this.user = user;
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

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
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
    public String toString() {
        return "Employee{" +
               "id=" + id +
               ", userId=" + (user != null ? user.getId() : "null") +
               ", employeeIdNumber='" + employeeIdNumber + '\'' +
               ", firstName='" + firstName + '\'' +
               ", lastName='" + lastName + '\'' +
               ", email='" + email + '\'' +
               ", department='" + department + '\'' +
               ", designation='" + designation + '\'' +
               ", salary=" + salary +
               ", joinDate=" + joinDate +
               '}';
    }
}
