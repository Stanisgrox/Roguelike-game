const GameData = [];
const GameField = document.getElementsByClassName('field')[0];

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

//UTILITY FUNCTIONS
function getRandomInt(min, max) {
    return Math.round(Math.random() * (max - min)) + min;
}

function removeWall (x, y) {
    GameData[y][x] = "R";
    document.getElementById(`${x}-${y}`).classList.remove('tileW');
}

function removeUnit (x, y, typeClass) {
    GameData[y][x] = "R";
    document.getElementById(`${x}-${y}`).classList.remove(typeClass);
}

function spawnUnit (x, y, type) {
    GameData[y][x] = type;
    const objectData = objectProps.find(x => x.tileValue === type);
    document.getElementById(`${x}-${y}`).classList.add(objectData.tileClass);
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

//Генераторы и отрисовка

function GenerateTiles () {
    for (let iy = 0; iy <= 23; iy++) {
        GameData[iy] = [];
        for (let ix = 0; ix <= 39; ix ++) {
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

    for (let i = 0; i <= roomNumber; i++) {
        let roomDimensions = {x: getRandomInt(3,8), y: getRandomInt(3,8)}
        let roomCoordinates = {x: getRandomInt(0,36), y: getRandomInt(0,20)}
        for (let iy = 0; iy <= 23; iy++){
            for (let ix = 0; ix <= 39; ix++){
                if (ix >= roomCoordinates.x && ix <= roomCoordinates.x + roomDimensions.x){
                    if (iy >= roomCoordinates.y && iy <= roomCoordinates.y + roomDimensions.y) {
                        removeWall(ix, iy)
                    }
                }
            }
        }
    }
}

function GeneratePasses () {
    let passesNumber = {horizontal: getRandomInt(3,5), vertical: getRandomInt(3,5)}
    let passessCoord = [];

    for (let i = 1; i <= passesNumber.vertical; i++) {
        let coordinate = getRandomInt(1,38);
        while (passessCoord.includes(coordinate) || passessCoord.includes(coordinate + 1) || passessCoord.includes(coordinate - 1)) {
            coordinate = getRandomInt(1,38)
        }
        passessCoord.push(coordinate);
        for (let iy = 0; iy <= 23; iy++) {
            removeWall(coordinate, iy)
        }
    }
    passessCoord = [];
    for (let i = 1; i <= passesNumber.horizontal; i++) {
        let coordinate = getRandomInt(1,22);
        while (passessCoord.includes(coordinate) || passessCoord.includes(coordinate + 1) || passessCoord.includes(coordinate - 1)) {
            coordinate = getRandomInt(1,22)
        }
        passessCoord.push(coordinate);
        for (let ix = 0; ix <= 39; ix++) {
            removeWall(ix, coordinate)
        }
    }
}

function PlaceGoods (objectProps) {
    objectProps.forEach(element => {
        for (let i = 1; i <= element.amount; i++) {
            let x = getRandomInt(0, 39);
            let y = getRandomInt(0, 23);
            while (GameData[y][x] != 'R'){
                x = getRandomInt(0, 39);
                y = getRandomInt(0, 23); 
            }
            GameData[y][x] = element.tileValue;
            document.getElementById(`${x}-${y}`).classList.add(element.tileClass);
        }
    });
}

//Перемещения
function MovePlayer (direction) {
    let shift = {x: 0, y: 0}
    let coords = getCoordinates('P');
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
    if (GameData[newCoords.y][newCoords.x] === 'W' || GameData[newCoords.y][newCoords.x] === 'E') return;
    if (GameData[newCoords.y][newCoords.x] === 'H' || GameData[newCoords.y][newCoords.x] === 'S') {
        const objectData = objectProps.find(x => x.tileValue === GameData[newCoords.y][newCoords.x]);
        removeUnit(newCoords.x, newCoords.y, objectData.tileClass);
    }
    removeUnit(coords.x, coords.y, 'tileP');
    spawnUnit(newCoords.x, newCoords.y, 'P');
}

GenerateTiles();
GenerateRooms();
GeneratePasses();
PlaceGoods (objectProps);

document.addEventListener('keydown', (e) => {
    switch (e.key) {
        case 'w':
            MovePlayer('up');
        break;
        case 's':
            MovePlayer('down');
        break;
        case 'd':
            MovePlayer('right');
        break;
        case 'a':
            MovePlayer('left');
        break
    }
})