package com.insurance.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.insurance.entity.Surveyor;

public interface SurveyorRepository extends JpaRepository<Surveyor, Long> {

    List<Surveyor> findByDepartmentContainingIgnoreCase(String department);
}
