const TelegramBot = require('@soymaycol/maytelegram');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Colores ANSI para consola
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    dim: '\x1b[2m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    white: '\x1b[37m',
    bgRed: '\x1b[41m',
    bgGreen: '\x1b[42m',
    bgYellow: '\x1b[43m',
    bgBlue: '\x1b[44m',
    bgMagenta: '\x1b[45m',
    bgCyan: '\x1b[46m'
};

// ASCII Art del bot
const botAscii = `
${colors.cyan}
███╗   ███╗ █████╗ ██╗   ██╗ ██████╗ ██████╗ ██╗      █████╗ ██╗
████╗ ████║██╔══██╗╚██╗ ██╔╝██╔════╝██╔═══██╗██║     ██╔══██╗██║
██╔████╔██║███████║ ╚████╔╝ ██║     ██║   ██║██║     ███████║██║
██║╚██╔╝██║██╔══██║  ╚██╔╝  ██║     ██║   ██║██║     ██╔══██║██║
██║ ╚═╝ ██║██║  ██║   ██║   ╚██████╗╚██████╔╝███████╗██║  ██║██║
╚═╝     ╚═╝╚═╝  ╚═╝   ╚═╝    ╚═════╝ ╚═════╝ ╚══════╝╚═╝  ╚═╝╚═╝
                                                                    
${colors.yellow}        ╔══════════════════════════════════════╗
${colors.yellow}        ║     🤖 MaycolAIUltraMD Bot 🤖        ║
${colors.yellow}        ║        Created by SoyMaycol         ║
${colors.yellow}        ╚══════════════════════════════════════╝
${colors.reset}
`;

// Función para mostrar mensajes con colores
function log(message, color = 'white') {
    const timestamp = new Date().toLocaleString();
    console.log(`${colors[color]}[${timestamp}] ${message}${colors.reset}`);
}

// Función para mostrar el estado del bot
function showBotStatus(status, color) {
    console.log(`${colors[color]}
╔${'═'.repeat(50)}╗
║${' '.repeat(18)}BOT STATUS${' '.repeat(18)}║
║${' '.repeat(50)}║
║  ${status.padEnd(46)}  ║
╚${'═'.repeat(50)}╝
${colors.reset}`);
}

// Configuración de archivos
const configPath = path.join(__dirname, 'config.json');
const pluginsPath = path.join(__dirname, 'MayPlugins');

// Función para cargar configuración
function loadConfig() {
    try {
        if (fs.existsSync(configPath)) {
            const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
            return config;
        }
    } catch (error) {
        log('Error al cargar configuración', 'red');
    }
    return null;
}

// Función para guardar configuración
function saveConfig(token) {
    try {
        const config = { token: token, lastConnection: Date.now() };
        fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
        log('Configuración guardada exitosamente', 'green');
    } catch (error) {
        log('Error al guardar configuración', 'red');
    }
}

// Función para solicitar token
function askForToken() {
    return new Promise((resolve) => {
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        console.log(`${colors.yellow}
╔════════════════════════════════════════════════════════╗
║                  🔐 TOKEN REQUERIDO 🔐                  ║
║                                                        ║
║  Por favor ingresa tu token de Telegram Bot:           ║
╚════════════════════════════════════════════════════════╝${colors.reset}`);

        rl.question(`${colors.cyan}📝 Token: ${colors.reset}`, (token) => {
            rl.close();
            resolve(token.trim());
        });
    });
}

// Función para validar token
function validateToken(token) {
    return token && token.includes(':') && token.length > 20;
}

// Función para cargar plugins
function loadPlugins(bot) {
    let pluginCount = 0;
    
    if (!fs.existsSync(pluginsPath)) {
        fs.mkdirSync(pluginsPath, { recursive: true });
        log('Carpeta MayPlugins creada', 'yellow');
        return 0;
    }

    const files = fs.readdirSync(pluginsPath);
    
    files.forEach(file => {
        if (file.endsWith('.js')) {
            try {
                const pluginPath = path.join(pluginsPath, file);
                // Limpiar caché del require para recargas
                delete require.cache[require.resolve(pluginPath)];
                const handler = require(pluginPath);
                
                if (typeof handler === 'function') {
                    handler(bot);
                    pluginCount++;
                    log(`Plugin cargado: ${file}`, 'green');
                } else {
                    log(`Plugin inválido: ${file}`, 'yellow');
                }
            } catch (error) {
                log(`Error cargando plugin ${file}: ${error.message}`, 'red');
            }
        }
    });
    
    return pluginCount;
}

// Función para manejar mensajes del bot
function setupMessageHandler(bot) {
    bot.on('message', (msg) => {
        const chatId = msg.chat.id;
        const userId = msg.from.id;
        const userName = msg.from.username || msg.from.first_name || 'Usuario';
        const messageText = msg.text || '[Archivo/Media]';
        const chatType = msg.chat.type;
        const chatTitle = msg.chat.title || 'Chat Privado';

        // Log del mensaje recibido
        console.log(`${colors.magenta}
┌${'─'.repeat(60)}┐
│ 📨 MENSAJE RECIBIDO                                      │
├${'─'.repeat(60)}┤
│ 👤 Usuario: ${userName.padEnd(43)} │
│ 🆔 User ID: ${userId.toString().padEnd(42)} │
│ 💬 Chat: ${chatTitle.padEnd(46)} │
│ 📝 Tipo: ${chatType.padEnd(46)} │
│ 🔤 Mensaje: ${messageText.slice(0, 40).padEnd(40)} │
└${'─'.repeat(60)}┘${colors.reset}`);
    });

    bot.on('polling_error', (error) => {
        log(`Polling Error: ${error.message}`, 'red');
    });

    bot.on('error', (error) => {
        log(`Bot Error: ${error.message}`, 'red');
    });
}

// Función principal
async function startBot() {
    console.clear();
    console.log(botAscii);
    
    showBotStatus('🔍 Iniciando sistema...', 'cyan');
    
    let token;
    let config = loadConfig();
    
    if (config && config.token && validateToken(config.token)) {
        log('Token encontrado en configuración', 'green');
        token = config.token;
        
        // Mostrar última conexión
        const lastConnection = new Date(config.lastConnection).toLocaleString();
        log(`Última conexión: ${lastConnection}`, 'cyan');
    } else {
        log('Token no encontrado o inválido', 'yellow');
        token = await askForToken();
        
        if (!validateToken(token)) {
            log('❌ Token inválido. El bot se cerrará.', 'red');
            process.exit(1);
        }
        
        saveConfig(token);
    }

    showBotStatus('🔗 Conectando al bot...', 'yellow');
    
    try {
        const bot = new TelegramBot(token, { 
            polling: {
                interval: 300,
                autoStart: true,
                params: {
                    timeout: 10
                }
            }
        });

        // Configurar manejadores de mensajes
        setupMessageHandler(bot);

        // Verificar conexión
        const botInfo = await bot.getMe();
        
        showBotStatus('✅ Bot conectado exitosamente', 'green');
        
        console.log(`${colors.green}
╔════════════════════════════════════════════════════════╗
║                   🎉 BOT INFORMACIÓN 🎉                 ║
║                                                        ║
║  🤖 Nombre: ${botInfo.first_name.padEnd(37)} ║
║  👤 Usuario: @${botInfo.username.padEnd(35)} ║
║  🆔 ID: ${botInfo.id.toString().padEnd(41)} ║
║  📅 Iniciado: ${new Date().toLocaleString().padEnd(33)} ║
╚════════════════════════════════════════════════════════╝${colors.reset}`);

        // Cargar plugins
        log('🔌 Cargando plugins...', 'cyan');
        const pluginCount = loadPlugins(bot);
        
        if (pluginCount > 0) {
            log(`✅ ${pluginCount} plugins cargados exitosamente`, 'green');
        } else {
            log('⚠️ No se encontraron plugins', 'yellow');
        }

        showBotStatus('🚀 Bot funcionando correctamente', 'green');
        
        log('Bot iniciado correctamente. Presiona Ctrl+C para detener.', 'bright');

        // Manejar cierre graceful
        process.on('SIGINT', () => {
            log('Deteniendo bot...', 'yellow');
            bot.stopPolling();
            showBotStatus('⏹️ Bot detenido', 'red');
            process.exit(0);
        });

    } catch (error) {
        showBotStatus('❌ Error de conexión', 'red');
        log(`Error: ${error.message}`, 'red');
        
        if (error.message.includes('401')) {
            log('Token inválido. Eliminando configuración...', 'yellow');
            if (fs.existsSync(configPath)) {
                fs.unlinkSync(configPath);
            }
            log('Reinicia el bot para ingresar un nuevo token', 'cyan');
        }
        
        process.exit(1);
    }
}

// Crear carpeta de plugins si no existe
if (!fs.existsSync(pluginsPath)) {
    fs.mkdirSync(pluginsPath, { recursive: true });
    log('Carpeta MayPlugins creada', 'green');
}

// Iniciar el bot
startBot().catch(error => {
    console.error('Error fatal:', error);
    process.exit(1);
});
