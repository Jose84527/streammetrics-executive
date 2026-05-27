package com.jose.streammetrics.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import com.jose.streammetrics.dto.OpcionesFiltroResponse;
import com.jose.streammetrics.service.FiltroService;

@RestController
public class FiltroController {

    private final FiltroService filtroService;

    public FiltroController(FiltroService filtroService) {
        this.filtroService = filtroService;
    }

    @GetMapping("/api/filtros/opciones")
    public OpcionesFiltroResponse obtenerOpcionesFiltros() {
        return filtroService.obtenerOpcionesFiltros();
    }
}