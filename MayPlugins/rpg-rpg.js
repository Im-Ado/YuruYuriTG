const fs = require('fs');
const path = require('path');

// Ruta del archivo de base de datos
const DB_PATH = path.join(__dirname, '..', 'database.json');

// Función para cargar la base de datos
function loadDatabase() {
  try {
    if (!fs.existsSync(DB_PATH)) {
      const initialData = { users: {}, guilds: {}, rpg: {} };
      fs.writeFileSync(DB_PATH, JSON.stringify(initialData, null, 2));
      return initialData;
    }
    const data = fs.readFileSync(DB_PATH, 'utf8');
    const parsed = JSON.parse(data);
    
    // Asegurar que existe la sección RPG
    if (!parsed.rpg) parsed.rpg = {};
    
    return parsed;
  } catch (error) {
    console.error('Error cargando database:', error);
    return { users: {}, guilds: {}, rpg: {} };
  }
}

// Función para guardar la base de datos
function saveDatabase(data) {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error('Error guardando database:', error);
    return false;
  }
}

// Función para obtener o crear perfil de usuario
function getUserProfile(userId) {
  const db = loadDatabase();
  
  if (!db.rpg[userId]) {
    db.rpg[userId] = {
      name: 'Aventurero',
      level: 1,
      exp: 0,
      expNext: 100,
      hp: 100,
      maxHp: 100,
      mp: 50,
      maxMp: 50,
      attack: 15,
      defense: 10,
      speed: 12,
      gold: 100,
      inventory: {
        'Poción de Vida': 3,
        'Poción de Maná': 2
      },
      equipment: {
        weapon: 'Espada de Madera',
        armor: 'Ropa Simple',
        accessory: null
      },
      location: 'Ciudad Inicial',
      lastAdventure: 0,
      achievements: [],
      stats: {
        monstersKilled: 0,
        adventuresCompleted: 0,
        goldEarned: 0,
        timesHealed: 0
      }
    };
    saveDatabase(db);
  }
  
  return db.rpg[userId];
}

// Función para actualizar perfil de usuario
function updateUserProfile(userId, updates) {
  const db = loadDatabase();
  if (db.rpg[userId]) {
    Object.assign(db.rpg[userId], updates);
    saveDatabase(db);
    return true;
  }
  return false;
}

// Sistema de enemigos
const ENEMIES = {
  weak: [
    { name: 'Slime Verde', hp: 30, attack: 8, defense: 2, exp: 15, gold: 10 },
    { name: 'Goblin', hp: 45, attack: 12, defense: 4, exp: 25, gold: 18 },
    { name: 'Rata Gigante', hp: 35, attack: 10, defense: 3, exp: 20, gold: 12 }
  ],
  normal: [
    { name: 'Orco Guerrero', hp: 80, attack: 18, defense: 8, exp: 45, gold: 35 },
    { name: 'Esqueleto Arquero', hp: 65, attack: 22, defense: 5, exp: 40, gold: 30 },
    { name: 'Lobo Salvaje', hp: 70, attack: 20, defense: 6, exp: 42, gold: 28 }
  ],
  strong: [
    { name: 'Dragón Joven', hp: 150, attack: 35, defense: 15, exp: 100, gold: 80 },
    { name: 'Golem de Piedra', hp: 200, attack: 25, defense: 25, exp: 120, gold: 90 },
    { name: 'Mago Oscuro', hp: 120, attack: 40, defense: 10, exp: 110, gold: 85 }
  ],
  boss: [
    { name: 'Rey Demonio', hp: 500, attack: 60, defense: 30, exp: 300, gold: 250 },
    { name: 'Dragón Anciano', hp: 600, attack: 55, defense: 35, exp: 350, gold: 300 },
    { name: 'Lich Supremo', hp: 450, attack: 70, defense: 25, exp: 280, gold: 220 }
  ]
};

// Sistema de items
const ITEMS = {
  weapons: {
    'Espada de Madera': { attack: 5, price: 0 },
    'Espada de Hierro': { attack: 15, price: 200 },
    'Espada de Acero': { attack: 25, price: 500 },
    'Espada Mágica': { attack: 40, price: 1200 },
    'Excalibur': { attack: 60, price: 3000 }
  },
  armors: {
    'Ropa Simple': { defense: 2, price: 0 },
    'Armadura de Cuero': { defense: 8, price: 150 },
    'Armadura de Hierro': { defense: 15, price: 400 },
    'Armadura Mágica': { defense: 25, price: 1000 },
    'Armadura Divina': { defense: 40, price: 2500 }
  },
  consumables: {
    'Poción de Vida': { hp: 50, price: 25 },
    'Poción de Maná': { mp: 30, price: 20 },
    'Poción Grande de Vida': { hp: 100, price: 60 },
    'Elixir Completo': { hp: 200, mp: 100, price: 150 }
  }
};

// Función para obtener enemigo aleatorio basado en nivel
function getRandomEnemy(playerLevel) {
  let enemyType;
  
  if (playerLevel <= 5) enemyType = 'weak';
  else if (playerLevel <= 15) enemyType = Math.random() < 0.7 ? 'weak' : 'normal';
  else if (playerLevel <= 30) enemyType = Math.random() < 0.5 ? 'normal' : 'strong';
  else enemyType = Math.random() < 0.8 ? 'strong' : 'boss';
  
  const enemyList = ENEMIES[enemyType];
  const baseEnemy = enemyList[Math.floor(Math.random() * enemyList.length)];
  
  // Escalar enemigo según el nivel del jugador
  const levelMultiplier = 1 + (playerLevel - 1) * 0.1;
  
  return {
    ...baseEnemy,
    hp: Math.floor(baseEnemy.hp * levelMultiplier),
    maxHp: Math.floor(baseEnemy.hp * levelMultiplier),
    attack: Math.floor(baseEnemy.attack * levelMultiplier),
    defense: Math.floor(baseEnemy.defense * levelMultiplier),
    exp: Math.floor(baseEnemy.exp * levelMultiplier),
    gold: Math.floor(baseEnemy.gold * levelMultiplier)
  };
}

// Función de combate
function simulateBattle(player, enemyData) {
  const battle = {
    player: {
      name: player.name,
      hp: player.hp,
      maxHp: player.maxHp,
      attack: player.attack + (ITEMS.weapons[player.equipment.weapon]?.attack || 0),
      defense: player.defense + (ITEMS.armors[player.equipment.armor]?.defense || 0)
    },
    enemy: {
      name: enemyData.name,
      hp: enemyData.hp,
      maxHp: enemyData.maxHp,
      attack: enemyData.attack,
      defense: enemyData.defense
    },
    log: [],
    winner: null
  };

  let round = 1;
  
  while (battle.player.hp > 0 && battle.enemy.hp > 0 && round <= 20) {
    // Turno del jugador
    const playerDamage = Math.max(1, battle.player.attack - battle.enemy.defense + Math.floor(Math.random() * 10) - 5);
    battle.enemy.hp -= playerDamage;
    battle.log.push(`⚔️ ${battle.player.name} ataca a ${battle.enemy.name} por ${playerDamage} de daño`);
    
    if (battle.enemy.hp <= 0) {
      battle.winner = 'player';
      battle.log.push(`🏆 ¡${battle.player.name} ha vencido a ${battle.enemy.name}!`);
      break;
    }
    
    // Turno del enemigo
    const enemyDamage = Math.max(1, battle.enemy.attack - battle.player.defense + Math.floor(Math.random() * 8) - 4);
    battle.player.hp -= enemyDamage;
    battle.log.push(`💥 ${battle.enemy.name} ataca a ${battle.player.name} por ${enemyDamage} de daño`);
    
    if (battle.player.hp <= 0) {
      battle.winner = 'enemy';
      battle.log.push(`💀 ${battle.player.name} ha sido derrotado por ${battle.enemy.name}...`);
      break;
    }
    
    round++;
  }
  
  if (round > 20) {
    battle.winner = 'draw';
    battle.log.push(`⏰ ¡El combate terminó en empate por tiempo!`);
  }
  
  return battle;
}

// Función para calcular nivel siguiente
function getExpForNextLevel(level) {
  return Math.floor(100 * Math.pow(1.2, level - 1));
}

// Función para subir de nivel
function levelUp(player) {
  const oldLevel = player.level;
  let levelsGained = 0;
  
  while (player.exp >= player.expNext) {
    player.exp -= player.expNext;
    player.level++;
    levelsGained++;
    
    // Aumentar stats al subir de nivel
    const hpIncrease = Math.floor(Math.random() * 20) + 15;
    const mpIncrease = Math.floor(Math.random() * 10) + 8;
    const attackIncrease = Math.floor(Math.random() * 5) + 3;
    const defenseIncrease = Math.floor(Math.random() * 4) + 2;
    const speedIncrease = Math.floor(Math.random() * 3) + 1;
    
    player.maxHp += hpIncrease;
    player.maxMp += mpIncrease;
    player.attack += attackIncrease;
    player.defense += defenseIncrease;
    player.speed += speedIncrease;
    
    // Restaurar HP y MP al subir de nivel
    player.hp = player.maxHp;
    player.mp = player.maxMp;
    
    player.expNext = getExpForNextLevel(player.level);
  }
  
  return levelsGained;
}

module.exports = (bot) => {
  bot.onText(/^\/rpg(?:\s+(.+))?$/, async (msg, match) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    const action = match[1] ? match[1].toLowerCase().trim() : 'perfil';

    try {
      const player = getUserProfile(userId);

      switch (action) {
        case 'perfil':
        case 'profile':
        case 'stats':
          const weaponBonus = ITEMS.weapons[player.equipment.weapon]?.attack || 0;
          const armorBonus = ITEMS.armors[player.equipment.armor]?.defense || 0;
          
          let profileMsg = `🎮 **MAYРPG - Perfil de ${player.name}** 🎮

📊 **Estados:**
▫️ Nivel: ${player.level}
▫️ EXP: ${player.exp}/${player.expNext}
▫️ HP: ${player.hp}/${player.maxHp}
▫️ MP: ${player.mp}/${player.maxMp}

⚔️ **Atributos:**
▫️ Ataque: ${player.attack} (+${weaponBonus})
▫️ Defensa: ${player.defense} (+${armorBonus})
▫️ Velocidad: ${player.speed}

💰 **Recursos:**
▫️ Oro: ${player.gold}
▫️ Ubicación: ${player.location}

🎒 **Equipamiento:**
▫️ Arma: ${player.equipment.weapon}
▫️ Armadura: ${player.equipment.armor}
▫️ Accesorio: ${player.equipment.accessory || 'Ninguno'}

📈 **Estadísticas:**
▫️ Monstruos derrotados: ${player.stats.monstersKilled}
▫️ Aventuras completadas: ${player.stats.adventuresCompleted}
▫️ Oro ganado: ${player.stats.goldEarned}

> 💖 MayRPG por SoyMaycol`;

          await bot.sendMessage(chatId, profileMsg, { parse_mode: 'Markdown' });
          break;

        case 'aventura':
        case 'adventure':
        case 'hunt':
          const now = Date.now();
          const cooldown = 30000; // 30 segundos
          
          if (now - player.lastAdventure < cooldown) {
            const timeLeft = Math.ceil((cooldown - (now - player.lastAdventure)) / 1000);
            return bot.sendMessage(chatId, `⏰ Debes esperar ${timeLeft} segundos antes de tu próxima aventura.`);
          }

          if (player.hp <= 0) {
            return bot.sendMessage(chatId, `💀 No puedes aventurarte estando derrotado. Usa */rpg curar* para restaurar tu HP.`, { parse_mode: 'Markdown' });
          }

          const randomEnemy = getRandomEnemy(player.level);
          const battle = simulateBattle(player, randomEnemy);

          let battleMsg = `⚔️ **COMBATE** ⚔️

🧑‍💻 **${battle.player.name}** vs 👹 **${randomEnemy.name}**

${battle.log.slice(0, 6).join('\n')}

`;

          if (battle.winner === 'player') {
            // Jugador gana
            const expGained = randomEnemy.exp;
            const goldGained = randomEnemy.gold;
            
            player.exp += expGained;
            player.gold += goldGained;
            player.hp = battle.player.hp;
            player.lastAdventure = now;
            player.stats.monstersKilled++;
            player.stats.adventuresCompleted++;
            player.stats.goldEarned += goldGained;

            // Verificar subida de nivel
            const levelsGained = levelUp(player);
            
            battleMsg += `🏆 **¡VICTORIA!**
💰 +${goldGained} oro
⭐ +${expGained} EXP`;

            if (levelsGained > 0) {
              battleMsg += `\n\n🎉 **¡SUBISTE ${levelsGained} NIVEL${levelsGained > 1 ? 'ES' : ''}!**
📈 Ahora eres nivel ${player.level}
❤️ HP y MP completamente restaurados`;
            }

            // Posibilidad de encontrar item (10%)
            if (Math.random() < 0.1) {
              const items = Object.keys(ITEMS.consumables);
              const randomItem = items[Math.floor(Math.random() * items.length)];
              
              if (!player.inventory[randomItem]) player.inventory[randomItem] = 0;
              player.inventory[randomItem]++;
              
              battleMsg += `\n🎁 ¡Encontraste: ${randomItem}!`;
            }

          } else if (battle.winner === 'enemy') {
            // Jugador pierde
            const goldLost = Math.floor(player.gold * 0.1);
            player.gold = Math.max(0, player.gold - goldLost);
            player.hp = 0;
            player.lastAdventure = now;

            battleMsg += `💀 **DERROTA...**
💸 Perdiste ${goldLost} oro
🏥 Necesitas curarte antes de continuar`;

          } else {
            // Empate
            player.hp = battle.player.hp;
            player.lastAdventure = now;
            
            battleMsg += `⚖️ **EMPATE**
⏰ El combate fue muy reñido`;
          }

          updateUserProfile(userId, player);
          await bot.sendMessage(chatId, battleMsg, { parse_mode: 'Markdown' });
          break;

        case 'curar':
        case 'heal':
        case 'descansar':
          if (player.hp >= player.maxHp && player.mp >= player.maxMp) {
            return bot.sendMessage(chatId, `😊 Ya tienes la salud y maná al máximo.`);
          }

          const healCost = Math.floor(player.maxHp * 0.3);
          
          if (player.gold < healCost) {
            return bot.sendMessage(chatId, `💸 Necesitas ${healCost} oro para curarte. Tienes ${player.gold} oro.`);
          }

          player.hp = player.maxHp;
          player.mp = player.maxMp;
          player.gold -= healCost;
          player.stats.timesHealed++;

          updateUserProfile(userId, player);
          
          await bot.sendMessage(chatId, `🏥 **CURACIÓN COMPLETA**

❤️ HP restaurado: ${player.maxHp}/${player.maxHp}
💙 MP restaurado: ${player.maxMp}/${player.maxMp}
💰 Costo: ${healCost} oro
💵 Oro restante: ${player.gold}

> ¡Listo para nuevas aventuras!`, { parse_mode: 'Markdown' });
          break;

        case 'inventario':
        case 'inventory':
        case 'items':
          let inventoryMsg = `🎒 **INVENTARIO DE ${player.name.toUpperCase()}**\n\n`;
          
          const items = Object.entries(player.inventory);
          if (items.length === 0) {
            inventoryMsg += `📦 Tu inventario está vacío.`;
          } else {
            items.forEach(([item, quantity]) => {
              inventoryMsg += `▫️ ${item}: ${quantity}\n`;
            });
          }

          inventoryMsg += `\n💰 **Oro:** ${player.gold}`;
          inventoryMsg += `\n\n> Usa */rpg usar [item]* para consumir items`;

          await bot.sendMessage(chatId, inventoryMsg, { parse_mode: 'Markdown' });
          break;

        case 'tienda':
        case 'shop':
        case 'store':
          let shopMsg = `🏪 **TIENDA MAYРPG** 🏪

💰 Tu oro: **${player.gold}**

⚔️ **ARMAS:**
`;
          Object.entries(ITEMS.weapons).forEach(([weapon, stats]) => {
            if (stats.price > 0) {
              shopMsg += `▫️ ${weapon} - ${stats.price} oro (+${stats.attack} ATK)\n`;
            }
          });

          shopMsg += `\n🛡️ **ARMADURAS:**
`;
          Object.entries(ITEMS.armors).forEach(([armor, stats]) => {
            if (stats.price > 0) {
              shopMsg += `▫️ ${armor} - ${stats.price} oro (+${stats.defense} DEF)\n`;
            }
          });

          shopMsg += `\n🧪 **CONSUMIBLES:**
`;
          Object.entries(ITEMS.consumables).forEach(([item, stats]) => {
            const effects = [];
            if (stats.hp) effects.push(`+${stats.hp} HP`);
            if (stats.mp) effects.push(`+${stats.mp} MP`);
            shopMsg += `▫️ ${item} - ${stats.price} oro (${effects.join(', ')})\n`;
          });

          shopMsg += `\n> Usa */rpg comprar [item]* para comprar`;

          await bot.sendMessage(chatId, shopMsg, { parse_mode: 'Markdown' });
          break;

        case 'help':
        case 'comandos':
        case 'ayuda':
          const helpMsg = `🎮 **MAYРPG - COMANDOS** 🎮

📊 **Información:**
▫️ */rpg* - Ver tu perfil
▫️ */rpg inventario* - Ver items
▫️ */rpg tienda* - Ver tienda

⚔️ **Acciones:**
▫️ */rpg aventura* - Ir de aventura
▫️ */rpg curar* - Restaurar HP/MP
▫️ */rpg usar [item]* - Usar item
▫️ */rpg comprar [item]* - Comprar item
▫️ */rpg equipar [item]* - Equipar arma/armadura

🏆 **Otros:**
▫️ */rpg ranking* - Ver ranking
▫️ */rpg reset* - Reiniciar perfil

> 💖 MayRPG creado por SoyMaycol`;

          await bot.sendMessage(chatId, helpMsg, { parse_mode: 'Markdown' });
          break;

        default:
          // Verificar si es un comando específico con parámetros
          if (action.startsWith('usar ') || action.startsWith('use ')) {
            const itemName = action.substring(action.indexOf(' ') + 1);
            
            if (!player.inventory[itemName] || player.inventory[itemName] <= 0) {
              return bot.sendMessage(chatId, `❌ No tienes "${itemName}" en tu inventario.`);
            }

            const item = ITEMS.consumables[itemName];
            if (!item) {
              return bot.sendMessage(chatId, `❌ "${itemName}" no es un item consumible.`);
            }

            let used = false;
            let effectMsg = '';

            if (item.hp && player.hp < player.maxHp) {
              const hpRestored = Math.min(item.hp, player.maxHp - player.hp);
              player.hp += hpRestored;
              effectMsg += `❤️ +${hpRestored} HP `;
              used = true;
            }

            if (item.mp && player.mp < player.maxMp) {
              const mpRestored = Math.min(item.mp, player.maxMp - player.mp);
              player.mp += mpRestored;
              effectMsg += `💙 +${mpRestored} MP `;
              used = true;
            }

            if (!used) {
              return bot.sendMessage(chatId, `😊 Ya tienes la salud y maná al máximo.`);
            }

            player.inventory[itemName]--;
            if (player.inventory[itemName] <= 0) {
              delete player.inventory[itemName];
            }

            updateUserProfile(userId, player);
            
            await bot.sendMessage(chatId, `✨ **ITEM USADO**

🧪 Usaste: ${itemName}
${effectMsg}

❤️ HP: ${player.hp}/${player.maxHp}
💙 MP: ${player.mp}/${player.maxMp}`, { parse_mode: 'Markdown' });

          } else if (action.startsWith('comprar ') || action.startsWith('buy ')) {
            const itemName = action.substring(action.indexOf(' ') + 1);
            
            // Buscar item en todas las categorías
            let item = null;
            let category = null;
            
            if (ITEMS.weapons[itemName]) {
              item = ITEMS.weapons[itemName];
              category = 'weapon';
            } else if (ITEMS.armors[itemName]) {
              item = ITEMS.armors[itemName];
              category = 'armor';
            } else if (ITEMS.consumables[itemName]) {
              item = ITEMS.consumables[itemName];
              category = 'consumable';
            }

            if (!item) {
              return bot.sendMessage(chatId, `❌ "${itemName}" no está disponible en la tienda.`);
            }

            if (player.gold < item.price) {
              return bot.sendMessage(chatId, `💸 No tienes suficiente oro. Necesitas ${item.price} oro, tienes ${player.gold}.`);
            }

            player.gold -= item.price;

            if (category === 'consumable') {
              if (!player.inventory[itemName]) player.inventory[itemName] = 0;
              player.inventory[itemName]++;
            } else if (category === 'weapon') {
              player.equipment.weapon = itemName;
            } else if (category === 'armor') {
              player.equipment.armor = itemName;
            }

            updateUserProfile(userId, player);

            let purchaseMsg = `🛒 **COMPRA REALIZADA**

🎁 Compraste: ${itemName}
💰 Costo: ${item.price} oro
💵 Oro restante: ${player.gold}`;

            if (category === 'weapon') {
              purchaseMsg += `\n⚔️ ¡Arma equipada automáticamente! (+${item.attack} ATK)`;
            } else if (category === 'armor') {
              purchaseMsg += `\n🛡️ ¡Armadura equipada automáticamente! (+${item.defense} DEF)`;
            }

            await bot.sendMessage(chatId, purchaseMsg, { parse_mode: 'Markdown' });

          } else {
            await bot.sendMessage(chatId, `❓ Comando no reconocido. Usa */rpg help* para ver todos los comandos disponibles.`, { parse_mode: 'Markdown' });
          }
          break;
      }

    } catch (error) {
      console.error('Error en MayRPG:', error);
      await bot.sendMessage(chatId, `❌ Ocurrió un error en el RPG. Por favor intenta de nuevo.`);
    }
  });
};