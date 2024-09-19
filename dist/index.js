"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Ffmpeg = void 0;
const child_process_1 = require("child_process");
class Ffmpeg {
    constructor() {
        this.args = [];
    }
    input(file) {
        this.inputFile = file;
        this.args.push('-i', file);
        return this;
    }
    output(file) {
        this.outputFile = file;
        this.args.push(file);
        return this;
    }
    videoCodec(codec) {
        this.args.push('-c:v', codec);
        return this;
    }
    videoBitrate(bitrate) {
        this.args.push('-b:v', bitrate);
        return this;
    }
    videoFps(fps) {
        this.args.push('-r', fps.toString());
        return this;
    }
    videoFpsMax(fpsMax) {
        this.args.push('-fpsmax', fpsMax.toString());
        return this;
    }
    videoSize(size) {
        this.args.push('-s', size);
        return this;
    }
    videoAspect(aspect) {
        this.args.push('-aspect', aspect);
        return this;
    }
    videoCrop(crop) {
        if (crop) {
            this.args.push('-apply_cropping', crop);
        }
        return this;
    }
    videoTune(tune) {
        this.args.push('-tune', tune);
        return this;
    }
    videoPreset(preset) {
        this.args.push('-preset', preset);
        return this;
    }
    videoPass(pass) {
        this.args.push('-pass', pass.toString());
        return this;
    }
    videoPasslogfile(passlogfile) {
        this.args.push('-passlogfile', passlogfile);
        return this;
    }
    audioCodec(codec) {
        this.args.push('-c:a', codec);
        return this;
    }
    audioBitrate(bitrate) {
        this.args.push('-b:a', bitrate);
        return this;
    }
    audioSampleRate(sampleRate) {
        this.args.push('-ar', sampleRate.toString());
        return this;
    }
    audioChannels(channels) {
        this.args.push('-ac', channels.toString());
        return this;
    }
    subtitleCodec(codec) {
        this.args.push('-c:s', codec);
        return this;
    }
    complexFilter(options) {
        this.args.push('-filter_complex', options.filtergraph);
        return this;
    }
    overwrite(overwrite = true) {
        this.args.push(overwrite ? '-y' : '-n');
        return this;
    }
    logLevel(level) {
        if (level) {
            this.args.push('-loglevel', level);
        }
        return this;
    }
    duration(duration) {
        this.args.push('-t', duration);
        return this;
    }
    seek(seek) {
        this.args.push('-ss', seek);
        return this;
    }
    format(format) {
        this.args.push('-f', format);
        return this;
    }
    addMetadata(metadata) {
        for (const key in metadata) {
            this.args.push('-metadata', `${key}=${metadata[key]}`);
        }
        return this;
    }
    addMap(map) {
        this.args.push('-map', map);
        return this;
    }
    addArgument(args) {
        args.forEach(arg => {
            this.args.push(arg);
        });
        return this;
    }
    concatVideos(inputFiles, outputFile) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // 1. Get video dimensions of all input files
                const dimensionPromises = inputFiles.map(file => this.getVideoDimensions(file));
                const dimensions = yield Promise.all(dimensionPromises);
                // 2. Find maximum width and height
                const maxWidth = Math.max(...dimensions.map(d => d.width));
                const maxHeight = Math.max(...dimensions.map(d => d.height));
                // 3. Create the complex filtergraph for scaling and padding
                const filtergraph = this.buildConcatFiltergraph(inputFiles, maxWidth, maxHeight);
                // 4. Run ffmpeg with multiple inputs and concatenation filter
                const ffmpeg = new Ffmpeg()
                    .logLevel('info');
                for (const file of inputFiles) {
                    ffmpeg.input(file);
                }
                ffmpeg.complexFilter({ filtergraph })
                    .videoCodec('libx264')
                    .videoFps(30)
                    .addMap('[outv]') // Map the filter output
                    .output(outputFile)
                    .overwrite();
                yield ffmpeg.run();
                console.log('Concatenation complete!');
            }
            catch (error) {
                console.error('Concatenation failed:', error);
            }
        });
    }
    buildConcatFiltergraph(inputFiles, maxWidth, maxHeight) {
        let filtergraph = '';
        // Create a filter chain for each input video
        for (let i = 0; i < inputFiles.length; i++) {
            filtergraph += `[${i}:v]scale=${maxWidth}:${maxHeight}:force_original_aspect_ratio=decrease,pad=${maxWidth}:${maxHeight}:(ow-iw)/2:(oh-ih)/2,setsar=1[v${i}];`;
        }
        // Concatenate all scaled and padded videos
        filtergraph += `[v0]`;
        for (let i = 1; i < inputFiles.length; i++) {
            filtergraph += `[v${i}]`;
        }
        filtergraph += `concat=n=${inputFiles.length}:v=1[outv]`; // No audio in concat
        return filtergraph;
    }
    getVideoDimensions(file) {
        return new Promise((resolve, reject) => {
            const ffprobeProcess = (0, child_process_1.spawn)('ffprobe', [
                '-v', 'error',
                '-select_streams', 'v:0',
                '-show_entries', 'stream=width,height',
                '-of', 'csv=s=x:p=0',
                file,
            ]);
            let output = '';
            ffprobeProcess.stdout.on('data', (data) => {
                output += data.toString();
            });
            ffprobeProcess.on('close', (code) => {
                if (code === 0) {
                    const [width, height] = output.trim().split('x').map(Number);
                    resolve({ width, height });
                }
                else {
                    reject(new Error(`ffprobe exited with code ${code}`));
                }
            });
        });
    }
    hasAudioStream(file) {
        return new Promise((resolve, reject) => {
            const ffprobeProcess = (0, child_process_1.spawn)('ffprobe', [
                '-v', 'error',
                '-show_streams',
                '-select_streams', 'a', // Select audio streams
                '-of', 'compact=p=0:nk=1', // Output format: stream count
                file,
            ]);
            ffprobeProcess.on('close', (code) => {
                if (code === 0) {
                    resolve(true); // Has audio stream
                }
                else {
                    resolve(false); // No audio stream
                }
            });
            ffprobeProcess.on('error', (error) => {
                reject(error);
            });
        });
    }
    run() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.inputFile) {
                throw new Error('Input file not specified. Use .input(file) method.');
            }
            if (!this.outputFile) {
                throw new Error('Output file not specified. Use .output(file) method.');
            }
            return new Promise((resolve, reject) => {
                const process = (0, child_process_1.spawn)('ffmpeg', this.args);
                process.stdout.on('data', (data) => {
                    console.log(`ffmpeg: ${data.toString()}`);
                });
                process.stderr.on('data', (data) => {
                    console.error(`ffmpeg: ${data.toString()}`);
                });
                process.on('close', (code) => {
                    if (code === 0) {
                        resolve();
                    }
                    else {
                        reject(new Error(`ffmpeg exited with code ${code}`));
                    }
                });
            });
        });
    }
}
exports.Ffmpeg = Ffmpeg;
