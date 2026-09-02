import os
import sys
import subprocess
import platform
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent


def check_python():
    version = sys.version_info
    if version.major < 3 or (version.major == 3 and version.minor < 8):
        print(f"Python 3.8+ necessario. Versao atual: {version.major}.{version.minor}")
        sys.exit(1)
    print(f"Python {version.major}.{version.minor}.{version.micro} detectado")


def create_database():
    db_dir = BASE_DIR / "database"
    db_dir.mkdir(exist_ok=True)
    print(f"Diretorio do banco criado/verificado: {db_dir}")


def install_dependencies():
    print("Instalando dependencias...")
    subprocess.run(
        [sys.executable, "-m", "pip", "install", "--upgrade", "pip"],
        cwd=BASE_DIR,
        check=False,
    )
    subprocess.run(
        [sys.executable, "-m", "pip", "install", "-r", "requirements.txt"],
        cwd=BASE_DIR,
        check=True,
    )
    print("Dependencias instaladas.")


def run_app():
    print("Iniciando Agenda 2026...")
    print(f"Acesse: http://localhost:{os.getenv('AGENDA_PORT', '5000')}")
    print("Pressione Ctrl+C para parar.")
    subprocess.run([sys.executable, "app.py"], cwd=BASE_DIR, check=True)


def main():
    if len(sys.argv) > 1 and sys.argv[1] == "install":
        check_python()
        install_dependencies()
        return

    check_python()
    create_database()
    run_app()


if __name__ == "__main__":
    main()
