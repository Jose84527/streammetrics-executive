package com.jose.streammetrics.service;

import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import com.jose.streammetrics.dto.FiltroKpiRequest;
import com.jose.streammetrics.dto.ResumenActividadPerfilesDto;
import com.jose.streammetrics.repository.PerfilRepository;

@Service
public class PerfilService {

    private final PerfilRepository perfilRepository;

    public PerfilService(PerfilRepository perfilRepository) {
        this.perfilRepository = perfilRepository;
    }

    public ResumenActividadPerfilesDto obtenerActividadPerfiles() {
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

        return obtenerActividadPerfiles(filtros);
    }

    @Cacheable(
            value = "perfilesActividad",
            key = "{#filtros.anio(), #filtros.pais(), #filtros.continente(), #filtros.plan(), #filtros.nivelActividad()}"
    )
    public ResumenActividadPerfilesDto obtenerActividadPerfiles(FiltroKpiRequest filtros) {
        return new ResumenActividadPerfilesDto(
                perfilRepository.obtenerActividadPerfiles(filtros)
        );
    }
}