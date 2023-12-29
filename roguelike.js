const GameData = [];
const Player = {
    HP: 10,
    maxHP: 10,
    attack: 1
};
const GameField = document.getElementsByClassName('field')[0];
var Enemies = [];
var playerCom = '';
var GameActive = true;

//CONFIG
const objectProps = [
    {
        //PLAYER
        tileClass: 'tileP',
        tileValue: 'P',
        amount: 1
    },
    {
        //ENEMY
        tileClass: 'tileE',
        tileValue: 'E',
        amount: 10
    },
    {
        //HPOTION
        tileClass: 'tileHP',
        tileValue: 'H',
        amount: 10
    },
    {
        //SWORD
        tileClass: 'tileSW',
        tileValue: 'S',
        amount: 2
    }
]

const FIELD_WIDTH = 39;
const FIELD_HEIGHT = 23;
const TILE_SIZE = 30;

//UTILITY FUNCTIONS
function getRandomInt(min, max) {
    return Math.round(Math.random() * (max - min)) + min;
}

function removeWall (x, y) {
    GameData[y][x] = "R";
    document.getElementById(`${x}-${y}`).classList.remove('tileW');
}

function removeUnit (x, y) {
    const prevTile = GameData[y][x].charAt(0);
    if (prevTile === "R" || prevTile === "W") return;
    GameData[y][x] = "R";
    const objectData = objectProps.find(x => x.tileValue === prevTile);
    const tile = document.getElementById(`${x}-${y}`);
    tile.classList.remove(objectData.tileClass);

    if (objectData.tileClass === 'tileE') {
        tile.removeAttribute('enemy-id')
    }

    if (tile.lastChild) {
        const HPBar = tile.lastChild;
        tile.removeChild(HPBar);
        return HPBar;
    }
}

function spawnUnit (x, y, type, id) {
    if (id) GameData[y][x] = type + '.' + id;
    else GameData[y][x] = type;
    const objectData = objectProps.find(x => x.tileValue === type);
    const tile = document.getElementById(`${x}-${y}`)
    tile.classList.add(objectData.tileClass);

    if (type === 'E' && id) {
        tile.setAttribute('enemy-id', id)
    }
    return tile;
}

function getCoordinates (type, index) {
    if (!index) index = 0;

    let indexes = [], i = -1;
    let arr = GameData.flat();

    while ((i = arr.indexOf(type, i + 1)) != -1){
        indexes.push(i)
    }

    return {
        x: indexes[index] % 40,
        y: Math.floor(indexes[index] / 40)
    }
}

function createHPBar (id, x, y) {
    const HPBar = document.createElement('div');
    HPBar.id = id?`HP_E.${id}` : 'HP_P';
    HPBar.classList.add('health')
    HPBar.style['width'] = `100%`;
    document.getElementById(`${x}-${y}`).appendChild(HPBar);
}

//Генераторы и отрисовка

function GenerateTiles () {
    for (let iy = 0; iy <= FIELD_HEIGHT; iy++) {
        GameData[iy] = [];
        for (let ix = 0; ix <= FIELD_WIDTH; ix ++) {
            GameData[iy][ix] = 'W';
            const tile = document.createElement('div');
            tile.id = `${ix}-${iy}`;
            tile.classList.add('tile');
            tile.classList.add('tileW');
            tile.style['left'] = `${30*ix}px`
            tile.style['top'] = `${30*iy}px`
            GameField.appendChild(tile);
        }
    }
}

function GenerateRooms () {
    let roomNumber = getRandomInt(5,10);
    let horizontalAllowed = [];
    let verticalAllowed = [];

    for (let i = 0; i <= roomNumber; i++) {
        let roomDimensions = {x: getRandomInt(3,8), y: getRandomInt(3,8)};
        let roomCoordinates = {x: getRandomInt(1, FIELD_WIDTH - roomDimensions.x - 1), y: getRandomInt(1, FIELD_HEIGHT - roomDimensions.y - 1)};

        for (let iy = 0; iy <= FIELD_HEIGHT; iy++){
            for (let ix = 0; ix <= FIELD_WIDTH; ix++){
                if (ix >= roomCoordinates.x && ix <= roomCoordinates.x + roomDimensions.x){
                    if (iy >= roomCoordinates.y && iy <= roomCoordinates.y + roomDimensions.y) {
                        removeWall(ix, iy);
                        if (!horizontalAllowed.find(e => e === iy)) horizontalAllowed.push(iy);
                        if (!verticalAllowed.find(e => e === ix)) verticalAllowed.push(ix);;
                    }
                }
            }
        }
    }

    return {
        horizontalAllowed: horizontalAllowed,
        verticalAllowed: verticalAllowed
    };
}

function GeneratePasses (horizontalAllowed, verticalAllowed) {
    let passesNumber = {horizontal: getRandomInt(3,5), vertical: getRandomInt(3,5)}
    let passessCoord = [];

    for (let i = 1; i <= passesNumber.vertical; i++) {
        let coordinate = getRandomInt(3, FIELD_WIDTH - 3);
        while (passessCoord.includes(coordinate) || passessCoord.includes(coordinate + 1) || passessCoord.includes(coordinate - 1) || !verticalAllowed.includes(coordinate)) {
            coordinate = getRandomInt(3, FIELD_WIDTH - 3);
        }
        passessCoord.push(coordinate);
        for (let iy = 0; iy <= FIELD_HEIGHT; iy++) {
            removeWall(coordinate, iy);
        }
    }
    passessCoord = [];
    for (let i = 1; i <= passesNumber.horizontal; i++) {
        let coordinate = getRandomInt(3, FIELD_HEIGHT - 3);
        while (passessCoord.includes(coordinate) || passessCoord.includes(coordinate + 1) || passessCoord.includes(coordinate - 1) || !horizontalAllowed.includes(coordinate)) {
            coordinate = getRandomInt(3, FIELD_HEIGHT - 3);
        }
        passessCoord.push(coordinate);
        for (let ix = 0; ix <= FIELD_WIDTH; ix++) {
            removeWall(ix, coordinate);
        }
    }
}

function PlaceGoods (objectProps) {
    objectProps.forEach(element => {
        for (let i = 1; i <= element.amount; i++) {
            let x = getRandomInt(0, FIELD_WIDTH);
            let y = getRandomInt(0, FIELD_HEIGHT);
            while (GameData[y][x] != 'R'){
                x = getRandomInt(0, FIELD_WIDTH);
                y = getRandomInt(0, FIELD_HEIGHT); 
            }
            const tile = document.getElementById(`${x}-${y}`)
            tile.classList.add(element.tileClass);

            if (element.tileValue === 'E') {
                Enemies.push({
                    maxHP: 6,
                    HP: 6,
                    id: i,
                    direction: undefined,
                    turns: 0,
                    attack: 1
                });
                tile.setAttribute('enemy-id', i);
            }

            if (element.tileValue === 'E' || element.tileValue === 'P') createHPBar(i, x, y);

            GameData[y][x] = element.tileValue === 'E'? element.tileValue + '.' + i : element.tileValue
        }
    });
}

//Перемещения
function Move (direction, unit) {
    let shift = {x: 0, y: 0}
    let coords = getCoordinates(unit);
    const id = unit.split('.')[1];
    const type = unit.split('.')[0];

    switch (direction) {
        case 'up': 
            shift.y = -1;
        break;
        case 'down':
            shift.y = 1;
        break;
        case 'left':
            shift.x = -1;
        break;
        case 'right':
            shift.x = 1;
        break;
    }
    let newCoords = {x: coords.x + shift.x, y: coords.y + shift.y};
    if ((newCoords.x > FIELD_WIDTH || newCoords.x <0) || (newCoords.y > FIELD_HEIGHT || newCoords.y < 0)) return false;
    if (GameData[newCoords.y][newCoords.x] === 'W' || GameData[newCoords.y][newCoords.x].charAt(0) === 'E' || GameData[newCoords.y][newCoords.x] === 'P') return false;
    if (GameData[newCoords.y][newCoords.x] === 'H' || GameData[newCoords.y][newCoords.x] === 'S') {
        if (type === 'P') {
            if (GameData[newCoords.y][newCoords.x] === 'S') ATTChange(1);
            if (GameData[newCoords.y][newCoords.x] === 'H') HPChange('P', 5);
            removeUnit(newCoords.x, newCoords.y)
        } else return false;
    }
    const HPBar = removeUnit(coords.x, coords.y);
    const NewTile = spawnUnit(newCoords.x, newCoords.y, type, id);
    NewTile.appendChild(HPBar);
    return true;
}

// Атака и изменение характеристик
function attack (initiator, damage) {
    const coordinates = getCoordinates(initiator);
    const targets = [];
    if (!damage) damage = 1;

    for (let iy = coordinates.y - 1; iy <= coordinates.y + 1; iy ++) {
        for (let ix = coordinates.x - 1; ix <= coordinates.x + 1; ix++) {
            if (ix > FIELD_WIDTH || iy > FIELD_HEIGHT) continue;
            if (ix < 0 || iy < 0) continue;
            const target = GameData[iy][ix];
            if (target.charAt(0) != 'E' && target.charAt(0) != 'P') continue;
            if (target === initiator) continue;
            if (initiator.charAt(0) === 'E' && target.charAt(0) === 'E') continue;
            targets.push(target);
        }
    }

    targets.forEach(target => HPChange(target, -damage));
    if (targets.includes('P')) return true;
    else return false;
}

function HPChange (target, amount) {
    if (!target) return;
    if (target.charAt(0) === 'E') id = target.split('.')[1];
    const object = target === 'P'? Player : Enemies.filter((enemy) => enemy.id === Number(id))[0];

    object.HP = object.HP + amount;
    if (object.HP > object.maxHP) object.HP = object.maxHP;

    const unit = getCoordinates(target);
    const HPBar = document.getElementById(`${unit.x}-${unit.y}`).firstChild;
    HPBar.style['width'] = `${object.HP / object.maxHP * 100}%`;

    if (object.HP <= 0) {
        if (target.charAt(0) === 'E') Enemies = Enemies.filter((enemy) => enemy.id != id);
        if (target === 'P') {
            const caption = document.getElementById('caption');
            caption.innerHTML = 'Игра окончена';
            caption.style['color'] = 'red';
            GameActive = false;
        }
        removeUnit(unit.x, unit.y);
    }
}

function ATTChange (amount) {
    Player.attack = Player.attack + amount;
}

// Главная петля
function gameLoop () {

    if (playerCom != ''){
        if (playerCom === 'atk') attack('P', Player.attack);
        else Move(playerCom, 'P');
        playerCom = '';
    }


    Enemies.forEach((enemy) => {
        const playerAround = attack(`E.${enemy.id}`);
        if (!playerAround) {
            if (enemy.direction && enemy.turns > 0) {
                const movementProgress = Move(enemy.direction, `E.${enemy.id}`);
                enemy.turns = enemy.turns - 1;
                if (!movementProgress) enemy.turns = 0;
            } else {
                enemy.turns = getRandomInt(1, 6);
                const direction = getRandomInt(1,4);
                switch (direction) {
                    case 1:
                        enemy.direction = 'up';
                    break;
                    case 2:
                        enemy.direction = 'down';
                    break;
                    case 3:
                        enemy.direction = 'left';
                    break;
                    case 4:
                        enemy.direction = 'right';
                    break;
                }
            }
        }
    });

    setTimeout(() => gameLoop(), 500);
}

//Регистрация взаимодействий
document.addEventListener('keydown', (e) => {
    switch (e.code) {
        case 'KeyW':
            playerCom = 'up';
        break;
        case 'KeyS':
            playerCom = 'down'
        break;
        case 'KeyD':
            playerCom = 'right';
        break;
        case 'KeyA':
            playerCom = 'left';
        break
        case 'Space':
            playerCom = 'atk';
        break;
    }
})

// Инициализация поля
GenerateTiles();
const roomsH = GenerateRooms();
GeneratePasses(roomsH.horizontalAllowed, roomsH.verticalAllowed);
PlaceGoods (objectProps);

//Запуск петли
gameLoop();