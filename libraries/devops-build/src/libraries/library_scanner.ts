import { TrackerProcess } from '../tracking/tracker_process';

export class LibraryScanner extends TrackerProcess {
    constructor(public glob: string, public libraryTracker: LibraryTracker) {
        super();
    }

    start() {
        super.start();
    }

    createTracker() {

    }
}

// create a watch (or run once)
// create target
// wire connection