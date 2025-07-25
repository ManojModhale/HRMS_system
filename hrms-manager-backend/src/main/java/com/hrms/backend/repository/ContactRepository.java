package com.hrms.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.hrms.backend.entity.Contact;

@Repository
public interface ContactRepository extends JpaRepository<Contact, Long> {

}
