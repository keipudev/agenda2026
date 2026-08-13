@echo off
title Agenda 2026 - Docker
echo ========================================
echo          Agenda 2026 - Docker
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

:MENU
echo Escolha o modo Docker:
echo.
echo [1] Windows Containers
echo [2] Linux Containers
echo.
set /p modo="Opcao (1 ou 2): "

if "%modo%"=="1" (
    set COMPOSE_FILE=docker-compose.windows.yml
    set COMPOSE_CMD=docker-compose -f docker-compose.windows.yml
) else if "%modo%"=="2" (
    set COMPOSE_FILE=docker-compose.yml
    set COMPOSE_CMD=docker-compose
) else (
    echo Opcao invalida.
    goto MENU
)

echo.
echo Modo selecionado: %COMPOSE_FILE%
echo.

echo Construindo imagem...
%COMPOSE_CMD% build
if errorlevel 1 (
    echo ERRO ao construir a imagem.
    pause
    exit /b 1
)

echo.
echo Iniciando container...
%COMPOSE_CMD% up -d
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
echo   - Ver logs: %COMPOSE_CMD% logs -f
echo   - Parar: %COMPOSE_CMD% down
echo   - Reiniciar: %COMPOSE_CMD% restart
echo.

pause
