import dotenv from "dotenv";
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import express from 'express';
import fileUpload from 'express-fileupload';
import morgan from 'morgan';
import cors from 'cors';
import Database from './src/db/client.js';
import apiRoutes from './src/routes/index.js';
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const app = express();

// Handling database authentication
async function authenticateDatabase() {
  try {
    console.log('Starting database...');
    await Database.query('SELECT 1');
    console.log('Database connected');
  } catch (err) {
    console.error('Database connection failed:', err.message);
    process.exit(1);
  }
}

// Call authenticate when server is start
authenticateDatabase();

// Log http request in the 'dev' format
app.use(morgan('dev'));

// Handling body-parse
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

// Handling CORS
app.use(cors({
    origin: "http://localhost:4700",
    credentials: true,
}));

// Upload File
app.use(fileUpload({
    createParentPath: true
}));
// Serve upload files
app.use("/uploads", express.static("uploads")); 

app.use(cookieParser());

// Route
apiRoutes.forEach(r => {
    app.use(r.path, r.route);
});

// recreate __dirname (ESM)
const __filename = fileURLToPath(import.meta.url);
console.log(__filename)
const __dirname = path.dirname(__filename);

// 👇 expose upload_temp folder
app.use(
  "/upload_temp",
  express.static(path.join(__dirname, "src/upload_temp"))
);

// app.use('/upload_temp', express.static('upload_temp'))


// Customize error log
// app.use((req, res, next) => {
//     const error = new Error('Not Found');
//     error.status = 404;
//     next(error);
// });

// app.use((error, req, res) => {
//     res.status(error.status || 500);
//     res.json({
//         error: {
//             message: error.message
//         }
//     });
// });

export default app;