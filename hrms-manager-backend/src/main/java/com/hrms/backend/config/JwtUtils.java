package com.hrms.backend.config;

import java.security.Key;
import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.stereotype.Component;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;     // Add this import
import io.jsonwebtoken.UnsupportedJwtException; // Add this import


@Component
public class JwtUtils {
	
	private static final Logger logger = LoggerFactory.getLogger(JwtUtils.class);

    @Value("${hrms.app.jwtSecret}") // Defined in application.properties/yml
    private String jwtSecret;

    @Value("${hrms.app.jwtExpirationMs}") // Defined in application.properties/yml
    private int jwtExpirationMs;

    // Helper to get signing key
    private Key key() {
        return Keys.hmacShaKeyFor(Decoders.BASE64.decode(jwtSecret));
    }

    public String generateJwtToken(Authentication authentication) {
        // Get user details from authenticated principal
        UserDetailsImpl userPrincipal = (UserDetailsImpl) authentication.getPrincipal();

        /*
        // Extract roles from user details
        List<String> roles = userPrincipal.getAuthorities().stream()
                                        .map(GrantedAuthority::getAuthority)
                                        .collect(Collectors.toList());*/
        
     // Extract the single role string (without "ROLE_" prefix)
        String role = userPrincipal.getAuthorities().stream()
                                   .findFirst()
                                   .map(GrantedAuthority::getAuthority)
                                   .map(s -> s.replace("ROLE_", "")) // Remove "ROLE_" prefix for claim
                                   .orElse("EMPLOYEE"); // Default to EMPLOYEE if no role found

        return Jwts.builder()
                .setSubject((userPrincipal.getUsername()))
                .claim("id", userPrincipal.getId()) // Include user ID in JWT claims
                .claim("role", role) // Include role (without "ROLE_" prefix) in JWT claims
                .setIssuedAt(new Date())
                .setExpiration(new Date((new Date()).getTime() + jwtExpirationMs))
                .signWith(key(), SignatureAlgorithm.HS256)
                .compact();
    }//.claim("roles", roles) // Add roles as a claim

    public String getUserNameFromJwtToken(String token) {
        return Jwts.parserBuilder().setSigningKey(key()).build()
                .parseClaimsJws(token).getBody().getSubject();
    }
    
    // New method to get all claims from the JWT token
    public Claims getClaimsFromJwtToken(String token) {
        return Jwts.parserBuilder().setSigningKey(key()).build()
                .parseClaimsJws(token).getBody();
    }

    public boolean validateJwtToken(String authToken) {
        try {
            Jwts.parserBuilder().setSigningKey(key()).build().parse(authToken);
            return true;
        } catch (MalformedJwtException e) {
            logger.error("Invalid JWT token: {}", e.getMessage());
        } catch (ExpiredJwtException e) {
            logger.error("JWT token is expired: {}", e.getMessage());
        } catch (UnsupportedJwtException e) {
            logger.error("JWT token is unsupported: {}", e.getMessage());
        } catch (IllegalArgumentException e) {
            logger.error("JWT claims string is empty: {}", e.getMessage());
        }
        return false;
    }
}
