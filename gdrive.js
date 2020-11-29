const fs = require('fs');
const { Readable } = require('stream');
const readline = require('readline');
const { google } = require('googleapis');
const sheets = google.sheets('v4');
const { OPERATION_TYPES, GOOGLE_DOCS_MIMETYPE, DOCX_MIMETYPE } = require('./constants');


const SCOPES = ['https://www.googleapis.com/auth/drive'];

const TOKEN_PATH = 'token.json';

const FOLDER_ID = '11wbRkFFb2HovkoQDihW-OcK-xdLDCYxi';
const GOOGLE_SPREADSHEET_ID = '1KNUHr7P7hWWh1cq08mvSYvRtOUbMpqyCWXo0wI76VHo';



function authorize(credentials, callback, args) {
    return new Promise((resolve, reject) => {
        const { client_secret, client_id, redirect_uris } = credentials.installed;
        const oAuth2Client = new google.auth.OAuth2(
            client_id, client_secret, redirect_uris[0]);
        const token = fs.readFileSync(TOKEN_PATH);
        oAuth2Client.setCredentials(JSON.parse(token));
        return resolve(callback(oAuth2Client, args));
    });
}


function getAccessToken(oAuth2Client, callback, args) {
    return new Promise((resolve, reject) => {
        const authUrl = oAuth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: SCOPES,
        });
        console.log('Authorize this app by visiting this url:', authUrl);
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
        });
        rl.question('Enter the code from that page here: ', (code) => {
            rl.close();
            oAuth2Client.getToken(code, (err, token) => {
                if (err) return Promise.reject(`Error retrieving access token: ${err}`);
                oAuth2Client.setCredentials(token);

                fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
                    if (err) return Promise.reject(err);
                });
                return callback(oAuth2Client, args);
            });
        });
    });

}

/** args: array of values in the order required by the adoptions spreadsheet */
function updateSheet(auth, data) {
    return new Promise((resolve, reject) => {
        sheets.spreadsheets.values.append({
            spreadsheetId: GOOGLE_SPREADSHEET_ID,
            range: 'works',
            valueInputOption: 'USER_ENTERED',
            insertDataOption: 'INSERT_ROWS',
            resource: {
                values: [
                    data
                ],
            },
            auth: auth
        }, (err, response) => {
            if (err) return reject(err);
            resolve(response);
        })
    });
}

async function getTable(auth, data) {
    return new Promise((resolve, reject) => {
        sheets.spreadsheets.values.get({
            spreadsheetId: GOOGLE_SPREADSHEET_ID,
            range: 'works',
            auth
        }, (err, response) => {
            if (err) return reject(err);
            resolve(response.data.values);
        })
    })
}

async function getDocx(auth, fileId) {
    return new Promise((resolve, reject) => {
        const drive = google.drive({ version: 'v3', auth });
        drive.files.export({
            fileId: fileId,
            mimeType: 'text/plain'
        },(err, response) => {
            if (err) return reject(err);
            resolve(response.data);
        })
            // .on('end', function () {
            //     resolve(data)
            // })
            // .on('error', function (err) {
            //     reject(err);
            // }).on('data', function (d) {
            //     data += d
            // })
    })
}

/** args: {image: Buffer, name: string} */
function storeImage(auth, args) {
    return new Promise((resolve, reject) => {
        const drive = google.drive({ version: 'v3', auth });
        const fileMetadata = {
            name: args.name,
            parents: [FOLDER_ID]
        };
        const media = {
            mimeType: 'image/jpeg',
            body: new Readable({
                read() {
                    this.push(args.image);
                    this.push(null);
                },
            })
        };
        drive.files.create({
            resource: fileMetadata,
            media: media,
            fields: 'id'
        }, function (err, file) {
            if (err) {
                return reject(err);
            }
            resolve(file.data.id);
        });
    });
}

function storeDocx(auth, args) {
    return new Promise((resolve, reject) => {
        const drive = google.drive({ version: 'v3', auth });
        const fileMetadata = {
            name: args.name,
            mimeType: GOOGLE_DOCS_MIMETYPE,
            parents: [FOLDER_ID]
        };
        const media = {
            mimeType: DOCX_MIMETYPE,
            body: new Readable({
                read() {
                    this.push(args.docx);
                    this.push(null);
                },
            })
        };
        drive.files.create({
            resource: fileMetadata,
            media: media,
            fields: 'id'
        }, function (err, file) {
            if (err) {
                return reject(err);
            }
            resolve(file.data.id);
        });
    });
}

const GoogleDrive = (data, actionType) => {
    if (!data) return Promise.reject('no data provided for saving');

    try {
        const credentials = fs.readFileSync('credentials.json');
        let callback;
        switch (actionType) {
            case OPERATION_TYPES.SAVE_SHEET:
                callback = updateSheet;
                break;
            case OPERATION_TYPES.SAVE_DOCX:
                callback = storeDocx;
                break;
            case OPERATION_TYPES.SAVE_IMAGE:
                callback = storeImage;
                break;
            case OPERATION_TYPES.GET_DOCX:
                callback = getDocx;
                break;
            case OPERATION_TYPES.GET_SHEET: 
                callback = getTable;
                break;
            default:
                return Promise.reject('unknown data type: ' + actionType);
        }

        return Promise.resolve(authorize(JSON.parse(credentials), callback, data));
    } catch (e) {
        console.error('GoogleDrive', actionType, e.stack);
        return Promise.reject(e.message)
    }
}


module.exports = {
    GoogleDrive
}