package com.insurance.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.insurance.dto.AgentDto;
import com.insurance.entity.Agent;
import com.insurance.service.AgentService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/agents")
@RequiredArgsConstructor
@Tag(name = "Agents", description = "Agent management")
@SecurityRequirement(name = "bearerAuth")
public class AgentController {

    private final AgentService agentService;

    @GetMapping
    @Operation(summary = "Get all agents")
    public ResponseEntity<List<Agent>> getAllAgents() {
        return ResponseEntity.ok(agentService.getAllAgents());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Agent> getAgentById(@PathVariable Long id) {
        return ResponseEntity.ok(agentService.getAgentById(id));
    }

    @GetMapping("/search")
    public ResponseEntity<List<Agent>> searchAgentsBySpecialization(@RequestParam(required = false) String specialization) {
        return ResponseEntity.ok(agentService.searchAgentsBySpecialization(specialization));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Create a new agent")
    public ResponseEntity<Agent> createAgent(@Valid @RequestBody AgentDto dto) {
        return new ResponseEntity<>(agentService.createAgent(dto), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Agent> updateAgent(@PathVariable Long id, @Valid @RequestBody AgentDto dto) {
        return ResponseEntity.ok(agentService.updateAgent(id, dto));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteAgent(@PathVariable Long id) {
        agentService.deleteAgent(id);
        return ResponseEntity.noContent().build();
    }
}
