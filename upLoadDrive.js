
const { Readable } = require('stream');
const { google } = require('googleapis');

const GOOGLE_DOCS_MIME_TYPE = 'application/vnd.google-apps.document';
  
const uploadDoc = (name, file) => {
    const fileMetadata = {
        name,
        'mimeType': GOOGLE_DOCS_MIME_TYPE
      };
      const media = {
        mimeType: 'text/docx',
        body:  new Readable({
          read() {
              this.push(file);
              this.push(null);
          }})
      };
      drive.files.create({
        resource: fileMetadata,
        media: media,
        fields: 'id'
      }, function (err, file) {
        if (err) {
          // Handle error
          console.error(err);
        } else {
          console.log('File Id:', file.id);
        }
      });
  };

  module.exports = {
    uploadDoc
  }
  