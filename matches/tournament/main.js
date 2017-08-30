class Main extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            configuring: true,

            numRounds: 3,
            majority: 3,
            judgementSpan: 600,
            roundDuration: 90,
            breakDuration: 60,
            firstMatchID: 0,

            roundSound: 'buzzer.mp3',

            players: []
        };
    }

    render() {
        if (this.state.configuring) {
            return e(TournamentForm, {
                numRounds:     this.state.numRounds,
                majority:      this.state.majority,
                judgementSpan: this.state.judgementSpan,
                roundDuration: this.state.roundDuration,
                breakDuration: this.state.breakDuration,
                players:       this.state.players,
                firstMatchID: this.state.firstMatchID,
                onNumRounds:     x => this.setState({ numRounds: x }),
                onMajority:      x => this.setState({ majority: x }),
                onJudgementSpan: x => this.setState({ judgementSpan: x }),
                onRoundDuration: x => this.setState({ roundDuration: x }),
                onRoundSound:    x => this.setState({ roundSound: x }),
                onBreakDuration: x => this.setState({ breakDuration: x }),
                onFirstMatchID: x => this.setState({ firstMatchID: x }),
                onPlayers:       x => this.setState({ players: x }),
                onSubmit: () => this.setState({ configuring: false })
            });
        }

        return e(Bracket, {
            players: this.state.players,
            roundSound:    this.state.roundSound,
            numRounds:     this.state.numRounds,
            majority:      this.state.majority,
            judgementSpan: this.state.judgementSpan,
            roundDuration: this.state.roundDuration,
            breakDuration: this.state.breakDuration,
            firstMatchID: this.state.firstMatchID
        });
    }
}

document.addEventListener('DOMContentLoaded', function () {
    ReactDOM.render(e(Main, null), document.getElementById('main'));
});
