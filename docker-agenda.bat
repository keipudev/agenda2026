@echo off
title Agenda 2026 - Docker
echo ========================================
echo          Agenda 2026 - Docker
echo ========================================
echo.

echo Verificando Docker...
docker --version >nul 2>&1
if errorlevel 1 (
    echo ERRO: Docker nao encontrado.
    echo Instale o Docker Desktop em: https://www.docker.com/products/docker-desktop/
    pause
    exit /b 1
)

echo.
echo Iniciando Agenda 2026 via Docker...
echo Acesse: http://localhost:5000
echo.
echo Pressione Ctrl+C para parar o servidor
echo.

docker compose up --build

pause
