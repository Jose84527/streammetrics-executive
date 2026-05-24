package com.jose.streammetrics.service;

import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import com.jose.streammetrics.dto.ResumenDesempenoContenidosDto;
import com.jose.streammetrics.repository.ContenidoRepository;

@Service
public class ContenidoService {

    private final ContenidoRepository contenidoRepository;

    public ContenidoService(ContenidoRepository contenidoRepository) {
        this.contenidoRepository = contenidoRepository;
    }

    @Cacheable("contenidosDesempeno")
    public ResumenDesempenoContenidosDto obtenerDesempenoContenidos() {
        return new ResumenDesempenoContenidosDto(
                contenidoRepository.obtenerContenidosMasVistos(),
                contenidoRepository.obtenerContenidosMejorCalificados(),
                contenidoRepository.obtenerContenidosMayorFinalizacion()
        );
    }
}