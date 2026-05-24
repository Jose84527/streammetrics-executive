package com.jose.streammetrics.service;

import org.springframework.stereotype.Service;

import com.jose.streammetrics.dto.ResumenPlanesDto;
import com.jose.streammetrics.repository.PlanRepository;

@Service
public class PlanService {

    private final PlanRepository planRepository;

    public PlanService(PlanRepository planRepository) {
        this.planRepository = planRepository;
    }

    public ResumenPlanesDto obtenerConsumoPorPlanes() {
        return new ResumenPlanesDto(
                planRepository.obtenerConsumoPorPlanes()
        );
    }
}