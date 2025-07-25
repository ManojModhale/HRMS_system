package com.hrms.backend.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.hrms.backend.config.UserDetailsImpl;
import com.hrms.backend.entity.User;
import com.hrms.backend.repository.UserRepository;

@Service
public class UserDetailsServiceImpl implements UserDetailsService {
	
	@Autowired
	UserRepository userRepository;
	
	// Logger for service
    private static final Logger logger = LoggerFactory.getLogger(UserDetailsServiceImpl.class);

    @Override
    @Transactional // Ensure the user object is fully initialized (e.g., roles)
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        logger.info("Attempting to load user by username: {}", username);
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> {
                    logger.warn("User Not Found with username: {}", username);
                    return new UsernameNotFoundException("User Not Found with username: " + username);
                });
        logger.info("User {} found with role: {}", user.getUsername(), user.getRole().name());
        return UserDetailsImpl.build(user); // Build our custom UserDetailsImpl
    }
}
