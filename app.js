const express = require("express");
const cors = require("cors");
const ytdl = require("ytdl-core");
const path = require("path");
const { getInstaAudioVideo, getAll } = require("./instagram");
const { getYoutubeVideo, getYoutubeVideo2 } = require("./youtube");

const app = express();

app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "/index.html"));
});

app.get("/api/instagram-download", async (req, res) => {
  const date = new Date().toLocaleString();

  console.log("GET Instagram Downloader accessed on " + date);

  const result = await getInstaAudioVideo(req.query.url);
  // const response = await getAll(req.query.url);

  res.json({
    creator: "Fredo Ronan",
    date_accessed: date,
    source_api: "https://rest-api.akuari.my.id",
    audio: result.audio,
    video: result.video,
  });

  // res.json({
  //     data: response,
  // })
});

app.get("/api/youtube-download", async (req, res) => {
  const date = new Date().toLocaleString();
  console.log("GET Youtube Downloader accessed on " + date);

  const videoUrl = req.query.url;

  // const result = await getYoutubeVideo2(req.query.url);

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

  // res.json({
  //     "creator": "Fredo Ronan",
  //     "date_accessed": date,
  //     "audio": "nothing",
  //     "video": result.videoUrl,
  // })
});

app.listen(PORT, () => {
  console.log(`Server UP and listen on PORT ${PORT}.....`);
});
