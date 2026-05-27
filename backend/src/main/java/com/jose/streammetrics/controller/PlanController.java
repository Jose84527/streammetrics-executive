package com.jose.streammetrics.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.jose.streammetrics.dto.FiltroKpiRequest;
import com.jose.streammetrics.dto.ResumenPlanesDto;
import com.jose.streammetrics.service.PlanService;

@RestController
@RequestMapping("/api/planes")
public class PlanController {

    private final PlanService planService;

    public PlanController(PlanService planService) {
        this.planService = planService;
    }

    @GetMapping("/consumo")
    public ResumenPlanesDto obtenerConsumoPorPlanes(
            @RequestParam(required = false) Integer anio,
            @RequestParam(required = false) String pais,
            @RequestParam(required = false) String continente,
            @RequestParam(required = false) String tipoContenido,
            @RequestParam(required = false) String genero
    ) {
        FiltroKpiRequest filtros = new FiltroKpiRequest(
                anio,
                pais,
                continente,
                null,
                tipoContenido,
                genero,
                null,
                null
        );

        return planService.obtenerConsumoPorPlanes(filtros);
    }
}