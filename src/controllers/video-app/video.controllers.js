import { v4 as uuidv4 } from "uuid";
import { Video } from "../../models/video.models.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { uploadToCloudinary } from "../../utils/cloudinary.js";
import { convertToDASH, convertToHLS } from "../../utils/converter.js";

/**
 * Handles the uploading of a video file and its associated thumbnail.
 * @param {object} req - The request object containing the video and thumbnail file paths in the `body` property.
 * @param {object} res - The response object used to send the JSON response.
 * @returns {object} - JSON response with a status code of 200 and a new `ApiResponse` object containing the uploaded video data.
 */
export const addVideo = async (req, res) => {
  try {
    const { title, description, publishStatus } = req.body;
    const videoFilePath = req.files?.video?.[0]?.path;
    const thumbnailFilePath = req.files?.thumbnail?.[0]?.path;

    //convert video file to hls
    // const localHlsFilePath = await convertToHLS(
    //   videoFilePath,
    //   "./public/uploads/videos"
    // );
    // const localDASHFilePath = await convertToDASH(videoFilePath, "./public/uploads/videos");
    // console.log("l20 local hls Filepath:", localHlsFilePath);

    // console.log("l24 local Filepath:", videoFilePath, thumbnailFilePath);

    const thumbnailUrl = await uploadToCloudinary(thumbnailFilePath);
    const vRes = await uploadToCloudinary(videoFilePath);

    // console.log("l29 Cloudinary Response:", vRes, thumbnailUrl);

    if (!vRes || !thumbnailUrl) {
      throw new ApiError(400, "Problem with the uploaded file");
    }

    const videoData = await Video.create({
      title,
      description,
      thumbnail: {
        original: {
          url: thumbnailUrl.secure_url,
          width: thumbnailUrl.width,
          height: thumbnailUrl.height,
        },
      },
      contentDetails: {
        duration: vRes.duration / 100,
      },
      video: {
        url: vRes.secure_url,
        playbackUrl: vRes.playback_url,
        folder: vRes.folder,
        width: vRes.width,
        height: vRes.height,
        size: vRes.bytes,
        format: vRes.format,
        resource_type: vRes.resource_type,
        frame_rate: vRes.frame_rate,
        duration: vRes.duration,
        profile: vRes.video.profile,
        time_base: vRes.video.time_base,
        pix_format: vRes.video.pix_format,
        codec: vRes.video.codec,
        level: vRes.video.level,
        bit_rate: vRes.video.bit_rate,
      },
      status: publishStatus,
      publishedAt: publishStatus === "PUBLISHED" ? Date.now() : null,
      // owner: uuidv4(),
      // categoryId: uuidv4(),
    });

    // console.log("l51 videoData: ", videoData);

    return res
      .status(200)
      .json(new ApiResponse(200, videoData, "Video uploaded successfully"));
  } catch (error) {
    // Handle any errors and send an appropriate response
    return res
      .status(error.statusCode || 500)
      .json(
        new ApiResponse(
          error.statusCode || 500,
          null,
          error.message || "Internal Server Error"
        )
      );
  }
};

/**
 * Retrieves the videos information.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @return {Promise<void>} - A promise that resolves when the response is sent.
 */
export const getAllVideo = async (req, res) => {
  try {
    const videos = await Video.find({ status: "PUBLISHED" }).exec();
    return res.status(200).json(new ApiResponse(200, videos, "Success"));
  } catch (error) {
    return res
      .status(error.statusCode || 500)
      .json(
        new ApiResponse(
          error.statusCode || 500,
          null,
          error.message || "Internal Server Error"
        )
      );
  }
};

/**
 * Retrieves the video information by Id.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @return {Promise<void>} - A promise that resolves when the response is sent.
 */
export const getVideoById = async (req, res) => {
  try {
    const video = await Video.findById(req.params.vid);
    return res.status(200).json(new ApiResponse(200, video, "success"));
  } catch (error) {
    return res
      .status(error.statusCode || 500)
      .json(
        new ApiResponse(
          error.statusCode || 500,
          null,
          error.message || "Internal Server Error"
        )
      );
  }
};
