function nameForm(text) {
    return text.replaceAll(" ", "_").toLowerCase();
}

function feature(name, location) {
    let html = "<h4>" + name + "</h4>";
    return fetch(location + "/" + nameForm(name) + ".html")
        .then(response => response.text())
        .then(text => { return html + text });
}

function features(names, location, idx = 0) {
    let promises = []
    names.forEach(name => {
        promises.push(feature(name, location))
    });
    return Promise.all(promises).then((values) => {
        return values.join('');
    })
}

function table(tbl, title) {
    let html = "<h3>" + title + "</h3><table>";
    let row, refs, rsm;
    let rn = 0;
    tbl.forEach(r => {
        row = "<tr>";
        rsm = 0;
        r.forEach(element => {
            if (rn === 0)
                row = row + "<th";
            else
                row = row + "<td";
            if (typeof element !== "string") //object
            {
                if ('classes' in element) {
                    row = row + " class=\"" + element.classes.join(' ') + "\"";
                }
                if ('rowspan' in element) {
                    row = row + " rowspan = \"" + element.rowspan + "\"";
                    rsm = Math.max(rsm, parseInt(element.rowspan));
                }
                if ('colspan' in element) {
                    row = row + " colspan = \"" + element.colspan + "\"";
                }
                row = row + ">";
                if ('refs' in element) {
                    refs = [];
                    element.refs.forEach(ref => {
                        refs.push("<a href=#" + nameForm(ref) + ">" + ref + "</a>")
                    });
                    row = row + refs.join(", ")
                }
                row = row + element.value;
            } else //object
            {
                row = row + ">" + element;
            }
            row = row + "</th>";
        });
        rn = rn + 2 - rsm
        html = html + row + "</tr>"
    });
    return html + "</table>";
}

function dndclass(location, name) {

    let folder = location + "/" + name;
    return fetch(folder + "/" + "features.json")
        .then(response => response.json())
        .then(data => {
            let html = "<div><br><h1>" + data.clsname + "</h1><p cstyle=\"font-size:20px; color:grey; display:inline;\">Class Details</p><p>" + data.clsflavor + "</p><h2>" + data.sflavorname + "</h2><p>" + data.sflavor +
                "</p><h2>Creating" + data.aan + data.clsname + "</h2><div class=\"quick\"><h5>Quick Build</h5><p>" + data.quickbuild + "</p></div>" +
                table(data.table, "The " + data.clsname + " Table");
            return features(data.features, location + "/" + name + "/features").then(feats => {
                return html + feats + "</div>";
            });
        });
}