var RED = 0,
    BLUE = 1,
    DRAW = 2;

function download(filename, text) {
    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
}
	
function getWinner(match) {
    // Every match has winner === null | RED | BLUE.
    if (match === null || !match.hasOwnProperty('winner')) {
        return match;
    }

    if (match.winner === RED) {
        return getWinner(match.red);
    } else if (match.winner === BLUE) {
        return getWinner(match.blue);
    } else {
        return null;
    }
}

function makeBracket(players) {
    let n = players.length;
        first = 2 * n - smallestPowerOfTwoGreaterThanOrEqualTo(n);
        rounds = [];
        last = [];

    if (first === 1) {
        return [[{ red: players[0], blue: null, winner: RED }]];
    }

    for (let i = 0; i < first; i += 2) {
        last.push({ red: players[i], blue: players[i + 1], winner: null})
    }

    for (let i = first; i < n; i++) {
        last.push({ red: players[i], blue: null, winner: RED });
    }

    rounds.push(last);

    while (last.length > 1) {
        let future = [];

        for (let i = 0; i < last.length; i += 2) {
            future.push({ red: last[i], blue: last[i + 1], winner: null });
        }

        last = future;
        rounds.push(last);
    }

    return rounds;
}

function smallestPowerOfTwoGreaterThanOrEqualTo(n) {
    let x = 1 << (32 - Math.clz32(n));
    return x >> 1 == n ? n : x;
}

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        let temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
    return array;
}

function setValidity(elm, err) {
    if (elm.setCustomValidity) {
        elm.setCustomValidity(err);
    }
}

function clearValidity(elm) {
    if (elm.setCustomValidity) {
        elm.setCustomValidity('');
    }
}
