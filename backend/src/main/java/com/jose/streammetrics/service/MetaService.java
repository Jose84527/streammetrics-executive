package com.jose.streammetrics.service;

import org.springframework.stereotype.Service;

import com.jose.streammetrics.dto.ResumenCumplimientoMetasDto;
import com.jose.streammetrics.repository.MetaRepository;

@Service
public class MetaService {

    private final MetaRepository metaRepository;

    public MetaService(MetaRepository metaRepository) {
        this.metaRepository = metaRepository;
    }

    public ResumenCumplimientoMetasDto obtenerCumplimientoMetas() {
        return new ResumenCumplimientoMetasDto(
                metaRepository.obtenerCumplimientoPorPais()
        );
    }
}