package com.hrms.backend.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.hrms.backend.dto.LogEntryDto;

@RestController
@RequestMapping("/api/frontend-logs")
public class FrontendLogController {
	
	// Define a dedicated logger for frontend logs
    private static final Logger frontendLogger = LoggerFactory.getLogger("FrontendLogger");

    @PostMapping
    @ResponseStatus(HttpStatus.OK) // Or HttpStatus.ACCEPTED (202) if you don't need immediate confirmation
    public void receiveFrontendLog(@RequestBody LogEntryDto logEntry) {
        // Your custom logic to log the frontend entry using the dedicated logger
        String logMessage = String.format("FE_LOG - [%s] %s: %s (Context: %s)",
                                          logEntry.getTimestamp(),
                                          logEntry.getLevel(),
                                          logEntry.getMessage(),
                                          logEntry.getContext());

        // Use the dedicated frontendLogger to write the log, mapping frontend level to backend level
        switch (logEntry.getLevel()) {
            case "DEBUG":
                frontendLogger.debug(logMessage);
                break;
            case "INFO":
                frontendLogger.info(logMessage);
                break;
            case "WARN":
                frontendLogger.warn(logMessage);
                break;
            case "ERROR":
                // For errors, you might want to specifically log the stack trace if available in context
                if (logEntry.getContext() != null && logEntry.getContext().containsKey("stack")) {
                    frontendLogger.error(logMessage + "\nStack Trace: " + logEntry.getContext().get("stack"));
                } else {
                    frontendLogger.error(logMessage);
                }
                break;
            default:
                frontendLogger.info(logMessage); // Default to info for unhandled levels
        }
    }
}
