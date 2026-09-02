import os
import sys
import subprocess
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent


def main():
    if sys.version_info < (3, 8):
        print("Python 3.8+ necessario.")
        sys.exit(1)

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
    print("Concluido. Use 'python scripts/run.py' para iniciar a aplicacao.")


if __name__ == "__main__":
    main()
