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
${colors.yellow}        ║       🛡️ ANTI-SPAM ACTIVADO 🛡️       ║
${colors.yellow}        ╚══════════════════════════════════════╝
${colors.reset}
`;

// Sistema Anti-Spam Global
class AntiSpamSystem {
    constructor() {
        
    this.config = {
    maxMessagesPerUser: 4,          // Toleramos un poco más antes de saltar (4 mensajes)
    timeWindow: 8000,               // En 8 segundos (más ajustado pero justo)
    globalCooldown: 1500,           // 1.5s entre respuestas del bot, más fluido
    userCooldown: 7000,             // Castigamos al spammer con 7s de espera
    maxConsecutiveMessages: 2,      // Bot solo puede responder 2 veces seguidas
    consecutiveTimeWindow: 4000     // En 4s, evita que el bot explote en respuestas
    };
        
        // Tracking de usuarios
        this.userMessages = new Map();      // userId -> [{timestamp, messageId}, ...]
        this.userCooldowns = new Map();     // userId -> timestamp
        this.lastBotMessage = 0;            // Timestamp del último mensaje del bot
        this.botConsecutiveMessages = [];   // Array de timestamps de mensajes consecutivos del bot
        this.processedMessages = new Set(); // Set de messageIds ya procesados
        
        // Limpiar datos antiguos cada 30 segundos
        setInterval(() => this.cleanup(), 30000);
        
        log('🛡️ Sistema Anti-Spam inicializado', 'green');
    }
    
    // Verificar si un usuario está en spam
    isUserSpamming(userId, messageId) {
        const now = Date.now();
        const userKey = userId.toString();
        
        // Verificar si el mensaje ya fue procesado
        if (this.processedMessages.has(messageId)) {
            log(`⚠️ Mensaje duplicado detectado: ${messageId}`, 'yellow');
            return true;
        }
        
        // Verificar cooldown del usuario
        if (this.userCooldowns.has(userKey)) {
            const cooldownEnd = this.userCooldowns.get(userKey);
            if (now < cooldownEnd) {
                const remaining = Math.ceil((cooldownEnd - now) / 1000);
                log(`🚫 Usuario ${userId} en cooldown (${remaining}s restantes)`, 'yellow');
                return true;
            } else {
                this.userCooldowns.delete(userKey);
            }
        }
        
        // Obtener mensajes del usuario en la ventana de tiempo
        if (!this.userMessages.has(userKey)) {
            this.userMessages.set(userKey, []);
        }
        
        const userMsgs = this.userMessages.get(userKey);
        const windowStart = now - this.config.timeWindow;
        
        // Filtrar mensajes dentro de la ventana de tiempo
        const recentMessages = userMsgs.filter(msg => msg.timestamp > windowStart);
        
        // Verificar si excede el límite
        if (recentMessages.length >= this.config.maxMessagesPerUser) {
            log(`🚨 SPAM detectado: Usuario ${userId} (${recentMessages.length} mensajes en ${this.config.timeWindow/1000}s)`, 'red');
            
            // Aplicar cooldown
            this.userCooldowns.set(userKey, now + this.config.userCooldown);
            return true;
        }
        
        // Agregar mensaje actual al tracking
        recentMessages.push({ timestamp: now, messageId });
        this.userMessages.set(userKey, recentMessages);
        
        // Marcar mensaje como procesado
        this.processedMessages.add(messageId);
        
        return false;
    }
    
    // Verificar si el bot debe esperar antes de responder
    shouldBotWait() {
        const now = Date.now();
        
        // Verificar cooldown global
        if (now - this.lastBotMessage < this.config.globalCooldown) {
            const remaining = Math.ceil((this.config.globalCooldown - (now - this.lastBotMessage)) / 1000);
            log(`⏳ Bot en cooldown global (${remaining}s)`, 'yellow');
            return true;
        }
        
        // Verificar mensajes consecutivos del bot
        const windowStart = now - this.config.consecutiveTimeWindow;
        this.botConsecutiveMessages = this.botConsecutiveMessages.filter(ts => ts > windowStart);
        
        if (this.botConsecutiveMessages.length >= this.config.maxConsecutiveMessages) {
            log(`🚫 Bot ha enviado demasiados mensajes consecutivos`, 'yellow');
            return true;
        }
        
        return false;
    }
    
    // Registrar que el bot envió un mensaje
    recordBotMessage() {
        const now = Date.now();
        this.lastBotMessage = now;
        this.botConsecutiveMessages.push(now);
        log(`📤 Mensaje del bot registrado`, 'cyan');
    }
    
    // Limpiar datos antiguos
    cleanup() {
        const now = Date.now();
        const oldThreshold = now - (this.config.timeWindow * 2);
        
        // Limpiar mensajes de usuarios antiguos
        for (const [userId, messages] of this.userMessages.entries()) {
            const filteredMessages = messages.filter(msg => msg.timestamp > oldThreshold);
            if (filteredMessages.length === 0) {
                this.userMessages.delete(userId);
            } else {
                this.userMessages.set(userId, filteredMessages);
            }
        }
        
        // Limpiar cooldowns expirados
        for (const [userId, cooldownEnd] of this.userCooldowns.entries()) {
            if (now > cooldownEnd) {
                this.userCooldowns.delete(userId);
            }
        }
        
        // Limpiar mensajes procesados antiguos (mantener solo los últimos 1000)
        if (this.processedMessages.size > 1000) {
            const processed = Array.from(this.processedMessages);
            this.processedMessages.clear();
            // Mantener solo los más recientes
            processed.slice(-500).forEach(id => this.processedMessages.add(id));
        }
        
        log(`🧹 Limpieza del sistema anti-spam completada`, 'dim');
    }
    
    // Obtener estadísticas del sistema
    getStats() {
        return {
            activeUsers: this.userMessages.size,
            usersInCooldown: this.userCooldowns.size,
            processedMessages: this.processedMessages.size,
            botConsecutiveMessages: this.botConsecutiveMessages.length
        };
    }
}

// Crear instancia global del sistema anti-spam
const antiSpam = new AntiSpamSystem();

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

// Función para cargar plugins con protección anti-spam
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
                delete require.cache[require.resolve(pluginPath)];
                const handler = require(pluginPath);
                
                if (typeof handler === 'function') {
                    // Envolver el plugin con protección anti-spam
                    const wrappedHandler = createAntiSpamWrapper(handler);
                    wrappedHandler(bot);
                    pluginCount++;
                    log(`Plugin cargado con protección anti-spam: ${file}`, 'green');
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

// Wrapper para proteger plugins del spam
function createAntiSpamWrapper(originalHandler) {
    return (bot) => {
        // Crear un bot proxy que intercepta todos los métodos de envío
        const botProxy = createBotProxy(bot);
        
        // Ejecutar el handler original con el bot protegido
        originalHandler(botProxy);
    };
}

// Crear proxy del bot para interceptar envíos de mensajes
function createBotProxy(originalBot) {
    const sendMethods = [
        'sendMessage', 'sendPhoto', 'sendDocument', 'sendVideo', 
        'sendVoice', 'sendLocation', 'sendSticker', 'sendAnimation',
        'editMessageText', 'editMessageCaption', 'answerCallbackQuery'
    ];
    
    const botProxy = Object.create(originalBot);
    
    sendMethods.forEach(method => {
        if (typeof originalBot[method] === 'function') {
            botProxy[method] = async (...args) => {
                // Verificar si el bot debe esperar
                if (antiSpam.shouldBotWait()) {
                    log(`🚫 Envío bloqueado por sistema anti-spam: ${method}`, 'yellow');
                    return Promise.reject(new Error('Bot en cooldown - mensaje bloqueado por anti-spam'));
                }
                
                try {
                    // Registrar que el bot va a enviar un mensaje
                    antiSpam.recordBotMessage();
                    
                    // Ejecutar el método original
                    const result = await originalBot[method].apply(originalBot, args);
                    
                    log(`✅ Mensaje enviado: ${method}`, 'green');
                    return result;
                } catch (error) {
                    log(`❌ Error enviando mensaje: ${error.message}`, 'red');
                    throw error;
                }
            };
        }
    });
    
    // Copiar todas las demás propiedades y métodos
    Object.keys(originalBot).forEach(key => {
        if (!(key in botProxy)) {
            botProxy[key] = originalBot[key];
        }
    });
    
    return botProxy;
}

// Función para manejar mensajes del bot con sistema anti-spam
function setupMessageHandler(bot) {
    bot.on('message', (msg) => {
        const chatId = msg.chat.id;
        const userId = msg.from.id;
        const userName = msg.from.username || msg.from.first_name || 'Usuario';
        const messageText = msg.text || '[Archivo/Media]';
        const chatType = msg.chat.type;
        const chatTitle = msg.chat.title || 'Chat Privado';
        const messageId = msg.message_id;

        // Aplicar sistema anti-spam
        if (antiSpam.isUserSpamming(userId, messageId)) {
            log(`🚫 Mensaje bloqueado por spam - Usuario: ${userName}`, 'red');
            return; // No procesar el mensaje
        }

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
│ 🆔 Msg ID: ${messageId.toString().padEnd(42)} │
└${'─'.repeat(60)}┘${colors.reset}`);

        // Mostrar estadísticas del anti-spam cada 50 mensajes
        const stats = antiSpam.getStats();
        if (stats.processedMessages % 50 === 0) {
            console.log(`${colors.cyan}
📊 ESTADÍSTICAS ANTI-SPAM:
   • Usuarios activos: ${stats.activeUsers}
   • Usuarios en cooldown: ${stats.usersInCooldown}
   • Mensajes procesados: ${stats.processedMessages}
   • Mensajes consecutivos del bot: ${stats.botConsecutiveMessages}${colors.reset}`);
        }
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
                interval: 500,  // Incrementamos intervalo para evitar spam
                autoStart: true,
                params: {
                    timeout: 10
                }
            }
        });

        // Configurar manejadores de mensajes con anti-spam
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
║  🛡️ Anti-Spam: ACTIVADO                               ║
╚════════════════════════════════════════════════════════╝${colors.reset}`);

        // Cargar plugins con protección anti-spam
        log('🔌 Cargando plugins con protección anti-spam...', 'cyan');
        const pluginCount = loadPlugins(bot);
        
        if (pluginCount > 0) {
            log(`✅ ${pluginCount} plugins cargados con protección anti-spam`, 'green');
        } else {
            log('⚠️ No se encontraron plugins', 'yellow');
        }

        showBotStatus('🚀 Bot funcionando con anti-spam activo', 'green');
        
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