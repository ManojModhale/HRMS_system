package com.hrms.backend.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "contact")
public class Contact {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(length = 50, nullable = false) // Added nullable = false for required fields
    private String name;

    @Column(length = 100, unique = true, nullable = false) // Added nullable = false
    private String email;

    @Column(length = 12, nullable = false) // Assuming mobile is required
    private String mobile; // This field is used for 'subject' in the frontend form submission

    @Column(length = 500, nullable = false) // Increased length for message, added nullable = false
    private String message;

    public Contact() {
        // Default constructor for JPA
    }

    public Contact(String name, String email, String mobile, String message) {
        this.name = name;
        this.email = email;
        this.mobile = mobile;
        this.message = message;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getMobile() {
        return mobile;
    }

    public void setMobile(String mobile) {
        this.mobile = mobile;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    @Override
    public String toString() {
        return "Contact [id=" + id + ", name=" + name + ", email=" + email + ", mobile=" + mobile + ", message="
                + message + "]";
    }
}