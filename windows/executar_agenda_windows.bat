@echo off
title Agenda 2026 - Windows Nativo
echo ========================================
echo    Agenda 2026 - Windows Nativo
echo ========================================
echo.

cd /d "%~dp0"

REM Verificar se Python esta instalado
python --version >nul 2>&1
if errorlevel 1 (
    echo ERRO: Python nao encontrado.
    echo Instale o Python em: https://www.python.org/downloads/
    pause
    exit /b 1
)

REM Criar banco de dados se nao existir
if not exist "database" mkdir database
if not exist "database\agenda.db" (
    echo Inicializando banco de dados...
    python app.py
    if errorlevel 1 (
        echo ERRO ao inicializar o banco de dados.
        pause
        exit /b 1
    )
    timeout /t 2 /nobreak >nul
)

echo.
echo Iniciando Agenda 2026...
echo Acesse: http://localhost:5000
echo.
echo Pressione Ctrl+C para parar o servidor
echo.

python app.py
pause
