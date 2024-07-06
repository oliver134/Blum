// ==UserScript==
// @name         Blum
// @version      1.0
// @description  AutoClicker and Autofarm for Blum
// @match        https://telegram.blum.codes/*
// @grant        none
// @icon         https://raw.githubusercontent.com/oliver134/Blum/main/blum.jpeg
// @downloadURL  https://github.com/oliver134/Blum/raw/main/blum-autoclicker.user.js
// @updateURL    https://github.com/oliver134/Blum/raw/main/blum-autoclicker.user.js
// @author       Emin M @emin.mir
// @homepage     https://t.me/crypto_world_aze
// ==/UserScript==
let GAME_SETTINGS = {
    clickPercentage: Math.floor(Math.random() * 11) + 75, // Вероятность нажатия на элемент (цветок или бомбу) в процентах
    minIceHits: Math.floor(Math.random() * 2) + 2, // Минимальное количество нажатий на заморозку
    minDelayMs: 2000, // Минимальная задержка между действиями в миллисекундах
    maxDelayMs: 5000, // Максимальная задержка между действиями в миллисекундах
};

let isGamePaused = false;

try {
    let gameStats = {
        score: 0,
        bombHits: 0,
        iceHits: 0,
        flowersClicked: 0,
        flowersSkipped: 0,
        bombsClicked: 0,
        bombsSkipped: 0,
        isGameOver: false,
    };

    // Перехват и обработка новых элементов игры
    const originalPush = Array.prototype.push;
    Array.prototype.push = function (...items) {
        if (!isGamePaused) {
            items.forEach(item => handleGameElement(item));
        }
        return originalPush.apply(this, items);
    };

    // Обработка каждого игрового элемента
    function handleGameElement(element) {
        if (!element || !element.item) return;

        const { type } = element.item;
        switch (type) {
            case "CLOVER":
                processFlower(element);
                break;
            case "BOMB":
                processBomb(element);
                break;
            case "FREEZE":
                processIce(element);
                break;
        }
    }

    function processFlower(element) {
        if (!isGamePaused) {
            const shouldClick = Math.random() < (GAME_SETTINGS.clickPercentage / 100);
            if (shouldClick) {
                gameStats.score++;
                gameStats.flowersClicked++;
                clickElement(element);
            } else {
                gameStats.flowersSkipped++;
            }
        }
    }

     function processBomb(element) {
        if (!isGamePaused) {
            const shouldClick = Math.random() < (GAME_SETTINGS.clickPercentage / 100);
            if (shouldClick) {
                gameStats.score = 0;
                gameStats.bombsClicked++;
                clickElement(element);
            } else {
                gameStats.bombsSkipped++;
            }
        }
    }

    function processIce(element) {
        if (gameStats.iceHits < GAME_SETTINGS.minIceHits) {
            clickElement(element);
            gameStats.iceHits++;
        }
    }

    function clickElement(element) {
        element.onClick(element);
        element.isExplosion = true;
        element.addedAt = performance.now();
    }

    // Проверка завершения игры и нажатие кнопки "Claim"
    function checkGameCompletionAndNavigateHome() {
        const rewardElement = document.querySelector('#app > div > div > div.content > div.reward');
        if (rewardElement && !gameStats.isGameOver) {
            gameStats.isGameOver = true;
            const claimButton = rewardElement.querySelector('button');
            if (claimButton) {
                claimButton.click(); // Нажатие кнопки "Claim"
            }
            setTimeout(() => {
                navigateToHomePage(); // Переход на главную страницу через 5 секунд
                resetGameStats(); // Сброс статистики игры
                resetGameSettings(); // Сброс настроек игры
                setTimeout(checkAndClickPlayButton, 5000); // После перехода, проверяем кнопку "Play"
            }, 5000); // Задержка 5 секунд перед переходом
        }
    }







    // Функция для перехода на главную страницу
    function navigateToHomePage() {
        window.location.href = 'https://telegram.blum.codes/'; // Замените на ваш URL главной страницы
    }

    // Функция для непрерывной проверки завершения игры и перехода на главную страницу
    function continuousGameCompletionCheck() {
        checkGameCompletionAndNavigateHome();
        setTimeout(continuousGameCompletionCheck, 1000); // Повторная проверка каждую секунду
    }

    // Запуск непрерывной проверки завершения игры и перехода на главную страницу
    continuousGameCompletionCheck();






    function resetGameSettings() {
        GAME_SETTINGS = {
            clickPercentage: Math.floor(Math.random() * 11) + 75,  // Вероятность нажатия на элемент (цветок или бомбу) в процентах
            minIceHits: Math.floor(Math.random() * 2) + 2, // Минимальное количество нажатий на заморозку
            minDelayMs: 2000, // Минимальная задержка между действиями в миллисекундах
            maxDelayMs: 5000, // Максимальная задержка между действиями в миллисекундах
        };
    }

    function getRandomDelay() {
        return Math.random() * (GAME_SETTINGS.maxDelayMs - GAME_SETTINGS.minDelayMs) + GAME_SETTINGS.minDelayMs;
    }

    function getNewGameDelay() {
        return Math.floor(Math.random() * (3000 - 1000 + 1) + 1000);
    }










   // Функция для непрерывной проверки наличия кнопки "Claim"
    function checkAndClickClaimButton() {
        if (!isGamePaused) {
            const claimButton = document.querySelector('button.kit-button.is-large.is-drop.is-fill.button.is-done');
            if (claimButton && claimButton.textContent.includes('Claim')) {
                setTimeout(() => {
                    claimButton.click(); // Нажатие кнопки "Claim"
                    gameStats.isGameOver = false; // Сброс состояния игры
                    setTimeout(checkAndClickStartFarmingButton, getNewGameDelay()); // После нажатия Claim, проверяем кнопку "Start farming"
                }, getNewGameDelay()); // Получение случайной задержки
            }
        }
    }

 // Функция для проверки и нажатия кнопки "Start farming"
    function checkAndClickStartFarmingButton() {
        if (!isGamePaused) {
            const startFarmingButton = document.querySelector('button.kit-button.is-large.is-primary.is-fill.button');
            if (startFarmingButton && startFarmingButton.textContent.includes('Start farming')) {
                setTimeout(() => {
                    startFarmingButton.click(); // Нажатие кнопки "Start farming"
                    gameStats.isGameOver = false; // Сброс состояния игры
                    setTimeout(checkAndClickPlayButton, getNewGameDelay()); // После нажатия Start farming, проверяем кнопку "Play"
                }, getNewGameDelay()); // Получение случайной задержки
            }
        }
    }

  // Функция для проверки и нажатия кнопки "Play"
    function checkAndClickPlayButton() {
        if (!isGamePaused) {
            const playButton = document.querySelector('a.play-btn[href="/game"]');
            if (playButton) {
                setTimeout(() => {
                    playButton.click(); // Нажатие кнопки "Play"
                    gameStats.isGameOver = false; // Сброс состояния игры
                }, getNewGameDelay()); // Получение случайной задержки
            }
        }
    }

// Функция для непрерывной проверки наличия кнопки "Claim"
function continuousClaimButtonCheck() {
    checkAndClickClaimButton();  // Вызов функции проверки и нажатия "Claim"
    setTimeout(continuousClaimButtonCheck, 1000);  // Повторная проверка каждую секунду
}

// Функция для непрерывной проверки наличия кнопки "Start farming"
function continuousStartFarmingCheck() {
    checkAndClickStartFarmingButton();  // Вызов функции проверки и нажатия "Start farming"
    setTimeout(continuousStartFarmingCheck, 1000);  // Повторная проверка каждую секунду
}

// Функция для непрерывной проверки наличия кнопки "Play"
function continuousPlayButtonCheck() {
    checkAndClickPlayButton();  // Вызов функции проверки и нажатия "Play"
    setTimeout(continuousPlayButtonCheck, 1000);  // Повторная проверка каждую секунду
}

// Запуск непрерывной проверки кнопки "Claim"
continuousClaimButtonCheck();

// Запуск непрерывной проверки кнопки "Start farming"
continuousStartFarmingCheck();

// Запуск непрерывной проверки кнопки "Play"
continuousPlayButtonCheck();





 // Функция для генерации случайной задержки
    function getNewGameDelay() {
        return Math.floor(Math.random() * (3000 - 1000 + 1) + 1000); // Случайная задержка от 1 до 3 секунд
    }











    // Кнопка "Пауза"
    const pauseButton = document.createElement('button');
    pauseButton.textContent = 'Пауза';
    pauseButton.style.position = 'fixed';
    pauseButton.style.bottom = '20px';
    pauseButton.style.right = '20px';
    pauseButton.style.zIndex = '9999';
    pauseButton.style.padding = '4px 8px';
    pauseButton.style.backgroundColor = '#8B0000';
    pauseButton.style.color = 'white';
    pauseButton.style.border = 'none';
    pauseButton.style.borderRadius = '10px';
    pauseButton.style.cursor = 'pointer';
    pauseButton.onclick = toggleGamePause;
    document.body.appendChild(pauseButton);

    // Кнопка "Настройки"
    const settingsButton = document.createElement('button');
    settingsButton.textContent = 'Настройки';
    settingsButton.style.position = 'fixed';
    settingsButton.style.bottom = '60px';
    settingsButton.style.right = '20px';
    settingsButton.style.zIndex = '9999';
    settingsButton.style.padding = '4px 8px';
    settingsButton.style.backgroundColor = '#4CAF50';
    settingsButton.style.color = 'white';
    settingsButton.style.border = 'none';
    settingsButton.style.borderRadius = '10px';
    settingsButton.style.cursor = 'pointer';
    settingsButton.onclick = openSettingsModal;
    document.body.appendChild(settingsButton);

   // Функция для переключения состояния игры (пауза/старт)
    function toggleGamePause() {
        isGamePaused = !isGamePaused;
        pauseButton.textContent = isGamePaused ? 'Старт' : 'Пауза';
    }

    // Открытие модального окна настроек
    function openSettingsModal() {
        const modal = document.createElement('div');
        modal.style.position = 'fixed';
        modal.style.top = '50%';
        modal.style.left = '50%';
        modal.style.transform = 'translate(-50%, -50%)';
        modal.style.zIndex = '10000';
        modal.style.padding = '20px';
        modal.style.backgroundColor = 'Black';
        modal.style.border = '1px solid #ccc';
        modal.style.borderRadius = '10px';
        modal.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)';
        modal.style.fontSize = '14px';
        modal.style.fontFamily = 'Arial, sans-serif';

        const clickPercentageInput = createSettingInput('Нажатия на цветок или бомбу (%)', GAME_SETTINGS.clickPercentage);
        const minIceHitsInput = createSettingInput('Мин. кол-во нажатий на лёд', GAME_SETTINGS.minIceHits);
        const minDelayMsInput = createSettingInput('Мин. задержка (мс)', GAME_SETTINGS.minDelayMs);
        const maxDelayMsInput = createSettingInput('Макс. задержка (мс)', GAME_SETTINGS.maxDelayMs);

        const saveButton = document.createElement('button');
        saveButton.textContent = 'Сохранить';
        saveButton.style.marginTop = '10px';
        saveButton.style.padding = '6px 12px';
        saveButton.style.backgroundColor = '#4CAF50';
        saveButton.style.color = 'Black';
        saveButton.style.border = 'none';
        saveButton.style.borderRadius = '5px';
        saveButton.style.cursor = 'pointer';
        saveButton.onclick = () => {
            GAME_SETTINGS.clickPercentage = parseInt(clickPercentageInput.input.value);
            GAME_SETTINGS.minIceHits = parseInt(minIceHitsInput.input.value);
            GAME_SETTINGS.minDelayMs = parseInt(minDelayMsInput.input.value);
            GAME_SETTINGS.maxDelayMs = parseInt(maxDelayMsInput.input.value);
            document.body.removeChild(modal);
        };

        modal.appendChild(clickPercentageInput.container);
        modal.appendChild(minIceHitsInput.container);
        modal.appendChild(minDelayMsInput.container);
        modal.appendChild(maxDelayMsInput.container);
        modal.appendChild(saveButton);

        document.body.appendChild(modal);
    }

    function createSettingInput(labelText, defaultValue) {
        const container = document.createElement('div');
        container.style.marginBottom = '10px';

        const label = document.createElement('label');
        label.textContent = labelText;
        label.style.display = 'block';
        label.style.marginBottom = '5px';
        label.style.fontSize = '14px';

        const input = document.createElement('input');
        input.type = 'number';
        input.value = defaultValue;
        input.style.width = '100%';
        input.style.padding = '8px';
        input.style.boxSizing = 'border-box';
        input.style.fontSize = '14px';
        input.style.border = '1px solid #ccc';
        input.style.borderRadius = '5px';

        container.appendChild(label);
        container.appendChild(input);

        return { container, input };
    }
} catch (e) {
    console.error('Error in Blum Autoclicker script:', e);
	}
