class TournamentForm extends React.Component {
    render() {
        let props = this.props;

        return e('form', {
                className: 'config-form',
                onSubmit: e => {
                    props.onSubmit();
                    e.preventDefault();
                }
            },

            e('h1', null, 'Taekwondo Tournament Manager '),
            e('p', null, 'Click to start match, right-click to input scores.'),

            e('label',
                {
                    className: 'hinted',
                    title: 'The title of the tournament.'
                },
                'Title',
                e('input', {
                    type: 'text',
                    autoFocus: true,
                    required: true, min: 1,
                    value: props.title,
                    onChange: e => props.onTitle(e.target.value)
                })),

            e('label',
                {
                    className: 'hinted',
                    title: 'The number of rounds in each match.'
                },
                'Rounds',
                e('input', {
                    type: 'number',
                    required: true, min: 1,
                    value: props.numRounds,
                    onChange: e => props.onNumRounds(parseInt(e.target.value))
                })),

            e('label',
                {
                    className: 'hinted',
                    title: 'The number of judges that need to agree on a point for it to count.'
                },
                'Judge Threshold',
                e('input', {
                    type: 'number',
                    required: true, min: 1, max: 4,
                    value: props.majority,
                    onChange: e => props.onMajority(parseInt(e.target.value))
                })),

            e('label',
                {
                    className: 'hinted',
                    title: 'The maximum amount of time over which a judgement can be made.'
                },
                'Judgement Span (Milliseconds)',
                e('input', {
                    type: 'number',
                    required: true, min: 0,
                    value: props.judgementSpan,
                    onChange: e => props.onJudgementSpan(parseInt(e.target.value))
                })),

            e('label',
                {
                    className: 'hinted',
                    title: 'The length of each round in a match.'
                },
                'Round Length (Seconds)',
                e('input', {
                    type: 'number',
                    required: true, min: 0,
                    value: props.roundDuration,
                    onChange: e => props.onRoundDuration(parseInt(e.target.value))
                })),

            e('label',
                {
                    className: 'hinted',
                    title: 'The allotted break time after each round.'
                },
                'Break Length (Seconds)',
                e('input', {
                    type: 'number',
                    required: true, min: 0,
                    value: props.breakDuration,
                    onChange: e => props.onBreakDuration(parseInt(e.target.value))
                })),

            e('label',
                {
                    className: 'hinted',
                    title: 'The match ID of the first match. This will be the smallest match ID in the tournament.'
                },
                'First Match ID',
                e('input', {
                    type: 'number',
                    required: true, min: 0,
                    value: props.firstMatchID,
                    onChange: e => props.onFirstMatchID(parseInt(e.target.value))
                })),

            e('label',
                {
                    className: 'hinted',
                    title: 'The sound played at the end of each round.'
                },
                'Custom Round Buzzer (Optional)',
                e('input', {
                    type: 'file',
                    accept: 'audio/*',
                    onChange: e => {
                        let file = e.target.files[0];
                        if (file) {
                            props.onRoundSound(URL.createObjectURL(file));
                        } else {
                            props.onRoundSound('buzzer.mp3');
                        }
                    }
                })),

            e('textarea', {
                placeholder: 'Players, each on a separate line. \n\nIf the players are given in the same order, the bracket will be exactly the same.',
                required: true,

                onChange: e => {
                    if (e.target.value.trim() === '') {
                        setValidity(
                            e.target,
                            'At least one player required.'
                        );
                    } else {
                        clearValidity(e.target);
                    }

                    props.onPlayers(
                        e.target.value
                            .trim()
                            .split('\n')
                            .map(x => x.trim())
                            .filter(x => !!x));
                },
                
                ref: x => this.playerArea = x,
                onBlur: e => this.playerArea.value = props.players.join('\n')
            }),

            e('div', { className: 'action-button-group' },
                e('button', {
                        type: 'button',
                        onClick: e => {
                            props.onPlayers(shuffle(props.players));
                            this.playerArea.value = props.players.join('\n');
                        }
                    },
                    'Shuffle Players'),
                e('button', { type: 'submit' },
                    'Start Tournament')));
    }
}
