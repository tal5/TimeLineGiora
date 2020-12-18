const { OPERATION_TYPES, DOCX_MIMETYPE } = require('./constants');
const GoogleDrive = require('./gdrive').GoogleDrive;
const express = require('express');
const bodyParser = require('body-parser');
const fileUpload = require('express-fileupload');
const { getDocx } = require('./gdrive');
const PORT = process.env.PORT || 3000;
const app = express();
app.use(express.static('public', { extensions: ['html', 'css', 'js'] }));
app.use(express.static('public/img'));

app.use(bodyParser.json());
app.use(fileUpload());

app.get('/workForDisplay', async (req, res) => {
    const fileID = req.query.fileID;
    const work = await GoogleDrive(fileID, OPERATION_TYPES.GET_DOCX);
    res.send({content: work});
});

app.get('/allWorks', async (req, res) => {
    const worksArray = await GoogleDrive('null', OPERATION_TYPES.GET_SHEET);
    const [titles, ...works] = worksArray;
    const { searchTime } = req.query;
    const filtred = works.filter(work => +work[2] > +searchTime && +work[2] < +searchTime + 100);
    res.send({ titles, works: filtred });
});

app.post('/addWork', async (req, res) => {
    if (!req.files || !req.files.uploadFile || req.files.uploadFile.mimetype !== DOCX_MIMETYPE) {
        res.status(400).send({ error: 'invalid file to upload' });
    }
    const fileName = req.body.fileName;
    const creatorName = req.body.creatorName;
    const workYear = req.body.date;
    const description = req.body.description;
    const fileData = req.files.uploadFile.data;
    const creationDate = new Date().toLocaleDateString();
    const docxFileId = await GoogleDrive({ name: fileName + '.docx', docx: fileData }, OPERATION_TYPES.SAVE_DOCX);
    GoogleDrive([creatorName, fileName, workYear, description, creationDate, docxFileId], OPERATION_TYPES.SAVE_SHEET).then(data => {
        console.log(data)
    }).catch(console.log);
    res.redirect('/');
});

app.listen(PORT, () => console.log('listening on port ' + PORT));
//GoogleDrive('1wdfKhFZSWfpQwBmWnbJ5wNZslbF3iCO_YMU3TuqUiz8', OPERATION_TYPES.GET_DOCX)