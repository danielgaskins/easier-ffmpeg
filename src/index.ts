import { spawn } from 'child_process';
import fs from 'fs';
import os from 'os';
import path from 'path';

interface VideoOptions {
  codec?: string;
  bitrate?: string;
  fps?: number;
  fpsMax?: number;
  size?: string;
  aspect?: string;
  crop?: 'none' | 'all' | 'codec' | 'container';
  tune?: string; // Add video tune option
  preset?: string; // Add video preset option
  pass?: number; // Add video pass option
  passlogfile?: string; // Add video passlogfile option
}

interface AudioOptions {
  codec?: string;
  bitrate?: string;
  sampleRate?: number;
  channels?: number;
}

interface SubtitleOptions {
  codec?: string;
}

interface ComplexFilterOptions {
  filtergraph: string;
}

interface FfmpegOptions {
  overwrite?: boolean;
  logLevel?: 'quiet' | 'panic' | 'fatal' | 'error' | 'warning' | 'info' | 'verbose' | 'debug' | 'trace';
  duration?: string; // Add duration option
  seek?: string; // Add seek option
  format?: string; // Add format option
  metadata?: Record<string, string>; // Add metadata option
  map?: string[]; // Add map option
}

export class Ffmpeg {
  private args: string[] = [];
  private inputFile?: string;
  private outputFile?: string;

  input(file: string): Ffmpeg {
    this.inputFile = file;
    this.args.push('-i', file);
    return this;
  }

  output(file: string): Ffmpeg {
    this.outputFile = file;
    this.args.push(file);
    return this;
  }

  videoCodec(codec: string): Ffmpeg {
    this.args.push('-c:v', codec);
    return this;
  }

  videoBitrate(bitrate: string): Ffmpeg {
    this.args.push('-b:v', bitrate);
    return this;
  }

  videoFps(fps: number): Ffmpeg {
    this.args.push('-r', fps.toString());
    return this;
  }

  videoFpsMax(fpsMax: number): Ffmpeg {
    this.args.push('-fpsmax', fpsMax.toString());
    return this;
  }

  videoSize(size: string): Ffmpeg {
    this.args.push('-s', size);
    return this;
  }

  videoAspect(aspect: string): Ffmpeg {
    this.args.push('-aspect', aspect);
    return this;
  }

  videoCrop(crop: VideoOptions['crop']): Ffmpeg {
    if (crop) {
      this.args.push('-apply_cropping', crop);
    }
    return this;
  }

  videoTune(tune: string): Ffmpeg {
    this.args.push('-tune', tune);
    return this;
  }

  videoPreset(preset: string): Ffmpeg {
    this.args.push('-preset', preset);
    return this;
  }

  videoPass(pass: number): Ffmpeg {
    this.args.push('-pass', pass.toString());
    return this;
  }

  videoPasslogfile(passlogfile: string): Ffmpeg {
    this.args.push('-passlogfile', passlogfile);
    return this;
  }

  audioCodec(codec: string): Ffmpeg {
    this.args.push('-c:a', codec);
    return this;
  }

  audioBitrate(bitrate: string): Ffmpeg {
    this.args.push('-b:a', bitrate);
    return this;
  }

  audioSampleRate(sampleRate: number): Ffmpeg {
    this.args.push('-ar', sampleRate.toString());
    return this;
  }

  audioChannels(channels: number): Ffmpeg {
    this.args.push('-ac', channels.toString());
    return this;
  }

  subtitleCodec(codec: string): Ffmpeg {
    this.args.push('-c:s', codec);
    return this;
  }

  complexFilter(options: ComplexFilterOptions): Ffmpeg {
    this.args.push('-filter_complex', options.filtergraph);
    return this;
  }

  overwrite(overwrite = true): Ffmpeg {
    this.args.push(overwrite ? '-y' : '-n');
    return this;
  }

  logLevel(level: FfmpegOptions['logLevel']): Ffmpeg {
    if (level) {
      this.args.push('-loglevel', level);
    }
    return this;
  }

  duration(duration: string): Ffmpeg {
    this.args.push('-t', duration);
    return this;
  }

  seek(seek: string): Ffmpeg {
    this.args.push('-ss', seek);
    return this;
  }

  format(format: string): Ffmpeg {
    this.args.push('-f', format);
    return this;
  }

  addMetadata(metadata: Record<string, string>): Ffmpeg {
    for (const key in metadata) {
      this.args.push('-metadata', `${key}=${metadata[key]}`);
    }
    return this;
  }

  addMap(map: string): Ffmpeg {
    this.args.push('-map', map);
    return this;
  }

  addArgument(args: string[]): Ffmpeg {
    args.forEach(arg=>{
        this.args.push(arg);
    });
    return this;
  }

  async concatVideos(inputFiles: string[], outputFile: string): Promise<void> {
    try {
      // 1. Get video dimensions of all input files
      const dimensionPromises = inputFiles.map(file => this.getVideoDimensions(file));
      const dimensions = await Promise.all(dimensionPromises);

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
      .addMap('[outv]')  // Map the filter output
      .output(outputFile)
      .overwrite();

    await ffmpeg.run();

      console.log('Concatenation complete!');
    } catch (error) {
      console.error('Concatenation failed:', error);
    }
  }

  private buildConcatFiltergraph(
    inputFiles: string[],
    maxWidth: number,
    maxHeight: number,
  ): string {
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


  private getVideoDimensions(file: string): Promise<{ width: number; height: number }> {
    return new Promise((resolve, reject) => {
      const ffprobeProcess = spawn('ffprobe', [
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
        } else {
          reject(new Error(`ffprobe exited with code ${code}`));
        }
      });
    });
  }

  private hasAudioStream(file: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const ffprobeProcess = spawn('ffprobe', [
        '-v', 'error',
        '-show_streams',
        '-select_streams', 'a', // Select audio streams
        '-of', 'compact=p=0:nk=1', // Output format: stream count
        file,
      ]);

      ffprobeProcess.on('close', (code) => {
        if (code === 0) {
          resolve(true); // Has audio stream
        } else {
          resolve(false); // No audio stream
        }
      });

      ffprobeProcess.on('error', (error) => {
        reject(error);
      });
    });
  }
  
  async run(): Promise<void> {
    if (!this.inputFile) {
      throw new Error('Input file not specified. Use .input(file) method.');
    }

    if (!this.outputFile) {
      throw new Error('Output file not specified. Use .output(file) method.');
    }

    return new Promise((resolve, reject) => {
      const process = spawn('ffmpeg', this.args);

      process.stdout.on('data', (data) => {
        console.log(`ffmpeg: ${data.toString()}`);
      });

      process.stderr.on('data', (data) => {
        console.error(`ffmpeg: ${data.toString()}`);
      });

      process.on('close', (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`ffmpeg exited with code ${code}`));
        }
      });
    });
  }
}