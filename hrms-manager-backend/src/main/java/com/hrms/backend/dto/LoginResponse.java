package com.hrms.backend.dto;

import java.util.Objects;

public class LoginResponse {
	
	private String jwtToken;
    private String type = "Bearer";
    private Long id;
    private String username;
    private String role; // Role as string
	public LoginResponse() {
		super();
		// TODO Auto-generated constructor stub
	}
	public LoginResponse(String jwtToken, String type, Long id, String username, String role) {
		super();
		this.jwtToken = jwtToken;
		this.type = type;
		this.id = id;
		this.username = username;
		this.role = role;
	}
	public String getJwtToken() {
		return jwtToken;
	}
	public void setJwtToken(String jwtToken) {
		this.jwtToken = jwtToken;
	}
	public String getType() {
		return type;
	}
	public void setType(String type) {
		this.type = type;
	}
	public Long getId() {
		return id;
	}
	public void setId(Long id) {
		this.id = id;
	}
	public String getUsername() {
		return username;
	}
	public void setUsername(String username) {
		this.username = username;
	}
	public String getRole() {
		return role;
	}
	public void setRole(String role) {
		this.role = role;
	}
	@Override
	public int hashCode() {
		return Objects.hash(id, jwtToken, role, type, username);
	}
	@Override
	public boolean equals(Object obj) {
		if (this == obj)
			return true;
		if (obj == null)
			return false;
		if (getClass() != obj.getClass())
			return false;
		LoginResponse other = (LoginResponse) obj;
		return Objects.equals(id, other.id) && Objects.equals(jwtToken, other.jwtToken)
				&& Objects.equals(role, other.role) && Objects.equals(type, other.type)
				&& Objects.equals(username, other.username);
	}
	@Override
	public String toString() {
		return "LoginResponse [jwtToken=" + jwtToken + ", type=" + type + ", id=" + id + ", username=" + username
				+ ", role=" + role + "]";
	}
    
}
