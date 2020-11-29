document.getElementById('uploadFile').addEventListener('change', newfileuploded)

function newfileuploded(e){
    document.getElementById('uplodedfilename').innerText = e.target.files[0].name;
}