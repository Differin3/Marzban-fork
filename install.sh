# Обновляем систему
sudo apt update && sudo apt upgrade -y

# Устанавливаем зависимости
sudo apt install -y docker.io docker-compose python3-pip git curl

# Клонируем ваш форк
git clone https://github.com/Differin3/Marzban-fork.git
cd Marzban-fork

# Запускаем установку
if [ -f "install_service.sh" ]; then
    chmod +x install_service.sh
    sudo ./install_service.sh
elif [ -f "docker-compose.yml" ]; then
    sudo docker-compose up -d
else
    echo "Не найден метод установки. Пожалуйста, проверьте структуру репозитория."
fi