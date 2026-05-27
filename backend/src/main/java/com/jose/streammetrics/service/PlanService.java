package com.jose.streammetrics.service;

import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import com.jose.streammetrics.dto.FiltroKpiRequest;
import com.jose.streammetrics.dto.ResumenPlanesDto;
import com.jose.streammetrics.repository.PlanRepository;

@Service
public class PlanService {

    private final PlanRepository planRepository;

    public PlanService(PlanRepository planRepository) {
        this.planRepository = planRepository;
    }

    @Cacheable(
            value = "planesConsumo",
            key = "{#filtros.anio(), #filtros.pais(), #filtros.continente(), #filtros.tipoContenido(), #filtros.genero()}"
    )
    public ResumenPlanesDto obtenerConsumoPorPlanes(FiltroKpiRequest filtros) {
        return new ResumenPlanesDto(
                planRepository.obtenerConsumoPorPlanes(filtros)
        );
    }
}