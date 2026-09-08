package com.insurance.service;

import java.util.List;
import java.util.Objects;

import org.springframework.stereotype.Service;

import com.insurance.dto.AgentDto;
import com.insurance.entity.Agent;
import com.insurance.exception.ResourceNotFoundException;
import com.insurance.repository.AgentRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AgentService {

    private final AgentRepository agentRepository;

    public List<Agent> getAllAgents() {
        return agentRepository.findAll();
    }

    public Agent getAgentById(Long id) {
        Long agentId = Objects.requireNonNull(id, "Agent id must not be null");
        return agentRepository.findById(agentId)
                .orElseThrow(() -> new ResourceNotFoundException("Agent not found with id: " + agentId));
    }

    public Agent createAgent(AgentDto dto) {
        Agent agent = new Agent();
        agent.setName(dto.getName());
        agent.setEmail(dto.getEmail());
        agent.setPhone(dto.getPhone());
        agent.setLicenseNumber(dto.getLicenseNumber());
        agent.setSpecialization(dto.getSpecialization());
        return agentRepository.save(agent);
    }

    public Agent updateAgent(Long id, AgentDto dto) {
        Agent existing = getAgentById(id);
        existing.setName(dto.getName());
        existing.setEmail(dto.getEmail());
        existing.setPhone(dto.getPhone());
        existing.setLicenseNumber(dto.getLicenseNumber());
        existing.setSpecialization(dto.getSpecialization());
        return agentRepository.save(existing);
    }

    public void deleteAgent(Long id) {
        Agent existing = getAgentById(id);
        agentRepository.delete(Objects.requireNonNull(existing, "Agent must not be null"));
    }

    public List<Agent> searchAgentsBySpecialization(String specialization) {
        if (specialization == null || specialization.isBlank()) {
            return agentRepository.findAll();
        }
        return agentRepository.findBySpecializationContainingIgnoreCase(specialization);
    }
}
