/** shared dataTypes */

const GOOGLE_DOCS_MIMETYPE = 'application/vnd.google-apps.document';
const DOCX_MIMETYPE = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

const OPERATION_TYPES = {
    SAVE_SHEET: 'text',
    SAVE_IMAGE: 'image',
    SAVE_DOCX: 'docx',
    GET_SHEET: 'getSheet',
    GET_DOCX: 'getDocx'
}
module.exports = {
    OPERATION_TYPES,
    GOOGLE_DOCS_MIMETYPE: GOOGLE_DOCS_MIMETYPE,
    DOCX_MIMETYPE : DOCX_MIMETYPE
}