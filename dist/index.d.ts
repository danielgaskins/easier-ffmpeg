interface VideoOptions {
    codec?: string;
    bitrate?: string;
    fps?: number;
    fpsMax?: number;
    size?: string;
    aspect?: string;
    crop?: 'none' | 'all' | 'codec' | 'container';
    tune?: string;
    preset?: string;
    pass?: number;
    passlogfile?: string;
}
interface ComplexFilterOptions {
    filtergraph: string;
}
interface FfmpegOptions {
    overwrite?: boolean;
    logLevel?: 'quiet' | 'panic' | 'fatal' | 'error' | 'warning' | 'info' | 'verbose' | 'debug' | 'trace';
    duration?: string;
    seek?: string;
    format?: string;
    metadata?: Record<string, string>;
    map?: string[];
}
export declare class Ffmpeg {
    private args;
    private inputFile?;
    private outputFile?;
    input(file: string): Ffmpeg;
    output(file: string): Ffmpeg;
    videoCodec(codec: string): Ffmpeg;
    videoBitrate(bitrate: string): Ffmpeg;
    videoFps(fps: number): Ffmpeg;
    videoFpsMax(fpsMax: number): Ffmpeg;
    videoSize(size: string): Ffmpeg;
    videoAspect(aspect: string): Ffmpeg;
    videoCrop(crop: VideoOptions['crop']): Ffmpeg;
    videoTune(tune: string): Ffmpeg;
    videoPreset(preset: string): Ffmpeg;
    videoPass(pass: number): Ffmpeg;
    videoPasslogfile(passlogfile: string): Ffmpeg;
    audioCodec(codec: string): Ffmpeg;
    audioBitrate(bitrate: string): Ffmpeg;
    audioSampleRate(sampleRate: number): Ffmpeg;
    audioChannels(channels: number): Ffmpeg;
    subtitleCodec(codec: string): Ffmpeg;
    complexFilter(options: ComplexFilterOptions): Ffmpeg;
    overwrite(overwrite?: boolean): Ffmpeg;
    logLevel(level: FfmpegOptions['logLevel']): Ffmpeg;
    duration(duration: string): Ffmpeg;
    seek(seek: string): Ffmpeg;
    format(format: string): Ffmpeg;
    addMetadata(metadata: Record<string, string>): Ffmpeg;
    addMap(map: string): Ffmpeg;
    addArgument(args: string[]): Ffmpeg;
    concatVideos(inputFiles: string[], outputFile: string): Promise<void>;
    private buildConcatFiltergraph;
    private getVideoDimensions;
    private hasAudioStream;
    run(): Promise<void>;
}
export {};
