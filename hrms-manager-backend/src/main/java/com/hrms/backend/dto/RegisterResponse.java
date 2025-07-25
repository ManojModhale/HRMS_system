package com.hrms.backend.dto;

public class RegisterResponse {
	private String message;
    private Long userId; // Optional: ID of the newly registered user

    // Constructors
    public RegisterResponse(String message, Long userId) {
        this.message = message;
        this.userId = userId;
    }

    // Getters and Setters
    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }
}
