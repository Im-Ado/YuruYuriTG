const fs = require('fs');
const path = require('path');

// Ruta del archivo de base de datos
const DB_PATH = path.join(__dirname, '..', 'database.json');

// Clases disponibles
const CLASSES = {
  warrior: {
    name: '⚔️ Guerrero',
    baseHp: 120,
    baseAttack: 25,
    baseDefense: 20,
    baseMana: 30,
    skills: ['Golpe Fuerte', 'Defensa Férrea', 'Grito de Guerra']
  },
  mage: {
    name: '🔮 Mago',
    baseHp: 80,
    baseAttack: 35,
    baseDefense: 10,
    baseMana: 100,
    skills: ['Bola de Fuego', 'Escudo Mágico', 'Rayo']
  },
  archer: {
    name: '🏹 Arquero',
    baseHp: 100,
    baseAttack: 30,
    baseDefense: 15,
    baseMana: 50,
    skills: ['Disparo Certero', 'Lluvia de Flechas', 'Sigilo']
  },
  paladin: {
    name: '✨ Paladín',
    baseHp: 110,
    baseAttack: 20,
    baseDefense: 25,
    baseMana: 60,
    skills: ['Curación', 'Luz Divina', 'Protección']
  }
};

// Enemigos por nivel
const ENEMIES = {
  1: [
    { name: '🐭 Rata', hp: 20, attack: 8, defense: 2, exp: 10, gold: 5 },
    { name: '🕷️ Araña', hp: 25, attack: 10, defense: 3, exp: 12, gold: 7 }
  ],
  2: [
    { name: '🐺 Lobo', hp: 40, attack: 15, defense: 5, exp: 20, gold: 12 },
    { name: '👹 Goblin', hp: 35, attack: 18, defense: 4, exp: 25, gold: 15 }
  ],
  3: [
    { name: '🐻 Oso', hp: 60, attack: 22, defense: 8, exp: 35, gold: 25 },
    { name: '🧟 Zombie', hp: 50, attack: 20, defense: 6, exp: 30, gold: 20 }
  ],
  4: [
    { name: '🐲 Dragoncillo', hp: 80, attack: 30, defense: 12, exp: 50, gold: 40 },
    { name: '👤 Asesino', hp: 70, attack: 35, defense: 8, exp: 45, gold: 35 }
  ],
  5: [
    { name: '🐉 Dragón', hp: 120, attack: 45, defense: 20, exp: 100, gold: 80 },
    { name: '👹 Demonio', hp: 100, attack: 40, defense: 15, exp: 90, gold: 70 }
  ]
};

// Items disponibles
const ITEMS = {
  weapons: {
    'espada_madera': { name: '🗡️ Espada de Madera', attack: 5, price: 50 },
    'espada_hierro': { name: '⚔️ Espada de Hierro', attack: 15, price: 200 },
    'baston_magico': { name: '🪄 Bastón Mágico', attack: 20, mana: 10, price: 300 },
    'arco_elfico': { name: '🏹 Arco Élfico', attack: 18, price: 250 },
    'martillo_sagrado': { name: '🔨 Martillo Sagrado', attack: 25, defense: 5, price: 400 }
  },
  armor: {
    'armadura_cuero': { name: '🛡️ Armadura de Cuero', defense: 8, price: 80 },
    'armadura_hierro': { name: '🛡️ Armadura de Hierro', defense: 15, price: 300 },
    'tunica_magica': { name: '👘 Túnica Mágica', defense: 10, mana: 20, price: 250 },
    'armadura_sagrada': { name: '✨ Armadura Sagrada', defense: 20, hp: 30, price: 500 }
  },
  consumables: {
    'pocion_vida': { name: '❤️ Poción de Vida', heal: 50, price: 30 },
    'pocion_mana': { name: '💙 Poción de Maná', mana: 30, price: 25 },
    'elixir_fuerza': { name: '💪 Elixir de Fuerza', attack: 10, duration: 3, price: 100 }
  }
};

// Función para cargar la base de datos
function loadDatabase() {
  try {
    if (fs.existsSync(DB_PATH)) {
      const data = fs.readFileSync(DB_PATH, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error al cargar la base de datos:', error);
  }
  return { rpg: {} };
}

// Función para guardar la base de datos
function saveDatabase(db) {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
  } catch (error) {
    console.error('Error al guardar la base de datos:', error);
  }
}

// Función para obtener o crear un jugador
function getPlayer(userId) {
  const db = loadDatabase();
  if (!db.rpg[userId]) {
    db.rpg[userId] = {
      name: null,
      class: null,
      level: 1,
      exp: 0,
      expToNext: 100,
      hp: 100,
      maxHp: 100,
      mana: 50,
      maxMana: 50,
      attack: 10,
      defense: 5,
      gold: 100,
      inventory: {
        weapons: {},
        armor: {},
        consumables: { 'pocion_vida': 3 }
      },
      equipment: {
        weapon: null,
        armor: null,
        accessory: null
      },
      location: 'town',
      inBattle: false,
      battleData: null,
      questsCompleted: 0,
      achievements: [],
      lastDaily: null,
      stats: {
        battlesWon: 0,
        enemiesKilled: 0,
        goldEarned: 0,
        itemsBought: 0
      }
    };
  }
  return db.rpg[userId];
}

// Función para guardar jugador
function savePlayer(userId, playerData) {
  const db = loadDatabase();
  db.rpg[userId] = playerData;
  saveDatabase(db);
}

// Función para subir de nivel
function levelUp(player) {
  if (player.exp >= player.expToNext) {
    player.level++;
    player.exp -= player.expToNext;
    
    // Aumentar stats base
    const hpIncrease = Math.floor(Math.random() * 20) + 15;
    const manaIncrease = Math.floor(Math.random() * 15) + 10;
    const attackIncrease = Math.floor(Math.random() * 8) + 5;
    const defenseIncrease = Math.floor(Math.random() * 6) + 3;
    
    player.maxHp += hpIncrease;
    player.hp = player.maxHp; // Curar al subir de nivel
    player.maxMana += manaIncrease;
    player.mana = player.maxMana;
    player.attack += attackIncrease;
    player.defense += defenseIncrease;
    
    player.expToNext = Math.floor(player.expToNext * 1.5);
    
    return {
      leveledUp: true,
      newLevel: player.level,
      increases: { hp: hpIncrease, mana: manaIncrease, attack: attackIncrease, defense: defenseIncrease }
    };
  }
  return { leveledUp: false };
}

// Función para obtener enemigo aleatorio
function getRandomEnemy(playerLevel) {
  const enemyLevel = Math.max(1, Math.min(5, playerLevel + Math.floor(Math.random() * 3) - 1));
  const enemies = ENEMIES[enemyLevel];
  const baseEnemy = enemies[Math.floor(Math.random() * enemies.length)];
  
  // Crear copia y ajustar stats según nivel del jugador
  const enemy = { ...baseEnemy };
  if (playerLevel > enemyLevel) {
    const multiplier = 1 + (playerLevel - enemyLevel) * 0.2;
    enemy.hp = Math.floor(enemy.hp * multiplier);
    enemy.attack = Math.floor(enemy.attack * multiplier);
    enemy.defense = Math.floor(enemy.defense * multiplier);
    enemy.exp = Math.floor(enemy.exp * multiplier);
    enemy.gold = Math.floor(enemy.gold * multiplier);
  }
  
  enemy.maxHp = enemy.hp;
  return enemy;
}

// Función de combate
function calculateDamage(attacker, defender) {
  const baseDamage = attacker.attack;
  const defense = defender.defense;
  const randomFactor = 0.8 + Math.random() * 0.4; // 80% - 120%
  
  const damage = Math.max(1, Math.floor((baseDamage - defense * 0.5) * randomFactor));
  return damage;
}

module.exports = (bot) => {
  // Comando principal /rpg
  bot.onText(/^\/rpg(?:\s+(.+))?$/, async (msg, match) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    const userName = msg.from.first_name || 'Aventurero';
    const action = match[1] ? match[1].toLowerCase().trim() : 'perfil';

    const player = getPlayer(userId);

    try {
      switch (action) {
        case 'crear':
        case 'empezar':
        case 'start':
          if (player.name) {
            return bot.sendMessage(chatId, `❌ Ya tienes un personaje creado: *${player.name}*\n\nUsa /rpg perfil para ver tus stats.`, { parse_mode: 'Markdown' });
          }

          return bot.sendMessage(chatId, `🎮 *¡Bienvenido a MayRPG!* ⚔️

¡Hola *${userName}*! Es hora de crear tu aventurero.

🔮 *Clases disponibles:*
⚔️ **Guerrero** - Tanque resistente con alta defensa
🔮 **Mago** - Maestro de la magia con alto daño
🏹 **Arquero** - Atacante ágil y certero
✨ **Paladín** - Híbrido que puede curar y atacar

Para elegir tu clase, usa:
/rpg clase warrior (o mage, archer, paladin)

> 💖 *Creado con amor por SoyMaycol*`, { parse_mode: 'Markdown' });

        case 'clase':
          const args = match[1].split(' ');
          if (args.length < 2) {
            return bot.sendMessage(chatId, `❌ Especifica una clase: warrior, mage, archer, paladin\n\nEjemplo: /rpg clase warrior`, { parse_mode: 'Markdown' });
          }

          const selectedClass = args[1].toLowerCase();
          if (!CLASSES[selectedClass]) {
            return bot.sendMessage(chatId, `❌ Clase no válida. Usa: warrior, mage, archer, paladin`);
          }

          if (player.name) {
            return bot.sendMessage(chatId, `❌ Ya tienes un personaje creado. No puedes cambiar de clase.`);
          }

          const classData = CLASSES[selectedClass];
          player.name = userName;
          player.class = selectedClass;
          player.hp = classData.baseHp;
          player.maxHp = classData.baseHp;
          player.mana = classData.baseMana;
          player.maxMana = classData.baseMana;
          player.attack = classData.baseAttack;
          player.defense = classData.baseDefense;

          savePlayer(userId, player);

          return bot.sendMessage(chatId, `✅ *¡Personaje creado exitosamente!*

👤 **Nombre:** ${player.name}
${classData.name}

📊 **Stats iniciales:**
❤️ HP: ${player.hp}/${player.maxHp}
💙 Maná: ${player.mana}/${player.maxMana}
⚔️ Ataque: ${player.attack}
🛡️ Defensa: ${player.defense}
💰 Oro: ${player.gold}

🎯 **Habilidades:** ${classData.skills.join(', ')}

¡Usa /rpg aventura para comenzar a explorar!

> 🌟 *¡Tu aventura comienza ahora!*`, { parse_mode: 'Markdown' });

        case 'perfil':
        case 'stats':
        case 'estado':
          if (!player.name) {
            return bot.sendMessage(chatId, `❌ Primero crea tu personaje con /rpg crear`);
          }

          const classInfo = CLASSES[player.class];
          let equipmentText = '';
          
          if (player.equipment.weapon) {
            const weapon = ITEMS.weapons[player.equipment.weapon];
            equipmentText += `⚔️ ${weapon.name}\n`;
          }
          if (player.equipment.armor) {
            const armor = ITEMS.armor[player.equipment.armor];
            equipmentText += `🛡️ ${armor.name}\n`;
          }

          return bot.sendMessage(chatId, `👤 **PERFIL DE ${player.name.toUpperCase()}**
━━━━━━━━━━━━━━━━━━━━━

${classInfo.name} • Nivel ${player.level}

📊 **ESTADÍSTICAS:**
❤️ HP: ${player.hp}/${player.maxHp}
💙 Maná: ${player.mana}/${player.maxMana}
⚔️ Ataque: ${player.attack}
🛡️ Defensa: ${player.defense}
✨ EXP: ${player.exp}/${player.expToNext}

💰 **Oro:** ${player.gold}
📍 **Ubicación:** ${player.location === 'town' ? '🏘️ Pueblo' : '🌲 Aventura'}

${equipmentText ? `🎒 **EQUIPAMIENTO:**\n${equipmentText}` : ''}

🏆 **LOGROS:**
⚔️ Batallas ganadas: ${player.stats.battlesWon}
👹 Enemigos derrotados: ${player.stats.enemiesKilled}
💰 Oro ganado: ${player.stats.goldEarned}

> 💖 *MayRPG - Aventuras épicas te esperan*`, { parse_mode: 'Markdown' });

        case 'aventura':
        case 'explorar':
          if (!player.name) {
            return bot.sendMessage(chatId, `❌ Primero crea tu personaje con /rpg crear`);
          }

          if (player.inBattle) {
            return bot.sendMessage(chatId, `⚔️ ¡Ya estás en batalla! Usa /rpg atacar, /rpg huir o /rpg habilidad`);
          }

          if (player.hp <= 0) {
            return bot.sendMessage(chatId, `💀 Estás derrotado. Usa /rpg curar para recuperarte (cuesta 50 oro)`);
          }

          const enemy = getRandomEnemy(player.level);
          player.inBattle = true;
          player.battleData = enemy;
          player.location = 'battle';

          savePlayer(userId, player);

          return bot.sendMessage(chatId, `🌲 *Explorando el bosque...*

⚔️ **¡ENEMIGO ENCONTRADO!**

${enemy.name}
❤️ HP: ${enemy.hp}/${enemy.maxHp}
⚔️ Ataque: ${enemy.attack}
🛡️ Defensa: ${enemy.defense}

💰 **Recompensas:** ${enemy.gold} oro, ${enemy.exp} EXP

**¿Qué harás?**
/rpg atacar - Atacar al enemigo
/rpg habilidad - Usar habilidad especial
/rpg huir - Huir del combate (50% probabilidad)

> ⚔️ *¡La batalla comienza!*`, { parse_mode: 'Markdown' });

        case 'atacar':
        case 'attack':
          if (!player.inBattle || !player.battleData) {
            return bot.sendMessage(chatId, `❌ No estás en combate. Usa /rpg aventura para encontrar enemigos.`);
          }

          const enemy = player.battleData;
          
          // Turno del jugador
          const playerDamage = calculateDamage(player, enemy);
          enemy.hp -= playerDamage;

          let battleResult = `⚔️ **COMBATE**

Tu ataque: -${playerDamage} HP
${enemy.name}: ${Math.max(0, enemy.hp)}/${enemy.maxHp} HP\n`;

          // Verificar si el enemigo murió
          if (enemy.hp <= 0) {
            player.exp += enemy.exp;
            player.gold += enemy.gold;
            player.stats.battlesWon++;
            player.stats.enemiesKilled++;
            player.stats.goldEarned += enemy.gold;
            
            // Reset battle
            player.inBattle = false;
            player.battleData = null;
            player.location = 'town';

            const levelUpResult = levelUp(player);
            
            battleResult += `\n🏆 **¡VICTORIA!**
+${enemy.exp} EXP
+${enemy.gold} oro

`;

            if (levelUpResult.leveledUp) {
              battleResult += `🎉 **¡SUBISTE DE NIVEL!**
Nivel ${levelUpResult.newLevel}
+${levelUpResult.increases.hp} HP máximo
+${levelUpResult.increases.mana} Maná máximo
+${levelUpResult.increases.attack} Ataque
+${levelUpResult.increases.defense} Defensa

❤️ ¡HP y Maná restaurados!

`;
            }

            savePlayer(userId, player);
            return bot.sendMessage(chatId, battleResult + `> 🌟 *¡Usa /rpg aventura para más batallas!*`, { parse_mode: 'Markdown' });
          }

          // Turno del enemigo
          const enemyDamage = calculateDamage(enemy, player);
          player.hp -= enemyDamage;

          battleResult += `${enemy.name} ataca: -${enemyDamage} HP
Tu HP: ${Math.max(0, player.hp)}/${player.maxHp}\n`;

          // Verificar si el jugador murió
          if (player.hp <= 0) {
            player.hp = 0;
            player.inBattle = false;
            player.battleData = null;
            player.location = 'town';
            
            savePlayer(userId, player);
            return bot.sendMessage(chatId, battleResult + `\n💀 **¡HAS SIDO DERROTADO!**

Usa /rpg curar para recuperarte (50 oro)
O espera 1 hora para curación gratuita.

> 💔 *¡No te rindas, aventurero!*`, { parse_mode: 'Markdown' });
          }

          savePlayer(userId, player);
          return bot.sendMessage(chatId, battleResult + `\n**¿Qué harás ahora?**
/rpg atacar - Continuar atacando
/rpg habilidad - Usar habilidad
/rpg huir - Intentar huir`, { parse_mode: 'Markdown' });

        case 'huir':
        case 'escape':
          if (!player.inBattle) {
            return bot.sendMessage(chatId, `❌ No estás en combate.`);
          }

          const escapeChance = Math.random();
          if (escapeChance > 0.5) {
            player.inBattle = false;
            player.battleData = null;
            player.location = 'town';
            savePlayer(userId, player);
            
            return bot.sendMessage(chatId, `🏃‍♂️ **¡Escapaste exitosamente!**

Has vuelto al pueblo sano y salvo.
Usa /rpg aventura cuando estés listo para más combate.

> 🛡️ *Vivir para luchar otro día*`, { parse_mode: 'Markdown' });
          } else {
            // Falló el escape, el enemigo ataca
            const enemy = player.battleData;
            const damage = calculateDamage(enemy, player);
            player.hp -= damage;

            if (player.hp <= 0) {
              player.hp = 0;
              player.inBattle = false;
              player.battleData = null;
              player.location = 'town';
            }

            savePlayer(userId, player);
            
            return bot.sendMessage(chatId, `❌ **¡No pudiste escapar!**

${enemy.name} te alcanza y ataca: -${damage} HP
Tu HP: ${Math.max(0, player.hp)}/${player.maxHp}

${player.hp <= 0 ? 
              '💀 Has sido derrotado. Usa /rpg curar para recuperarte.' : 
              '⚔️ ¡Sigue luchando! /rpg atacar'
            }`, { parse_mode: 'Markdown' });
          }

        case 'curar':
        case 'heal':
          if (player.hp >= player.maxHp) {
            return bot.sendMessage(chatId, `❤️ Ya tienes la vida completa (${player.hp}/${player.maxHp})`);
          }

          if (player.gold < 50) {
            return bot.sendMessage(chatId, `💰 No tienes suficiente oro para curarte (necesitas 50, tienes ${player.gold})`);
          }

          player.gold -= 50;
          player.hp = player.maxHp;
          player.mana = player.maxMana;
          
          savePlayer(userId, player);
          
          return bot.sendMessage(chatId, `✨ **¡Te has curado completamente!**

❤️ HP: ${player.hp}/${player.maxHp}
💙 Maná: ${player.mana}/${player.maxMana}
💰 Oro restante: ${player.gold}

> 🌟 *¡Listo para la aventura!*`, { parse_mode: 'Markdown' });

        case 'tienda':
        case 'shop':
          return bot.sendMessage(chatId, `🏪 **TIENDA DE AVENTUREROS**
━━━━━━━━━━━━━━━━━━━━━

💰 *Tu oro: ${player.gold}*

**🗡️ ARMAS:**
• Espada de Madera - 50 oro (+5 ATK)
• Espada de Hierro - 200 oro (+15 ATK)
• Bastón Mágico - 300 oro (+20 ATK, +10 MANA)
• Arco Élfico - 250 oro (+18 ATK)

**🛡️ ARMADURAS:**
• Armadura de Cuero - 80 oro (+8 DEF)
• Armadura de Hierro - 300 oro (+15 DEF)
• Túnica Mágica - 250 oro (+10 DEF, +20 MANA)

**💊 CONSUMIBLES:**
• Poción de Vida - 30 oro (+50 HP)
• Poción de Maná - 25 oro (+30 MANA)

Para comprar: /rpg comprar [item]
Ejemplo: /rpg comprar espada_hierro

> 🛒 *¡Equípate para la aventura!*`, { parse_mode: 'Markdown' });

        case 'inventario':
        case 'inv':
          let invText = `🎒 **INVENTARIO**
━━━━━━━━━━━━━━━━━━━━━

💰 *Oro: ${player.gold}*\n`;

          const inv = player.inventory;
          let hasItems = false;

          if (Object.keys(inv.weapons).length > 0) {
            invText += '\n🗡️ **ARMAS:**\n';
            for (const [key, qty] of Object.entries(inv.weapons)) {
              const item = ITEMS.weapons[key];
              invText += `• ${item.name} x${qty}\n`;
              hasItems = true;
            }
          }

          if (Object.keys(inv.armor).length > 0) {
            invText += '\n🛡️ **ARMADURAS:**\n';
            for (const [key, qty] of Object.entries(inv.armor)) {
              const item = ITEMS.armor[key];
              invText += `• ${item.name} x${qty}\n`;
              hasItems = true;
            }
          }

          if (Object.keys(inv.consumables).length > 0) {
            invText += '\n💊 **CONSUMIBLES:**\n';
            for (const [key, qty] of Object.entries(inv.consumables)) {
              const item = ITEMS.consumables[key];
              invText += `• ${item.name} x${qty}\n`;
              hasItems = true;
            }
          }

          if (!hasItems) {
            invText += '\n📦 *Tu inventario está vacío*\n¡Visita /rpg tienda para comprar items!';
          }

          invText += '\n\nPara usar items: /rpg usar [item]';

          return bot.sendMessage(chatId, invText, { parse_mode: 'Markdown' });

        case 'ayuda':
        case 'help':
        case 'comandos':
          return bot.sendMessage(chatId, `📋 **COMANDOS DE MAYRPG**
━━━━━━━━━━━━━━━━━━━━━

🎮 **BÁSICOS:**
/rpg crear - Crear personaje
/rpg perfil - Ver estadísticas
/rpg aventura - Explorar y combatir

⚔️ **COMBATE:**
/rpg atacar - Atacar enemigo
/rpg huir - Huir del combate
/rpg habilidad - Usar habilidad

🏪 **TIENDA E ITEMS:**
/rpg tienda - Ver tienda
/rpg inventario - Ver inventario
/rpg comprar [item] - Comprar item
/rpg usar [item] - Usar item

❤️ **OTROS:**
/rpg curar - Curarse (50 oro)
/rpg ayuda - Ver esta ayuda

> 💖 *MayRPG - ¡Tu aventura épica!*`, { parse_mode: 'Markdown' });

        default:
          if (action.startsWith('comprar ')) {
            const itemName = action.substring(8).trim();
            // Lógica de compra aquí
            return bot.sendMessage(chatId, `🛒 Sistema de compras en desarrollo...`);
          }
          
          return bot.sendMessage(chatId, `❓ Acción no reconocida: "${action}"\n\nUsa /rpg ayuda para ver todos los comandos disponibles.`);
      }
    } catch (error) {
      console.error('Error en MayRPG:', error);
      return bot.sendMessage(chatId, `❌ Error interno del juego. Inténtalo de nuevo.`);
    }
  });
};
