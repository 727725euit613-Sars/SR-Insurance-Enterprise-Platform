package com.insurance.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.insurance.entity.Agent;

public interface AgentRepository extends JpaRepository<Agent, Long> {

    List<Agent> findBySpecializationContainingIgnoreCase(String specialization);
}
