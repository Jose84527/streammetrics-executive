package com.jose.streammetrics.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.jose.streammetrics.dto.ResumenDesempenoContenidosDto;
import com.jose.streammetrics.service.ContenidoService;

@RestController
@RequestMapping("/api/contenidos")
public class ContenidoController {

    private final ContenidoService contenidoService;

    public ContenidoController(ContenidoService contenidoService) {
        this.contenidoService = contenidoService;
    }

    @GetMapping("/desempeno")
    public ResumenDesempenoContenidosDto obtenerDesempenoContenidos() {
        return contenidoService.obtenerDesempenoContenidos();
    }
}