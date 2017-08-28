let e = React.createElement;

class Bracket extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            rounds: makeBracket(this.props.players),
            editing: null
        };
    }
    
    // downloadCsv() {
    //     let csv = 'Match ID,Player 1 Name,Player 2 Name,Player 1 Score,Player 1 Points,Player 1 Penalties,Player 2 Score,Player 2 Points,Player 2 Penalties,Winner\n';
        
    //     let rounds = this.state.rounds,
    //         children = [];

    //     let i = 0;
    //     for (let a = 0, round; a < rounds.length; a++) {
    //         round = rounds[a];
    //         for (let n = 0; n < round.length; n++) {
    //             let match = round[n];
    //             let row = '' + i;
                
    //             row += ',' + (getWinner(match.red) || '');
    //             row += ',' + (getWinner(match.blue) || '');
                
    //             let results = match.results;
    //             if (results) {
    //                 row += ',' + ;
    //             }
    //             // TODO: Player 1 Score.
    //             // TODO: Player 1 Points.
    //             // TODO: Player 1 Penalties.
    //             // TODO: Player 2 Score.
    //             // TODO: Player 2 Points.
    //             // TODO: Player 2 Penalties.
    //             // TODO: Winner.
                
    //             csv += row + '\n';
    //             i += 1;
    //         }
    //     }
        
    //     download('matches.csv', csv);
    // }

    render() {
        if (this.state.editing !== null) {
            return e(Editing, {
                initialState: this.state.editing.results,
                onSubmit: results => {
                    this.state.editing.results = results;
                    if (!results) {
                        this.state.editing.winner = null;
                    } else {
                        this.state.editing.winner = results.winner;
                    }
                    // this.forceUpdate();
                    this.setState({ editing: null });
                }
            });
        }

        let height = 80,
            width = 192,
            pad = 16;

        let rounds = this.state.rounds,
            children = [];

        let i = 0;
        for (let a = 0, round; a < rounds.length; a++) {
            round = rounds[a];
            for (let n = 0; n < round.length; n++) {
                let match = round[n],
                    top = (height + pad)*(0.5 * ((1 << a) * ((n * 2) + 1) - 1)),
                    left = (width + 2*pad)*a,
                    luid = Date.now(),
                    // Essentially, that this match is not actually a bye.
                    editable = match.red !== null && match.blue !== null,
                    // That both sides have names attached to them.
                    playable = getWinner(match.red) !== null
                            && getWinner(match.blue) !== null,
                    // JavaScript is evil, I tell you.
                    id = i;

                let init = e => {
                    if (e.origin !== window.location.origin || e.data !== 'match.ready.' + luid)
                        return;

                    window.removeEventListener('message', init);
                    e.source.init({
                        callback: results => {
                            match.results = results;
                            match.winner = results.winner;
                            this.forceUpdate();
                        },

                        redName: getWinner(match.red),
                        blueName: getWinner(match.blue),
                        matchID: '#' + id,

                        numRounds: this.props.numRounds,
                        majority: this.props.majority,
                        judgementSpan: this.props.judgementSpan,

                        sounds: {
                            round: this.props.roundSound
                        },

                        roundDuration: this.props.roundDuration,
                        breakDuration: this.props.breakDuration,

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
                };

                children.push(e('div', {
                    key: id,
                    style: {
                        position: 'absolute',
                        height: height,
                        width: width,
                        top: top,
                        left: left
                    },
                    onContextMenu: e => {
                        if (editable) {
                            this.setState({ editing: match });
                        }
                        e.preventDefault();
                    },
                    onClick: e => {
                        if (playable) {
                            window.addEventListener('message', init);
                            window.open('../match#' + luid, '_blank');
                        }
                    }
                }, e(MatchBox, { match: match })));

                if (round.length !== 1) {
                    children.push(e('div', {
                        key: id + '-before',
                        className: 'line',
                        style: {
                            position: 'absolute',
                            height: 1,
                            width: pad,
                            top: top + height / 2,
                            left: left + width
                        }
                    }));

                    if (n % 2 == 0) {
                        children.push(e('div', {
                            key: id + '-vs',
                            className: 'line',
                            style: {
                                position: 'absolute',
                                height: (height + pad)*(0.5 * (1 << (a + 1))) + 1,
                                width: 1,
                                top: top + height / 2,
                                left: left + width + pad
                            }
                        }));
                    }
                }

                if (a !== 0) {
                    children.push(e('div', {
                        key: id + '-after',
                        className: 'line',
                        style: {
                            position: 'absolute',
                            height: 1,
                            width: pad,
                            top: top + height / 2,
                            left: left - pad
                        }
                    }));
                }

                i += 1;
            }
        }

        let style = {
            position: 'relative',
            width: rounds.length * (width + 2*pad) - pad,
            height: rounds[0].length * (height + pad)
        };

        return e('section', { className: 'bracket' },
            e('section', { style: style }, children));
            //TODO: e('button', { paddingBottom: pad, onClick: () => this.downloadCsv() }, 'Export Results')
    }
}

function MatchBox(props) {
    let match = props.match,
        className = 'match-box';

    if (match.winner === RED || match.winner === BLUE) {
        className += ' complete';
    } else if (getWinner(match.red) === null || getWinner(match.blue) === null) {
        className += ' unready';
    }

    let redScore, blueScore;
    if (match.results) {
        redScore = match.results.red.points + (match.results.blue.penalties >> 1);
        blueScore = match.results.blue.points + (match.results.red.penalties >> 1);
    }

    return e('div', { className: className },
        e(MatchEntry, {
            player: match.red,
            winner: match.winner === RED,
            score: redScore
        }),
        e(MatchEntry, {
            player: match.blue,
            winner: match.winner === BLUE,
            score: blueScore
        }));
}

function MatchEntry(props) {
    let player = props.player;
    let className = 'match-entry', name;

    if (props.winner) {
        className += ' winner';
    }

    if (player === null) {
        className += ' bye';
        name = 'Bye';
    } else {
        player = getWinner(player);
        if (player === null) {
            className += ' pending';
            name = 'Unknown';
        } else {
            name = player;
        }
    }

    return e('div', { className: className },
        e('span', null, name),
        props.score === undefined ? undefined : e('span', null, props.score));
}

class Editing extends React.Component {
    constructor(props) {
        super(props);

        let x = props.initialState || {
            winner: DRAW,
            red:  { points: 0, penalties: 0 },
            blue: { points: 0, penalties: 0 }
        };

        this.state = {
            winner:        x.winner,
            redPoints:     x.red.points,
            redPenalties:  x.red.penalties,
            bluePoints:    x.blue.points,
            bluePenalties: x.blue.penalties
        };
    }

    render() {
        return e('form', {
                className: 'editing-form',
                onSubmit: e => {
                    this.props.onSubmit({
                        winner: this.state.winner,
                        red:  {
                            points: this.state.redPoints,
                            penalties: this.state.redPenalties
                        },
                        blue: {
                            points: this.state.bluePoints,
                            penalties: this.state.bluePenalties
                        }
                    });
                    e.preventDefault();
                }
            },

            e('label', null, 'Red Points',
                e('input', {
                    type: 'number',
                    required: true, min: 0,
                    value: this.state.redPoints,
                    onChange: e => this.setState({
                        redPoints: parseInt(e.target.value)
                    })
                })),
            e('label', null, 'Red Penalties',
                e('input', {
                    type: 'number',
                    required: true, min: 0, max: 8,
                    value: this.state.redPenalties,
                    onChange: e => this.setState({
                        redPenalties: parseInt(e.target.value)
                    })
                })),
            e('label', null, 'Blue Points',
                e('input', {
                    type: 'number',
                    required: true, min: 0,
                    value: this.state.bluePoints,
                    onChange: e => this.setState({
                        bluePoints: parseInt(e.target.value)
                    })
                })),
            e('label', null, 'Blue Penalties',
                e('input', {
                    type: 'number',
                    required: true, min: 0, max: 8,
                    value: this.state.bluePenalties,
                    onChange: e => this.setState({
                        bluePenalties: parseInt(e.target.value)
                    })
                })),

            e('label', null, 'Winner'),
            e('div', { className: 'radio-group' },
                e('label', null,
                    e('input', {
                            type: 'radio',
                            checked: this.state.winner === RED,
                            onClick: e => this.setState({ winner: RED })
                        }), ' Red'),
                e('label', null,
                    e('input', {
                            type: 'radio',
                            checked: this.state.winner === BLUE,
                            onClick: e => this.setState({ winner: BLUE })
                        }), ' Blue'),
                e('label', null,
                    e('input', {
                            type: 'radio',
                            checked: this.state.winner === DRAW,
                            onClick: e => this.setState({ winner: DRAW })
                        }), ' Draw')),

            e('div', { className: 'action-button-group' },
                e('button', {type: 'submit'},
                    'Save'),
                e('button', {
                        type: 'button',
                        onClick: e => this.props.onSubmit(null)
                    },
                    'Clear'),
                e('button', {
                        type: 'button',
                        onClick: e => this.props.onSubmit(this.props.initialState)
                    },
                    'Cancel')));
    }
}
