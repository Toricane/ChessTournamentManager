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
        for (let i = 0; i < list.childNodes.length; i++) {
            if (list.children[i].innerHTML.includes(`${player} vs `) || list.children[i].innerHTML.includes(` vs ${player}`)) {
                if (list.children[i].innerHTML.includes("<strike>")) {
                    alert("This match has already been played!");
                    const input = document.getElementById("player");
                    input.select();
                    return;
                }
                opponent = list.children[i].innerHTML.replace(player, "").replace(" vs ", "");
                list.children[i].innerHTML = `<strike>${list.children[i].innerHTML}</strike>`
                break;
            }
        }
    }
    const round = ROUNDS;
    const index = data.Players.indexOf(player);
    if (index === -1) return;
    data[round][index] = status.toString();
    data.Total[index] = (parseFloat(data.Total[index]) + status).toString();
    if (opponent) {
        const opponentIndex = data.Players.indexOf(opponent);
        data[round][opponentIndex] = (status === 0.5 ? 0.5 : 0).toString();
        data.Total[opponentIndex] = (parseFloat(data.Total[opponentIndex]) + (status === 0.5 ? 0.5 : 0)).toString();
    }
    document.getElementById("player").value = "";
    document.getElementById("player").focus();
    updateTable();
    if (!data[round].some(element => element === undefined || element === "" || element === null)) {
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
            if (total > sortedData.Total[i]) {
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
    // container.innerHTML = "";
    const table = document.createElement("table");
    table.id = "table";
    let header = table.insertRow();
    let hCell = header.insertCell();
    hCell.innerHTML = "Players";
    for (let i = 1; i <= ROUNDS; i++) {
        hCell = header.insertCell();
        hCell.innerHTML = i;
    }
    hCell = header.insertCell();
    hCell.innerHTML = "Total";
    for (let i = 0; i < data.Players.length; i++) {
        let row = table.insertRow();
        let cell = row.insertCell();
        cell.innerHTML = data.Players[i];
        for (let j = 1; j <= ROUNDS; j++) {
            cell = row.insertCell();
            cell.innerHTML = data[j][i] || "";
        }
        cell = row.insertCell();
        cell.innerHTML = data.Total[i] || "";
    }
    try {
        container.removeChild(document.getElementById("table"));
    } catch (e) {
    }
    container.appendChild(table);
    try {
        let oldList = container.removeChild(document.getElementById("list"));
        container.appendChild(oldList);
    } catch (e) {
    }
}

function generateMatchups() {
    if (ROUNDS > 0) {
        if (data[ROUNDS].some(element => element === undefined)) {
            alert("Please fill out all of the scores for the current round!");
            return;
        }
    }
    document.getElementById("pair").hidden = true;
    const scoreButtons = document.getElementById("scoreButtons");
    for (let i = 0; i < scoreButtons.children.length; i++) {
        scoreButtons.children[i].hidden = false;
    }
    newRound();
    try {
        document.getElementById("list").remove();
    } catch (e) {
    }
    let players = [];
    for (let i = 0; i < data.Players.length; i++) {
        players.push({ name: data.Players[i], score: parseFloat(data.Total[i]) });
    }
    // Sort players by score in descending order
    players.sort((a, b) => b.score - a.score);

    // Create an empty array to store the matched players
    const matchedPlayers = [];

    // Iterate through the players array
    for (let i = 0; i < players.length; i++) {
        // If the current player has not yet been matched
        if (!players[i].matched) {
            // Find the next highest-scoring player who has not yet been matched
            for (let j = i + 1; j < players.length; j++) {
                if (!players[j].matched && players[j].score === players[i].score) {
                    // Add the current player and the next highest-scoring player to the matchedPlayers array
                    matchedPlayers.push([players[i].name, players[j].name]);
                    // Mark both players as matched
                    players[i].matched = true;
                    players[j].matched = true;
                    break;
                }
            }
            // If there is an odd number of players with the same score, one will be left unmatched
            // In this case, we will just match that player with the next unmatched player with a lower score
            if (i === players.length - 1 || players[i].score !== players[i + 1].score) {
                for (let j = i + 1; j < players.length; j++) {
                    if (!players[j].matched) {
                        matchedPlayers.push([players[i].name, players[j].name]);
                        players[i].matched = true;
                        players[j].matched = true;
                        break;
                    }
                }
            }
        }
    }
    matchedPlayers.forEach(innerArr => innerArr.sort(() => Math.random() - 0.5))
    placeMatchups(matchedPlayers);
}

function placeMatchups(matchedPlayers) {
    const container = document.getElementById("container");
    const ol = document.createElement("ol");
    matchedPlayers.forEach((arr, index) => {
        const li = document.createElement("li");
        li.innerHTML = `${arr[0]} vs ${arr[1]}`;
        ol.appendChild(li);
    });
    ol.id = "list";
    container.appendChild(ol);
    for (let i = 0; i < data.Players.length; i++) {
        let notInArray = matchedPlayers.every(subArray => !subArray.includes(data.Players[i]));
        if (notInArray) {
            const li = document.createElement("li");
            li.innerHTML = `${data.Players[i]} has a bye`;
            ol.appendChild(li);
            const ind = data.Players.indexOf(data.Players[i]);
            for (let j = 1; j <= ROUNDS; j++) {
                if (!data[j][ind]) {
                    data[j][ind] = 0.5;
                    data.Total[ind] += 0.5;
                    break;
                }
            }
        }
    }
    matchups = matchedPlayers;
    updateTable();
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
    const name = input.value
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
    const name = input.value
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

function hookExport() {
    const exportButton = document.getElementById("export");
    exportButton.addEventListener("click", function () {
        // Convert your variables to a JSON string
        const jsonData = JSON.stringify(
            { rounds: ROUNDS, data: data, matchups: matchups }
        );
        // Create a new <a> element and trigger a download
        const downloadLink = document.createElement("a");
        const currentDate = new Date();
        const year = currentDate.getFullYear();
        const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
        const day = currentDate.getDate().toString().padStart(2, '0');
        const hour = currentDate.getHours().toString().padStart(2, '0');
        const minute = currentDate.getMinutes().toString().padStart(2, '0');
        const formattedDate = `${year}-${month}-${day}_${hour}-${minute}`;
        downloadLink.href = "data:text/json," + jsonData;
        downloadLink.download = `chessexport_${formattedDate}_${ROUNDS}rounds_${data.Players.length}players.json`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
    });
}

function handleFileSelect() {
    const input = document.getElementById('fileInput');
    const file = input.files[0];
    const reader = new FileReader();

    reader.onload = function () {
        const fileContent = JSON.parse(reader.result);
        data = fileContent.data;
        matchups = fileContent.matchups;
        ROUNDS = fileContent.rounds;
        placeMatchups(matchups);

        document.getElementById("pair").hidden = true;
        const scoreButtons = document.getElementById("scoreButtons");
        for (let i = 0; i < scoreButtons.children.length; i++) {
            scoreButtons.children[i].hidden = false;
        }

        const list = document.getElementById("list");
        if (list) {
            for (let i = 0; i < data.Players.length; i++) {
                const playerPlayed = data[ROUNDS][i] !== null;
                if (!playerPlayed) continue;
                const player = data.Players[i];
                for (let i = 0; i < list.childNodes.length; i++) {
                    if (list.children[i].innerHTML.includes(`${player} vs `) || list.children[i].innerHTML.includes(` vs ${player}`)) {
                        if (list.children[i].innerHTML.includes("<strike>")) {
                            continue;
                        }
                        list.children[i].innerHTML = `<strike>${list.children[i].innerHTML}</strike>`
                        break;
                    }
                }
            }
        }
    };

    reader.readAsText(file);
}
