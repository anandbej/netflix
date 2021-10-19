const express = require("express");
const fs = require("fs");
const app = express();


app.get("/", function (req, res) {
    res.status(200).send("done")
});
app.get("/video", function (req, res) {
    // Ensure there is a range given for the video
    // const range = req.headers.range;
    const range = "bytes=0-1023";
    if (!range) {
        res.status(400).send("Requires Range header");
    }
    // console.log("asd")
    // get video stats (about 61MB)
    const videoName = "bigbuck.mp4";
    const videoPath = videoName;
    const videoSize = fs.statSync(videoName).size;

    // Parse Range
    // Example: "bytes=32324-"
    const CHUNK_SIZE = 10 ** 6; // 1MB
    // const CHUNK_SIZE = 10 ** 5; // 1MB
    const start = Number(range.replace(/\D/g, ""));
    const end = Math.min(start + CHUNK_SIZE, videoSize - 1);
    
    // Create headers
    const contentLength = end - start + 1;
    const headers = {
        "Content-Range": `bytes ${start}-${end}/${videoSize}`,
        "Accept-Ranges": "bytes",
        "Content-Length": contentLength,
        "Content-Type": "video/mp4",
    };
    
    console.log(headers);
    // HTTP Status 206 for Partial Content
    res.writeHead(206, headers);

    // create video read stream for this particular chunk
    // const videoStream = fs.createReadStream(videoPath, { start, end });
    const videoStream = fs.createReadStream(videoPath, { start: start, end: end });


    // Stream the video chunk to the client
    videoStream.pipe(res);
});
app.listen(8000, function () {
  console.log("Listening on port 8000!");
});

