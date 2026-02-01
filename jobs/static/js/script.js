// Custom Scripts
document.addEventListener('DOMContentLoaded', function () {

    // Custom Scripts

    // Autocomplete Logic
    function autocomplete(inp, type) {
        let currentFocus;
        inp.addEventListener("input", function (e) {
            let a, b, i, val = this.value;
            closeAllLists();
            if (!val) { return false; }
            currentFocus = -1;
            a = document.createElement("DIV");
            a.setAttribute("id", this.id + "autocomplete-list");
            a.setAttribute("class", "autocomplete-items");

            // Append to the parent div instead of form to handle positioning better relative to input
            this.parentNode.parentNode.appendChild(a);

            // Fetch suggestions
            fetch(`/jobs/api/autocomplete/?term=${val}`)
                .then(response => response.json())
                .then(data => {
                    const items = type === 'title' ? data.titles : data.locations;
                    a.innerHTML = ''; // Clear previous
                    if (items.length === 0) {
                        closeAllLists();
                        return;
                    }

                    items.forEach(item => {
                        b = document.createElement("DIV");
                        // Bold the matching part
                        let matchIndex = item.toLowerCase().indexOf(val.toLowerCase());
                        if (matchIndex > -1) {
                            b.innerHTML = item.substr(0, matchIndex) + "<strong>" + item.substr(matchIndex, val.length) + "</strong>" + item.substr(matchIndex + val.length);
                        } else {
                            b.innerHTML = item;
                        }

                        b.innerHTML += "<input type='hidden' value='" + item + "'>";
                        b.addEventListener("click", function (e) {
                            inp.value = this.getElementsByTagName("input")[0].value;
                            closeAllLists();
                        });
                        a.appendChild(b);
                    });
                })
                .catch(err => console.log('Autocomplete fetch error:', err));
        });

        inp.addEventListener("keydown", function (e) {
            let x = document.getElementById(this.id + "autocomplete-list");
            if (x) x = x.getElementsByTagName("div");
            if (e.keyCode == 40) { // DOWN
                currentFocus++;
                addActive(x);
            } else if (e.keyCode == 38) { // UP
                currentFocus--;
                addActive(x);
            } else if (e.keyCode == 13) { // ENTER
                if (currentFocus > -1) {
                    if (x) x[currentFocus].click();
                }
            }
        });

        function addActive(x) {
            if (!x) return false;
            removeActive(x);
            if (currentFocus >= x.length) currentFocus = 0;
            if (currentFocus < 0) currentFocus = (x.length - 1);
            x[currentFocus].classList.add("autocomplete-active");
        }

        function removeActive(x) {
            for (let i = 0; i < x.length; i++) {
                x[i].classList.remove("autocomplete-active");
            }
        }

        function closeAllLists(elmnt) {
            let x = document.getElementsByClassName("autocomplete-items");
            for (let i = 0; i < x.length; i++) {
                if (elmnt != x[i] && elmnt != inp) {
                    x[i].parentNode.removeChild(x[i]);
                }
            }
        }
        document.addEventListener("click", function (e) {
            closeAllLists(e.target);
        });
    }

    // Initialize Autocomplete
    const jobInput = document.getElementById("job-search-input");
    const locInput = document.getElementById("location-search-input");
    if (jobInput) autocomplete(jobInput, 'title');
    if (locInput) autocomplete(locInput, 'location');


    // Initialize Vanta.js Effect (3D Background)
    if (document.getElementById('hero-animate')) {
        try {
            VANTA.NET({
                el: "#hero-animate",
                mouseControls: true,
                touchControls: true,
                gyroControls: false,
                minHeight: 200.00,
                minWidth: 200.00,
                scale: 1.00,
                scaleMobile: 1.00,
                color: 0x4e54c8,       // Primary color
                backgroundColor: 0x1a1a2e, // Dark background matching theme
                points: 12.00,
                maxDistance: 22.00,
                spacing: 18.00
            })
        } catch (e) {
            console.log("Vanta JS failed to load", e);
        }
    }

    // Initialize Vanilla-Tilt for 3D Cards
    if (typeof VanillaTilt !== 'undefined') {
        VanillaTilt.init(document.querySelectorAll(".js-tilt"), {
            max: 10,
            speed: 400,
            glare: true,
            "max-glare": 0.2,
            scale: 1.02
        });
    }

    // Auto-dismiss alerts
    var alerts = document.querySelectorAll('.toast');
    alerts.forEach(function (alert) {
        var bsAlert = new bootstrap.Toast(alert, { delay: 5000 });
        bsAlert.show();
    });

    // File Input Customization
    const fileInputs = document.querySelectorAll('input[type="file"]');
    fileInputs.forEach(input => {
        input.addEventListener('change', function (e) {
            const fileName = e.target.files[0]?.name;
            if (fileName) {
                // Could update a label here
            }
        });
    });

    // Animate numbers (e.g. stats) if any
    const counters = document.querySelectorAll('.counter');
    counters.forEach(counter => {
        const target = +counter.getAttribute('data-target');
        const updateCount = () => {
            const count = +counter.innerText;
            const inc = target / 200;
            if (count < target) {
                counter.innerText = Math.ceil(count + inc);
                setTimeout(updateCount, 10);
            } else {
                counter.innerText = target;
            }
        };
        updateCount();
    });
});
