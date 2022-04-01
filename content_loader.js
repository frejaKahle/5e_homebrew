var body = document.querySelector("body");
var primary, sidenav;

function nameForm(text) {
    return text.replaceAll(" ", "_").toLowerCase();
}

function nameFormInv(text) {
    return text.replaceAll("_", " ").replaceAll(/(?:^|\s)\S/g, function(a) { return a.toUpperCase(); });
}

function feature(name, location) {
    let html = "<div id=\"" + nameForm(name) + "\"><h4>" + name + "</h4>";
    return fetch(location + "/" + nameForm(name) + ".html")
        .then(response => response.text())
        .then(text => { return html + text + "</div>" });
}

function features(clsname, names, location, sc = false) {
    let promises = [];
    names.forEach(name => {
        promises.push(feature(name, location))
    });
    return Promise.all(promises).then((values) => {
        if (sc)
            return values.join('');
        else
            return "<div id=\"" + nameForm(clsname) + "_features\">" + values.join('') + "</div>";
    })
}

function table(tbl, title) {
    let html = "<div id=\"" + nameForm(title) + "_table\"><h3>The " + title + " Table</h3><table>";
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
    return html + "</table></div>";
}

function dndSubclassFNames(name, location) {
    let folder = location + "/" + nameForm(name);
    return fetch(folder + "/" + "features.json")
        .then(response => response.json())
        .then(data => {
            return data.features
        });
}

function dndSubclass(name, location) {
    let folder = location + "/" + nameForm(name);
    let html = "<div id=\"" + nameForm(name) + "\"><h3>" + name + "</h3>";
    return fetch(folder + "/" + "features.json")
        .then(response => response.json())
        .then(data => {
            html = html + "<p>" + data.scdesc + "</p>";
            return features(name, data.features, folder, true).then(text => {
                return html + text + "</div>";
            });
        });
}

function dndSubclasses(names, location, div, scname, scdesc, navlist) {
    let p1 = [];
    let p2 = [];
    let l1 = [];
    let l2 = [];
    names.forEach(name => {
        p1.push(dndSubclass(name, location));
        p2.push(dndSubclassFNames(name, location));
    });
    let p3 = Promise.all(p1).then((values) => {
        div.innerHTML += "<div id=\"" + nameForm(scname) + "\"><h2>" + scname + "</h2><p>" + scdesc + "</p>" + values.join('') + "</div>";
    });
    let fnl;
    let p4 = Promise.all(p2).then((values) => {
        for (let i = 0; i < names.length; i++) {
            l1 = [];
            values[i].forEach(f => {
                fnl = navlink(f);
                l1.push(fnl);
            });
            l2.push(navlink(names[i], null, { "nested": l1 }));
        }
        navlist.appendChild(navlink(scname, null, { "nested": l2 }));
    });
    return Promise.all([p3, p4]).then(n => {
        return null;
    })
}

function pageSetup() {
    //TODO: Implement Site Navigation
    let topdiv = document.createElement("div");
    topdiv.id = "top";

    // content of page
    let contentdiv = document.createElement("div");
    contentdiv.classList.add("content");
    //secondary content: nav 
    let secdiv = document.createElement("div");
    sidenav = document.createElement("nav");
    sidenav.appendChild(document.createElement("div"));
    secdiv.appendChild(sidenav);
    secdiv.classList.add("secondarycontent");
    sidenav.classList.add("side");
    sidenav.firstChild.appendChild(document.createElement("ul"));
    navlist = sidenav.firstChild.firstChild;
    contentdiv.appendChild(secdiv);
    //Primary Content
    primary = document.createElement('div');
    primary.classList.add("primarycontent");
    contentdiv.appendChild(primary);

    body.appendChild(topdiv);
    body.appendChild(contentdiv);
}

function dndclass(location, name, elem, navlist) {
    let folder = location + "/" + name;
    return fetch(folder + "/" + "features.json")
        .then(response => response.json())
        .then(data => {
            elem.innerHTML += "<div id=\"" + nameForm(data.clsname) + "\"><br><h1>" + data.clsname + "</h1><p cstyle=\"font-size:20px; color:grey; display:inline;\">Class Details</p><p>" + data.clsflavor + "</p><h2>" + data.sflavorname + "</h2><p>" + data.sflavor +
                "</p></div><div id=\"creating" + nameForm(data.aan) + nameForm(data.clsname) + "\"><h2>Creating" + data.aan + data.clsname + "</h2><div class=\"quick\"><h5>Quick Build</h5><p>" + data.quickbuild + "</p></div></div>" +
                table(data.table, data.clsname);


            navlist.appendChild(navlink("back to top", "top", { "classes": ["nav-top-link"] }));
            navlist.appendChild(navlink(data.clsname, null, { "classes": ["title"] }));
            navlist.appendChild(navlink("Creating" + nameFormInv(data.aan) + data.clsname));
            navlist.appendChild(navlink(data.clsname + " Table"));

            return features(data.clsname, data.features, folder + "/features").then(feats => {
                elem.innerHTML += feats;
                navfeats = [];
                data.features.forEach(name => {
                    navfeats.push(navlink(name));
                });
                navlist.appendChild(navlink(data.clsname + " Features", null, { "nested": navfeats }))

                return dndSubclasses(data.subclasses, folder + "/subclasses", elem, data.subclassname, data.subclassdesc, navlist).then(n => {

                    return null;
                });
            });
        });
}

function navlink(name, link = null, options = null) {
    link = link || nameForm(name)
    let li = document.createElement("li");
    let s = document.createElement("span");
    li.appendChild(s);
    let t = s;
    let r = li;
    if (options !== null) {
        if (options.italics !== undefined && options.italics === true) {
            t.appendChild(document.createElement("i"));
            t = t.lastChild;
        }
        if (options.bold !== undefined && options.bold === true) {
            t.appendChild(document.createElement("b"));
            t = t.lastChild;
        }
        if (options.classes !== undefined && options.classes.length > 0) {
            options.classes.forEach(cls => {
                li.classList.add(cls);
            });
        }
        if (options.nested !== undefined && options.nested.length > 0) {
            let ul = document.createElement("ul");
            options.nested.forEach(le => {
                ul.appendChild(le);
            });
            btn = document.createElement("div");
            btn.setAttribute("onclick", `navdrop(${nameForm(name)}_dropdown)`);
            btn.appendChild(document.createElement("i"));
            btn.classList.add("dropbtn");
            s.appendChild(btn);
            let d = document.createElement("div");
            d.id = nameForm(name) + "_dropdown"
            d.appendChild(li);
            d.appendChild(ul);
            r = d;
        }
    }
    let a = document.createElement("a");
    a.innerHTML = name
    a.href = `#${link}`;
    t.prepend(a);
    return r;
}

function navdrop(elem) {
    if (elem.classList.contains("open"))
        elem.classList.remove("open");
    else
        elem.classList.add("open");
}

function sitenav() {

}