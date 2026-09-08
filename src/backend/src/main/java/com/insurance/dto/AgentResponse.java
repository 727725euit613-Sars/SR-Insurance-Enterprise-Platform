package com.insurance.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AgentResponse {
    private Long agentId;
    private String name;
    private String email;
    private String phone;
    private String licenseNumber;
    private String specialization;
}
