#!/usr/bin/env node

import inquirer from "inquirer";
import chalk from "chalk";
import figlet from "figlet";

// 🎨 ASCII Art
const dragonArt = chalk.red(`
        ,     \\    /      ,        
       / \\    )\\__/(     / \\       
      /   \\  (_\\  /_)   /   \\      
 ____/____\\__\\@  @/___/_____\\____ 
|             |\\../|              |
|              \\VV/               |
|       🐉   🐉 🐉   🐉      |
|_________________________________|
 |    |  |  |  |  |  |  |  |  |  |
 |    |  |  |  |  |  |  |  |  |  |
 |    |  |  |  |  |  |  |  |  |  |
`);

const playerArt = chalk.green(`
  O  
 /|\\ 
 / \\ 
`);

const goblinArt = chalk.magenta(`
  ,      ,
 /(.-""-.)\\
 |  |   |  |
 |  |   |  |
  \\ |   | /
   \\|___|/
`);

const orcArt = chalk.yellow(`
   ,--./,-.
  / #      \\
 |          |
  \\        /
   \`._,._,'
`);

// 🎮 Game Variables
const player = { health: 100, attack: 10, x: 0, y: 0 };
let enemies = [];
const maxRooms = 5;
let currentRoom = 1;
const mapSize = 5;

// 🎭 Dungeon Map
let map = Array(mapSize).fill(null).map(() => Array(mapSize).fill("⬛"));

// 📌 Enemy Positions
let enemyPositions = [];

// 📌 Set Random Enemy Locations on Map
function placeEnemies() {
    enemyPositions = [];
    for (let i = 0; i < maxRooms; i++) {
        let x, y;
        do {
            x = Math.floor(Math.random() * mapSize);
            y = Math.floor(Math.random() * mapSize);
        } while (map[x][y] !== "⬛");

        enemyPositions.push({ x, y, enemy: generateEnemies()[Math.floor(Math.random() * 3)] });
        map[x][y] = "👾"; // Mark enemy
    }
}

// 🎲 Generate Random Enemies
function generateEnemies() {
    return [
        { name: "Goblin", health: 20, attack: 5, art: goblinArt },
        { name: "Orc", health: 35, attack: 7, art: orcArt },
        { name: "Dragon", health: 50, attack: 12, art: dragonArt }
    ];
}

// 📌 Generate Dungeon
function generateDungeon() {
    enemies = Array.from({ length: maxRooms }, () => {
        return generateEnemies()[Math.floor(Math.random() * 3)];
    });

    // Reset map and place enemies
    map = Array(mapSize).fill(null).map(() => Array(mapSize).fill("⬛"));
    placeEnemies();
}

// 🔥 Display Title
function displayTitle() {
    console.clear();
    console.log(chalk.cyan(figlet.textSync("RogueMaze")));
}

// ⚔️ Battle System
async function battle(enemy) {
    console.log(chalk.red(`\nA ${enemy.name} appears!`));
    console.log(enemy.art);

    while (player.health > 0 && enemy.health > 0) {
        console.log(chalk.green(`\nYour Health: ${player.health}`));
        console.log(chalk.red(`${enemy.name} Health: ${enemy.health}`));

        const action = await inquirer.prompt([
            {
                type: "list",
                name: "choice",
                message: "Choose your action:",
                choices: ["Attack", "Defend", "Heal"]
            }
        ]);

        if (action.choice === "Attack") {
            enemy.health -= player.attack;
            console.log(chalk.green(`You hit the ${enemy.name} for ${player.attack} damage!`));
        } else if (action.choice === "Defend") {
            console.log(chalk.yellow("You block the enemy's attack!"));
            continue;
        } else if (action.choice === "Heal") {
            player.health = Math.min(100, player.health + 20);
            console.log(chalk.blue("You heal 20 HP!"));
        }

        if (enemy.health > 0) {
            player.health -= enemy.attack;
            console.log(chalk.red(`The ${enemy.name} attacks for ${enemy.attack} damage!`));
        }
    }

    if (player.health <= 0) {
        console.log(chalk.bgRed.white("\nYou Died! Game Over!\n"));
        process.exit();
    } else {
        console.log(chalk.green(`\nYou defeated the ${enemy.name}!\n`));
    }
}

// 🗺️ Display Map
function displayMap() {
    console.clear();
    displayTitle();

    // Update Player Position
    map[player.x][player.y] = chalk.blue("🧙"); 

    console.log("\n" + map.map(row => row.join(" ")).join("\n") + "\n");

    map[player.x][player.y] = "⬛"; // Reset after printing
}

// 🏃 Movement System
async function movePlayer() {
    while (currentRoom <= maxRooms) {
        displayMap();
        const move = await inquirer.prompt([
            {
                type: "list",
                name: "direction",
                message: "Move in which direction?",
                choices: ["Up", "Down", "Left", "Right"]
            }
        ]);

        let newX = player.x;
        let newY = player.y;

        switch (move.direction) {
            case "Up": newX = Math.max(0, player.x - 1); break;
            case "Down": newX = Math.min(mapSize - 1, player.x + 1); break;
            case "Left": newY = Math.max(0, player.y - 1); break;
            case "Right": newY = Math.min(mapSize - 1, player.y + 1); break;
        }

        if (newX === player.x && newY === player.y) {
            console.log(chalk.yellow("\nYou cannot move further!\n"));
            continue;
        }

        player.x = newX;
        player.y = newY;

        // Check if there's an enemy at this position
        let enemyIndex = enemyPositions.findIndex(e => e.x === player.x && e.y === player.y);
        if (enemyIndex !== -1) {
            await battle(enemyPositions[enemyIndex].enemy);
            currentRoom++;
        }
    }

    console.log(chalk.green("\nCongratulations! You cleared the dungeon!\n"));
}

// 🎮 Start Game
async function playGame() {
    displayTitle();
    generateDungeon();
    console.log(chalk.magenta("\nWelcome to RogueMaze!\n"));
    await movePlayer();
}

// Start
playGame();
