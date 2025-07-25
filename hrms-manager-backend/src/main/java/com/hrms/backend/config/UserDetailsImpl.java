package com.hrms.backend.config;

import java.util.Collection;
import java.util.Collections;
import java.util.Objects;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.hrms.backend.entity.User;

public class UserDetailsImpl implements UserDetails {
	
	private static final long serialVersionUID = 1L;

    private Long id;
    private String username;

    @JsonIgnore // Prevent password from being serialized to JSON
    private String password; // This is the hashed password from the DB

    private GrantedAuthority authority; // Single role for simplicity

    /// Constructor for building from a User entity (from DB)
    public UserDetailsImpl(Long id, String username, String password, GrantedAuthority authority) {
        this.id = id;
        this.username = username;
        this.password = password;
        this.authority = authority;
    }
    
    // Constructor for building from raw data (e.g., for hardcoded admin or reconstructing from JWT claims with a simple role string)
    public UserDetailsImpl(Long id, String username, String password, String roleName) {
        this.id = id;
        this.username = username;
        this.password = password;
        // CRITICAL FIX: Ensure the role has the "ROLE_" prefix here
        this.authority = new SimpleGrantedAuthority("ROLE_" + roleName.toUpperCase());
    }

    /*public UserDetailsImpl(long id, String adminUsername, String adminPassword, String roleName) {
		// TODO Auto-generated constructor stub
    	this.id = id;
    	this.username = adminUsername;
    	this.password = adminPassword;
    	this.authority = new SimpleGrantedAuthority("ROLE_" + roleName.toUpperCase());
	}*/

 // Factory method to build UserDetailsImpl from your User entity
    public static UserDetailsImpl build(User user) {
        // CRITICAL FIX: Ensure the role has the "ROLE_" prefix here
        GrantedAuthority authority = new SimpleGrantedAuthority("ROLE_" + user.getRole().name());
        return new UserDetailsImpl(
                user.getId(),
                user.getUsername(),
                user.getPassword(), // Use password field from User entity
                authority);
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        // Return a collection containing the single authority
        return Collections.singletonList(authority);
    }

    public Long getId() {
        return id;
    }

    @Override
    public String getPassword() {
        return password;
    }

    @Override
    public String getUsername() {
        return username;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o)
            return true;
        if (o == null || getClass() != o.getClass())
            return false;
        UserDetailsImpl user = (UserDetailsImpl) o;
        return Objects.equals(id, user.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }
}
