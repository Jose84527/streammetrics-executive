package com.jose.streammetrics.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

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
    public ResumenMercadosDto obtenerResumenMercados() {
        return mercadoService.obtenerResumenMercados();
    }
}