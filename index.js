const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();

app.use(express.json());
app.use(cors());

const PORT = 3000;

app.get("/api/instagram-download", async (req, res) => {
    const date = new Date().toLocaleString();

    console.log("GET Instagram Downloader accessed on " + date);

    const response = await axios.get(`https://rest-api.akuari.my.id/downloader/igdl3?link=${req.query.url}`);
    const audio = response.data.respon.graphql.clips_metadata.original_sound_info.progressive_download_url;
    const video = response.data.respon.graphql.shortcode_media.video_url;

    res.json({
        "creator": "Fredo Ronan",
        "date_accessed": date,
        "source_api": "https://rest-api.akuari.my.id",
        "audio": audio,
        "video": video
    });
});

app.get("/api/youtube-download", async (req, res) => {
    const date = new Date().toLocaleString();
    console.log("GET Youtube Downloader accessed on " + date);
    res.json({
        "creator": "Fredo Ronan",
        "date_accessed": date,
        "message": "Comming Soon.....",
        "audio": "nothing",
        "video": "nothing"
    })
})

app.listen(PORT, () => {
    console.log("Server UP listen on PORT 3000.....");
});
