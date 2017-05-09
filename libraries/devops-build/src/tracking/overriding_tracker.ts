import { TrackerProcess } from './tracker_process';
import { MutexTracker } from './mutex_tracker';

/**
 * A tracker that cancels any existing process when triggered.
 */
export abstract class OverridingTracker<TProcess extends TrackerProcess<TProgress, TError> = TrackerProcess<TProgress, TError>, TConfig = any, TProgress = any, TError = any> extends MutexTracker<TProcess, TConfig, TProgress, TError> {
    protected startProcess(trackerProcess: TProcess) {
        if (this.activeProcess)
            this.activeProcess.cancelAsync();
        super.startProcess(trackerProcess);
    }
}