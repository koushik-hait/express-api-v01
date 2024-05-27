import { exec } from "child_process";
import fs from "fs";

function generateUniqueId() {
  const guid = "video-" + Date.now() + Math.ceil(Math.random() * 1e5);
  return guid;
}

/**
 * Converts the input video file to HLS format using FFmpeg.
 *
 * @param {string} inputFilePath - The path of the input video file.
 * @param {string} outputDir - The directory where the HLS playlist and segment files will be saved.
 * @return {void} This function does not return a value.
 * 
// Example usage
const inputVideoPath = "./public/temp/input-video.mp4";
const outputDir = "./public/uploads/videos"; // Change this to your desired output directory
convertToHLS(inputVideoPath, outputDir);


 */
export const convertToHLS = async (inputFilePath, outputDir) => {
  // Generate a unique lesson ID (you can use any method you prefer)
  const file_id = generateUniqueId();

  // Create the output directory if it doesn't exist
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const hlsPath = `${outputDir}/${file_id}.m3u8`;

  // Construct the FFmpeg command
  const ffmpegCommand = `ffmpeg -i ${inputFilePath} -codec:v libx264 -codec:a aac -hls_time 10 -hls_playlist_type vod -hls_segment_filename "${outputDir}/${file_id}-segment%03d.ts" -start_number 0 ${hlsPath}`;
  const ffmpegCommand1 = `ffmpeg -i ${inputFilePath} -codec:v libx264 -codec:a aac -hls_time 10 -hls_list_size 0 -f hls ${outputDir}/index.m3u8`;

  // Execute FFmpeg command
  exec(ffmpegCommand, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error executing FFmpeg: ${error}`);
      return;
    }
    console.log(`FFmpeg output: ${stdout}`);
    console.log(`FFmpeg error: ${stderr}`);

    console.log(
      `Video converted to HLS format. Access it at: ${outputDir}/${file_id}.m3u8`
    );
    //remove input file
    fs.unlinkSync(inputFilePath);
    return `${outputDir}/${file_id}.m3u8`;
  });
};

/**
 * Converts the input video file to DASH format using FFmpeg.
 *
 * @param {string} inputFilePath - The path of the input video file.
 * @param {string} outputDir - The path where the converted DASH video will be saved.
 * @return {void} This function does not return a value.
 * // Example usage
 *  const inputVideoPath = "public/temp/input-video.mp4";
 *  const outputDASHPath = "./public/uploads/videos"; // Change this to your desired output path
 *  convertToDASH(inputVideoPath, outputDASHPath);
 */
export const convertToDASH = async (inputFilePath, outputDir) => {
  const file_id = generateUniqueId();
  //create output directory if it doesn't exist
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const dashPath = `${outputDir}/${file_id}.mpd`;
  // Construct the FFmpeg command
  const ffmpegCommand = `ffmpeg -i ${inputFilePath} -codec:v libx264 -codec:a aac -b:v 800k -b:a 128k -f dash -single_file 1 ${dashPath}`;

  // Execute FFmpeg command
  exec(ffmpegCommand, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error executing FFmpeg: ${error},`);
      return;
    }
    console.log(`FFmpeg output: ${stdout},`);
    console.log(`FFmpeg error: ${stderr},`);

    console.log(
      `Video converted to DASH format. Output file: ${outputDir}/index.mpd`
    );
    //remove input file
    fs.unlinkSync(inputFilePath);
    return `${outputDir}/index.mpd`;
  });
};
