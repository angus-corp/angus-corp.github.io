// CONSTANTS

var PAUSED   = 0;
var PLAYING  = 1;
var COMPLETE = 2;

var RED = 0;
var BLUE = 1;
var DRAW = 2;

// CONFIGURATION

var config;

// STATE

var state;
var votes; // Non-null if and only if state.mode === PLAYING.
var scoreboards;
var secondTicker;

// INITIALIZATION

function resetSecondTicker() {
    clearInterval(secondTicker);
    secondTicker = setInterval(aSecondHasPassed, 1000);
}

document.addEventListener('DOMContentLoaded', function () {
    var hash = window.location.hash;
    if (hash) {
        hash = hash.slice(1);
        window.opener.postMessage('match.ready.' + hash, '*');
        console.log('Awaiting external initialization...');
        return;
    }

    init({
        callback: null,

        redName: 'Player 1',
        blueName: 'Player 2',
        matchID: '',

        numRounds: 3,
        majority: 3,
        judgementSpan: 600,

        sounds: {
            round:  'buzzer.mp3'  // Round ends.
        },

        roundDuration: 90,
        breakDuration: 60,

        keys: {
            red: {
                upper: ['c', 'i', 'o', 'u'],
                lower: ['a', 'g', 'm', 's']
            },
            blue: {
                upper: ['d', 'j', 'p', 'v'],
                lower: ['b', 'h', 'n', 't']
            }
        }
    });
});

function init(config) {
    window.config = config;
    console.log('Initializing...');

    state = {
        mode: PAUSED,

        redPoints:     0,
        bluePoints:    0,
        redPenalties:  0,
        bluePenalties: 0,

        round:     1,
        matchTime: config.roundDuration,
        breakTime: 0
    };

    votes = null; // Non-null if and only if state.mode === PLAYING.
    scoreboards = [];
    secondTicker = null;

    setState(state);
    $('round-inp').max = config.numRounds + 1;
    $('pause-btn').textContent = 'Start';
    resetSecondTicker();

    heyListen();

    window.open('../scoreboard', '_blank');
    window.addEventListener('message', function (e) {
        if (e.origin !== window.location.origin || e.data !== 'scoreboard.ready')
            return;

        let scoreboard = e.source;

        scoreboard.setName(RED, config.redName);
        scoreboard.setName(BLUE, config.blueName);

        scoreboard.setScore(RED, getScore(state, RED));
        scoreboard.setScore(BLUE, getScore(state, BLUE));
        scoreboard.setPenalties(RED, state.redPenalties);
        scoreboard.setPenalties(BLUE, state.bluePenalties);

        scoreboard.setMatchID(config.matchID);
        scoreboard.setRound(getRoundText(state));
        scoreboard.setBreakTime(state.breakTime);
        scoreboard.setMatchTime(state.matchTime);

        if (state.mode === PAUSED) {
            scoreboard.startBreak();
        }

        scoreboards.push(scoreboard);
    });

    console.log('Initialized!');
}

// EVENTS

function resume() {
    assert(state.mode === PAUSED);
    votes = zeroedVotes();
    setState({ breakTime: config.breakDuration, mode: PLAYING });
    resetSecondTicker();
}

function pause() {
    assert(state.mode === PLAYING);
    votes = null;
    setState({ mode: PAUSED });
    resetSecondTicker();
}

function end() {
    assert(state.mode === PLAYING || state.mode === PAUSED);
    votes = null;
    setState({ mode: COMPLETE });
}

function aSecondHasPassed() {
    if (state.mode === PAUSED) {
        // Decrement the break time if it's not zero already.
        setState({ breakTime: Math.max(state.breakTime - 1, 0) });
    } else if (state.mode === PLAYING) {
        // Decrement the match time if it's not zero already.
        var changes = { matchTime: Math.max(state.matchTime - 1, 0) };

        if (state.matchTime === 0) {
            // Pause and play the end-of-round buzzer.
            pause();
            playSound(config.sounds.round);

            // Move to the next round.
            changes.matchTime = config.roundDuration;
            changes.round = Math.min(state.round + 1, config.numRounds + 1);
        }

        setState(changes);
    }
}

// Handles the judges' input.
window.addEventListener('keydown', function (e) {
    if (state.mode !== PLAYING) {
        return;
    }

    function process(arr, i, side, value) {
        function reset() {
            arr[0] = 0;
            arr[1] = 0;
            arr[2] = 0;
            arr[3] = 0;
            clearTimeout(arr[4]);
            arr[4] = null;
        }

        if (arr[4] === null) {
            arr[4] = setTimeout(reset, config.judgementSpan);
        }

        arr[i] = 1;

        if (arr[0] + arr[1] + arr[2] + arr[3] === config.majority) {
            reset();

            if (side === RED) {
                setState({ redPoints: state.redPoints + value });
            } else {
                setState({ bluePoints: state.bluePoints + value });
            }
        }
    }

    var index = -1;
    var char = e.key.toLowerCase();

    index = config.keys.red.upper.indexOf(char);
    if (index > -1)
        return process(votes.red.upper, index, RED, 2);
    index = config.keys.red.lower.indexOf(char);
    if (index > -1)
        return process(votes.red.lower, index, RED, 1);
    index = config.keys.blue.upper.indexOf(char);
    if (index > -1)
        return process(votes.blue.upper, index, BLUE, 2);
    index = config.keys.blue.lower.indexOf(char);
    if (index > -1)
        return process(votes.blue.lower, index, BLUE, 1);
});

// SET STATE - THE HEART OF THE RENDERER (I HAVE NO IDEA WHAT I'M DOING)

var PAUSE_TEXT = 'Pause';
var PLAY_TEXT = 'Resume';

function setState(newState) {
    var edits = {};

    if (newState.hasOwnProperty('mode')) {
        scoreboards.forEach(scoreboard => {
            if (state.mode === PAUSED && newState.mode !== PAUSED) {
                scoreboard.endBreak();
            } else if (state.mode !== PAUSED && newState.mode === PAUSED) {
                scoreboard.startBreak();
            }
        });

        // Set this first to tell unload handler not to confirm departure.
        state.mode = newState.mode;

        if (state.mode === COMPLETE) {
            // If there is an opener, tell them the good news!
            if (config.callback) {
                config.callback({
                    winner: getWinner(state),
                    red: {
                        points: state.redPoints,
                        penalties: state.redPenalties
                    },
                    blue: {
                        points: state.bluePoints,
                        penalties: state.bluePenalties
                    }
                });
            }
            // Try closing the window.
            window.close();
            // If that fails, just tell the user to close it.
            window.location.href = '../complete';
        } else if (state.mode === PLAYING) {
            $('pause-btn').textContent = PAUSE_TEXT;
            $('round-inp').disabled = true;
            $('match-time-m-inp').disabled = true;
            $('match-time-s-inp').disabled = true;
            $('blue-points').disabled = true;
            $('blue-penalties').disabled = true;
            $('red-points').disabled = true;
            $('red-penalties').disabled = true;
        } else {
            $('pause-btn').textContent = PLAY_TEXT;
            $('round-inp').disabled = false;
            $('match-time-m-inp').disabled = false;
            $('match-time-s-inp').disabled = false;
            $('blue-points').disabled = false;
            $('blue-penalties').disabled = false;
            $('red-points').disabled = false;
            $('red-penalties').disabled = false;
        }
    }

    if (newState.hasOwnProperty('redPoints') ||
        newState.hasOwnProperty('bluePoints') ||
        newState.hasOwnProperty('redPenalties') ||
        newState.hasOwnProperty('bluePenalties')) {

        state.redPoints     = chain('redPoints',     newState, state);
        state.bluePoints    = chain('bluePoints',    newState, state);
        state.redPenalties  = chain('redPenalties',  newState, state);
        state.bluePenalties = chain('bluePenalties', newState, state);

        scoreboards.forEach(scoreboard => {
            scoreboard.setScore(RED, getScore(state, RED));
            scoreboard.setScore(BLUE, getScore(state, BLUE));
            scoreboard.setPenalties(RED, state.redPenalties);
            scoreboard.setPenalties(BLUE, state.bluePenalties);
        });

        edits['red-points'] = state.redPoints;
        edits['blue-points'] = state.bluePoints;
        edits['red-penalties'] = state.redPenalties;
        edits['blue-penalties'] = state.bluePenalties;
    }

    if (newState.hasOwnProperty('round')) {
        scoreboards.forEach(scoreboard => {
            scoreboard.setRound(getRoundText(newState));
        });

        edits['round-inp'] = newState.round;
        state.round = newState.round;
    }

    if (newState.hasOwnProperty('matchTime')) {
        scoreboards.forEach(scoreboard => {
            scoreboard.setMatchTime(newState.matchTime);
        });

        edits['match-time-m-inp'] = Math.floor(newState.matchTime / 60);
        edits['match-time-s-inp'] = newState.matchTime % 60;
        state.matchTime = newState.matchTime;
    }

    if (newState.hasOwnProperty('breakTime')) {
        scoreboards.forEach(scoreboard => {
            scoreboard.setBreakTime(newState.breakTime);
        });

        edits['break-time-m-inp'] = Math.floor(newState.breakTime / 60);
        edits['break-time-s-inp'] = newState.breakTime % 60;
        state.breakTime = newState.breakTime;
    }

    Object.keys(edits).forEach(function (id) {
        if (document.activeElement.id !== id) {
            $(id).value = edits[id];
        } else {
            $(id).dataset.value = edits[id];
        }
    });

    var endtxt;
    switch (getWinner(state)) {
        case RED: endtxt = 'Red Wins'; break;
        case BLUE: endtxt = 'Blue Wins'; break;
        default: endtxt = 'Draw';
    }
    endtxt = 'End Match - ' + endtxt;
    $('end-btn').textContent = endtxt;
}

document.addEventListener('blur', function (e) {
    var target = e.target;
    if (!target.dataset) {
        return;
    }

    var value = target.dataset.value;
    if (typeof value !== 'undefined') {
        target.value = value;
        delete e.target.dataset.value;
    }
}, true);

function chain(prop, a, b) {
    return typeof a[prop] === 'undefined' ? b[prop] : a[prop];
}

// GETTERS

function getWinner(state) {
    var winner;

    if (state.redPenalties === 8) {
        if (state.bluePenalties === 8) {
            winner = DRAW;
        } else {
            winner = BLUE;
        }
    } else if (state.bluePenalties === 8) {
        winner = RED;
    } else {
        var redScore = getScore(state, RED);
        var blueScore = getScore(state, BLUE);

        if (blueScore < redScore) {
            winner = RED;
        } else if (redScore < blueScore) {
            winner = BLUE;
        } else {
            winner = DRAW;
        }
    }

    return winner;
}

function getScore(state, side) {
    if (side === RED) {
        return state.redPoints + Math.floor(state.bluePenalties / 2);
    } else {
        return state.bluePoints + Math.floor(state.redPenalties / 2);
    }
}

function getRoundText(state) {
    if (state.round === config.numRounds + 1) {
        return 'Golden Point';
    } else {
        return 'Round ' + state.round;
    }
}

// HELPERS

function $(id) {
    return document.getElementById(id);
}

function assert(b) {
    if (!b) {
        throw new Error('Assertion failed!');
    }
}

function zeroedVotes() {
    return {
        red: {
            upper: [0, 0, 0, 0, null],
            lower: [0, 0, 0, 0, null]
        },
        blue: {
            upper: [0, 0, 0, 0, null],
            lower: [0, 0, 0, 0, null]
        }
    };
}

// EVENT LISTENERS

function heyListen() {
    // MATCH DATA

    $('pause-btn').addEventListener('click', function () {
        if (state.mode === PAUSED) {
            resume();
        } else {
            pause();
        }
    });

    window.addEventListener('keydown', function (e) {
        if (e.keyCode === 32) {
            e.preventDefault();
            if (state.mode === PAUSED) {
                resume();
            } else {
                pause();
            }
        }
    });

    $('end-btn').addEventListener('click', function () {
        let msg = 'Are you sure you want to end this match? \nThis cannot be undone.';
        if (confirm(msg)) {
            end();
        }
    });

    $('round-inp').addEventListener('change', function () {
        setState({
            round: Math.max(Math.min(parseInt(this.value), config.numRounds + 1), 1)
        });
        this.blur();
    });

    function matchTimeChanged() {
        var s = parseInt($('match-time-m-inp').value) * 60
              + parseInt($('match-time-s-inp').value);

        setState({ matchTime: s });
        this.blur();
    }

    $('match-time-m-inp').addEventListener('change', matchTimeChanged);
    $('match-time-s-inp').addEventListener('change', matchTimeChanged);

    function breakTimeChanged() {
        var s = parseInt($('break-time-m-inp').value) * 60
              + parseInt($('break-time-s-inp').value);

        setState({ breakTime: s });
        this.blur();
    }

    $('break-time-m-inp').addEventListener('change', breakTimeChanged);
    $('break-time-s-inp').addEventListener('change', breakTimeChanged);

    // PLAYER DATA

    $('red-points').addEventListener('input', function () {
        setState({
            redPoints: Math.max(parseInt(this.value), 0)
        });
    });

    $('blue-points').addEventListener('input', function () {
        setState({
            bluePoints: Math.max(parseInt(this.value), 0)
        });
    });

    $('red-penalties').addEventListener('input', function () {
        setState({
            redPenalties: Math.min(Math.max(parseInt(this.value), 0), 8)
        });
    });

    $('blue-penalties').addEventListener('input', function () {
        setState({
            bluePenalties: Math.min(Math.max(parseInt(this.value), 0), 8)
        });
    });
}

function playSound(sound) {
    if (sound !== null) {
        new Audio(sound).play();
    }
}

window.addEventListener('beforeunload', function (e) {
    if (state.mode === PAUSED || state.mode === PLAYING) {
        var message = 'A match is in progress!';
        e.returnValue = message;
        return message;
    }
});
