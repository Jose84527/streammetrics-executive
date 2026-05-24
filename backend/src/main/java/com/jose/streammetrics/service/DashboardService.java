package com.jose.streammetrics.service;

import org.springframework.stereotype.Service;

import com.jose.streammetrics.dto.ResumenDashboardDto;
import com.jose.streammetrics.repository.DashboardRepository;

@Service
public class DashboardService {

    private final DashboardRepository dashboardRepository;

    public DashboardService(DashboardRepository dashboardRepository) {
        this.dashboardRepository = dashboardRepository;
    }

    public ResumenDashboardDto obtenerResumenDashboard() {
        return new ResumenDashboardDto(
                dashboardRepository.obtenerTotalVisualizaciones(),
                dashboardRepository.obtenerTotalHorasVistas(),
                dashboardRepository.obtenerTotalPerfilesAnalizados(),
                dashboardRepository.obtenerGeneroMasVisto(),
                dashboardRepository.obtenerPaisMayorConsumo(),
                dashboardRepository.obtenerPlanMayorConsumo(),
                dashboardRepository.obtenerFranjaHorariaMayorActividad()
        );
    }
}