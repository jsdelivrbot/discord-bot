

class StreamManager {
	constructor(player) {
		this.player = player
	}
    // streamPlayer main event handler after a StreamDispatcher is created
    handleStream({ player, info, readable, timer }) {
        this.bot.user.setGame(info.title, 'https://b.com');

        player.once('start', () => { // if start takes too long, throw an error
            // maybe kill timeout here
            this._handleStart({ info, timer });
        })
            .once('end', reason => {
                this._handleEnd({ info, reason });
            })
            .once('debug', debug => this.bot.log(`streamPlayer debug: ${debug}`))
            .once('error', this.bot.log);
    }

    // streamPlayer start event handler
    handleStart({ info, timer }) {
        this.bot.log(`Play: ${info.title} --- ${((now() - timer) / 1000).toFixed(2)}s`);
        this.emit('play', info);
    }

    /** 
	 * streamPlayer end event handler
	 * 
	 */
    handleEnd({ info, reason }) {
        // case 1: user uses play command with query, case 2: user uses play command with no query, case 3: next from queue, case 4: repeat
        if (this.repeat && !this.explicitPlay) {
            this.queue.unshift({ info });
        } else if (this.queue.length === 0) {
            this._reset();
        }

        this.bot.log(`Stop: ${info.title}\nReason: ${reason || 'End of audio'}`);
        this.emit('stop', info);
    }
}

module.exports = StreamManager;