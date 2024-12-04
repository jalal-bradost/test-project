const {validate} = require("../../../validations/validation");
const {
    taskIdValidation,
    taskChatCreationValidationRules, taskAudioChatCreationValidationRules, taskFileChatCreationValidationRules
} = require("../../../validations/hr/tasks/taskChatValidations");
const router = require("../../../config/express");
const {
    createTaskChat,
    createAudioTaskChat,
    getTaskChats,
    createFileTaskChat
} = require("../../../controllers/hr/tasks/taskChatController");
const isAuthenticated = require("../../../middlware/isAuthenticatedMiddleware");
const path = require("path");
const TASK_CHAT_DIR = path.join('files', 'task-chats')
const {v4: uuidv4} = require('uuid'); // UUID generator
const {diskStorage} = require("multer");
const multer = require("multer");
const {markChatsAsSeen} = require("../../../controllers/hr/tasks/taskChatController");
// Configure multer for file storage
const storage = diskStorage({
    destination: function (req, file, cb) {
        cb(null, TASK_CHAT_DIR)  // Ensure the uploads folder exists
    },
    filename: function (req, file, cb) {
        const fileExtension = file.originalname.split('.').pop();
        const uniqueSuffix = uuidv4() + '.' + fileExtension; // Append UUID
        cb(null, file.fieldname + '-' + uniqueSuffix)
    }
});
const upload = multer({storage: storage});
router.post(
    '/v1/hr/employees/tasks/:taskId/chats',
    isAuthenticated,
    taskChatCreationValidationRules(),
    validate,
    createTaskChat
);

router.post(
    '/v1/hr/employees/tasks/:taskId/chats/audio',
    isAuthenticated,
    taskAudioChatCreationValidationRules(),
    validate,
    createAudioTaskChat
);

router.post(
    '/v1/hr/employees/tasks/:taskId/chats/file',
    isAuthenticated,
    taskIdValidation,
    upload.single('file'),
    validate,
    createFileTaskChat
);

router.get(
    '/v1/hr/employees/tasks/:taskId/chats',
    isAuthenticated,
    taskIdValidation,
    validate,
    getTaskChats
);

router.post(
    '/v1/department-tasks/:taskId/chats/seen',
    isAuthenticated,
    taskIdValidation,
    validate,
    markChatsAsSeen
);