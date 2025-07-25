package com.hrms.backend.config;

import java.io.IOException;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import com.hrms.backend.service.UserDetailsServiceImpl;

import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class AuthTokenFilter extends OncePerRequestFilter {
	
	@Autowired
    private JwtUtils jwtUtils;

    @Autowired
    private UserDetailsServiceImpl userDetailsService;

    private static final Logger logger = LoggerFactory.getLogger(AuthTokenFilter.class);

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        try {
            String jwt = parseJwt(request);
            if (jwt != null && jwtUtils.validateJwtToken(jwt)) {
            	Claims claims = jwtUtils.getClaimsFromJwtToken(jwt);
                String username = claims.getSubject();
                //String username = jwtUtils.getUserNameFromJwtToken(jwt);
                
                // Get ID and role directly from JWT claims
                Long id = claims.get("id", Long.class);
                String role = claims.get("role", String.class); // This role is without "ROLE_" prefix

                UserDetails userDetails;
                //UserDetails userDetails = userDetailsService.loadUserByUsername(username);
                // Check if it's the hardcoded admin (ID 0L and ADMIN role)
                if (id != null && id == 0L && "ADMIN".equals(role)) {
                    // Reconstruct UserDetailsImpl for the hardcoded admin directly from token claims
                    // Pass a dummy password as it's not used after authentication in the filter chain
                    userDetails = new UserDetailsImpl(id, username, "", role);
                    logger.debug("Reconstructed UserDetails for hardcoded Admin from token: {} (ID: {})", username, id);
                } else {
                    // For database users, load full details from the database
                    // This ensures up-to-date user details (e.g., if roles or password change in DB)
                    userDetails = userDetailsService.loadUserByUsername(username);
                    logger.debug("Loaded UserDetails for database user: {} (ID: {})", username, ((UserDetailsImpl) userDetails).getId());
                }
                
                UsernamePasswordAuthenticationToken authentication =
                        new UsernamePasswordAuthenticationToken(
                                userDetails,
                                null, // Credentials (password) not needed after token validation
                                userDetails.getAuthorities()); // Use authorities from UserDetailsImpl
                authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
 
                SecurityContextHolder.getContext().setAuthentication(authentication);
                //logger.debug("Successfully authenticated user: {}", username);
                logger.debug("Successfully set authentication for user: {} (ID: {}, Role: {})", username, id, role);
            } else if (jwt == null) {
                logger.debug("No JWT token found in request for path: {}", request.getRequestURI());
            } else {
                logger.debug("Invalid or expired JWT token for request path: {}", request.getRequestURI());
            }
        } catch (Exception e) {
            logger.error("Cannot set user authentication: {}", e.getMessage());
        }

        filterChain.doFilter(request, response);
    }

    private String parseJwt(HttpServletRequest request) {
        String headerAuth = request.getHeader("Authorization");

        if (StringUtils.hasText(headerAuth) && headerAuth.startsWith("Bearer ")) {
            return headerAuth.substring(7); // Extract token after "Bearer "
        }
        return null;
    }
}
