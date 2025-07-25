package com.hrms.backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.hrms.backend.entity.Role;
import com.hrms.backend.entity.User;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
	
	Optional<User> findByUsername(String username);
	
    boolean existsByUsername(String username);
    
    // New method: Find users with a specific role where their 'employee' field is null
    //List<User> findByRoleAndEmployeeIsNull(Role role);

    List<User> findByRole(Role role);
    List<User> findByRoleIn(List<Role> roles);
    
 // Find users that are not yet associated with an employee.
    // This query works by checking if a user's ID exists in the employee table.
    @Query("SELECT u FROM User u WHERE u.role = :role AND u.id NOT IN (SELECT e.user.id FROM Employee e)")
    List<User> findUnassignedUsersByRole(@Param("role") Role role);
}
