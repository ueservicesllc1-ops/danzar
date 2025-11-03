# Script para matar procesos en puerto 3000 y reiniciar el servidor
Write-Host "Deteniendo procesos en puerto 3000..." -ForegroundColor Yellow

# Matar todos los procesos de Node.js
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force

# Matar procesos específicos en el puerto 3000
$connections = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue
if ($connections) {
    $connections | ForEach-Object {
        $processId = $_.OwningProcess
        if ($processId) {
            Stop-Process -Id $processId -Force -ErrorAction SilentlyContinue
            Write-Host "Proceso $processId detenido" -ForegroundColor Green
        }
    }
}

Start-Sleep -Seconds 2

Write-Host "Iniciando servidor en puerto 3000..." -ForegroundColor Green
Set-Location E:\danzar
npm run dev

