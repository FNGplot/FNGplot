/* SPDX-License-Identifier: Apache-2.0 */
/* Copyright (c) Wei-Hsu Lin & All Contributors to FNGplot */

/* convert.js: This file requires Node.js to run. It converts editpanels.txt to editpanels.json */

"use strict";

const fs = require('fs');

fs.readFile('editpanels.txt', (err, rawData) => {
    if (err)
        console.error(err);
    else {
        // process data
        let data = rawData.toString();
        data = data.replaceAll("    ",'');   //remove 4-space tab
        data = data.replaceAll("\"",'\'');   //change double quotes to single quotes
        let panelList = data.split(/\r\n\r\n|\r\r|\n\n/); //split data using two EOLs

        let jsonData = "{\n";
        for (let [index, elem] of panelList.entries()) {
            if (index % 2 == 0) {   //even elements are keys
                jsonData += `    "${elem}": `;
            } else {    // odd elements are values
                elem = elem.replaceAll(/\r\n|\r|\n/g,'');  //do away with newlines
                jsonData += `"${elem}"`;
                index == panelList.length-1 ? jsonData += '\n' : jsonData += ',\n'; //json doesn't allow trailing commas
            }
        }
        jsonData += "}";
        fs.writeFile('editpanels.json', jsonData, (err) => {
            if (err)
                console.error(err);
            else
                console.log(`Conversion complete. ${panelList.length / 2} panels minified.`);
        });
    }
});