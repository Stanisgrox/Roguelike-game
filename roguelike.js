//UTILITY FUNCTIONS
function getRandomInt(min, max) {
    return Math.round(Math.random() * (max - min)) + min;
}

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

const GameData = [];
const GameField = document.getElementsByClassName('field')[0];

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
                        GameData[iy][ix] = "R";
                        const tile = document.getElementById(`${ix}-${iy}`);
                        tile.classList.remove('tileW')
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
            GameData[iy][coordinate] = "R";
            const tile = document.getElementById(`${coordinate}-${iy}`);
            tile.classList.remove('tileW');
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
            GameData[coordinate][ix] = "R";
            const tile = document.getElementById(`${ix}-${coordinate}`);
            tile.classList.remove('tileW');
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

GenerateTiles();
GenerateRooms();
GeneratePasses();
PlaceGoods (objectProps);
console.table(GameData);