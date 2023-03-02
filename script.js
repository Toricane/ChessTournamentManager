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
        )
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
        cell.innerHTML = `<a class="player">${data.Players[i]}</a>`;
        for (let j = 1; j <= ROUNDS; j++) {
            cell = row.insertCell();
            cell.innerHTML = data[j][i] || "";
            if (parseFloat(cell.innerHTML) === 1) {
                cell.classList.add("win");
            } else if (parseFloat(cell.innerHTML) === 0.5) {
                cell.classList.add("tie");
            } else if (parseFloat(cell.innerHTML) === 0) {
                cell.classList.add("loss");
            }
        }
        cell = row.insertCell();
        cell.innerHTML = data.Total[i] || "";
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

function generateMatchups() {
    if (ROUNDS > 0) {
        if (data[ROUNDS].some((element) => element === undefined)) {
            alert("Please fill out all of the scores for the current round!");
            return;
        }
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
        });
    }
    // Sort players by score in descending order
    players.sort((a, b) => b.score - a.score);
    let bye;
    if (players.length % 2 === 1) {
        const randomIndex = Math.floor(Math.random() * players.length);
        bye = players.splice(randomIndex, 1)[0];
    }

    // Create an empty array to store the matched players
    const matchedPlayers = [];

    // Iterate through the players array
    for (let i = 0; i < players.length; i++) {
        // If the current player has not yet been matched
        if (!players[i].matched) {
            // Find the next highest-scoring player who has not yet been matched
            for (let j = i + 1; j < players.length; j++) {
                if (
                    !players[j].matched &&
                    players[j].score === players[i].score
                ) {
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
            if (
                i === players.length - 1 ||
                players[i].score !== players[i + 1].score
            ) {
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
    matchedPlayers.forEach((innerArr) =>
        innerArr.sort(() => Math.random() - 0.5)
    );
    placeMatchups(matchedPlayers);
}

function placeMatchups(matchedPlayers) {
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
                data[ROUNDS][ind] = 0.5;
                data.Total[ind] = (
                    parseFloat(data.Total[ind]) + 0.5
                ).toString();
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
    let options = savedNames
        .map((name) => `<option value="${name}"></option>`)
        .join("");
    document.getElementById("saveNames").innerHTML = options;
}

function exportData() {
    const saveName = document.getElementById("saveName").value;
    if (!saveName) {
        alert("Please enter a name for the save!");
        return;
    }
    const arr = [...document.getElementById("loggy").children];
    arr.shift();
    arr.shift();
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
    console.log(logs);

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
    const logHeader = document.createElement("tr");
    logHeader.innerHTML = `<td class="long" colspan="3">Logs</td>`;
    loggy.appendChild(logHeader);
    const logHeader2 = document.createElement("tr");
    logHeader2.innerHTML = `<td>Round</td><td>Match</td><td>Result</td>`;
    loggy.appendChild(logHeader2);
    for (let i = 1; i <= ROUNDS; i++) {
        const roundInfo = logs[i];
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
    placeMatchups(matchups);
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
    const keys = Object.keys(localStorage);
    if (!keys.length) {
        alert("No saves to delete!");
        return;
    }
    const clear = confirm(
        `Are you sure you want to delete ${keys.length} save${
            keys.length === 1 ? "" : "s"
        }?`
    );
    if (!clear) return;
    localStorage.clear();
    updateSaveNames();
}

function downloadData() {
    const saveData = {};
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
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
        const target = event.target;

        // Check if clicked element is a cell with a class
        if (target.tagName === "TD" && target.classList.length > 0) {
            // Get the round number from the table header
            const round =
                target.parentElement.parentElement.firstElementChild.children[
                    target.cellIndex
                ].textContent;

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
                    var cellRect = this.getBoundingClientRect();
                    var popupRect = popup.getBoundingClientRect();
                    var top = cellRect.top - popupRect.height - 5;
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
    for (let i = 1; i <= ROUNDS; i++) {
        const label = document.createElement("label");
        label.id = `label${i}`;
        label.appendChild(document.createTextNode(i));
        const input = document.createElement("input");
        input.id = `checkbox${i}`;
        input.type = "checkbox";
        input.checked = checked;
        input.onclick = whenWhichChanged;
        label.appendChild(input);
        which.appendChild(label);
    }
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
    const which = document.getElementById("which");
    const loggy = document.getElementById("loggy");
    let numChecked = 0;
    let numUnchecked = 0;
    for (let i = 0; i < which.children.length; i++) {
        const label = document.getElementById(`label${i + 1}`);
        const checkbox = document.getElementById(`checkbox${i + 1}`);
        if (checkbox.checked) {
            numChecked++;
        } else {
            numUnchecked++;
        }
        const round = label.textContent;
        for (let j = 0; j < loggy.rows.length; j++) {
            if (loggy.rows[j].getAttribute("data-round") === round) {
                loggy.rows[j].hidden = !checkbox.checked;
            }
        }
    }
    const show = document.getElementById("show");
    const hide = document.getElementById("hide");
    if (numUnchecked === 0) {
        show.checked = true;
        show.hidden = true;
        show.parentElement.hidden = true;
    }
    if (numChecked === 0) {
        hide.checked = true;
        hide.hidden = true;
        hide.parentElement.hidden = true;
    }
    if (numChecked > 0 && numUnchecked > 0) {
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
    body.classList.toggle("light-mode");
    body.classList.toggle("dark-mode");
    const theme = document.getElementById("theme");
    if (body.classList.contains("light-mode")) {
        theme.innerHTML = "☀️";
        localStorage.setItem("theme", "light-mode");
    } else {
        theme.innerHTML = "🌙";
        localStorage.setItem("theme", "dark-mode");
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
