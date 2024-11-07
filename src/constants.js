/**
 * @type {{ ADMIN: "ADMIN"; USER: "USER"} as const}
 */
export const UserRolesEnum = {
  ADMIN: "ADMIN",
  USER: "USER",
};

export const AvailableUserRoles = Object.values(UserRolesEnum);

/**
 * @type {{ PENDING: "PENDING"; CANCELLED: "CANCELLED"; DELIVERED: "DELIVERED" } as const}
 */
export const OrderStatusEnum = {
  PENDING: "PENDING",
  CANCELLED: "CANCELLED",
  DELIVERED: "DELIVERED",
};

export const AvailableOrderStatuses = Object.values(OrderStatusEnum);

/**
 * @type {{ UNKNOWN:"UNKNOWN"; RAZORPAY: "RAZORPAY"; PAYPAL: "PAYPAL"; } as const}
 */
export const PaymentProviderEnum = {
  UNKNOWN: "UNKNOWN",
  RAZORPAY: "RAZORPAY",
  PAYPAL: "PAYPAL",
};

export const AvailablePaymentProviders = Object.values(PaymentProviderEnum);

/**
 * @type {{ FLAT:"FLAT"; } as const}
 */
export const CouponTypeEnum = {
  FLAT: "FLAT",
  // PERCENTAGE: "PERCENTAGE",
};

export const AvailableCouponTypes = Object.values(CouponTypeEnum);

/**
 * @type {{ GOOGLE: "GOOGLE"; GITHUB: "GITHUB"; EMAIL_PASSWORD: "EMAIL_PASSWORD"} as const}
 */
export const UserLoginType = {
  GOOGLE: "GOOGLE",
  GITHUB: "GITHUB",
  EMAIL_PASSWORD: "EMAIL_PASSWORD",
};

export const AvailableSocialLogins = Object.values(UserLoginType);

/**
 * @type {{ TWO_DIMENSION: "2D"; THREE_DIMENSION: "3D"; } as const}
 */
export const dimensionEnum = {
  TWO_DIMENSION: "2D",
  THREE_DIMENSION: "3D",
}; //["2D", "3D"];
export const AvalableVideoDimensions = Object.values(dimensionEnum);

/**
 * @type {{ STANDARD_DEFINITION: "SD"; HIGH_DEFINITION: "HD"; FULL_HD: "FHD"; ULTRA_HD: "UHD"; } as const}
 */
export const definitionEnum = {
  STANDARD_DEFINITION: "SD",
  HIGH_DEFINITION: "HD",
  FULL_HD: "FHD",
  ULTRA_HD: "UHD",
}; //["SD", "HD", "FHD", "UHD"];
export const AvalableVideoDefinitions = Object.values(definitionEnum);

/**
 * @type {{ GENERAL: "G"; PARENT_GUIDED: "PG"; PARENT_STRONGLY_GUIDED: "PG-13"; RESTRICTED: "R"; ADULTS_ONLY: "NC-17"; } as const}
 */
export const contentRatingEnum = {
  GENERAL: "G",
  PARENT_GUIDED: "PG",
  PARENT_STRONGLY_GUIDED: "PG-13",
  RESTRICTED: "R",
  ADULTS_ONLY: "NC-17",
}; //["G", "PG", "PG-13", "R", "NC-17"];
export const AvalableVideoContentRatings = Object.values(contentRatingEnum);

/**
 * @type {{ EQUIRECTANGULAR: "equirectangular"; CUBEMAP: "cubemap"; THREE_D: "360"; VR: "VR"; } as const}
 */
export const projectionEnum = {
  EQUIRECTANGULAR: "equirectangular",
  CUBEMAP: "cubemap",
  THREE_D: "360",
  VR: "VR",
}; //["equirectangular", "cubemap", "360", "VR"];
export const AvalableVideoProjections = Object.values(projectionEnum);

/**
 * @type {{ DRAFT: "DRAFT"; PUBLIC: "PUBLIC"; PRIVATE: "PRIVATE"} as const}
 */
export const videoStatusEnum = {
  DRAFT: "DRAFT",
  PUBLIC: "PUBLIC",
  PRIVATE: "PRIVATE",
}; //["DRAFT", "PUBLIC", "PRIVATE"];
export const AvalableVideoStatuses = Object.values(videoStatusEnum);

/**
 * @type {{ MOST_VIEWED: "mostViewed"; MOST_LIKED: "mostLiked"; LATEST: "latest"; OLDEST: "oldest"} as const}
 */
export const YouTubeFilterEnum = {
  MOST_VIEWED: "mostViewed",
  MOST_LIKED: "mostLiked",
  LATEST: "latest",
  OLDEST: "oldest",
};

export const AvailableYouTubeFilters = Object.values(YouTubeFilterEnum);

export const USER_TEMPORARY_TOKEN_EXPIRY = 20 * 60 * 1000; // 20 minutes

export const MAXIMUM_SUB_IMAGE_COUNT = 4;
export const MAXIMUM_SOCIAL_POST_IMAGE_COUNT = 6;

export const DB_NAME = "poc_app";
export const ROOT_S3_BUCKET_DIR = "Imaginary";

export const paypalBaseUrl = {
  sandbox: "https://api-m.sandbox.paypal.com",
};

/**
 * @description set of events that we are using in chat app. more to be added as we develop the chat app
 */
export const ChatEventEnum = Object.freeze({
  // ? once user is ready to go
  CONNECTED_EVENT: "connected",
  // ? when user gets disconnected
  DISCONNECT_EVENT: "disconnect",
  // ? when user joins a socket room
  JOIN_CHAT_EVENT: "joinChat",
  // ? when participant gets removed from group, chat gets deleted or leaves a group
  LEAVE_CHAT_EVENT: "leaveChat",
  // ? when admin updates a group name
  UPDATE_GROUP_NAME_EVENT: "updateGroupName",
  // ? when new message is received
  MESSAGE_RECEIVED_EVENT: "messageReceived",
  // ? when there is new one on one chat, new group chat or user gets added in the group
  NEW_CHAT_EVENT: "newChat",
  // ? when there is an error in socket
  SOCKET_ERROR_EVENT: "socketError",
  // ? when participant stops typing
  STOP_TYPING_EVENT: "stopTyping",
  // ? when participant starts typing
  TYPING_EVENT: "typing",
});

export const AvailableChatEvents = Object.values(ChatEventEnum);
