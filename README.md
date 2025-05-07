# XLive-Tools-Electron
Electron (and webapp) tool to analyse the contents of an SD card to support directly running ffmpeg to extract your recorded X-Live sessions as fast as possible

Current features include:
- Automatically listing all sessions in a given folder and decoding the available metadata
- Ability to select which channels to extract
- Generating an ffmpeg command that works on windows or unix systems

Unfinished features:
- Generating individual file names based on an X32 .scn file
- Allowing to set stereo pairing for exported files
- Extracting stereo linking data from .scn file to automatically assign to exported channels

Distant future roadmap:
- Creating an ableton live set with already populated channels

## ffmpeg command primer
Main option docs including -f and -i flags [here](https://ffmpeg.org/ffmpeg.html#Main-options])\
Concat format and list.txt format docs [here](https://ffmpeg.org/ffmpeg-formats.html#concat-1)

- `ffmpeg` start of command
- `-f concat` forces the input format to 'concat'
- `-safe 0` disables checking for 'safe' filepath (let's you include non-relative filepaths)
- `-i list.txt` location of concat list file (can also use bash process substitution instead of a list file on disk using `<(echo "...");` instead of list.txt)
- `-af "pan=mono|c0=c<0-31>"`
- `-af "pan=stereo|c0=c<0-31>"|c1=c<0-31>"`
- `-acodec pcm_s32le`
- `-acodec libmp3lame -b:a 320k`
- `"<output location>/n.wav"` output the specified channel unmodified to the related file, you can use multiple `-map_channel` flags before the output file to create a stereo track for example

### list.txt definition
Every line must contain only one directive (file or otherwise)\
`file './X_LIVE/596A5051/00000001.WAV'`\
`file './X_LIVE/596A5051/00000002.WAV'`\
Only single quotes and backslash as excape char can be used