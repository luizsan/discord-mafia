'use strict';

require('./lib/Options')({'': [(process.env.MAFIA_DATA_DIR || process.env.OPENSHIFT_DATA_DIR || '.') + '/options.json']});
require('./lib/Client').run();
