package com.jose.streammetrics.service;

import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import com.jose.streammetrics.dto.FiltroKpiRequest;
import com.jose.streammetrics.dto.ResumenDesempenoContenidosDto;
import com.jose.streammetrics.repository.ContenidoRepository;

@Service
public class ContenidoService {

    private final ContenidoRepository contenidoRepository;

    public ContenidoService(ContenidoRepository contenidoRepository) {
        this.contenidoRepository = contenidoRepository;
    }

    public ResumenDesempenoContenidosDto obtenerDesempenoContenidos() {
        FiltroKpiRequest filtros = new FiltroKpiRequest(
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null
        );

        return obtenerDesempenoContenidos(filtros);
    }

    @Cacheable(
            value = "contenidosDesempeno",
            key = "{#filtros.anio(), #filtros.pais(), #filtros.continente(), #filtros.plan(), #filtros.tipoContenido(), #filtros.genero()}"
    )
    public ResumenDesempenoContenidosDto obtenerDesempenoContenidos(FiltroKpiRequest filtros) {
        return new ResumenDesempenoContenidosDto(
                contenidoRepository.obtenerContenidosMasVistos(filtros),
                contenidoRepository.obtenerContenidosMejorCalificados(filtros),
                contenidoRepository.obtenerContenidosMayorFinalizacion(filtros)
        );
    }
}