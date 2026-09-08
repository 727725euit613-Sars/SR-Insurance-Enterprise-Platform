package com.insurance.service;

import java.util.List;
import java.util.Objects;

import org.springframework.stereotype.Service;

import com.insurance.dto.SurveyorDto;
import com.insurance.entity.Surveyor;
import com.insurance.exception.ResourceNotFoundException;
import com.insurance.repository.SurveyorRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class SurveyorService {

    private final SurveyorRepository surveyorRepository;

    public List<Surveyor> getAllSurveyors() {
        return surveyorRepository.findAll();
    }

    public Surveyor getSurveyorById(Long id) {
        Long surveyorId = Objects.requireNonNull(id, "Surveyor id must not be null");
        return surveyorRepository.findById(surveyorId)
                .orElseThrow(() -> new ResourceNotFoundException("Surveyor not found with id: " + surveyorId));
    }

    public Surveyor createSurveyor(SurveyorDto dto) {
        Surveyor surveyor = new Surveyor();
        surveyor.setName(dto.getName());
        surveyor.setEmail(dto.getEmail());
        surveyor.setPhone(dto.getPhone());
        surveyor.setSpecialization(dto.getSpecialization());
        surveyor.setDepartment(dto.getDepartment());
        return surveyorRepository.save(surveyor);
    }

    public Surveyor updateSurveyor(Long id, SurveyorDto dto) {
        Surveyor existing = getSurveyorById(id);
        existing.setName(dto.getName());
        existing.setEmail(dto.getEmail());
        existing.setPhone(dto.getPhone());
        existing.setSpecialization(dto.getSpecialization());
        existing.setDepartment(dto.getDepartment());
        return surveyorRepository.save(existing);
    }

    public void deleteSurveyor(Long id) {
        Surveyor existing = getSurveyorById(id);
        surveyorRepository.delete(Objects.requireNonNull(existing, "Surveyor must not be null"));
    }

    public List<Surveyor> searchSurveyorsByDepartment(String department) {
        if (department == null || department.isBlank()) {
            return surveyorRepository.findAll();
        }
        return surveyorRepository.findByDepartmentContainingIgnoreCase(department);
    }
}
