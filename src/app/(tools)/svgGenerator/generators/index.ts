/**
 * Generator Index - Exports and registers all available generators
 */

// Core generators
export { BlobGenerator, blobGenerator } from './blob';
export { WaveGenerator } from './wave';
export { CurvesGenerator, curvesGenerator } from './curves';
export { BlurryGradientGenerator } from './blurryGradient';

// Scatter generators
export { BlobScatterGenerator } from './blobScatter';
export { CircleScatterGenerator } from './circleScatter';
export { PolygonScatterGenerator } from './polygonScatter';
export { SymbolScatterGenerator } from './symbolScatter';

// Wave generators
export { LayeredWavesGenerator } from './layeredWaves';
export { StackedWavesGenerator } from './stackedWaves';

// Scene generators
export { BlobSceneGenerator } from './blobScene';
export { LowPolyGridGenerator } from './lowPolyGrid';
export { LayeredPeaksGenerator } from './layeredPeaks';
export { StackedPeaksGenerator } from './stackedPeaks';
export { LayeredStepsGenerator } from './layeredSteps';
export { StackedStepsGenerator } from './stackedSteps';

// Register all generators at module load time
import { registerGenerator } from './BaseGenerator';
import { blobGenerator } from './blob';
import { WaveGenerator } from './wave';
import { CurvesGenerator } from './curves';
import { BlurryGradientGenerator } from './blurryGradient';
import { BlobScatterGenerator } from './blobScatter';
import { CircleScatterGenerator } from './circleScatter';
import { PolygonScatterGenerator } from './polygonScatter';
import { SymbolScatterGenerator } from './symbolScatter';
import { LayeredWavesGenerator } from './layeredWaves';
import { StackedWavesGenerator } from './stackedWaves';
import { BlobSceneGenerator } from './blobScene';
import { LowPolyGridGenerator } from './lowPolyGrid';
import { LayeredPeaksGenerator } from './layeredPeaks';
import { StackedPeaksGenerator } from './stackedPeaks';
import { LayeredStepsGenerator } from './layeredSteps';
import { StackedStepsGenerator } from './stackedSteps';

// Register all generators
registerGenerator(blobGenerator);
registerGenerator(new WaveGenerator());
registerGenerator(new CurvesGenerator());
registerGenerator(new BlurryGradientGenerator());
registerGenerator(new BlobScatterGenerator());
registerGenerator(new CircleScatterGenerator());
registerGenerator(new PolygonScatterGenerator());
registerGenerator(new SymbolScatterGenerator());
registerGenerator(new LayeredWavesGenerator());
registerGenerator(new StackedWavesGenerator());
registerGenerator(new BlobSceneGenerator());
registerGenerator(new LowPolyGridGenerator());
registerGenerator(new LayeredPeaksGenerator());
registerGenerator(new StackedPeaksGenerator());
registerGenerator(new LayeredStepsGenerator());
registerGenerator(new StackedStepsGenerator());
