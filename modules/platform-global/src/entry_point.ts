import { FeatureReference } from './features/feature_reference';
import { Feature } from './features/feature';
import { traverse } from './traverse';

export class RootFeature extends Feature {
    constructor(public entryPoint: EntryPoint) {
        super();
    }

    /**
     * Start the application.
     */
    async startAsync(): Promise<void> {
        await this.wireFeature(this);
        await rootFeature.modifiedAsync(this.entryPoint);
    }

    /**
     * In larger enterprise systems, managing configuration across numerous entry points may require some amount of centralization.
     * Additionally, dynamically loaded capabilities may bring their own configuration and feature baggage.
     * For example, perhaps there is an angular shared kernel that is shared across many apps.
     * Setting up this configuration is often opinionated and changes based on a variety of bundling scenarios and architectural philosophies.
     * While this configuration could be statically referenced in every endpoint, it would cause our build to traverse all angular, the bootstrapped module, and all their dependencies.
     * This method handles dynamically adding features and rewiring the entire feature tree.
     */
    addFeatures(featureReferences: FeatureReference[]) {
        for (let featureReference of featureReferences) {
            let feature = featureReference.findFeature();
            rootFeature.addDependency(feature);
        }
        this.wireFeature(rootFeature);
        // if (this._started)
        //     await rootFeature.modifiedAsync(this.entryPoint);
    }

    protected wireFeature(feature: Feature) {
        // Flatten and check for cyclical
        let features: Feature[] = [];
        traverse(feature, f => f.dependencies, f => features.push(f));
        this._checkFeatureDependencies(features);
    }

    private _checkFeatureDependencies(features: Feature[]) {
        let ind = features.length - 1;
        // We only order the list to wire up dependencies and perform a cyclical check.  Once wired, awaiting tasks from the root is the most optimal async pattern.
        while (ind > 0) {
            for (let pos = 0; pos < features.length; pos++) { // Still go to full length to ensure dependsOn always gets called.
                let tries = 0;
                if (this._checkRuntimeDependency(features[pos], features[ind])) {
                    if (pos < ind)
                        features.splice(pos--, 0, features.splice(ind, 1)[0]);
                    if (++tries > features.length * 2)
                        throw new Error('Cyclical runtime dependencies in features.');
                }
            }
            ind--;
        }
    }

    private _checkRuntimeDependency(parent: Feature, child: Feature): boolean {
        if (!parent.dependsOn(child))
            return false;
        parent.addDependency(child);
        return true;
    }

}

export let rootFeature: RootFeature;

export class EntryPoint extends FeatureReference {
    constructor() {
        super(RootFeature);
        FeatureReference.setFactory(RootFeature, () => new RootFeature(this));
    }

    async startAsync(): Promise<void> {
        if (rootFeature)
            throw new Error('Already started');
        rootFeature = <RootFeature>this.findFeature();
        return rootFeature.startAsync();
    }
}
