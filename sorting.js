var listLength = 100;
var maxValue = 100;
var list = [];
var unsortedList = [];
var state = "unsorted";
var comparisons = 0;
var speed = 3;
var delayDuration;
var delayFrequency;

$(document).ready(function() {
    $("#listLength").val(listLength);
    $("#maxValue").val(maxValue);
    $("#speed").val(speed);

    generateList()
    updateSpeed()

    $(window).resize(function() {showList([], [], [])});
    $("#generateList").click(generateList);
    $("#sortList").click(sortList);
    $("#unsortList").click(unsortList);
    $("#cancelSort").click(unsortList);
    $("#speed").on("input", updateSpeed);
    $("#listLength").change(function(){
        $("#listLength").val(Math.max(1, Math.min(1000, parseInt($("#listLength").val() || 0))));
    });
    $("#maxValue").change(function(){
        $("#maxValue").val(Math.max(1, Math.min(1000, parseInt($("#maxValue").val() || 0))));
    });
});

function generateList() {
    listLength = parseInt($("#listLength").val());
    maxValue = parseInt($("#maxValue").val());
    list = [];
    for (let i = 0; i < listLength; i++) {
        list[i] = Math.floor(Math.random() * (maxValue + 1));
    }
    state = "unsorted";
    updateControls();
    showList([], [], []);
}

function showList(yellow, red, pink) {
    let percentageWidth = 75 / listLength;
    let pixelWidth = $("#visualisation").width() * percentageWidth / 100;
    let fontSize = Math.min(40, Math.floor(pixelWidth / 2));
    let showValues = false;

    $("#lengthCheck").css("font-size", `${fontSize}px`);
    $("#lengthCheck").html(maxValue);
    if ($("#lengthCheck").width() < pixelWidth) {
        showValues = true;
    }
    
    $("#visualisation").empty();
    for (let i = 0; i < list.length; i++) {
        
        styleString = `style='
            width:${percentageWidth}%;
            height:${list[i] / maxValue * 100}%;
            font-size:${fontSize}px;
            background-color:${red.includes(i) ? "red" : (yellow.includes(i) ? "greenyellow" : (pink.includes(i) ? "pink" : "green"))}'`
        $("#visualisation").append(`<div class='bar' ${styleString}>${(showValues && fontSize > 10) ? list[i]: ""}</div>`);
    }
}

function updateControls() {
    $("#listControls").css("display", state == "sorting" ? "none" : "block");
    $("#algorithmLabel").css("display", state == "sorted" || state == "sorting" ? "none" : "inline");
    $("#algorithm").css("display", state == "sorted" || state == "sorting" ? "none" : "inline");
    $("#sortList").css("display", state == "sorted" || state == "sorting" ? "none" : "inline");
    $("#unsortList").css("display", state == "sorted" ? "inline" : "none");
    $("#cancelSort").css("display", state == "sorting" ? "inline" : "none");
    updateStatus();
}

function updateStatus() {
    $("#status").removeClass("text-warning text-success text-danger")
    if (state == "sorting") {
        $("#status").html(`Sorting...  Comparisons: ${comparisons.toLocaleString()}`);
        $("#status").addClass("text-warning");
    }
    else if (state == "sorted") {
        $("#status").html(`Sorting complete.  Comparisons: ${comparisons.toLocaleString()}`);
        $("#status").addClass("text-success");
    }
    else {
        $("#status").empty();
    }
}

function unsortList() {
    state = "unsorted";
    list = unsortedList;
    updateControls();
    showList([], [], []);
}

function updateSpeed() {
    speed = parseInt($("#speed").val());
    $("#speedText").html("x" + (Math.pow(10, Math.floor(speed / 2)) * (speed % 2 == 0 ? 1 : 5)).toLocaleString())
    delayDuration = speed < 6 ? (Math.pow(10, 3 - Math.floor(speed / 2)) / (speed % 2 == 0 ? 1 : 2)): 1;
    delayFrequency = speed > 6 ? (Math.pow(10, Math.floor(speed / 2) - 3) * (speed % 2 == 0 ? 1 : 5)) : 1;
}

async function sortList() {
    let algorithm = $("#algorithm").val();
    unsortedList = list.slice();
    state = "sorting";
    comparisons = 0;
    updateControls();
    switch (algorithm) {
        case "selection":
            await selectionSort();
            break;
        case "insertion":
            await insertionSort();
            break;
        case "bubble":
            await bubbleSort();
            break;
        case "cocktail":
            await cocktailShakerSort();
            break;
        case "merge":
            await mergeSort(0, list.length);
            break;
        case "quick":
            await quickSort(0, list.length - 1)
            break;
        case "heap":
            await heapSort();
            break;
    }
    if (state == "sorting") {
        state = "sorted";
    }
    else {
        list = unsortedList;
    }
    updateControls()
    showList([], [], []);
}

async function selectionSort() {
    let count = 0;
    let yellow = [];
    let red = [];
    let pink = [];
    let n = list.length;
    for (let i = 0; i < n - 1; i++) {
        let min = i;
        for (let j = i + 1; j < n; j++) {
            if (state != "sorting") {
                return;
            }
            comparisons++;
            count++;
            pink.push(min);
            yellow.push(j);
            if (list[j] < list[min]) {
                min = j
            }
            if (count >= delayFrequency) {
                count = 0;
                showList(yellow, red, pink);
                updateStatus();
                await sleep(delayDuration);
            }
            yellow = [];
            pink = [];
        }
        count++;
        if (min != i) {
            red.push(i, min)
            swap(i, min);
        }
        if (count >= delayFrequency) {
            count = 0;
            showList(yellow, red, pink);
            updateStatus();
            await sleep(delayDuration);
        }
        red = [];
    }
}

async function insertionSort() {
    let count = 0;
    let yellow = [];
    let red = [];
    let n = list.length;
    for (let i = 1; i < n; i++) {
        let j = i;
        while (j > 0 && list[j - 1] > list[j]) {
            if (state != "sorting") {
                return;
            }
            comparisons++;
            count++;
            yellow.push(j, j-1)
            swap(j, j-1);
            red.push(j, j - 1)
            j -= 1;
            if (count >= delayFrequency) {
                count = 0;
                showList(yellow, red, []);
                updateStatus();
                await sleep(delayDuration);
            }
            yellow = [];
            red = [];
        }
    }
}

async function bubbleSort() {
    let count = 0;
    let yellow = [];
    let red = [];
    let n = list.length;
    do {
        swapped = false;
        for (let i = 0; i < n - 1; i++) {
            if (state != "sorting") {
                return;
            }
            comparisons++;
            count++;
            yellow.push(i, i+1);
            if (list[i] > list[i+1]) {
                red.push(i, i+1)
                swap(i, i+1);
                swapped = true;
            }
            if (count >= delayFrequency) {
                count = 0;
                showList(yellow, red, []);
                updateStatus();
                await sleep(delayDuration);
            }
            yellow = [];
            red = [];
        }
        n = n - 1;
    } while (swapped)
}

async function cocktailShakerSort() {
    let count = 0;
    let yellow = [];
    let red = [];
    let n = list.length;
    let start = 0;
    let end = n;
    while (start <= end) {
        newStart = end;
        newEnd = start;
        for (let i = start; i < end + 1; i++) {
            if (state != "sorting") {
                return;
            }
            comparisons++;
            count++;
            yellow.push(i, i+1);
            if (list[i] > list[i+1]) {
                red.push(i, i+1)
                swap(i, i+1);
                newEnd = i;
            }
            if (count >= delayFrequency) {
                count = 0;
                showList(yellow, red, []);
                updateStatus();
                await sleep(delayDuration);
            }
            yellow = [];
            red = [];
        }
        end = newEnd - 1;
        for (let i = end; i > start - 1; i--) {
            if (state != "sorting") {
                return;
            }
            comparisons++;
            count++;
            yellow.push(i, i+1);
            if (list[i] > list[i+1]) {
                red.push(i, i+1)
                swap(i, i+1);
                newStart = i;
            }
            if (count >= delayFrequency) {
                count = 0;
                showList(yellow, red, []);
                updateStatus();
                await sleep(delayDuration);
            }
            yellow = [];
            red = [];
        }
        start = newStart + 1;
    }
}

async function mergeSort(start, end) {
    if (end > start + 1) {
        let mid = start + Math.floor((end - start) / 2);
        await mergeSort(start, mid);
        await mergeSort(mid, end);
        await merge(start, mid, end);
    }
}

async function merge(start, mid, end) {
    let count = 0;
    let yellow = [];
    let red = [];
    let left = [];
    for (let i = 0; i < mid - start; i++) {
        left[i] = list[start + i];
    }
    let right = [];
    for (let i = 0; i < end - mid; i++) {
        right[i] = list[mid + i];
    }

    let i = 0;
    let j = 0;
    let k = start;
    while (i < left.length && j < right.length) {
        if (state != "sorting") {
            return;
        }
        if (left[i] <= right[j]) {
            list[k] = left[i];
            i++;
            count++;
            comparisons++;
            red.push(k);
            if (count >= delayFrequency) {
                count = 0;
                showList(yellow, red, []);
                updateStatus();
                await sleep(delayDuration);
            }
            red = [];
        } else {
            list[k] = right[j];
            j++;
            count++;
            comparisons++;
            red.push(k);
            if (count >= delayFrequency) {
                count = 0;
                showList(yellow, red, []);
                updateStatus();
                await sleep(delayDuration);
            }
            red = [];
        }
        k++;
    }

    while (i < left.length) {
        if (state != "sorting") {
            return;
        }
        list[k] = left[i];
        i++;
        k++;
        count++;
        comparisons++;
        red.push(k);
        if (count >= delayFrequency) {
            count = 0;
            showList(yellow, red, []);
            updateStatus();
            await sleep(delayDuration);
        }
        red = [];
    }
    while (j < right.length) {
        if (state != "sorting") {
            return;
        }
        list[k] = right[j];
        j++;
        k++;
        count++;
        comparisons++;
        red.push(k);
        if (count >= delayFrequency) {
            count = 0;
            showList(yellow, red, []);
            updateStatus();
            await sleep(delayDuration);
        }
        red = [];
    }
}

async function quickSort(start, end) {
    if (end > start) {
        let p = await partition(start, end)
        await quickSort(start, p - 1);
        await quickSort(p + 1, end);
    }
}

async function partition(start, end) {
    let count = 0;
    let red = [];
    let pink = [];
    let pivot = list[end];
    pink.push(end);
    i = start - 1;
    for (let j = start; j < end; j++) {
        if (state != "sorting") {
            return;
        }
        comparisons++;
        if (list[j] <= pivot) {
            i++;
            swap(i, j);
            count++;
            red.push(i, j);
            if (count >= delayFrequency) {
                count = 0;
                showList([], red, pink);
                updateStatus();
                await sleep(delayDuration);
            }
            red = [];
        }
    }
    i++;
    swap(i, end);
    count++;
    red.push(i, end);
    if (count >= delayFrequency) {
        count = 0;
        showList([], red, pink);
        updateStatus();
        await sleep(delayDuration);
    }
    red = [];
    pink = []
    return i;
}

async function heapSort() {  
    for (let i = 0; i < list.length; i++) {
        await heapify(i);  
    }
}

async function heapify(start) {
    let count = 0;
    let red = [];
    for (let i = start; i < list.length; i++) {  
        let j = i;
        let root = start + Math.floor((j - start) / 2);  
        while (root >= start && list[root] > list[j]) {
            if (state != "sorting") {
                return;
            }
            comparisons++;
            swap(j, root);
            red.push(j, root);
            j = root;
            count++;
            if (count >= delayFrequency) {
                count = 0;
                showList([], red, []);
                updateStatus();
                await sleep(delayDuration);
            }
            red = [];
            root = start + Math.floor((j - start) / 2);  
        }
    } 
}

function swap(i, j) {
    temp = list[i];
    list[i] = list[j];
    list[j] = temp;
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}