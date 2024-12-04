const {validate} = require("../validations/validation");
const {
    orderIdValidation,
    orderChatCreationValidationRules, orderAudioChatCreationValidationRules, orderFileChatCreationValidationRules
} = require("../validations/orderChatValidations");
const router = require("../config/express");
const {
    createOrderChat,
    getOrderChats,
    createAudioOrderChat,
    createFileOrderChat, markChatsAsSeen
} = require("../controllers/orderChatController");
const isAuthenticated = require("../middlware/isAuthenticatedMiddleware");
const {diskStorage} = require("multer");
const path = require("path");
const multer = require("multer");
const ORDER_CHAT_DIR = path.join('files', 'order-chats')
const { v4: uuidv4 } = require('uuid'); // UUID generator

// Configure multer for file storage
const storage = diskStorage({
    destination: function (req, file, cb) {
        cb(null, ORDER_CHAT_DIR)  // Ensure the uploads folder exists
    },
    filename: function (req, file, cb) {
        const fileExtension = file.originalname.split('.').pop();
        const uniqueSuffix = uuidv4() + '.' + fileExtension; // Append UUID
        cb(null, file.fieldname + '-' + uniqueSuffix)
    }
});
const upload = multer({storage: storage});
router.post(
    '/v1/department-orders/:orderId/chats',
    isAuthenticated,
    orderChatCreationValidationRules(),
    validate,
    createOrderChat
);

router.get(
    '/v1/department-orders/:orderId/chats',
    isAuthenticated,
    orderIdValidation,
    validate,
    getOrderChats
);

router.post(
    '/v1/department-orders/:orderId/chats/audio',
    isAuthenticated,
    orderAudioChatCreationValidationRules(),
    validate,
    createAudioOrderChat
);

router.post(
    '/v1/department-orders/:orderId/chats/file',
    isAuthenticated,
    orderIdValidation,
    upload.single('file'),
    validate,
    createFileOrderChat
);

router.post(
    '/v1/department-orders/:orderId/chats/seen',
    isAuthenticated,
    orderIdValidation,
    validate,
    markChatsAsSeen
);
