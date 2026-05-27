package com.jose.streammetrics.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.jose.streammetrics.dto.FiltroKpiRequest;
import com.jose.streammetrics.dto.ResumenMercadosDto;
import com.jose.streammetrics.service.MercadoService;

@RestController
@RequestMapping("/api/mercados")
public class MercadoController {

    private final MercadoService mercadoService;

    public MercadoController(MercadoService mercadoService) {
        this.mercadoService = mercadoService;
    }

    @GetMapping("/consumo")
    public ResumenMercadosDto obtenerResumenMercados(
            @RequestParam(required = false) Integer anio,
            @RequestParam(required = false) String continente,
            @RequestParam(required = false) String plan,
            @RequestParam(required = false) String tipoContenido,
            @RequestParam(required = false) String genero
    ) {
        FiltroKpiRequest filtros = new FiltroKpiRequest(
                anio,
                null,
                continente,
                plan,
                tipoContenido,
                genero,
                null,
                null
        );

        return mercadoService.obtenerResumenMercados(filtros);
    }
}