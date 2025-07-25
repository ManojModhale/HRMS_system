package com.hrms.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.hrms.backend.entity.Bonus;

@Repository
public interface BonusRepository extends JpaRepository<Bonus, Long> {

	List<Bonus> findByEmployeeIdAndMonthAndYear(Long employeeId, Integer month, Integer year);
	
}
