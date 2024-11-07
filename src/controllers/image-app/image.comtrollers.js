import sharp from "sharp";
import {
  deleteFromS3,
  downloadFromS3,
  generateS3Key,
  getS3ImageAsBase64,
  getS3KeyFromUrl,
  rootS3Url,
  uploadToS3,
} from "../../libs/aws/aws-s3.js";
import { uploadToCloudinary } from "../../libs/cloudinary.js";
import logger from "../../logger/winston.logger.js";
import { User } from "../../models/auth/user.models.js";
import { Image } from "../../models/image-app/image.models.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import {
  getMongoosePaginationOptions,
  validateMongoId,
} from "../../utils/helper.js";
import {
  getExifData,
  getImageMetadata,
  processImage,
} from "../../utils/image-helper.js";

/**
 * @api {post} /images/:id/transform
 * @apiName TransformImage
 * @apiGroup Images
 * @apiDescription Transform an image
 * @apiParam {String} id The ID of the image to transform
 * @apiParam {Object} transformations The transformations to apply
 * @apiParam {Object} transformations.resize Resizes the image
 * @apiParam {Number} transformations.resize.width The width of the resized image
 * @apiParam {Number} transformations.resize.height The height of the resized image
 * @apiParam {Object} transformations.crop Crops the image
 * @apiParam {Number} transformations.crop.width The width of the cropped image
 * @apiParam {Number} transformations.crop.height The height of the cropped image
 * @apiParam {Number} transformations.crop.x The x offset of the cropped image
 * @apiParam {Number} transformations.crop.y The y offset of the cropped image
 * @apiParam {Number} transformations.rotate Rotates the image
 * @apiParam {String} transformations.format The format of the output image
 * @apiParam {Object} transformations.filters The filters to apply
 * @apiParam {Boolean} transformations.filters.grayscale Applies a grayscale filter
 * @apiParam {Boolean} transformations.filters.sepia Applies a sepia filter
 * @apiSuccess {Buffer} The transformed image
 */

export const transformImage = asyncHandler(async (req, res) => {
  try {
    const imageId = req.params.id;
    // Get transformations Properties
    const transformations = req.body.transformations;
    const savedImage = await Image.aggregate([
      {
        $match: {
          _id: validateMongoId(imageId),
        },
      },
    ]);

    if (!savedImage) {
      return res
        .status(404)
        .json(new ApiResponse(404, null, "Image not found"));
    }
    const s3Key = savedImage[0].image.original.uploadKey;
    const base64Image = await getS3ImageAsBase64(s3Key);
    const buffer = Buffer.from(base64Image, "base64");

    let processedOutput = await processImage(
      buffer,
      transformations,
      savedImage[0].filename
    );

    if (!processedOutput) {
      return res
        .status(404)
        .json(new ApiResponse(404, null, "Image not transformed"));
    }
    console.log("processedOutput: ", processedOutput);
    const processedKey = generateS3Key(
      req.user?.email,
      savedImage[0].filename,
      "processed"
    );
    const url = await uploadToS3(processedOutput, processedKey, "image/jpeg");
    const image = await Image.findOneAndUpdate(
      { _id: imageId },
      {
        $set: {
          "image.processed.uploadKey": processedKey,
          "image.processed.url": url,
          transformations: transformations,
        },
      },
      { new: true }
    );
    if (!image) {
      return res
        .status(404)
        .json(new ApiResponse(404, null, "Image not found"));
    }

    res
      .status(200)
      .json(new ApiResponse(200, image, "Image transformed successfully"));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error transforming image" });
  }
});

/**
 * @api {post} /images
 * @apiName UploadImage
 * @apiGroup Images
 * @apiDescription Upload an image
 * @apiParam {File} image The image to upload
 * @apiSuccess {String} url The URL of the uploaded image
 * @apiSuccess {Object} metadata The metadata of the uploaded image
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 201 Created
 *     {
 *       "url": "https://example.com/image.jpg",
 *       "metadata": {
 *         "width": 800,
 *         "height": 600,
 *         "format": "jpeg",
 *         "size": 1024
 *       }
 *     }
 */

export const uploadImage = asyncHandler(async (req, res) => {
  try {
    const filePath = req.file?.path;
    console.log("file: ", req.file);
    const basicMetadata = await getImageMetadata(filePath);
    const exifData = await getExifData(filePath);
    const metadata = { ...basicMetadata, ...exifData };
    // const fileUrl = await uploadToCloudinary(filePath);
    const s3Key = generateS3Key(
      req.user?.email,
      req.file?.filename,
      "original"
    );
    const s3Url = await uploadToS3(filePath, s3Key, req.file?.mimetype);
    const uploadedImage = await Image.create({
      filename: req.file?.filename,
      image: {
        original: {
          url: s3Url,
          uploadKey: s3Key,
        },
        processed: {
          url: null,
          uploadKey: null,
        },
      },
      transformations: null,
      metadata,
      uploader: req.user?._id,
    });

    if (!s3Url) {
      throw new Error("Error uploading image");
    }
    if (!uploadedImage) {
      throw new Error("Error uploading image");
    }
    // console.log("fileUrl: ", s3Url, "localPath: ", filePath);
    return res
      .status(200)
      .json(new ApiResponse(200, uploadedImage, "File uploaded successfully"));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error uploading image" });
  }
});

/**
 * @api {get} /images/:id
 * @apiName RetrieveImage
 * @apiGroup Images
 * @apiDescription Retrieve an image
 * @apiParam {String} id The ID of the image to retrieve
 * @apiSuccess {Object} image The retrieved image
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "_id": "61a5d4a3c8b93a7f6e5f5f5f",
 *       "originalName": "sunset.jpg",
 *       "url": "https://example.com/sunset.jpg",
 *       "metadata": {
 *         "width": 800,
 *         "height": 600,
 *         "format": "jpeg",
 *         "size": 1024
 *       }
 *     }
 */

export const retrieveImage = asyncHandler(async (req, res) => {
  try {
    const image = await Image.aggregate([
      {
        $match: {
          _id: validateMongoId(req.params.id),
        },
      },
      {
        $project: {
          _id: 1,
          image: 1,
          metadata: 1,
        },
      },
      {
        $replaceRoot: {
          newRoot: "$$ROOT",
        },
      },
    ]);
    // console.log("image: ", image);
    if (!image) {
      return res
        .status(404)
        .json(new ApiResponse(404, null, "Image not found"));
    }
    // const s3Key = getS3KeyFromUrl(image[0].cloudUrl);
    const signedUrl = await downloadFromS3(image[0].image.original.uploadKey);
    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { ...image[0], imageUrl: signedUrl },
          "Image retrieved successfully"
        )
      );
  } catch (error) {
    logger.error(error);
    res.status(500).json(new ApiResponse(500, null, error.message));
  }
});

/**
 * @api {get} /images
 * @apiName GetImages
 * @apiGroup Images
 * @apiDescription Get a paginated list of images
 * @apiParam {Number} [page=1] Page number
 * @apiParam {Number} [limit=10] Items per page
 * @apiSuccess {Object[]} images List of images
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     [
 *       {
 *         "_id": "61a5d4a3c8b93a7f6e5f5f5f",
 *         "originalName": "sunset.jpg",
 *         "url": "https://example.com/sunset.jpg",
 *         "metadata": {
 *           "width": 800,
 *           "height": 600,
 *           "format": "jpeg",
 *           "size": 1024
 *         }
 *       },
 *       {
 *         "_id": "61a5d4a3c8b93a7f6e5f5f6",
 *         "originalName": "mountain.jpg",
 *         "url": "https://example.com/mountain.jpg",
 *         "metadata": {
 *           "width": 1024,
 *           "height": 768,
 *           "format": "jpeg",
 *           "size": 2048
 *         }
 *       }
 *     ]
 */

export const getImages = asyncHandler(async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const userId = req.user._id;
    const userDir = req.user.email.split("@")[0];
    const imagesAggregate = Image.aggregate([
      {
        $match: {
          uploader: userId,
        },
      },
    ]);

    const images = await Image.aggregatePaginate(imagesAggregate, {
      offset,
      limit,
      page,
      lean: true,
      customLabels: {
        docs: "data",
        totalDocs: "totalItems",
      },
    });

    if (!images) {
      return res
        .status(404)
        .json(new ApiResponse(404, null, "Images not found"));
    }

    console.log("images after aggregation: ", images);

    for (let i = 0; i < images.data.length; i++) {
      const image = images.data[i];
      // const s3Key = getS3KeyFromUrl(image.image.original.url);
      const s3Key = req.user.email.split("@")[0];
      const originalSignedUrl = await downloadFromS3(
        image.image.original.uploadKey
      );
      const transformedSignedUrl = await downloadFromS3(
        image.image.processed.uploadKey
      );
      images.data[i].originalSignedUrl = originalSignedUrl;
      images.data[i].transformedSignedUrl = transformedSignedUrl;
    }

    console.log("images after signed: ", images);
    res
      .status(200)
      .json(new ApiResponse(200, images, "Images retrieved successfully"));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error retrieving images" });
  }
});
