package com.jose.streammetrics.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.jose.streammetrics.dto.ResumenConsumoGenerosDto;
import com.jose.streammetrics.service.ConsumoService;

@RestController
@RequestMapping("/api/consumo")
public class ConsumoController {

    private final ConsumoService consumoService;

    public ConsumoController(ConsumoService consumoService) {
        this.consumoService = consumoService;
    }

    @GetMapping("/generos")
    public ResumenConsumoGenerosDto obtenerResumenGeneros() {
        return consumoService.obtenerResumenGeneros();
    }
}