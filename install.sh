#!/bin/bash

set -e

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Функция для вывода сообщений
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Функция установки
install_marzban() {
    print_status "Обновление системы и установка зависимостей"
    sudo apt update && sudo apt upgrade -y
    sudo apt install -y docker.io docker-compose python3-pip git curl python3.11-venv python3-full net-tools sqlite3

    print_status "Клонирование репозитория Marzban-fork"
    if [ ! -d "Marzban-fork" ]; then
        git clone https://github.com/Differin3/Marzban-fork.git
    fi
    cd Marzban-fork

    print_status "Создание виртуального окружения"
    python3 -m venv venv
    source venv/bin/activate

    print_status "Установка Python зависимостей"
    pip install -r requirements.txt

    print_status "Настройка переменных окружения"
    sudo mkdir -p /var/lib/marzban
    
    # Запрос порта у пользователя
    read -p "Введите порт для Marzban (по умолчанию 8000): " port
    port=${port:-8000}
    
    # Генерация пароля
    password=$(openssl rand -hex 16)

    sudo tee /var/lib/marzban/.env > /dev/null << EOF
SQLALCHEMY_DATABASE_URL=sqlite:////var/lib/marzban/data.db
XRAY_JSON=/var/lib/marzban/xray_config.json
XRAY_EXECUTABLE=/usr/local/bin/xray
XRAY_ASSETS=/usr/local/share/xray
SUDO_USERNAME=admin
SUDO_PASSWORD=$password
UVICORN_PORT=$port
EOF

    print_status "Исправление конфигурации в config.py"
    sed -i 's|default="sqlite:///db.sqlite3"|default="sqlite:////var/lib/marzban/data.db"|g' config.py

    print_status "Создание базы данных и таблиц"
    source venv/bin/activate
    python -c "
from app.db.base import Base
from app.db.session import engine
Base.metadata.create_all(bind=engine)
print('База данных создана успешно!')
"

    print_status "Установка Xray"
    if ! command -v xray &> /dev/null; then
        bash -c "$(curl -L https://github.com/XTLS/Xray-install/raw/main/install-release.sh)" @ install
    fi

    print_status "Создание systemd сервиса"
    sudo tee /etc/systemd/system/marzban.service > /dev/null << EOF
[Unit]
Description=Marzban Service
Documentation=https://github.com/gozargah/marzban
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/root/Marzban-fork
Environment=PYTHONPATH=/root/Marzban-fork
EnvironmentFile=/var/lib/marzban/.env
ExecStart=/root/Marzban-fork/venv/bin/python /root/Marzban-fork/main.py
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
EOF

    print_status "Запуск сервиса Marzban"
    sudo systemctl daemon-reload
    sudo systemctl enable marzban
    sudo systemctl start marzban

    print_status "Установка завершена!"
    echo "Пароль администратора: $password"
    echo "Marzban будет доступен на порту: $port"
}

# Функция обновления
update_marzban() {
    print_status "Остановка сервиса Marzban"
    sudo systemctl stop marzban

    print_status "Обновление кода из репозитория"
    cd /root/Marzban-fork
    git fetch origin
    git pull origin main

    print_status "Обновление зависимостей"
    source venv/bin/activate
    pip install -r requirements.txt

    print_status "Применение миграций базы данных"
    if [ -f "alembic.ini" ]; then
        alembic upgrade head
    fi

    print_status "Запуск сервиса Marzban"
    sudo systemctl start marzban

    print_status "Обновление завершено!"
}

# Основная логика
case "${1:-}" in
    "update")
        update_marzban
        ;;
    *)
        install_marzban
        ;;
esac