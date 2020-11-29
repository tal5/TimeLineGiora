//onst e = require("express");

class Work {
    constructor(obj){
            this.creationDate = obj.creationDate
            this.description = obj.description;
            this.fileId = obj.fileId;
            this.name = obj.name;
            this.workDate = obj.workDate;
            this.workName = obj.workName;
    }
    
}

const startYear = parseInt(new URLSearchParams(window.location.search).get('searchTime'));
const timeLine = document.getElementById('line');
const timeFrame = getTimeFrame(startYear); // usually 100
document.getElementById('num1').innerHTML = startYear;
document.getElementById('num2').innerHTML = startYear + timeFrame / 2;
document.getElementById('num3').innerHTML = startYear + timeFrame;

async function getWorks() {
    const response = await fetch('/allWorks' + window.location.search);
    const data = await response.json();
    const { titles, works } = data;
    const allWorks = works.map(arr => {
        return arr.reduce((obj, value, i) => {
            obj[titles[i]] = value;
            return obj;
        }, {})
    }).sort((a, b) => parseInt(a.workDate) - parseInt(b.workDate));
    return allWorks;
}

async function fillTimeLine() {
    const works = await getWorks();
    for (i = 0; i < works.length; i++) {
    makeDot(new Work(works[i]));
    }
    timeLine.addEventListener('click', getWorkContent)
}

function getLeftOffset(workYear) {
    const oneYearInPercent = timeFrame / 100;
    return oneYearInPercent * (workYear - startYear);
}

function makeDot(work) {
    var dot = document.createElement("div");
    dot.className = "dotOnLine";
    dot.id = work.fileId;
    const leftOffsetPercent = getLeftOffset(work.workDate);
dot.style.left = leftOffsetPercent + "%";
timeLine.appendChild(dot);
}

function getTimeFrame(from) {
    switch (true) {
        case from > -70000:
            return 100;
    }
}

async function getWorkContent(event) {
const response = await fetch (`/workForDisplay?fileID=${event.target.id}`);
const work = await response.json();
const content = work.content;
const worksContainer = document.getElementById('workDisplay');
worksContainer.style.display = "block";
worksContainer.innerHTML = content;
document.addEventListener('keypress', (event)=>{
    if (event.key = "ESC") {
        worksContainer.innerHTML = null;
        worksContainer.style.display = "none";
    }
});
}
fillTimeLine();