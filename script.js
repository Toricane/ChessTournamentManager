let ROUNDS = 0;
let data = {};
data["Players"] = [];
for (let i = 1; i <= ROUNDS; i++) {
    data[i] = [];
}
data["Total"] = [];
let matchups = [];

function newRound() {
    ROUNDS += 1;
    data[ROUNDS] = [];
    updateTable();
}

function updateScore(status) {
    const player = document.getElementById("player").value;
    const list = document.getElementById("list");
    let opponent = "";
    if (list) {
        if (
            list.children[list.children.length - 1].innerHTML ===
            `<a class="player">${player}</a> has a bye`
        ) {
            document.getElementById("player").select();
            return;
        }
        for (let i = 0; i < list.childNodes.length; i++) {
            if (
                list.children[i].innerHTML.includes(
                    `<a class="player">${player}</a> vs `
                ) ||
                list.children[i].innerHTML.includes(
                    ` vs <a class="player">${player}</a>`
                )
            ) {
                if (list.children[i].innerHTML.includes("<strike>")) {
                    alert("This match has already been played!");
                    const input = document.getElementById("player");
                    input.select();
                    return;
                }
                opponent = list.children[i].innerHTML
                    .replace(`<a class="player">${player}</a>`, "")
                    .replace(" vs ", "")
                    .replace('<a class="player">', "")
                    .replace("</a>", ""); // <a class="player">opponent</a>
                list.children[
                    i
                ].innerHTML = `<strike>${list.children[i].innerHTML}</strike>`;
                break;
            }
        }
    }
    const round = ROUNDS;
    const index = data.Players.indexOf(player);
    if (index === -1) return;
    data[round][index] = status.toString();
    data.Total[index] = (
        parseFloat(data.Total[index]) + parseFloat(status)
    ).toString();
    if (opponent) {
        const opponentIndex = data.Players.indexOf(opponent);
        data[round][opponentIndex] = (status === 0.5 ? 0.5 : 0).toString();
        data.Total[opponentIndex] = (
            parseFloat(data.Total[opponentIndex]) +
            (parseFloat(status) === 0.5 ? 0.5 : 0)
        ).toString();
    }
    document.getElementById("player").value = "";
    document.getElementById("player").focus();
    let result;
    if (status === 1) {
        result = `${player} won`;
    } else if (status === 0.5) {
        result = `draw`;
    }
    addMatchToLog(round, player, opponent, result);
    updateTable();
    if (
        !data[round].some(
            (element) =>
                element === undefined || element === "" || element === null
        ) &&
        document.getElementById("autoRound").checked
    ) {
        generateMatchups();
    }
}

function updateTable() {
    const sortedData = {};
    sortedData["Players"] = [];
    for (let i = 1; i <= ROUNDS; i++) {
        sortedData[i] = [];
    }
    sortedData["Total"] = [];

    data.Players.forEach((player, index) => {
        const total = data.Total[index];
        let added = false;

        for (let i = 0; i < sortedData.Players.length; i++) {
            if (parseFloat(total) > parseFloat(sortedData.Total[i])) {
                sortedData.Players.splice(i, 0, player);
                for (let j = 1; j <= ROUNDS; j++) {
                    sortedData[j].splice(i, 0, data[j][index]);
                }
                sortedData.Total.splice(i, 0, total);
                added = true;
                break;
            }
        }

        if (!added) {
            sortedData.Players.push(player);
            for (let j = 1; j <= ROUNDS; j++) {
                sortedData[j].push(data[j][index]);
            }
            sortedData.Total.push(total);
        }
    });
    data = sortedData;
    const container = document.getElementById("container");
    const table = document.createElement("table");
    table.id = "table";
    table.onclick = playerClicked;
    let thead = document.createElement("thead");
    let header = thead.insertRow();
    let hCell = document.createElement("th");
    hCell.innerHTML = "Players";
    hCell.setAttribute("scope", "row");
    header.appendChild(hCell);
    for (let i = 1; i <= ROUNDS; i++) {
        hCell = document.createElement("th");
        hCell.innerHTML = i;
        hCell.setAttribute("scope", "row");
        header.appendChild(hCell);
    }
    hCell = document.createElement("th");
    hCell.innerHTML = "Total";
    hCell.setAttribute("scope", "row");
    header.appendChild(hCell);
    table.appendChild(thead);
    let tbody = document.createElement("tbody");
    for (let i = 0; i < data.Players.length; i++) {
        let row = tbody.insertRow();
        let cell = row.insertCell();
        cell.innerHTML = `<a class="player">${data.Players[i]}</a>`;
        for (let j = 1; j <= ROUNDS; j++) {
            cell = row.insertCell();
            cell.innerHTML = data[j][i] || "";
            if (parseFloat(cell.innerHTML) === 1) {
                if (checkIfPlayerHasBye(data.Players[i], j)) {
                    cell.classList.add("bye");
                    cell.innerHTML = "";
                    const img = document.createElement("img");
                    const theme = document.body.className;
                    img.src = `emoji/bye_${theme}_mode.png`;
                    img.alt = "bye";
                    img.width = "20";
                    img.height = "20";
                    cell.appendChild(img);
                } else {
                    cell.classList.add("win");
                    cell.innerHTML = "";
                    const img = document.createElement("img");
                    img.src = "emoji/win.png";
                    img.alt = "1";
                    img.width = "20";
                    img.height = "20";
                    cell.appendChild(img);
                }
            } else if (parseFloat(cell.innerHTML) === 0.5) {
                cell.classList.add("tie");
                cell.innerHTML = "";
                const img = document.createElement("img");
                const theme = document.body.className;
                img.src = `emoji/draw_${theme}_mode.png`;
                img.alt = "draw";
                img.width = "20";
                img.height = "20";
                cell.appendChild(img);
            } else if (parseFloat(cell.innerHTML) === 0) {
                cell.classList.add("loss");
                cell.innerHTML = "";
                const img = document.createElement("img");
                img.src = "emoji/loss.png";
                img.alt = "0";
                img.width = "20";
                img.height = "20";
                cell.appendChild(img);
            }
        }
        cell = row.insertCell();
        cell.innerHTML = data.Total[i] || "";
    }
    table.appendChild(tbody);
    let images = table.getElementsByTagName("img");
    for (let img of images) {
        if ("1 bye draw 0".includes(img.alt)) {
            img.addEventListener("click", function (event) {
                playerClicked(event);
                event.stopPropagation();
            });
        }
    }
    try {
        container.removeChild(document.getElementById("table"));
    } catch (e) {}
    container.appendChild(table);
    try {
        let oldList = container.removeChild(document.getElementById("list"));
        container.appendChild(oldList);
    } catch (e) {}
}

function checkIfPlayerHasBye(player, round = null) {
    let logs = getLogs();
    if (round !== null) {
        if (logs[round][player] === "bye") {
            return true;
        }
        return false;
    }
    for (let _round in logs) {
        if (logs[_round][player] === "bye") {
            return true;
        }
    }
    return false;
}

function checkIfPlayersHavePlayed(player1, player2) {
    if (player1 === player2) {
        return false;
    }
    let logs = getLogs();
    for (let round in logs) {
        let matches = logs[round];
        for (let match in matches) {
            if (match.includes(player1) && match.includes(player2)) {
                return true;
            }
        }
    }
    return false;
}

function colorPlayed(player, round) {
    let logs = getLogs();
    let matches = logs[round];
    for (let match in matches) {
        if (!(match.includes(player) && match.includes(" vs "))) {
            if (match === player) {
                return "bye";
            }
            continue;
        }
        let game = match.split(" vs ");
        if (game[0] === player) {
            return "white";
        } else {
            return "black";
        }
    }
}

function convertToNumber(outcome) {
    switch (outcome) {
        case "white":
            return 1;
        case "black":
            return 0;
        case "bye":
            return "bye";
    }
}

function balanceColors(matchups) {
    let logs = getLogs();
    let players = data.Players;
    let colors = {};
    for (let player of players) {
        colors[player] = {
            white: 0,
            black: 0,
            bye: 0,
            lastPlayed: null,
            consecutive: 0,
        };
    } // lastPlayed = 0 || 1, 0 = black, 1 = white; consecutive = number of consecutive games played with same color
    let matches, game;
    for (let round in logs) {
        matches = logs[round];
        for (let match in matches) {
            if (!match.includes(" vs ")) {
                colors[match].bye++;
                continue;
            }
            game = match.split(" vs ");
            colors[game[0]][colorPlayed(game[0], round)]++;
            colors[game[1]][colorPlayed(game[1], round)]++;
        }
    }
    if (ROUNDS > 1) {
        for (let player of players) {
            let lastRound = ROUNDS - 1;
            while (true) {
                if (lastRound < 0) {
                    colors[player].lastPlayed = null;
                    break;
                }
                colors[player].lastPlayed = convertToNumber(
                    colorPlayed(player, lastRound)
                );
                if (colors[player].lastPlayed === "bye") {
                    lastRound--;
                } else {
                    break;
                }
            }
            if (colors[player].lastPlayed === undefined) {
                colors[player].lastPlayed = null;
            }

            if (lastRound >= 3) {
                let helper = {
                    lastRound: colors[player].lastPlayed,
                    beforeLastRound: convertToNumber(
                        colorPlayed(player, lastRound - 1)
                    ),
                    beforeBeforeLastRound: convertToNumber(
                        colorPlayed(player, lastRound - 2)
                    ),
                };
                if (
                    helper.beforeBeforeLastRound !== null &&
                    helper.beforeLastRound !== null &&
                    helper.lastRound !== null &&
                    helper.lastRound === helper.beforeLastRound &&
                    helper.beforeLastRound === helper.beforeBeforeLastRound
                ) {
                    colors[player].consecutive = 3;
                } else if (
                    helper.beforeLastRound !== null &&
                    helper.lastRound !== null &&
                    helper.lastRound === helper.beforeLastRound
                ) {
                    colors[player].consecutive = 2;
                } else {
                    colors[player].consecutive = 1;
                }
            } else if (lastRound >= 2) {
                if (
                    convertToNumber(colorPlayed(player, lastRound - 1)) !==
                        null &&
                    colors[player].lastPlayed !== null &&
                    colors[player].lastPlayed ===
                        convertToNumber(colorPlayed(player, ROUNDS - 2))
                ) {
                    colors[player].consecutive = 2;
                } else {
                    colors[player].consecutive = 1;
                }
            } else {
                colors[player].consecutive = 1;
            }
        }
    }

    let newMatchups = [];
    let player1Name, player2Name, player1, player2, diff1, diff2;
    for (let matchup of matchups) {
        [player1Name, player2Name] = matchup;
        [player1, player2] = [colors[player1Name], colors[player2Name]];
        [diff1, diff2] = [
            player1.white /* + player1.bye */ - player1.black,
            player2.white /* + player2.bye */ - player2.black,
        ];
        if (player1.lastPlayed === null && player2.lastPlayed === null) {
            // if first round
            matchup.sort(() => Math.random() - 0.5);
            newMatchups.push(matchup);
        } else if (player1.lastPlayed === null || player2.lastPlayed === null) {
            // if new player, just swap the colour of old player
            if (player1.lastPlayed === null) {
                if (player2.lastPlayed === 0) {
                    matchup.reverse();
                    newMatchups.push(matchup);
                } else if (player2.lastPlayed === 1) {
                    newMatchups.push(matchup);
                }
            } else if (player2.lastPlayed === null) {
                if (player1.lastPlayed === 0) {
                    matchup.reverse();
                    newMatchups.push(matchup);
                } else if (player1.lastPlayed === 1) {
                    newMatchups.push(matchup);
                }
            }
        } else if (player1.consecutive >= 2 || player2.consecutive >= 2) {
            if (player1.consecutive >= 2 && player2.consecutive >= 2) {
                if (
                    (player1.lastPlayed === 1 && player2.lastPlayed === 1) ||
                    (player1.lastPlayed === 0 && player2.lastPlayed === 0)
                ) {
                    matchup.sort(() => Math.random() - 0.5);
                    newMatchups.push(matchup);
                } else if (
                    player1.lastPlayed === 1 &&
                    player2.lastPlayed === 0
                ) {
                    matchup.reverse();
                    newMatchups.push(matchup);
                } else if (
                    player1.lastPlayed === 0 &&
                    player2.lastPlayed === 1
                ) {
                    newMatchups.push(matchup);
                }
            } else if (player1.consecutive >= 2) {
                if (player1.lastPlayed === 0) {
                    newMatchups.push(matchup);
                } else if (player1.lastPlayed === 1) {
                    matchup.reverse();
                    newMatchups.push(matchup);
                }
            } else if (player2.consecutive >= 2) {
                if (player2.lastPlayed === 1) {
                    newMatchups.push(matchup);
                } else if (player2.lastPlayed === 0) {
                    matchup.reverse();
                    newMatchups.push(matchup);
                }
            }
        } else if (Math.abs(diff1) >= 1 || Math.abs(diff2) >= 1) {
            if (Math.abs(diff1) >= 1 && Math.abs(diff2) >= 1) {
                if (diff1 > 0) {
                    matchup.reverse();
                    newMatchups.push(matchup);
                } else if (diff1 < 0) {
                    newMatchups.push(matchup);
                }
            } else if (Math.abs(diff1) >= 1) {
                if (diff1 > 0) {
                    matchup.reverse();
                    newMatchups.push(matchup);
                } else if (diff1 < 0) {
                    newMatchups.push(matchup);
                }
            } else if (Math.abs(diff2) >= 1) {
                if (diff2 > 0) {
                    matchup.reverse();
                    newMatchups.push(matchup);
                } else if (diff2 < 0) {
                    newMatchups.push(matchup);
                }
            }
        } else if (diff1 === diff2) {
            matchup.sort(() => Math.random() - 0.5);
            newMatchups.push(matchup);
        } else if (diff1 > diff2) {
            matchup.reverse();
            newMatchups.push(matchup);
        } else {
            if (player1.lastPlayed === 1 && player2.lastPlayed === 0) {
                matchup.reverse();
            } else if (player1.lastPlayed === 1 && player2.lastPlayed === 1) {
                if (diff1 > diff2) {
                    matchup.reverse();
                }
            } else if (player1.lastPlayed === 0 && player2.lastPlayed === 0) {
                if (diff1 < diff2) {
                    matchup.reverse();
                }
            }
            newMatchups.push(matchup);
        }
    }
    return matchups;
}

function generateMatchups() {
    if (ROUNDS > 0) {
        if (data[ROUNDS].some((element) => element === undefined)) {
            alert("Please fill out all of the scores for the current round!");
            return;
        }
    }
    if (data.Players.length < 2) {
        alert("Pairing requires at least two players!");
        return;
    }
    const scoreButtons = document.getElementById("scoreButtons");
    for (let i = 0; i < scoreButtons.children.length; i++) {
        scoreButtons.children[i].hidden = false;
    }
    document.getElementById("pair").hidden = true;
    newRound();
    try {
        document.getElementById("list").remove();
    } catch (e) {}
    let players = [];
    for (let i = 0; i < data.Players.length; i++) {
        players.push({
            name: data.Players[i],
            score: parseFloat(data.Total[i]),
            matched: false,
        });
    }
    // Sort players by score in descending order
    players.sort((a, b) => b.score - a.score);
    let bye;
    if (players.length % 2 === 1) {
        let randomIndex;
        let iter = players.length * 2;
        while (true) {
            randomIndex = Math.floor(Math.random() * players.length);
            if (!checkIfPlayerHasBye(players[randomIndex].name) || iter === 0) {
                break;
            }
            iter--;
        }
        bye = players.splice(randomIndex, 1)[0];
    }

    // TODO: clean up this code \/

    let logs = getLogs();
    // let players = data.Players;
    let colors = {};
    for (let player of data.Players) {
        colors[player] = {
            white: 0,
            black: 0,
            bye: 0,
            lastPlayed: null,
            consecutive: 0,
        };
    } // lastPlayed = 0 || 1, 0 = black, 1 = white; consecutive = number of consecutive games played with same color
    let matches, game;
    for (let round in logs) {
        matches = logs[round];
        for (let match in matches) {
            if (!match.includes(" vs ")) {
                colors[match].bye++;
                continue;
            }
            game = match.split(" vs ");
            colors[game[0]][colorPlayed(game[0], round)]++;
            colors[game[1]][colorPlayed(game[1], round)]++;
        }
    }
    if (ROUNDS > 1) {
        for (let plr of players) {
            let player = plr.name;
            let lastRound = ROUNDS - 1;
            while (true) {
                if (lastRound < 0) {
                    colors[player].lastPlayed = null;
                    break;
                }
                colors[player].lastPlayed = convertToNumber(
                    colorPlayed(player, lastRound)
                );
                if (colors[player].lastPlayed === "bye") {
                    lastRound--;
                } else {
                    break;
                }
            }
            if (colors[player].lastPlayed === undefined) {
                colors[player].lastPlayed = null;
            }

            if (lastRound >= 3) {
                let helper = {
                    lastRound: colors[player].lastPlayed,
                    beforeLastRound: convertToNumber(
                        colorPlayed(player, lastRound - 1)
                    ),
                    beforeBeforeLastRound: convertToNumber(
                        colorPlayed(player, lastRound - 2)
                    ),
                };
                if (
                    helper.beforeBeforeLastRound !== null &&
                    helper.beforeLastRound !== null &&
                    helper.lastRound !== null &&
                    helper.lastRound === helper.beforeLastRound &&
                    helper.beforeLastRound === helper.beforeBeforeLastRound
                ) {
                    colors[player].consecutive = 3;
                } else if (
                    helper.beforeLastRound !== null &&
                    helper.lastRound !== null &&
                    helper.lastRound === helper.beforeLastRound
                ) {
                    colors[player].consecutive = 2;
                } else {
                    colors[player].consecutive = 1;
                }
            } else if (lastRound >= 2) {
                if (
                    convertToNumber(colorPlayed(player, lastRound - 1)) !==
                        null &&
                    colors[player].lastPlayed !== null &&
                    colors[player].lastPlayed ===
                        convertToNumber(colorPlayed(player, ROUNDS - 2))
                ) {
                    colors[player].consecutive = 2;
                } else {
                    colors[player].consecutive = 1;
                }
            } else {
                colors[player].consecutive = 1;
            }
        }
    }

    // TODO: clean up this code /\

    // Create an empty array to store the matched players
    let matchedPlayers = [];
    players.sort(() => Math.random() - 0.5);

    for (let i = 0; i < players.length; i++) {
        if (players[i].matched) {
            continue;
        }
        let player1 = players[i].name;
        let player2;
        let done = false;
        let range = players;
        range.sort(
            (a, b) =>
                Math.abs(player1.score - a.score) -
                Math.abs(player1.score - b.score)
        );
        for (let j = 0; j < range.length; j++) {
            if (range[j].matched || range[j].name === players[i].name) {
                continue;
            }
            player2 = range[j].name;
            let player1Obj = colors[player1];
            let player2Obj = colors[player2];
            if (
                !(
                    checkIfPlayersHavePlayed(player1, player2) ||
                    (player1Obj.consecutive >= 2 &&
                        player2Obj.consecutive >= 2) ||
                    (player1Obj.lastPlayed === player2Obj.lastPlayed &&
                        (player1Obj.consecutive >= 2 ||
                            player2Obj.consecutive >= 2))
                )
            ) {
                matchedPlayers.push([player1, player2]);
                players[i].matched = true;
                range[j].matched = true;
                done = true;
                break;
            }
        }
        if (!done) {
            // get random player and match with player i
            let randomIndex = Math.floor(Math.random() * players.length);
            while (
                players[randomIndex].matched ||
                players[randomIndex].name === players[i].name
            ) {
                randomIndex = Math.floor(Math.random() * players.length);
            }
            player2 = players[randomIndex].name;
            matchedPlayers.push([player1, player2]);
            players[i].matched = true;
            players[randomIndex].matched = true;
            done = true;
        }
    }

    const newMatches = balanceColors(matchedPlayers); // NEED HELP HERE

    placeMatchups(newMatches);
}

function placeMatchups(matchedPlayers, full = false) {
    const container = document.getElementById("container");
    const ol = document.createElement("ol");
    matchedPlayers.forEach((arr, index) => {
        const li = document.createElement("li");
        li.innerHTML = `<a class="player">${arr[0]}</a> vs <a class="player">${arr[1]}</a>`;
        ol.appendChild(li);
    });
    ol.id = "list";
    ol.onclick = playerClicked;
    container.appendChild(ol);
    for (let i = 0; i < data.Players.length; i++) {
        let notInArray = matchedPlayers.every(
            (subArray) => !subArray.includes(data.Players[i])
        );
        if (notInArray) {
            const li = document.createElement("li");
            li.innerHTML = `<a class="player">${data.Players[i]}</a> has a bye`;
            ol.appendChild(li);
            addMatchToLog(ROUNDS, data.Players[i], null, "bye");
            const ind = data.Players.indexOf(data.Players[i]);
            if (!data[ROUNDS][ind]) {
                data[ROUNDS][ind] = 1;
                data.Total[ind] = (parseFloat(data.Total[ind]) + 1).toString();
            }
        }
    }
    matchups = matchedPlayers;
    unhideAutoRound(ROUNDS === 1, full);
    updateTable();
    modifyWhich();
}

function unhideAutoRound(first = false, full = false) {
    const autoRound = document.getElementById("autoRound");
    const autoRoundLabel = document.getElementById("autoRoundLabel");
    if (autoRoundLabel.hidden) {
        autoRoundLabel.hidden = false;
    }
    autoRound.checked = !autoRound.checked;
    autoRound.checked = full ? false : first ? true : !autoRound.checked;
}

function autoRoundClick() {
    const autoRound = document.getElementById("autoRound");
    if (!autoRound.checked) {
        return;
    }
    if (
        !data[ROUNDS].some((el) => el === undefined || el === null || el === "")
    ) {
        generateMatchups();
    }
}

function modifyDatalist() {
    const datalist = document.getElementById("playerNames");
    datalist.innerHTML = "";
    const sortedPlayers = data.Players.slice().sort();
    sortedPlayers.forEach((player) => {
        const option = document.createElement("option");
        option.value = player;
        datalist.appendChild(option);
    });
}

function addPlayer() {
    const input = document.getElementById("player");
    const name = input.value;
    input.select();
    if (!name) return;
    if (data.Players.includes(name)) return;
    input.value = "";
    data.Players.push(name);
    for (let i = 1; i <= ROUNDS; i++) {
        data[i].push(0);
    }
    data.Total.push(0);
    modifyDatalist();
    updateTable();
}

function removePlayer() {
    const input = document.getElementById("player");
    const name = input.value;
    input.select();
    if (!name) return;
    if (!data.Players.includes(name)) return;
    input.value = "";
    const index = data.Players.indexOf(name);
    data.Players.splice(index, 1);
    for (let i = 1; i <= ROUNDS; i++) {
        data[i].splice(index, 1);
    }
    data.Total.splice(index, 1);
    modifyDatalist();
    updateTable();
}

function updateSaveNames() {
    let savedNames = Object.keys(localStorage);
    savedNames.splice(savedNames.indexOf("theme"), 1);
    let options = savedNames
        .map((name) => `<option value="${name}"></option>`)
        .join("");
    document.getElementById("saveNames").innerHTML = options;
}

function getLogs() {
    const arr = [...document.getElementById("loggy").children];
    const logs = {};
    arr.forEach((el) => {
        const round = el.children[0].innerHTML;
        const match = el.children[1].innerHTML;
        const result = el.children[2].innerHTML;
        if (!logs[round]) {
            logs[round] = {};
        }
        logs[round][match] = result;
    });
    return logs;
}

function exportData() {
    const saveName = document.getElementById("saveName").value;
    if (!saveName) {
        alert("Please enter a name for the save!");
        return;
    }
    if (saveName === "theme") {
        alert("Please enter a different name for the save!");
        return;
    }
    let logs = getLogs();

    const jsonData = JSON.stringify({
        rounds: ROUNDS,
        data: data,
        matchups: matchups,
        logs: logs,
    });
    let dataExists = false;
    if (localStorage.getItem(saveName)) {
        dataExists = true;
    }
    if (!dataExists) {
        localStorage.setItem(saveName, jsonData);
        updateSaveNames();
    } else {
        const overwrite = confirm(
            `Save already exists with name: ${saveName}\nWould you like to overwrite it?`
        );
        if (overwrite) {
            localStorage.setItem(saveName, jsonData);
            updateSaveNames();
        }
    }
}

function importData() {
    const saveName = document.getElementById("saveName").value;
    if (!saveName) {
        alert("Please enter a name for the save!");
        return;
    }
    if (saveName === "theme") {
        alert("Please enter a different name for the save!");
        return;
    }
    const jsonData = localStorage.getItem(saveName);
    if (!jsonData) {
        alert("No save with that name exists!");
        return;
    }
    const parsedJsonData = JSON.parse(jsonData);

    data = parsedJsonData.data;
    matchups = parsedJsonData.matchups;
    ROUNDS = parsedJsonData.rounds || 0;
    const logs = parsedJsonData.logs;

    const loggy = document.getElementById("loggy");
    loggy.innerHTML = "";
    for (let i = 1; i <= ROUNDS; i++) {
        const roundInfo = logs[i];
        if (!roundInfo) {
            continue;
        }
        for (let [key, value] of Object.entries(roundInfo)) {
            const logRow = document.createElement("tr");
            logRow.setAttribute("data-round", i);
            logRow.hidden = true;
            logRow.innerHTML = `<td>${i}</td><td>${key}</td><td>${value}</td>`;
            loggy.appendChild(logRow);
        }
    }
    document.getElementById("logTable").hidden = false;

    const c = document.getElementById("container");
    if (c) {
        c.innerHTML = "";
    }
    if (!ROUNDS) {
        updateTable();
        return;
    }
    const full = !data[ROUNDS].some(
        (el) => el === undefined || el === null || el === ""
    );
    placeMatchups(matchups, full);
    const scoreButtons = document.getElementById("scoreButtons");
    for (let i = 0; i < scoreButtons.children.length; i++) {
        scoreButtons.children[i].hidden = false;
    }
    document.getElementById("pair").hidden = true;

    const list = document.getElementById("list");
    if (list) {
        for (let i = 0; i < data.Players.length; i++) {
            const playerPlayed = data[ROUNDS][i] !== null;
            if (!playerPlayed) continue;
            const player = data.Players[i];
            for (let i = 0; i < list.childNodes.length; i++) {
                if (
                    list.children[i].innerHTML.includes(
                        `<a class="player">${player}</a> vs `
                    ) ||
                    list.children[i].innerHTML.includes(
                        ` vs <a class="player">${player}</a>`
                    )
                ) {
                    if (list.children[i].innerHTML.includes("<strike>")) {
                        continue;
                    }
                    list.children[
                        i
                    ].innerHTML = `<strike>${list.children[i].innerHTML}</strike>`;
                    break;
                }
            }
        }
    }
    modifyWhich();
}

function clearData() {
    let keys = Object.keys(localStorage);
    if (keys.includes("theme")) {
        keys.splice(keys.indexOf("theme"), 1);
    }
    if (!keys.length) {
        alert("No saves to delete!");
        return;
    }
    const saveName = document.getElementById("saveName").value;
    if (saveName) {
        if (!keys.includes(saveName)) {
            alert("No save with that name exists!");
            return;
        }
        keys = [saveName];
    }
    let clear;
    if (keys.length === 1) {
        clear = confirm(`Are you sure you want to delete ${keys[0]}?`);
    } else {
        clear = confirm(
            `Are you sure you want to delete ${keys.length} save${
                keys.length === 1 ? "" : "s"
            }?`
        );
    }
    if (!clear) return;
    for (let key of keys) {
        localStorage.removeItem(key);
    }
    updateSaveNames();
}

function downloadData() {
    let keys = Object.keys(localStorage);
    if (!keys.length) {
        alert("No saves to download!");
        return;
    }
    const saveName = document.getElementById("saveName").value;
    if (saveName === "theme") {
        alert("Please enter a different name for the save!");
        return;
    }
    if (saveName !== "") {
        if (!keys.includes(saveName)) {
            alert("No save with that name exists!");
            return;
        }
        keys = [saveName];
    }
    if (keys.includes("theme")) {
        keys.splice(keys.indexOf("theme"), 1);
    }
    const saveData = {};
    for (let key of keys) {
        saveData[key] = JSON.parse(localStorage.getItem(key));
    }

    const blob = new Blob([JSON.stringify(saveData, null, 2)], {
        type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.style.display = "none";
    a.href = url;
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = (currentDate.getMonth() + 1).toString().padStart(2, "0");
    const day = currentDate.getDate().toString().padStart(2, "0");
    const hour = currentDate.getHours().toString().padStart(2, "0");
    const minute = currentDate.getMinutes().toString().padStart(2, "0");
    const formattedDate = `${year}-${month}-${day}_${hour}-${minute}`;
    a.download = `chessexport_${formattedDate}.json`;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    }, 100);
}

function hookUpload() {
    const uploadButton = document.getElementById("upload");
    const fileInput = document.getElementById("uploadInput");

    uploadButton.addEventListener("click", () => {
        fileInput.click();
    });

    fileInput.addEventListener("input", (event) => {
        const file = event.target.files[0];
        const reader = new FileReader();
        reader.onload = (event) => {
            const jsonData = JSON.parse(event.target.result);
            for (const key in jsonData) {
                if (!localStorage.getItem(key)) {
                    localStorage.setItem(key, JSON.stringify(jsonData[key]));
                }
            }
        };
        reader.readAsText(file);
    });
}

function playerClicked(event) {
    if (event.target.className === "player") {
        document.getElementById("player").value = event.target.textContent;
    } else {
        let target = event.target;
        if (target.tagName === "IMG") {
            target = target.parentElement;
        }

        // Check if clicked element is a cell with a class
        if (target.tagName === "TD" && target.classList.length > 0) {
            // Get the round number from the table header
            const round = target.cellIndex;

            // Get the player name from the row header
            const player = target.parentElement.firstElementChild.textContent;

            // Get the row with data-round equal to the round number
            const roundRows = document.querySelectorAll(
                `[data-round="${round}"]`
            );

            // Loop through each row with data-round equal to the round number
            for (let row of roundRows) {
                let cells = row.children;
                if (cells[1].textContent.includes(player)) {
                    // Do something with the row
                    const cell = cells[1];
                    const winner = cells[2].textContent;
                    if (winner === "") {
                        return;
                    }
                    let content = `${cells[0].textContent}. ${cell.textContent}, ${winner}`;
                    const popups = document.getElementsByClassName("popup");
                    while (popups.length > 0) {
                        popups[0].remove();
                    }

                    const popup = document.createElement("div");
                    popup.classList.add("popup");
                    popup.textContent = content;

                    // append the popup to the body
                    document.body.appendChild(popup);
                    var cellRect = target.getBoundingClientRect();
                    var popupRect = popup.getBoundingClientRect();
                    var top = cellRect.top - popupRect.height + 10;
                    var left =
                        cellRect.left + (cellRect.width - popupRect.width) / 2;
                    popup.style.top = top + "px";
                    popup.style.left = left + "px";
                    setTimeout(() => {
                        popup.remove();
                    }, 5000);
                    break;
                }
            }
        }
    }
}

function addMatchToLog(round, player1, player2, outcome) {
    const logTable = document.getElementById("logTable");
    if (logTable.hidden) logTable.hidden = false;
    const loggy = document.getElementById("loggy");
    const newRow = loggy.insertRow();
    newRow.setAttribute("data-round", ROUNDS);
    newRow.insertCell().innerHTML = `${round}`;
    if (player2) {
        newRow.insertCell().innerHTML = `${player1} vs ${player2}`;
    } else {
        newRow.insertCell().innerHTML = player1;
    }
    newRow.insertCell().innerHTML = outcome;
    modifyWhich();
}

function modifyWhich(checked = false) {
    const which = document.getElementById("which");
    which.innerHTML = "";
    const select = document.createElement("select");
    select.id = "whichSelect";
    select.multiple = true;
    let roundsCopy = ROUNDS;
    if (
        data[ROUNDS].every((el) => el === undefined || el === null || el === "")
    ) {
        roundsCopy--;
    }
    for (let i = 1; i <= roundsCopy; i++) {
        const option = document.createElement("option");
        option.id = `option${i}`;
        option.value = i;
        option.selected = checked;
        select.onchange = whenWhichChanged;
        option.appendChild(document.createTextNode(i));
        select.appendChild(option);
    }
    which.appendChild(select);
    const show = document.getElementById("show");
    const hide = document.getElementById("hide");
    show.checked = false;
    hide.checked = false;
    show.hidden = checked;
    show.parentElement.hidden = checked;
    hide.hidden = !checked;
    hide.parentElement.hidden = !checked;
    whenWhichChanged();
}

function whenWhichChanged() {
    const select = document.getElementById("whichSelect");
    const loggy = document.getElementById("loggy");
    let numSelected = 0;
    for (let i = 0; i < select.children.length; i++) {
        const option = select.children[i];
        if (option.selected) {
            numSelected++;
        }
        const round = option.textContent;
        for (let j = 0; j < loggy.rows.length; j++) {
            if (loggy.rows[j].getAttribute("data-round") === round) {
                loggy.rows[j].hidden = !option.selected;
            }
        }
    }
    const show = document.getElementById("show");
    const hide = document.getElementById("hide");
    if (numSelected === select.children.length) {
        show.checked = true;
        show.hidden = true;
        show.parentElement.hidden = true;
    } else if (numSelected === 0) {
        hide.checked = true;
        hide.hidden = true;
        hide.parentElement.hidden = true;
    } else {
        show.hidden = false;
        show.parentElement.hidden = false;
        hide.hidden = false;
        hide.parentElement.hidden = false;
    }
    show.checked = false;
    hide.checked = false;
}

function showHide(show, id) {
    modifyWhich(show);
    const element = document.getElementById(id);
    element.checked = false;
}

function toggleTheme() {
    const body = document.querySelector("body");
    body.classList.toggle("light");
    body.classList.toggle("dark");
    const theme = document.getElementById("theme");
    theme.innerHTML = "";
    let images = document.querySelectorAll('img[alt="draw"]');
    for (let image of images) {
        if (body.classList.contains("light")) {
            image.src = "emoji/draw_light_mode.png";
        } else {
            image.src = "emoji/draw_dark_mode.png";
        }
    }
    images = document.querySelectorAll('img[alt="bye"]');
    for (let image of images) {
        if (body.classList.contains("light")) {
            image.src = "emoji/bye_light_mode.png";
        } else {
            image.src = "emoji/bye_dark_mode.png";
        }
    }
    if (body.classList.contains("light")) {
        const sun = document.createElement("img");
        sun.src = "emoji/sun.svg";
        theme.appendChild(sun);
        document.getElementById("drawIcon").src = "emoji/draw_light_mode.png";
        localStorage.setItem("theme", "light");
    } else {
        const moon = document.createElement("img");
        moon.src = "emoji/moon.svg";
        theme.appendChild(moon);
        document.getElementById("drawIcon").src = "emoji/draw_dark_mode.png";
        localStorage.setItem("theme", "dark");
    }
}

document.addEventListener("click", function (event) {
    // Get all popups
    var popups = document.querySelectorAll(".popup");
    // Remove popups that are not the target or a child of the target or the table
    for (var i = 0; i < popups.length; i++) {
        var popup = popups[i];
        var isTarget = popup == event.target || popup.contains(event.target);
        var isTable = event.target.closest("#table");
        if (!isTarget && !isTable) {
            popup.remove();
        }
    }
});

function giveInfo(id) {
    switch (id) {
        case "theme":
            return "Toggle between light and dark mode";
        case "add":
            return "Add a new player";
        case "remove":
            return "Remove a player";
        case "import":
            return "Load a saved tournament";
        case "export":
            return "Save the current tournament";
        case "download":
            return "Download a specified save or all saves";
        case "upload":
            return "Upload a save file";
        case "clear":
            return "Clear a specified save or all saves";
        case "pair":
            return "Pair the players and start the tournament";
        case "1":
            return "Mark the selected player as the winner";
        case "draw":
            return "Mark the selected player's match as a draw";
    }
}

function initButtons() {
    const buttons = document.querySelectorAll("button");
    const infoContainer = document.getElementById("info-container");
    let timeoutId;
    const inputElement = document.getElementById("player");
    inputElement.addEventListener("keydown", function (event) {
        if (event.key === "Enter") {
            addPlayer();
        }
    });

    // Add event listeners to all buttons
    buttons.forEach((button) => {
        button.addEventListener("mouseenter", () => {
            // Show information about the button on desktop
            clearTimeout(timeoutId);
            infoContainer.textContent = giveInfo(button.id);
            // infoContainer.style.display = "block";
        });

        button.addEventListener("mouseleave", () => {
            // Hide the information container on desktop
            // infoContainer.style.display = "none";
            timeoutId = setTimeout(() => {
                infoContainer.textContent =
                    "Hover over or tap a button for more information";
            }, 1000);
        });

        button.addEventListener("touchstart", () => {
            // Show information about the button on mobile
            clearTimeout(timeoutId);
            infoContainer.textContent = giveInfo(button.id);
            // infoContainer.style.display = "block";
        });

        button.addEventListener("touchend", () => {
            // Hide the information container on mobile
            // infoContainer.style.display = "none";
            timeoutId = setTimeout(() => {
                infoContainer.textContent =
                    "Hover over or tap a button for more information";
            }, 1000);
        });

        button.addEventListener("focus", () => {
            // Show information about the button for accessibility
            clearTimeout(timeoutId);
            infoContainer.textContent = giveInfo(button.id);
            // infoContainer.style.display = "block";
        });

        button.addEventListener("blur", () => {
            // Hide the information container for accessibility
            // infoContainer.style.display = "none";
            timeoutId = setTimeout(() => {
                infoContainer.textContent =
                    "Hover over or tap a button for more information";
            }, 1000);
        });
    });
}
