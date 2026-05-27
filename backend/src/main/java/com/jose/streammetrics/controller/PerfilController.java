package com.jose.streammetrics.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.jose.streammetrics.dto.FiltroKpiRequest;
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
    public ResumenActividadPerfilesDto obtenerActividadPerfiles(
            @RequestParam(required = false) Integer anio,
            @RequestParam(required = false) String pais,
            @RequestParam(required = false) String continente,
            @RequestParam(required = false) String plan,
            @RequestParam(required = false) String nivelActividad
    ) {
        String continenteFinal = pais != null && !pais.isBlank()
                ? null
                : continente;

        FiltroKpiRequest filtros = new FiltroKpiRequest(
                anio,
                pais,
                continenteFinal,
                plan,
                null,
                null,
                null,
                nivelActividad
        );

        return perfilService.obtenerActividadPerfiles(filtros);
    }
}