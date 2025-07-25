package com.hrms.backend.service;

import java.util.Random;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {
	
	@Autowired
	private JavaMailSender javaMailSender;
	
	private static final String COMPANY_NAME = "HRMS";
	//private static final String SUPPORT_EMAIL = "support@expensetrack.com";
	private static final int OTP_LENGTH = 6;
	
	public int sendOtpMail(String toEmail, String firstName, String lastName) {
		int otp=generateOTP(OTP_LENGTH);
		String subject = COMPANY_NAME + " - Password Reset Request";
		String body = "Dear " + firstName + " " + lastName + ",\n\n"
		        + "We received a request to reset the password for your account on the "+COMPANY_NAME+".\n\n"
		        + "Please use the following One-Time Password (OTP) to reset your password:\n\n"
		        + "OTP: " + otp + "\n\n"
		        + "If you did not request this, please ignore this email or contact our support team.\n\n"
		        + "For your security, do not share this OTP with anyone.\n\n"
		        + "Thank you for using "+COMPANY_NAME+".\n\n"
		        + "Best regards,\n"
		        + COMPANY_NAME+" Team";
		
		try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(toEmail);
            message.setSubject(subject);
            message.setText(body);
            javaMailSender.send(message);
        } catch (MailException e) {
            System.err.println("Failed to send email to " + toEmail + ": " + e.getMessage());
            // In a real application, you'd log this error properly and potentially retry or notify an admin.
            // For now, we'll just print to console.
        }
		return otp;
	}
	
	private static int generateOTP(int length) {
		String allowedChars = "0123456789";
		StringBuilder otp = new StringBuilder(length);
		Random random = new Random();

		for (int i = 0; i < length; i++) {
			int index = random.nextInt(allowedChars.length());
			otp.append(allowedChars.charAt(index));
		}

		// Convert the OTP string to an integer
		return Integer.parseInt(otp.toString());
	}
}
