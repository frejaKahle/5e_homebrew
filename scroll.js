function scrollWatch() {
    let mainNavLinks = document.querySelectorAll("nav ul li a");
    let mainSections = document.querySelectorAll("main section");
    let navbar = document.querySelector("nav.side");
    let navbarcon = navbar.parentNode;

    let lastId;
    let cur = [];

    // This should probably be throttled.
    // Especially because it triggers during smooth scrolling.
    // https://lodash.com/docs/4.17.10#throttle
    // You could do like...
    // window.addEventListener("scroll", () => {
    //    _.throttle(doThatStuff, 100);
    // });
    // Only not doing it here to keep this Pen dependency-free.

    window.addEventListener("scroll", event => {
        let fromTop = window.scrollY;
        let lastLinkDest = document.querySelector(mainNavLinks[mainNavLinks.length - 1].hash);
        if (
            navbarcon.offsetTop <= fromTop &&
            lastLinkDest.offsetTop + lastLinkDest.offsetHeight > fromTop
        ) {
            navbar.classList.add("fixed");
        } else {
            navbar.classList.remove("fixed");
        }
        mainNavLinks.forEach(link => {
            let section = document.querySelector(link.hash);
            let p;
            if (link.parentNode.parentNode.parentNode.tagName === "div")
                p = link.parentNode.parentNode.parentNode.parentNode;
            else
                p = link.parentNode.parentNode.parentNode;
            //if (link.parentNode.parentElement.tagName === "ul")
            //    p = link.parentNode.parentNode;
            //else
            //    p = link.parentNode.parentNode.parentNode;
            if (
                section.offsetTop <= fromTop &&
                section.offsetTop + section.offsetHeight > fromTop
            ) {
                link.classList.add("current");
                p.classList.add("current");
            } else {
                link.classList.remove("current");

                if (p.querySelector(".current") === null)
                    p.classList.remove("current");
            }
        });
    });
}