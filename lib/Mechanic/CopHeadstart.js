'use strict';

function CopHeadstart(_merge, _super) {
    _merge('cycle', 'night');
    _merge('round', 0);
    // NOTE Don't use arrow functions
    _merge('onCycleReady', function() {
        if (this.cycle == 'night' && this.round == 0) {
            var ready = true;
            this.players.forEach((p) => {
                if (!p.role.cycleReady) ready = false;
            });
            if (ready) {
                this.clearVotes();
                this.emit(this.cycle + '.end', null);
            }
        } else {
            _super(this, 'onCycleReady');
        }
    });
};

CopHeadstart.class = __filename
module.exports = CopHeadstart;
