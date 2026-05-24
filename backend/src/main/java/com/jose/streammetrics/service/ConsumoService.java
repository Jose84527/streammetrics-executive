package com.jose.streammetrics.service;

import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import com.jose.streammetrics.dto.ResumenConsumoGenerosDto;
import com.jose.streammetrics.repository.ConsumoRepository;

@Service
public class ConsumoService {

    private final ConsumoRepository consumoRepository;

    public ConsumoService(ConsumoRepository consumoRepository) {
        this.consumoRepository = consumoRepository;
    }

    @Cacheable("consumoGeneros")
    public ResumenConsumoGenerosDto obtenerResumenGeneros() {
        return new ResumenConsumoGenerosDto(
                consumoRepository.obtenerTopGenerosPorVisualizaciones(),
                consumoRepository.obtenerTopGenerosPorHorasVistas()
        );
    }
}