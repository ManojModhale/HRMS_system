package com.hrms.backend.dto;

import java.util.Map;

public class LogEntryDto {
	
	private String timestamp; // Using String to directly match ISO string from JS
    private String level;
    private String message;
    private Map<String, Object> context; // For flexible additional data
    
    // Getters and Setters
    public String getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(String timestamp) {
        this.timestamp = timestamp;
    }

    public String getLevel() {
        return level;
    }

    public void setLevel(String level) {
        this.level = level;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public Map<String, Object> getContext() {
        return context;
    }

    public void setContext(Map<String, Object> context) {
        this.context = context;
    }

    @Override
    public String toString() {
        return "LogEntryDto{" +
               "timestamp='" + timestamp + '\'' +
               ", level='" + level + '\'' +
               ", message='" + message + '\'' +
               ", context=" + context +
               '}';
    }
}
