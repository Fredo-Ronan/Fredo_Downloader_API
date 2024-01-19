const axios = require("axios");

module.exports.getInstaAudioVideo = async (url) => {
    const response = await axios.get(`https://rest-api.akuari.my.id/downloader/igdl3?link=${url}`);

    try {

        const audio = response.data.respon.graphql.clips_metadata.original_sound_info.progressive_download_url;
        const video = response.data.respon.graphql.shortcode_media.video_url;

        return {
            "video": video,
            "audio": audio
        }
    }catch(err){
        const response = await axios.get(`https://rest-api.akuari.my.id/downloader/igdl2?link=${url}`);

        if(response.data.respon.status === true){
            const video = response.data.respon.data[0].url;

            return {
                "video": video,
                "audio": null,
            }
        } else {
            return {
                "video": null,
                "audio": null,
            }
        }
    }

}

module.exports.getAll = async (url) => {
    const response = await axios.get(`https://rest-api.akuari.my.id/downloader/igdl3?link=${url}`);

    return response.data;
}