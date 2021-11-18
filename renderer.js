

let form = document.querySelector('#form');
let logbestandA = document.querySelector('#seloga');
let logbestandB = document.querySelector('#selogb');
let outputElementA = document.querySelector('#outputa');
let outputElementB = document.querySelector('#outputb');
let inputPathA = document.querySelector('#inpatha');
let inputPathB = document.querySelector('#inpathb');
let outputPath = document.querySelector('#outpath');
let outputFile = document.querySelector('#outfile');
let outputCmd = document.querySelector('#outcmd');
let outputCmd2 = document.querySelector('#outcmd2');
let channels = document.querySelector('#channels');

form.addEventListener("submit", e => {
    e.preventDefault();

    if(logbestandA.value == '') {
        console.log('No file selected');
        outputElementA.innerHTML = 'No file selected';
        return;
    }

    readFile(logbestandA.files[0], outputElementA, 0);
    readFile(logbestandB.files[0], outputElementB, 1);

});

const readFile = (file, outputElement, sdnumber) => {
    let reader = new FileReader();
    reader.onload = e => {
        // Binary data
        let logData = parseLogdata(e.target.result);
        displayListTxt(logData, sdnumber)
        displayCmd(logData, sdnumber)
        displayResult(logData, outputElement)
    };
    reader.onerror = e => {
        // Error occurred
        throw e;
    };
    reader.readAsArrayBuffer(file);
}

const parseLogdata = logdata => {
    let dataview = new DataView(logdata);

    let output = [];

    for (let i = 0; i < 7; i++) {
        output[i] = dataview.getUint32(i*4, true)
    }

    output[7] = [];
    for (let i = 0; i < output[4]; i++) {
        output[7][i] = dataview.getUint32((i+7)*4, true)
    }

    output[8] = [];
    for (let i = 0; i < output[5]; i++) {
        output[8][i] = dataview.getUint32((i+7+256)*4, true)
    }

    stringbytes = []
    for (let i = 0; i < 19; i++) {
        stringbytes[i] = dataview.getUint8((i+1552), true)
    }
    output[9] = String.fromCharCode.apply(null, stringbytes);

    output[10] = dataview.getUint32(1572, true);
    output[11] = dataview.getUint32(1576, true);
    return output;
}

const displayResult = (data, outputElement) => {
    outputElement.innerHTML = "";
    let output = document.createElement("ul");
    output.insertAdjacentHTML('beforeend', `<li>Session ID: ${dosToID(data[0])}</li>\n`)
    output.insertAdjacentHTML('beforeend', `<li>Number of channels recorded: ${data[1]}</li>\n`)
    output.insertAdjacentHTML('beforeend', `<li>Sample Rate: ${data[2]}</li>\n`)
    output.insertAdjacentHTML('beforeend', `<li>Creation Date: ${dosDateTimeToString(data[3])}</li>\n`)
    output.insertAdjacentHTML('beforeend', `<li>Number of files (takes) in session: ${data[4]}</li>\n`)
    output.insertAdjacentHTML('beforeend', `<li>Number of markers in session: ${data[5]}</li>\n`)
    output.insertAdjacentHTML('beforeend', `<li>Duration of session on card: ${samplesToTimestamp(data[6], data[2])}</li>\n`)
    output.insertAdjacentHTML('beforeend', `<li>Duration of files (takes): ${listOfTimestamps(data[7], data[2])}</li>\n`)
    output.insertAdjacentHTML('beforeend', `<li>Marker timestamps: ${listOfTimestamps(data[8], data[2], )}</li>\n`)
    output.insertAdjacentHTML('beforeend', `<li>Session name: ${data[9]}</li>\n`)
    output.insertAdjacentHTML('beforeend', `<li>SD card number: ${data[10]}</li>\n`)
    output.insertAdjacentHTML('beforeend', `<li>Session duration on other card: ${samplesToTimestamp(data[11], data[2])}</li>\n`)
    outputElement.appendChild(output)
}

const displayListTxt = (data, sdnumber) => {
    if(sdnumber) {
        for (let i = 0; i < data[4]; i++) {
            outputFile.insertAdjacentText('beforeend', "file '" + inputPathB.value + (inputPathB.value===""?"":"/") + pad(i+1, 8) + ".WAV'\n")
        }
    } else {
        outputFile.innerHTML = ""
        for (let i = 0; i < data[4]; i++) {
            outputFile.insertAdjacentText('beforeend', "file '" + inputPathA.value + (inputPathA.value===""?"":"/") + pad(i+1, 8) + ".WAV'\n")
        }
    }
}

const displayCmd = (data, sdnumber) => {
    let channelsArray = new Array();
    if(channels.value !== "") {
        channelsArray = channels.value.split(",");
        for (i in channelsArray) {
            channelsArray[i] = parseInt(channelsArray[i], 10);
        }
    }
    if(!sdnumber) {
        outputCmd.innerHTML = "ffmpeg -f concat -safe 0 -i list.txt \\\n"
        outputCmd2.innerHTML = "ffmpeg -f concat -safe 0 -i list.txt"
        for (let i = 0; i < data[1]; i++) {
            if(channelsArray.length == 0 || channelsArray.includes(i+1)) {
                outputCmd.insertAdjacentText('beforeend', "-map_channel 0.0." + i + " /" + outputPath.value + (outputPath.value===""?"":"/") + pad(i+1, 2) + ".wav\" \\\n")
                outputCmd2.insertAdjacentText('beforeend', " -map_channel 0.0." + i + " /" + outputPath.value + (outputPath.value===""?"":"/") + pad(i+1, 2) + ".wav\"")
            }
        }
    }
}

function pad(n, width, z) {
    z = z || '0';
    n = n + '';
    return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
}

const dosToID = dos => {
    return dos.toString(16).toUpperCase()
}

const samplesToSeconds = (samples, rate) => {
    return Math.floor(samples/rate)
}

const samplesToTimestamp = (samples, rate) => {
    return (
        Math.floor(samples/rate/60/60) + ":" +
        Math.floor(samples/rate/60%60) + ":" +
        Math.floor(samples/rate%60) + "." +
        Math.floor(samples%rate/rate*1000)
    )
}

const listOfTimestamps = (sampleArray, rate) => {
    output = "";
    for (let i = 0; i < sampleArray.length; i++) {
        output += samplesToTimestamp(sampleArray[i], rate) + "  ";
    }
    return output
}

const dosDateTimeToString = dosDateTime => {
    return ((dosDateTime >>> 25) + 1980) + "-" + //Year (first 7 bits +1980)
    (dosDateTime << 7 >>> 28) + "-" + //Month (4 bits)
    (dosDateTime << 11 >>> 27) + " " + //Day (5 bits)
    (dosDateTime << 16 >>> 27) + ":" + //Hour (5 bits)
    (dosDateTime << 21 >>> 26) + ":" + //Minute (6 bits)
    ((dosDateTime << 27 >>> 27)*2) //Second (5 bits *2)
}

// const b64toBlob = (base64, type = 'application/octet-stream') => fetch(`data:${type};base64,${base64}`).then(res => res.blob())

// const testBlob = "yaGjUhAAAACAuwAAyaGjUgMAAAABAAAAADTxCADA/z8AwP8/AMATDwAAAAAAwP8/AMD/PwDA/z8AoGcYAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQrXwFwOOaACAymwAgP50AIGydACCZnQAgxp0AIAKeACAgngAgiZ4AIKeeACBpoAAglqAAILSgACDSoAAgDqEAICyhACCkoQAg0aEAIO+hACANogAgK6IAIKOiACDQogAQ76IAIAyjACAqowAgwKMAIM+jACD8owAgHaQAIDikACD4pwAgJagAIEOoACBhqAAgyqgAIOioACAGqQAgJKkAIEKpACDJqQAg56kAEPepACAUqgAgMqoAIF+qACDXqgCw+6oAIBOrACAxqwCQV6sAIG2rACD0qwAgEqwAIDCsAIBUrAAgbKwAIDyvACBarwAgeK8AIP+vACAssAAglbAAIA2xABAvsQCQWrEAIHaxACCUsQAg/bEAIBuyACBIsgAgZrIAIGWzAKCHswAgobMAIBm0ACA3tACQYLQAIIK0ACCgtAAgGLUAIDa1ACBjtQAggbUAIJ+1ACBAugAgXroAIHy6ACCaugAgx7oAID+7ACBduwAge7sAIJm7ACDGuwAg5LsAIE28ACBrvAAgibwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA="

// window.onload = () => {
//     b64toBlob(testBlob).then(res => readFile(res, outputElementA));
// }
