import puppeteer from 'puppeteer-core';
import process from 'process';

async function main() {
    var max: number = 20;
    var pattern: string;
    var patternSplit: Array<string>;
    var dict: Array<string> = [];
    var tempDict: Array<string>;
    var finalDict: any = {};
    var lastFinalDict = {};
    await fetch('https://textic.github.io/assets/dictionary.json').then(res => res.json()).then(data => {
    dict = data.spanish;
    }).catch(err => {console.log(err); process.exit(1);});

    console.clear();
    const browser = await puppeteer.launch({channel: 'chrome', headless: false});
    const page = await browser.newPage();
    await page.setViewport({width: 1920, height: 1080});
    await page.goto('https://skribbl.io/');
    console.log("Waiting for the game to start...");
    // wapt
    await page.waitForSelector('.word-length', {timeout: 0});
    console.clear();
    while (true) {
        var hintsDiv: any = await page.$('.hints');
        var containerDiv: any = await hintsDiv.$('.container');
        var hints = await containerDiv.$$('.hint', (el: any) => el.innerText);
        pattern = '';
        patternSplit = [];
        for (var i = 0; i < hints.length; i++) {
            var hint = hints[i];
            var hintValue = await hint.evaluate((el: any) => el.innerText);
            if (hintValue == "") {
                pattern += "-";
                continue;
            }
            pattern += hintValue;
        }
        if (pattern.includes("-")) { // if there is a dash, split the pattern and save in array of patterns
            patternSplit = pattern.split("-");
        } else { // save the pattern in an array anyway
            patternSplit = [pattern];
        }
        for (var i = 0; i < patternSplit.length; i++) {
            finalDict[i] = {
                "pattern": patternSplit[i],
                "len": patternSplit[i].length,
                "details": getPatternDetails(patternSplit[i])
            }
        }
        if (JSON.stringify(lastFinalDict) != JSON.stringify(finalDict)) {
            // set the lastfinaldict to the current finaldict but if i change the finaldict, the lastfinaldict will not change
            lastFinalDict = JSON.parse(JSON.stringify(finalDict));
            console.clear();
            tempDict = [];
            // loo through the finaldict {pattern: "_a__i_o", len: 7, details: {1: ["a"], 4: ["i"], 6: ["o"]}
            for (var i = 0; i < Object.keys(finalDict).length; i++) {
                console.log("Pattern: " + finalDict[i].pattern);
                tempDict = getWordsByPattern(dict, finalDict[i].pattern, finalDict[i].details);
                if (tempDict.length < max) {
                    for (var j = 0; j < tempDict.length; j++) {
                        process.stdout.write(tempDict[j] + "  |  ");
                    }
                    console.log("");
                } else {
                    console.log("The list of words are longer than " + max);
                }
            }
        }
    }
}

function getPatternDetails(pattern: string) { // patterns like "_a__i_o"
    var patternDetails: any = {};
    for (var i = 0; i < pattern.length; i++) {
        var letter = pattern[i];
        if (letter == "_") {
            continue;
        }
        patternDetails[i] = [letter];
    }
    return patternDetails;
}

function getWordsByPattern(dict: Array<string>, pattern: string, patternDetails: any) {
    var wordHits = [];
    var words = [];
    var len = pattern.length;
    for (var i = 0; i < dict.length; i++) { // get words with the same length
        var word = dict[i];
        if (word.length == len) {
            words.push(word);
        }
    }
    for (var i = 0; i < words.length; i++) { // check if the word match with the pattern
        var word = words[i];
        var hits = 0;
        for (var j = 0; j < word.length; j++) {
            if (pattern[j] == "_") {
                continue;
            }
            var letter = word[j];
            if (letter.toLowerCase() == pattern[j].toLowerCase()) {
                hits++;
            }
        }
        if (hits == Object.keys(patternDetails).length) {
            wordHits.push(word);
        }
    }
    return wordHits;
}

// function setMaxToArray(array, max) {
//     var newArray = [];
//     if(array.length > max) {
//         for (var i = 0; i < max; i++) {
//             pickRandom(array, {count: max});
//         }
//     }
//     return newArray;
// }

main();