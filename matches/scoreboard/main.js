var RED = 0,
    BLUE = 1;

function setScore(side, score) {
    var elm = document.getElementById('score-' + side);
    elm.textContent = score;
}

function setName(side, name) {
    var elm = document.getElementById('name-' + side);
    elm.textContent = name;
}

function setRound(round) {
    var elm = document.getElementById('round');
    elm.textContent = round;
}

function setMatchID(matchID) {
    var elm = document.getElementById('match-id');
    elm.textContent = matchID;
}

function setMatchTime(s) {
    var elm = document.getElementById('timer');

    var m = Math.floor(s / 60);
    s %= 60;

    elm.textContent = pad2(m) + ':' + pad2(s);
}

function setBreakTime(s) {
    var elm = document.getElementById('break-timer');

    var m = Math.floor(s / 60);
    s %= 60;

    elm.textContent = pad2(m) + ':' + pad2(s);
}

function startBreak() {
    document.body.classList.add('break');
}

function endBreak() {
    document.body.classList.remove('break');
}

function setPenalties(side, penalties) {
    let elms = document.getElementById('penalties-' + side).children;
    for (var i = 0; i < elms.length; i++) {
        var elm = elms[i];

        if (penalties > 1) {
            elm.classList.add('full');
            elm.classList.remove('half');
            penalties -= 2;
        } else if (penalties == 1) {
            elm.classList.add('half');
            elm.classList.remove('full');
            penalties -= 1;
        } else {
            elm.classList.remove('half');
            elm.classList.remove('full');
        }
    }
}

document.addEventListener('DOMContentLoaded', function () {
    if (window.opener) {
        window.opener.postMessage('scoreboard.ready', '*');
    }

    if (window.parent) {
        window.parent.postMessage('scoreboard.ready', '*');
    }
});

function pad2(x) {
    x = x + '';
    return x.length < 2 ? ('00' + x).slice(-2) : x;
}
