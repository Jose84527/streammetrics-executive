package com.jose.streammetrics.service;

import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import com.jose.streammetrics.dto.OpcionesFiltroResponse;
import com.jose.streammetrics.repository.FiltroRepository;

@Service
public class FiltroService {

    private final FiltroRepository filtroRepository;

    public FiltroService(FiltroRepository filtroRepository) {
        this.filtroRepository = filtroRepository;
    }

    @Cacheable("opcionesFiltros")
    public OpcionesFiltroResponse obtenerOpcionesFiltros() {
        return new OpcionesFiltroResponse(
                filtroRepository.obtenerAnios(),
                filtroRepository.obtenerPaises(),
                filtroRepository.obtenerContinentes(),
                filtroRepository.obtenerPlanes(),
                filtroRepository.obtenerTiposContenido(),
                filtroRepository.obtenerGeneros(),
                filtroRepository.obtenerPrioridadesMercado(),
                filtroRepository.obtenerNivelesActividad()
        );
    }
}