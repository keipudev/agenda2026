@echo off
title Agenda 2026 - Docker Windows
echo ========================================
echo    Agenda 2026 - Docker Windows
echo ========================================
echo.

REM Verificar se Docker esta rodando
docker info >nul 2>&1
if errorlevel 1 (
    echo ERRO: Docker Desktop nao esta rodando.
    echo Por favor, inicie o Docker Desktop e tente novamente.
    pause
    exit /b 1
)

REM Verificar se estamos no modo Windows Containers
docker info --format "{{.OperatingSystem}}" | findstr /C:"Windows" >nul
if errorlevel 1 (
    echo AVISO: Docker parece estar no modo Linux Containers.
    echo Alternando para Windows Containers...
    "C:\Program Files\Docker\Docker\DockerCli.exe" -SwitchDaemon
    timeout /t 5 /nobreak >nul
)

echo Construindo imagem Windows...
docker-compose -f docker-compose.windows.yml build
if errorlevel 1 (
    echo ERRO ao construir a imagem.
    pause
    exit /b 1
)

echo.
echo Iniciando container...
docker-compose -f docker-compose.windows.yml up -d
if errorlevel 1 (
    echo ERRO ao iniciar o container.
    pause
    exit /b 1
)

echo.
echo ========================================
echo Agenda 2026 iniciada com sucesso!
echo Acesse: http://localhost:5000
echo ========================================
echo.
echo Comandos uteis:
echo   - Ver logs: docker-compose -f docker-compose.windows.yml logs -f
echo   - Parar: docker-compose -f docker-compose.windows.yml down
echo   - Reiniciar: docker-compose -f docker-compose.windows.yml restart
echo.

pause
