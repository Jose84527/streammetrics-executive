$envFile = ".env"

if (-Not (Test-Path $envFile)) {
    Write-Host "No se encontró el archivo .env" -ForegroundColor Red
    exit 1
}

Get-Content $envFile | ForEach-Object {
    if ($_ -match "^\s*#" -or $_ -match "^\s*$") {
        return
    }

    $parts = $_ -split "=", 2

    if ($parts.Length -eq 2) {
        $name = $parts[0].Trim()
        $value = $parts[1].Trim()
        [Environment]::SetEnvironmentVariable($name, $value, "Process")
    }
}

Write-Host "Variables de entorno cargadas correctamente." -ForegroundColor Green
Write-Host "Iniciando backend StreamMetrics..." -ForegroundColor Cyan

.\mvnw.cmd spring-boot:run