const express = require("express");
const cors = require("cors");
const { getInstaAudioVideo } = require("./instagram");

const app = express();

app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 3000;

app.get("/api/instagram-download", async (req, res) => {
    const date = new Date().toLocaleString();

    console.log("GET Instagram Downloader accessed on " + date);

    const result = await getInstaAudioVideo(req.query.url);

    res.json({
        "creator": "Fredo Ronan",
        "date_accessed": date,
        "source_api": "https://rest-api.akuari.my.id",
        "audio": result.audio,
        "video": result.video
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
    console.log(`Server UP and listen on PORT ${PORT}.....`);
});
