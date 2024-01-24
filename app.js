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

  // Generate download links for video and audio
  const videoDownloadLink = videoFormat.url;
  const audioDownloadLink = audioFormat.url;

  // You can optionally include the title in the response
  const title = info.title;

  const videoData = await fetch(videoDownloadLink).then((res) => res.arrayBuffer());
  const audioData = await fetch(audioDownloadLink).then((res) => res.arrayBuffer());

  console.log(videoData);
  console.log(audioData);

  // const blobVideo = new Blob([videoData], {type: 'application/octet-stream'});
  // const blobAudio = new Blob([audioData], {type: 'application/octet-stream'});

  // const urlVideo = URL.createObjectURL(blobVideo);
  // const urlAudio = URL.createObjectURL(blobAudio);

  const videoUint8Array = new Uint8Array(videoData)
  const audioUint8Array = new Uint8Array(audioData)

  const textDecoder = new TextDecoder('utf-8');
  const videoStringDecoded = textDecoder.decode(videoUint8Array);
  const audioStringDecoded = textDecoder.decode(audioUint8Array);

  const base64Video = Buffer.from(videoStringDecoded).toString('base64');
  const base64Audio = Buffer.from(audioStringDecoded).toString('base64');

  // Send the links in the response
  res.json({
    creator: "Fredo Ronan",
    date_accessed: date,
    audio: base64Audio,
    video: base64Video,
    title,
  });
});

app.listen(PORT, () => {
  console.log(`Server UP and listen on PORT ${PORT}.....`);
});
