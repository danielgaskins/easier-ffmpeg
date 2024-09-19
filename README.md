# EasierFFmpeg

A simple and intuitive Node.js wrapper for ffmpeg, making it easy to perform video and audio processing tasks.

## Installation

```bash
npm i easier-ffmpeg
```

## Usage
```typescript
import { Ffmpeg } from 'easier-ffmpeg';

// Create an Ffmpeg instance
const ffmpeg = new Ffmpeg();

// Basic conversion
ffmpeg.input('input.avi')
  .videoCodec('libx264')
  .audioCodec('aac')
  .output('output.mp4')
  .overwrite() // Overwrite output file if it exists
  .logLevel('info')
  .run()
  .then(() => console.log('Conversion complete!'))
  .catch(error => console.error('Conversion failed:', error));

// Concatenate videos (scaling and padding to match largest dimensions)
const inputFiles = ['video1.mp4', 'video2.avi', 'video3.mov'];
const outputFile = 'concatenated_video.mp4';

ffmpeg.concatVideos(inputFiles, outputFile)
  .then(() => console.log('Concatenation complete!'))
  .catch(error => console.error('Concatenation failed:', error));

// More examples...
```

## Methods
- input(file: string): Sets the input file.
- output(file: string): Sets the output file.
- videoCodec(codec: string): Sets the video codec.
- videoBitrate(bitrate: string): Sets the video bitrate.
- videoFps(fps: number): Sets the video frames per second.
- videoFpsMax(fpsMax: number): Sets the maximum video frames per second.
- videoSize(size: string): Sets the video size (e.g., '1280x720').
- videoAspect(aspect: string): Sets the video aspect ratio (e.g., '16:9').
- videoCrop(crop: 'none' | 'all' | 'codec' | 'container'): Applies cropping based on metadata.
- videoTune(tune: string): Sets the video tuning algorithm (e.g., 'film', 'animation').
- videoPreset(preset: string): Sets the video encoding preset (e.g., 'ultrafast', 'medium').
- videoPass(pass: number): Specifies the pass number for two-pass encoding.
- videoPasslogfile(passlogfile: string): Sets the prefix for the two-pass log file.
- audioCodec(codec: string): Sets the audio codec.
- audioBitrate(bitrate: string): Sets the audio bitrate.
- audioSampleRate(sampleRate: number): Sets the audio sample rate.
- audioChannels(channels: number): Sets the number of audio channels.
- subtitleCodec(codec: string): Sets the subtitle codec.
- complexFilter(options: ComplexFilterOptions): Adds a complex filtergraph.
- overwrite(overwrite = true): Sets whether to overwrite the output file if it exists.
- logLevel(level: 'quiet' | 'panic' | 'fatal' | 'error' | 'warning' | 'info' | 'verbose' | 'debug' | 'trace'): Sets the logging level.
- duration(duration: string): Sets the duration of the output media.
- seek(seek: string): Starts encoding from a specific time position.
- format(format: string): Forces the output format.
- addMetadata(metadata: Record<string, string>): Adds metadata key-value pairs to the output file.
- addMap(map: string): Manually controls stream selection.
- addArgument(args: string[]): Allows the user to pass an arbitrary argument array e.g. Array("-vsync", "-1")
- concatVideos(inputFiles: string[], outputFile: string): Concatenates videos, scaling and padding them to the same dimensions. Be careful, running this will call "run" internally. 
- run(): Executes the ffmpeg command with the configured options. Returns a promise.

## Interfaces
- VideoOptions: Options for video encoding.
- AudioOptions: Options for audio encoding.
- SubtitleOptions: Options for subtitles.
- ComplexFilterOptions: Options for complex filtergraphs.
- FfmpegOptions: General ffmpeg options.

## Notes
This wrapper currently exposes a subset of ffmpeg's functionality. More options and methods will be added in the future. Feel free to make your own pull requests.
Refer to the ffmpeg documentation for more details about the available options and their usage: https://ffmpeg.org/ffmpeg.html

## License
ISC
