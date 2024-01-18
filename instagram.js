const axios = require("axios");

module.exports.getInstaAudioVideo = async (url) => {
    const response = await axios.get(`https://rest-api.akuari.my.id/downloader/igdl3?link=${url}`);
    const audio = response.data.respon.graphql.clips_metadata.original_sound_info.progressive_download_url;
    const video = response.data.respon.graphql.shortcode_media.video_url;

    return {
        "video": video,
        "audio": audio
    }
}