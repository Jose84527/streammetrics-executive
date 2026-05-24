package com.jose.streammetrics.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

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
    public ResumenPlanesDto obtenerConsumoPorPlanes() {
        return planService.obtenerConsumoPorPlanes();
    }
}