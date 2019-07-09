

function loadDefault() {
    fetch('loadjson', {
        method: 'post',
    })
    .then(function(resp){
        return resp.json();
    })
    .then(function(data){
        var data = JSON.parse(data)
        document.getElementById('output').value = data.output;
        document.getElementById('videoCount').value = data.videoCount;
        
        for(var i in data.videos){
            document.getElementById('videoFormatDropdown').value = data.videos[i].videoFormat;
            document.getElementById('width').value = data.videos[i].width;
            document.getElementById('height').value = data.videos[i].height;
            document.getElementById('fpsDropdown').value = data.videos[i].fps;
            document.getElementById('videoBitrate').value = data.videos[i].videoBitrate;
        }
    });
}
function loadSettings(){

}
function addRow(){
    var table = document.getElementById('my-table');
    var row = document.getElementById('table-row');
    var clone = row.cloneNode(true);
    clone.id = ("table-row" + (table.rows.length - 1));
    table.appendChild(clone);

    var videoCount = document.getElementById('videoCount');
    videoCount.value = table.rows.length - 1;
}
function removeRow(){
    var table = document.getElementById('my-table');
    var videoCount = document.getElementById('videoCount'); // table reference
    var lastRow = table.rows.length - 1; 
    if(lastRow != 1){
        table.deleteRow(lastRow);
        videoCount.value = lastRow - 1;
    }    
}

function saveSettings(){
    fetch('savejson', {
        method: 'post',
        body: JSON.stringify(data)
    })
    .then(function(resp){
        return resp.json();
    })
    .then(function(data){
        var data = JSON.parse(data)
        console.log(data.output)
    });
}