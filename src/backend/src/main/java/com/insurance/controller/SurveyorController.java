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

import com.insurance.dto.SurveyorDto;
import com.insurance.entity.Surveyor;
import com.insurance.service.SurveyorService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/surveyors")
@RequiredArgsConstructor
@Tag(name = "Surveyors", description = "Surveyor management")
@SecurityRequirement(name = "bearerAuth")
public class SurveyorController {

    private final SurveyorService surveyorService;

    @GetMapping
    @Operation(summary = "Get all surveyors")
    public ResponseEntity<List<Surveyor>> getAllSurveyors() {
        return ResponseEntity.ok(surveyorService.getAllSurveyors());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Surveyor> getSurveyorById(@PathVariable Long id) {
        return ResponseEntity.ok(surveyorService.getSurveyorById(id));
    }

    @GetMapping("/search")
    public ResponseEntity<List<Surveyor>> searchSurveyorsByDepartment(@RequestParam(required = false) String department) {
        return ResponseEntity.ok(surveyorService.searchSurveyorsByDepartment(department));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Create a new surveyor")
    public ResponseEntity<Surveyor> createSurveyor(@Valid @RequestBody SurveyorDto dto) {
        return new ResponseEntity<>(surveyorService.createSurveyor(dto), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','SURVEYOR')")
    public ResponseEntity<Surveyor> updateSurveyor(@PathVariable Long id, @Valid @RequestBody SurveyorDto dto) {
        return ResponseEntity.ok(surveyorService.updateSurveyor(id, dto));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteSurveyor(@PathVariable Long id) {
        surveyorService.deleteSurveyor(id);
        return ResponseEntity.noContent().build();
    }
}
