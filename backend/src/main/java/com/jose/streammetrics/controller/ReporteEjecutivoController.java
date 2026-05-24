package com.jose.streammetrics.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.jose.streammetrics.dto.ResumenReporteEjecutivoDto;
import com.jose.streammetrics.service.ReporteEjecutivoService;

@RestController
@RequestMapping("/api/reporte-ejecutivo")
public class ReporteEjecutivoController {

    private final ReporteEjecutivoService reporteEjecutivoService;

    public ReporteEjecutivoController(ReporteEjecutivoService reporteEjecutivoService) {
        this.reporteEjecutivoService = reporteEjecutivoService;
    }

    @GetMapping("/resumen")
    public ResumenReporteEjecutivoDto obtenerResumenReporteEjecutivo() {
        return reporteEjecutivoService.obtenerResumenReporteEjecutivo();
    }
}