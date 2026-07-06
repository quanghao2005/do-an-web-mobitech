const mammoth = require('mammoth');
const fs = require('fs');

mammoth.extractRawText({path: 'D:\\DATN\\BuiQuangHao_09-06-2026.docx'})
    .then(function(result){
        fs.writeFileSync('D:\\DATN\\extracted_text.txt', result.value);
        console.log('Done');
    })
    .catch(function(err) {
        console.error(err);
    });
