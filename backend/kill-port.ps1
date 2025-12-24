# Script to kill process on port 3000
$port = 3000
$process = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique

if ($process) {
    Write-Host "Found process with PID: $process on port $port"
    Stop-Process -Id $process -Force
    Write-Host "✅ Process killed successfully"
} else {
    Write-Host "ℹ️  No process found on port $port"
}

