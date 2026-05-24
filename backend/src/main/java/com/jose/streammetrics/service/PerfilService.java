package com.jose.streammetrics.service;

import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import com.jose.streammetrics.dto.ResumenActividadPerfilesDto;
import com.jose.streammetrics.repository.PerfilRepository;

@Service
public class PerfilService {

    private final PerfilRepository perfilRepository;

    public PerfilService(PerfilRepository perfilRepository) {
        this.perfilRepository = perfilRepository;
    }

    @Cacheable("perfilesActividad")
    public ResumenActividadPerfilesDto obtenerActividadPerfiles() {
        return new ResumenActividadPerfilesDto(
                perfilRepository.obtenerActividadPerfiles()
        );
    }
}