package com.jose.streammetrics.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.jose.streammetrics.dto.ResumenActividadPerfilesDto;
import com.jose.streammetrics.service.PerfilService;

@RestController
@RequestMapping("/api/perfiles")
public class PerfilController {

    private final PerfilService perfilService;

    public PerfilController(PerfilService perfilService) {
        this.perfilService = perfilService;
    }

    @GetMapping("/actividad")
    public ResumenActividadPerfilesDto obtenerActividadPerfiles() {
        return perfilService.obtenerActividadPerfiles();
    }
}