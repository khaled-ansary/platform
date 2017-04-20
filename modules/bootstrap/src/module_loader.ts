/// <reference path="./dependency.ts" />

namespace __sharpangles {
    /**
     * Implements a mechanism to track the loading of dependencies.
     */
    export abstract class ModuleLoader<TModuleLoaderConfig> {
        abstract registerDependencies(dependencies: { [key: string]: Dependency<TModuleLoaderConfig> }): void;
        abstract loadModuleAsync(moduleName: string): Promise<any>;

        /**
         * Ensures every module queued at the time of the call is loaded.
         */
        abstract ensureAllLoadedAsync(): Promise<void>;
    }
}
