package com.jose.streammetrics.controller;

import java.time.LocalDateTime;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class SaludController {

    @GetMapping("/api/salud")
    public RespuestaSalud obtenerEstado() {
        return new RespuestaSalud(
                "OK",
                "Backend de StreamMetrics funcionando correctamente",
                LocalDateTime.now()
        );
    }

    public record RespuestaSalud(
            String estado,
            String mensaje,
            LocalDateTime fecha
    ) {
    }
}