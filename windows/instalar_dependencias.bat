@echo off
title Agenda 2026 - Instalar Dependencias (Windows)
echo ========================================
echo    Instalando dependencias Python
echo ========================================
echo.

cd /d "%~dp0"

REM Verificar se pip esta disponivel
python -m pip --version >nul 2>&1
if errorlevel 1 (
    echo ERRO: pip nao encontrado.
    echo Tente executar: python -m ensurepip --default-pip
    pause
    exit /b 1
)

echo Instalando dependencias do requirements.txt...
pip install -r requirements.txt

echo.
echo ========================================
echo Dependencias instaladas com sucesso!
echo Agora voce pode executar o arquivo:
echo   executar_agenda_windows.bat
echo ========================================
echo.

pause
