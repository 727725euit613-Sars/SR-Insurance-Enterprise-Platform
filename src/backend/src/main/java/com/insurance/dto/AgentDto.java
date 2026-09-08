package com.insurance.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AgentDto {

    private Long agentId;

    @NotBlank(message = "Agent name is required")
    private String name;

    @NotBlank(message = "Email is required")
    @Email(message = "Email should be valid")
    private String email;

    @NotBlank(message = "Phone number is required")
    @Pattern(regexp = "^\\+?[0-9]{7,15}$", message = "Phone number should contain 7 to 15 digits")
    private String phone;

    @NotBlank(message = "License number is required")
    private String licenseNumber;

    @NotBlank(message = "Specialization is required")
    private String specialization;
}
