const axios = require("axios");

module.exports.getInstaAudioVideo = async (url) => {
    const response = await axios.get(`https://rest-api.akuari.my.id/downloader/igdl3?link=${url}`);

    try {

        const audio = await response.data.respon.graphql.clips_metadata.original_sound_info.progressive_download_url;
        const video = await response.data.respon.graphql.shortcode_media.video_url;

        return {
            "status": "OK",
            "video": video,
            "audio": audio
        }
    }catch(err){
        try {

            const response = await axios.get(`https://rest-api.akuari.my.id/downloader/igdl2?link=${url}`);
    
            if(response.data.respon.status === true){
                const video = await response.data.respon.data[0].url;
    
                return {
                    "status": "OK",
                    "video": video,
                    "audio": null,
                }
            } else {
                return {
                    "status": "OK",
                    "video": null,
                    "audio": null,
                }
            }
        }catch(err) {
            return {
                "status": "SERVER ERROR or OFFLINE",
            }
        }
    }

}

module.exports.getAll = async (url) => {
    const response = await axios.get(`https://rest-api.akuari.my.id/downloader/igdl3?link=${url}`);

    return response.data;
}