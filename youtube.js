const cp = require("child_process");
const readline = require("readline");
const ytdl = require("ytdl-core");
const ffmpeg = require("ffmpeg-static");
const { Blob } = require("buffer");

const DownloadYT = (url) => {
  console.log("MASUK DOWNLOAD YT");
  return new Promise((resolve, reject) => {
    const tracker = {
      start: Date.now(),
      audio: { downloaded: 0, total: Infinity },
      video: { downloaded: 0, total: Infinity },
      merged: { frame: 0, speed: "0x", fps: 0 },
    };

    const audio = ytdl(url, { quality: "highestaudio" }).on(
      "progress",
      (_, downloaded, total) => {
        tracker.audio = { downloaded, total };
      }
    );

    const video = ytdl(url, { quality: "highestvideo" }).on(
      "progress",
      (_, downloaded, total) => {
        tracker.video = { downloaded, total };
      }
    );

    let progressbarHandle = null;
    const progressbarInterval = 1000;
    const showProgress = () => {
      readline.cursorTo(process.stdout, 0);
      const toMB = (i) => (i / 1024 / 1024).toFixed(2);

      process.stdout.write(
        `Audio  | ${(
          (tracker.audio.downloaded / tracker.audio.total) *
          100
        ).toFixed(2)}% processed `
      );
      process.stdout.write(
        `(${toMB(tracker.audio.downloaded)}MB of ${toMB(
          tracker.audio.total
        )}MB).${" ".repeat(10)}\n`
      );

      process.stdout.write(
        `Video  | ${(
          (tracker.video.downloaded / tracker.video.total) *
          100
        ).toFixed(2)}% processed `
      );
      process.stdout.write(
        `(${toMB(tracker.video.downloaded)}MB of ${toMB(
          tracker.video.total
        )}MB).${" ".repeat(10)}\n`
      );

      process.stdout.write(
        `Merged | processing frame ${tracker.merged.frame} `
      );
      process.stdout.write(
        `(at ${tracker.merged.fps} fps => ${tracker.merged.speed}).${" ".repeat(
          10
        )}\n`
      );

      process.stdout.write(
        `running for: ${((Date.now() - tracker.start) / 1000 / 60).toFixed(
          2
        )} Minutes.`
      );
      readline.moveCursor(process.stdout, 0, -3);
    };

    const getTitle = async () => {
      const videoInfo = await ytdl.getBasicInfo(url);
      const title = videoInfo.player_response.videoDetails.title.replace(
        /[^\x00-\x7F]/g,
        ""
      );
      return title;
    };

    const ffmpegArgs = [
      "-loglevel",
      "8",
      "-hide_banner",
      "-progress",
      "pipe:2",
      "-i",
      "pipe:3",
      "-i",
      "pipe:4",
      "-map",
      "0:a",
      "-map",
      "1:v",
      "-c:v",
      "copy",
      // Output to stdout
      "pipe:1",
    ];

    const ffmpegProcess = cp.spawn(ffmpeg, ffmpegArgs, {
      windowsHide: true,
      stdio: ["inherit", "pipe", "pipe", "pipe", "pipe"],
    });

    let ffmpegOutput = Buffer.alloc(0);

    ffmpegProcess.stdout.on("data", (chunk) => {
      ffmpegOutput = Buffer.concat([ffmpegOutput, chunk]);
    });

    ffmpegProcess.on("close", () => {
      const videoBlob = new Blob([ffmpegOutput], { type: "video/mp4" });
      const videoUrl = URL.createObjectURL(videoBlob);
      console.log("Video URL:", videoUrl);

      clearInterval(progressbarHandle);
      resolve(videoUrl);
    });

    ffmpegProcess.stdio[2].on("data", (chunk) => {
      if (!progressbarHandle)
        progressbarHandle = setInterval(showProgress, progressbarInterval);

      const lines = chunk.toString().trim().split("\n");
      const args = {};
      for (const l of lines) {
        const [key, value] = l.split("=");
        args[key.trim()] = value.trim();
      }
      tracker.merged = args;
    });

    if (ffmpegProcess.stdio[3] && ffmpegProcess.stdio[4]) {
      audio
        .on("error", (err) => {
          console.error("Audio stream error:", err);
          reject(err);
        })
        .pipe(ffmpegProcess.stdio[3]);

      video
        .on("error", (err) => {
          console.error("Video stream error:", err);
          reject(err);
        })
        .pipe(ffmpegProcess.stdio[4]);
    } else {
      console.error("Error: One or both of the streams are undefined.");
      reject(new Error("One or both of the streams are undefined."));
    }
  });
};

module.exports.getYoutubeVideo = async (url) => {
  try {
    const videoUrl = await DownloadYT(url);
    return {
      videoUrl: videoUrl,
    };
  } catch (error) {
    return {
      error: error.message || "An error occurred",
    };
  }
};

module.exports.getYoutubeVideo2 = async (videoUrl) => {
  try {
    const info = await ytdl.getInfo(videoUrl);

    // Get the highest video and audio quality formats
    const videoFormat = ytdl.chooseFormat(info.formats, {
      quality: "highestvideo",
    });
    const audioFormat = ytdl.chooseFormat(info.formats, {
      quality: "highestaudio",
    });

    // Combine video and audio streams into one
    const stream = ytdl(videoUrl, { format: videoFormat })
      .on("error", (error) => console.error(error))
      .pipe(res);

    // Set appropriate headers
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${info.title}.mp4"`
    );
    res.setHeader("Content-Type", "video/mp4");
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
