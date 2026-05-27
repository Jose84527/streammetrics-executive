package com.jose.streammetrics.service;

import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import com.jose.streammetrics.dto.FiltroKpiRequest;
import com.jose.streammetrics.dto.ResumenConsumoGenerosDto;
import com.jose.streammetrics.repository.ConsumoRepository;

@Service
public class ConsumoService {

    private final ConsumoRepository consumoRepository;

    public ConsumoService(ConsumoRepository consumoRepository) {
        this.consumoRepository = consumoRepository;
    }

    @Cacheable(
            value = "consumoGeneros",
            key = "{#filtros.anio(), #filtros.pais(), #filtros.continente(), #filtros.plan(), #filtros.tipoContenido()}"
    )
    public ResumenConsumoGenerosDto obtenerResumenGeneros(FiltroKpiRequest filtros) {
        return new ResumenConsumoGenerosDto(
                consumoRepository.obtenerGenerosPorVisualizaciones(filtros),
                consumoRepository.obtenerGenerosPorHorasVistas(filtros)
        );
    }
}