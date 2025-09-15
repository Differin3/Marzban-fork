#!/bin/bash
# Скрипт инициализации системы туннелей для Marzban-node

set -e

echo "🔧 Инициализация системы туннелей..."

# Проверяем права root
if [ "$EUID" -ne 0 ]; then
    echo "❌ Этот скрипт должен запускаться с правами root"
    exit 1
fi

# Создаем директорию для конфигураций WireGuard
echo "📁 Создание директории для конфигураций WireGuard..."
mkdir -p /etc/wireguard
chmod 700 /etc/wireguard

# Проверяем доступность WireGuard
echo "🔍 Проверка доступности WireGuard..."
if ! command -v wg &> /dev/null; then
    echo "❌ WireGuard не установлен. Устанавливаем..."
    
    # Обновляем пакеты
    apt-get update
    
    # Устанавливаем WireGuard
    apt-get install -y wireguard wireguard-tools
    
    echo "✅ WireGuard установлен"
else
    echo "✅ WireGuard уже установлен"
fi

# Загружаем модуль WireGuard
echo "🔌 Загрузка модуля WireGuard..."
if ! lsmod | grep -q wireguard; then
    modprobe wireguard
    echo "✅ Модуль WireGuard загружен"
else
    echo "✅ Модуль WireGuard уже загружен"
fi

# Настраиваем автозагрузку модуля
echo "⚙️ Настройка автозагрузки модуля WireGuard..."
if ! grep -q "wireguard" /etc/modules; then
    echo "wireguard" >> /etc/modules
    echo "✅ Автозагрузка модуля настроена"
else
    echo "✅ Автозагрузка модуля уже настроена"
fi

# Создаем systemd сервис для управления туннелями
echo "🔧 Создание systemd сервиса для туннелей..."
cat > /etc/systemd/system/marzban-tunnels.service << EOF
[Unit]
Description=Marzban Tunnels Manager
After=network.target

[Service]
Type=oneshot
RemainAfterExit=yes
ExecStart=/bin/bash -c 'for conf in /etc/wireguard/tunnel_*.conf; do [ -f "\$conf" ] && wg-quick up "\$conf" || true; done'
ExecStop=/bin/bash -c 'for conf in /etc/wireguard/tunnel_*.conf; do [ -f "\$conf" ] && wg-quick down "\$conf" || true; done'

[Install]
WantedBy=multi-user.target
EOF

# Перезагружаем systemd
systemctl daemon-reload
systemctl enable marzban-tunnels.service

echo "✅ Systemd сервис создан и включен"

# Проверяем конфигурацию
echo "🔍 Проверка конфигурации..."
if [ -d "/etc/wireguard" ]; then
    echo "✅ Директория /etc/wireguard существует"
else
    echo "❌ Директория /etc/wireguard не существует"
    exit 1
fi

# Проверяем права доступа
if [ "$(stat -c %a /etc/wireguard)" = "700" ]; then
    echo "✅ Права доступа к /etc/wireguard настроены правильно"
else
    echo "⚠️ Настройка прав доступа к /etc/wireguard..."
    chmod 700 /etc/wireguard
fi

# Проверяем доступность wg-quick
if command -v wg-quick &> /dev/null; then
    echo "✅ wg-quick доступен"
else
    echo "❌ wg-quick не найден"
    exit 1
fi

echo ""
echo "🎉 Инициализация системы туннелей завершена!"
echo ""
echo "📋 Что было сделано:"
echo "  ✅ Установлен WireGuard и wireguard-tools"
echo "  ✅ Создана директория /etc/wireguard"
echo "  ✅ Загружен модуль WireGuard"
echo "  ✅ Настроена автозагрузка модуля"
echo "  ✅ Создан systemd сервис marzban-tunnels"
echo ""
echo "🚀 Система готова к работе с туннелями!"
echo ""
echo "💡 Для проверки статуса используйте:"
echo "  systemctl status marzban-tunnels"
echo "  wg show"
echo ""

