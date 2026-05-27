package com.jose.streammetrics.service;

import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import com.jose.streammetrics.dto.FiltroKpiRequest;
import com.jose.streammetrics.dto.ResumenCumplimientoMetasDto;
import com.jose.streammetrics.repository.MetaRepository;

@Service
public class MetaService {

    private final MetaRepository metaRepository;

    public MetaService(MetaRepository metaRepository) {
        this.metaRepository = metaRepository;
    }

    @Cacheable(
            value = "metasCumplimiento",
            key = "{#filtros.anio(), #filtros.pais(), #filtros.continente(), #filtros.plan(), #filtros.tipoContenido(), #filtros.prioridadMercado()}"
    )
    public ResumenCumplimientoMetasDto obtenerCumplimientoMetas(FiltroKpiRequest filtros) {
        return new ResumenCumplimientoMetasDto(
                metaRepository.obtenerCumplimientoPorPais(filtros)
        );
    }
}