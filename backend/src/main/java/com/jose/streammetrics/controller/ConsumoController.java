package com.jose.streammetrics.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.jose.streammetrics.dto.FiltroKpiRequest;
import com.jose.streammetrics.dto.ResumenConsumoGenerosDto;
import com.jose.streammetrics.service.ConsumoService;

@RestController
public class ConsumoController {

    private final ConsumoService consumoService;

    public ConsumoController(ConsumoService consumoService) {
        this.consumoService = consumoService;
    }

    @GetMapping("/api/consumo/generos")
    public ResumenConsumoGenerosDto obtenerResumenGeneros(
            @RequestParam(required = false) Integer anio,
            @RequestParam(required = false) String pais,
            @RequestParam(required = false) String continente,
            @RequestParam(required = false) String plan,
            @RequestParam(required = false) String tipoContenido
    ) {
        FiltroKpiRequest filtros = new FiltroKpiRequest(
                anio,
                pais,
                continente,
                plan,
                tipoContenido,
                null,
                null,
                null
        );

        return consumoService.obtenerResumenGeneros(filtros);
    }
}