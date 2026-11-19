
/* =====================================
   1. MOBILE NAVIGATION
===================================== */

const menuBtn = document.querySelector(".menu-btn");
const navLinks = document.querySelector(".nav-links");

if (menuBtn && navLinks) {
    menuBtn.addEventListener("click", function () {
        navLinks.classList.toggle("active");
    });
}


/* =====================================
   2. SMOOTH SCROLLING
===================================== */

document.querySelectorAll('a[href^="#"]').forEach(function (link) {

    link.addEventListener("click", function (event) {

        const targetId = this.getAttribute("href");

        if (targetId.length > 1) {
            const targetSection = document.querySelector(targetId);

            if (targetSection) {
                event.preventDefault();

                targetSection.scrollIntoView({
                    behavior: "smooth"
                });
            }
        }
    });
});


/* =====================================
   3. USER REGISTRATION
===================================== */

const registerForm = document.querySelector("#registerForm");

if (registerForm) {

    registerForm.addEventListener("submit", async function (event) {

        event.preventDefault();

        const name = document.querySelector("#registerName").value.trim();
        const email = document.querySelector("#registerEmail").value.trim();
        const password = document.querySelector("#registerPassword").value;
        const confirmPassword = document.querySelector("#confirmPassword").value;

        if (password.length < 8) {
            alert("Password must contain at least 8 characters.");
            return;
        }

        if (password !== confirmPassword) {
            alert("Passwords do not match.");
            return;
        }

        try {

            const response = await fetch("/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    name: name,
                    email: email,
                    password: password
                })
            });

            const result = await response.json();

            alert(result.message);

            if (response.ok) {
                window.location.href = "/login.html";
            }

        } catch (error) {
            alert("Server connection failed. Please try again.");
            console.error(error);
        }

    });

}


/* =====================================
   4. USER LOGIN
===================================== */

const loginForm = document.querySelector("#loginForm");

if (loginForm) {

    loginForm.addEventListener("submit", async function (event) {

        event.preventDefault();

        const email = document.querySelector("#loginEmail").value.trim();
        const password = document.querySelector("#loginPassword").value;

        try {

            const response = await fetch("/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    email: email,
                    password: password
                })
            });

            const result = await response.json();

            if (response.ok) {
                alert("Welcome " + result.name);
                window.location.href = "/dashboard.html";
            } else {
                alert(result.message);
            }

        } catch (error) {
            alert("Server connection failed.");
            console.error(error);
        }

    });

}


/* =====================================
   5. SHOW / HIDE PASSWORD
===================================== */

document.querySelectorAll(".toggle-password").forEach(function (button) {

    button.addEventListener("click", function () {

        const passwordInput = this.previousElementSibling;

        if (passwordInput && passwordInput.type === "password") {
            passwordInput.type = "text";
            this.textContent = "Hide";
        } else if (passwordInput) {
            passwordInput.type = "password";
            this.textContent = "Show";
        }

    });

});


/* =====================================
   6. BACK TO TOP
===================================== */

const backToTop = document.querySelector("#backToTop");

if (backToTop) {

    backToTop.addEventListener("click", function () {

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

    });

}


/* =====================================
   7. USER LOGOUT
===================================== */

const logoutBtn = document.querySelector("#logoutBtn");

if (logoutBtn) {

    logoutBtn.addEventListener("click", async function () {

        try {

            const response = await fetch("/logout", {
                method: "POST",
                credentials: "same-origin"
            });

            const result = await response.json();

            if (response.ok) {
                alert(result.message);
                window.location.href = "/login.html";
            } else {
                alert("Logout failed. Please try again.");
            }

        } catch (error) {
            alert("Something went wrong!");
            console.error(error);
        }

    });

}


/* =====================================
   8. DYNAMIC PLACE DETAILS
===================================== */

const placeData = {

    "bara-imambara": {
        name: "Bara Imambara",
        description: "A famous historical monument located in Lucknow.",
        location: "Hussainabad, Lucknow",
        category: "Historical Place",
        latitude: 26.8694,
        longitude: 80.9126
    },

    "rumi-darwaza": {
        name: "Rumi Darwaza",
        description: "A beautiful historical gateway and landmark of Lucknow.",
        location: "Husainabad, Lucknow",
        category: "Historical Gateway",
        latitude: 26.8698,
        longitude: 80.9125
    },

    "ambedkar-park": {
        name: "Ambedkar Memorial Park",
        description: "A famous memorial park in Gomti Nagar, Lucknow.",
        location: "Gomti Nagar, Lucknow",
        category: "Memorial Park",
        latitude: 26.8505,
        longitude: 80.9993
    }

};
// Calculate distance between two locations

function getDistanceInKm(lat1, lon1, lat2, lon2) {

    const R = 6371;

    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;

    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(lat1 * Math.PI / 180) *
        Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) ** 2;

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
}

// Get selected place from URL

const selectedPlace = new URLSearchParams(
    window.location.search
).get("place") || "bara-imambara";

const place = placeData[selectedPlace] || placeData["bara-imambara"];

if (place) {

    // Update destination details

    const destinationCard = document.querySelector(
        ".destination-card"
    );

    if (destinationCard) {

        destinationCard.innerHTML = `
                <h3>${place.name}</h3>
                <p>${place.description}</p>
                <p><strong>Location:</strong> ${place.location}</p>
                <p><strong>Category:</strong> ${place.category}</p>
            `;

    }


    // Update route destination

    const routeDestination = document.querySelector(
        ".route-info-card p:nth-child(2)"
    );

    if (routeDestination) {

        routeDestination.innerHTML = `
                <strong>Destination:</strong> ${place.name}, Lucknow
            `;

    }


    // DISPLAY DESTINATION MAP AND VERIFIED REPORTS

    const mapElement = document.getElementById("destinationMap");

    if (mapElement && window.L) {

        const map = L.map("destinationMap").setView(
            [place.latitude, place.longitude],
            16
        );

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: '&copy; OpenStreetMap contributors'
        }).addTo(map);

        L.marker([place.latitude, place.longitude])
            .addTo(map)
            .bindPopup(place.name)
            .openPopup();


// DISPLAY ACTIVE RESTRICTED PLACES ON MAP

fetch("/active-restricted-places", {
    credentials: "same-origin"
})
.then(response => {
    if (!response.ok) {
        throw new Error("Unable to fetch restricted places");
    }
    return response.json();
})
.then(data => {

    if (!Array.isArray(data.places)) return;

    data.places.forEach(restrictedPlace => {

        const latitude = Number(restrictedPlace.latitude);
        const longitude = Number(restrictedPlace.longitude);
        const radius = Number(restrictedPlace.radius);

        if (
            !Number.isFinite(latitude) ||
            !Number.isFinite(longitude) ||
            !Number.isFinite(radius)
        ) {
            return;
        }

        L.circle([latitude, longitude], {
            radius: radius,
            color: "yellow",
            fillColor: "yellow",
            fillOpacity: 0.25,
            weight: 2
        })
        .addTo(map)
        .bindPopup(`
            <strong>Restricted Area</strong>
            <p>${restrictedPlace.place_name}</p>
            <p>Reason: ${restrictedPlace.reason}</p>
            <p>Radius: ${radius} metres</p>
        `);

    });

})
.catch(error => {
    console.error("Restricted Places Map Error:", error);
});


        // Fetch admin-reviewed reports

        fetch("/verified-reports")
            .then(response => {

                if (!response.ok) {
                    throw new Error("Unable to fetch reports");
                }

                return response.json();

            })
            .then(data => {


                if (!Array.isArray(data.reports)) return;
                const nearbyReports = data.reports.filter(report => {

                    const lat = Number(report.latitude);
                    const lng = Number(report.longitude);

                    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
                        return false;
                    }

                    return true;

                });
                // Update Safety Report Summary

                console.log("MAP REPORTS:", nearbyReports.map(report => ({
                    type: report.report_type,
                    location: report.location,
                    latitude: report.latitude,
                    longitude: report.longitude
                })));

                const totalCount = nearbyReports.length;

                const cautionCount = nearbyReports.filter(
                    report => report.report_type === "caution"
                ).length;

                const dangerCount = nearbyReports.filter(
                    report => report.report_type === "danger"
                ).length;

                // UPDATE DESTINATION SAFETY STATUS

                const safetyStatus = document.getElementById("safetyStatus");

                if (safetyStatus) {

                    safetyStatus.className = "safety-status";

                    if (dangerCount > 0) {

                        safetyStatus.textContent =
                            "HIGH DANGER - Serious verified danger reports are available.";

                        safetyStatus.classList.add("status-danger");

                    } else if (cautionCount > 0) {

                        safetyStatus.textContent =
                            "LOW DANGER - Verified caution reports are available.";

                        safetyStatus.classList.add("status-caution");

                    } else {

                        safetyStatus.textContent =
                            "SAFE - No verified safety issues reported.";

                        safetyStatus.classList.add("status-safe");

                    }
                }


                // UPDATE REPORT COUNTS

                document.getElementById("totalVerifiedReports").textContent = totalCount;

                document.getElementById("cautionReports").textContent = cautionCount;

                document.getElementById("dangerReports").textContent = dangerCount;


                // DISPLAY VERIFIED REPORT MARKERS

                const reportMarkerPoints = [];

                nearbyReports.forEach(report => {

                    const lat = Number(report.latitude);
                    const lng = Number(report.longitude);

                    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
                        return;
                    }

                    const reportType = String(report.report_type).toLowerCase();

                    const markerColor =
                        ["danger", "open_pit", "unsafe_structure"].includes(reportType)
                            ? "red"
                            : "orange";

                    const marker = L.circleMarker([lat, lng], {
                        radius: 9,
                        color: markerColor,
                        fillColor: markerColor,
                        fillOpacity: 0.8,
                        weight: 2
                    }).addTo(map);

                    reportMarkerPoints.push(marker.getLatLng());

                    const popup = document.createElement("div");

                    const heading = document.createElement("strong");
                    heading.textContent = report.report_type;

                    const location = document.createElement("p");
                    location.textContent = report.location;

                    const description = document.createElement("p");
                    description.textContent = report.description;

                    const reviewNote = document.createElement("small");
                    reviewNote.textContent = "Admin-reviewed report";

                    popup.append(heading, location, description, reviewNote);

                    marker.bindPopup(popup);

                });

                // SHOW ALL REPORT LOCATIONS ON MAP

                if (reportMarkerPoints.length > 0) {
                    map.fitBounds(reportMarkerPoints, {
                        padding: [40, 40],
                        maxZoom: 14
                    });
                }


            })
            .catch(error => {
                console.error("Safety Reports Error:", error);
            });

    }  // Close mapElement condition

}      // Close place condition


/* =====================================
   9. SAFETOUR ADMIN PANEL JAVASCRIPT
===================================== */

document.addEventListener("DOMContentLoaded", function () {
    const loginForm = document.getElementById("adminLoginForm");

    // Admin page par hi code run hoga

    if (!loginForm) return;

    const loginSection = document.getElementById("adminLoginSection");
    const dashboard = document.getElementById("adminDashboard");

    const loginMessage = document.getElementById("loginMessage");
    const reportMessage = document.getElementById("reportMessage");

    const reportsTableBody = document.getElementById("reportsTableBody");


    /* =====================================
       1. ADMIN LOGIN
    ===================================== */

    loginForm.addEventListener("submit", async function (event) {

        event.preventDefault();

        const email = document.getElementById("adminEmail").value;
        const password = document.getElementById("adminPassword").value;

        try {

            const response = await fetch("/admin-login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "same-origin",
                body: JSON.stringify({
                    email: email,
                    password: password
                })
            });

            const result = await response.json();

            if (response.ok) {

                loginSection.style.display = "none";
                dashboard.style.display = "block";

                loadAdminReports();
                window.loadRestrictedPlaces();

            } else {

                loginMessage.textContent = result.message;

            }

        } catch (error) {

            loginMessage.textContent = "Server connection failed.";

            console.error(error);

        }

    });


    /* =====================================
       2. LOAD ADMIN REPORTS
    ===================================== */

    async function loadAdminReports() {

        try {

            const response = await fetch("/admin/reports", {
                credentials: "same-origin"
            });

            const result = await response.json();

            if (!response.ok) {
                reportMessage.textContent = result.message;
                return;
            }

            const reports = result.reports;


            // Update statistics

            document.getElementById("totalReports").textContent =
                reports.length;

            document.getElementById("pendingReports").textContent =
                reports.filter(r => r.status === "pending").length;

            document.getElementById("verifiedReports").textContent =
                reports.filter(r => r.status === "verified").length;

            document.getElementById("rejectedReports").textContent =
                reports.filter(r => r.status === "rejected").length;


            // Clear old table rows

            reportsTableBody.replaceChildren();

            if (reports.length === 0) {

                const row = document.createElement("tr");
                const cell = document.createElement("td");

                cell.colSpan = 7;
                cell.textContent = "No reports available.";

                row.appendChild(cell);
                reportsTableBody.appendChild(row);

                return;
            }


            // Display reports

            reports.forEach(function (report) {

                const row = document.createElement("tr");

                const values = [
                    report.id,
                    report.user_name || "Unknown",
                    report.location,
                    report.report_type,
                    report.description,
                    report.status
                ];

                values.forEach(function (value) {

                    const cell = document.createElement("td");
                    cell.textContent = value ?? "";

                    row.appendChild(cell);

                });


                // Action buttons

                const actionCell = document.createElement("td");

                if (report.status === "pending") {

                    const verifyButton = document.createElement("button");
                    verifyButton.textContent = "Verify";

                    verifyButton.addEventListener("click", function () {
                        reviewReport(report.id, "verified");
                    });


                    const rejectButton = document.createElement("button");
                    rejectButton.textContent = "Reject";

                    rejectButton.addEventListener("click", function () {
                        reviewReport(report.id, "rejected");
                    });

                    actionCell.appendChild(verifyButton);
                    actionCell.appendChild(rejectButton);

                } else {

                    actionCell.textContent = "Reviewed";

                }

                row.appendChild(actionCell);

                reportsTableBody.appendChild(row);

            });

        } catch (error) {

            reportMessage.textContent = "Unable to load reports.";

            console.error(error);

        }

    }


    /* =====================================
       3. VERIFY OR REJECT REPORT
    ===================================== */

    async function reviewReport(reportId, status) {

        try {

            const response = await fetch(
                `/admin/review-report/${reportId}`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    credentials: "same-origin",
                    body: JSON.stringify({
                        status: status
                    })
                }
            );

            const result = await response.json();

            reportMessage.textContent = result.message;

            if (response.ok) {
                loadAdminReports();
            }

        } catch (error) {

            reportMessage.textContent = "Unable to update report.";

            console.error(error);

        }

    }


    /* =====================================
       4. ADMIN LOGOUT
    ===================================== */

    const adminLogoutBtn = document.getElementById("adminLogoutBtn");

    if (adminLogoutBtn) {

        adminLogoutBtn.addEventListener("click", async function () {

            try {

                const response = await fetch("/admin-logout", {
                    method: "POST",
                    credentials: "same-origin"
                });

                if (response.ok) {
                    window.location.reload();
                } else {
                    reportMessage.textContent = "Admin logout failed.";
                }

            } catch (error) {

                console.error("Admin Logout Error:", error);

            }

        });

    }

});
// =====================================
// MY SAFETY REPORT HISTORY
// =====================================

document.addEventListener("DOMContentLoaded", async function () {

    const reportsContainer = document.getElementById("myReportsList");

    if (!reportsContainer) {
        return;
    }

    try {

        const response = await fetch("/my-reports", {
            method: "GET",
            credentials: "same-origin"
        });

        if (!response.ok) {
            throw new Error("Unable to load reports");
        }

        const data = await response.json();

        reportsContainer.innerHTML = "";

        if (!Array.isArray(data.reports) || data.reports.length === 0) {

            reportsContainer.textContent = "You have not submitted any safety reports yet.";

            return;
        }

        console.log("ALL VERIFIED REPORTS:", data.reports.map(report => ({
            type: report.report_type,
            location: report.location,
            latitude: report.latitude,
            longitude: report.longitude,
            distanceKm: getDistanceInKm(
                place.latitude,
                place.longitude,
                Number(report.latitude),
                Number(report.longitude)
            )
        })));

        const nearbyReports = data.reports.filter(report => {

            const lat = Number(report.latitude);
            const lng = Number(report.longitude);

            if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
                return false;
            }

            const distance = getDistanceInKm(
                place.latitude,
                place.longitude,
                lat,
                lng
            );

            return true;

        });

        nearbyReports.forEach(report => {

            const card = document.createElement("div");
            card.className = "report-card";

            const heading = document.createElement("h3");
            heading.textContent = report.location;

            const type = document.createElement("p");
            type.textContent = "Report Type: " + report.report_type;

            const description = document.createElement("p");
            description.textContent = "Description: " + report.description;

            const date = document.createElement("p");
            date.textContent = "Submitted On: " + report.created_at;

            const status = document.createElement("span");
            status.className = "report-status";

            const reportStatus = String(report.status || "").toLowerCase();

            status.textContent = reportStatus.toUpperCase();

            if (reportStatus === "verified") {
                status.classList.add("verified-status");
            } else if (reportStatus === "rejected") {
                status.classList.add("rejected-status");
            } else {
                status.classList.add("pending-status");
            }

            card.append(heading, type, description, date, status);

            reportsContainer.appendChild(card);

        });

    } catch (error) {

        console.error("Report History Error:", error);

        reportsContainer.textContent =
            "Unable to load your reports. Please try again.";

    }

});

// =====================================
// SUBMIT SAFETY REPORT
// =====================================

document.addEventListener("DOMContentLoaded", function () {

    const reportForm = document.getElementById("safetyReportForm");

    if (!reportForm) {
        return;
    }

    reportForm.addEventListener("submit", async function (event) {

        event.preventDefault();

        const location = document.getElementById("reportLocation").value.trim();

        const reportType = document.getElementById("reportType").value;

        const description = document.getElementById("reportDescription").value.trim();
        const latitude = parseFloat(document.getElementById("reportLatitude").value);
        const longitude = parseFloat(document.getElementById("reportLongitude").value);

        const message = document.getElementById("reportMessage");

        try {

            const response = await fetch("/submit-report", {

                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                credentials: "same-origin",

                body: JSON.stringify({
                    location: location,
                    latitude: latitude,
                    longitude: longitude,
                    report_type: reportType,
                    description: description
                })

            });

            const data = await response.json();

            if (!response.ok) {
                message.textContent = data.message || "Report submission failed.";
                return;
            }

            message.textContent = "Safety report submitted successfully! Status: Pending.";

            message.style.color = "green";

            reportForm.reset();

        } catch (error) {

            console.error("Report Submission Error:", error);

            message.textContent = "Unable to submit report. Please try again.";

            message.style.color = "red";

        }

    });

});
// AUTOMATIC LOCATION DETECTION

document.addEventListener("DOMContentLoaded", function () {

    const detectBtn = document.getElementById("detectLocationBtn");

    if (!detectBtn) return;

    detectBtn.addEventListener("click", function () {

        const message = document.getElementById("locationMessage");

        if (!navigator.geolocation) {
            message.textContent = "Location detection is not supported.";
            return;
        }

        message.textContent = "Detecting your location...";

        navigator.geolocation.getCurrentPosition(

            function (position) {

                const latitude = position.coords.latitude;
                const longitude = position.coords.longitude;

                document.getElementById("reportLatitude").value = latitude;
                document.getElementById("reportLongitude").value = longitude;

                document.getElementById("reportLocation").value =
                    "Current Location";



                message.textContent = "Location detected successfully!";
                message.style.color = "green";

                // Check whether current location is near an active restricted place
                checkRestrictedArea(latitude, longitude);

            },

            function (error) {

                message.textContent =
                    "Unable to detect location. Please allow location permission.";

                message.style.color = "red";

            }

        );

    });

});

/* =====================================
   10. RESTRICTED PLACES MANAGEMENT
===================================== */

// Load restricted places from backend

window.loadRestrictedPlaces = async function () {

    const tableBody = document.getElementById(
        "restrictedPlacesTableBody"
    );

    const message = document.getElementById(
        "restrictedMessage"
    );

    if (!tableBody) return;

    try {

        const response = await fetch("/admin/restricted-places", {
            credentials: "same-origin"
        });

        const data = await response.json();

        if (!response.ok) {
            if (message) message.textContent = data.message;
            return;
        }

        tableBody.replaceChildren();

        if (!data.places || data.places.length === 0) {

            const row = document.createElement("tr");
            const cell = document.createElement("td");

            cell.colSpan = 8;
            cell.textContent = "No restricted places added yet.";

            row.appendChild(cell);
            tableBody.appendChild(row);

            return;
        }

        data.places.forEach(function (place) {

            const row = document.createElement("tr");

            const values = [
                place.id,
                place.place_name,
                place.latitude,
                place.longitude,
                place.radius + " m",
                place.reason,
                place.is_active === 1 ? "Active" : "Inactive"
            ];

            values.forEach(function (value) {

                const cell = document.createElement("td");
                cell.textContent = value ?? "";

                row.appendChild(cell);

            });

            // Activate / Deactivate button

            const actionCell = document.createElement("td");

            const toggleButton = document.createElement("button");

            toggleButton.textContent =
                place.is_active === 1 ? "Deactivate" : "Activate";

            toggleButton.addEventListener("click", function () {

                toggleRestrictedPlace(place.id);

            });

            actionCell.appendChild(toggleButton);
            row.appendChild(actionCell);

            tableBody.appendChild(row);

        });

    } catch (error) {

        console.error("Restricted Places Error:", error);

        if (message) {
            message.textContent = "Unable to load restricted places.";
        }

    }

};


// Add a restricted place

document.addEventListener("DOMContentLoaded", function () {

    const restrictedForm = document.getElementById(
        "restrictedPlaceForm"
    );

    if (!restrictedForm) return;

    restrictedForm.addEventListener("submit", async function (event) {

        event.preventDefault();

        const message = document.getElementById(
            "restrictedMessage"
        );

        const placeName = document.getElementById(
            "restrictedPlaceName"
        ).value.trim();

        const latitude = Number(
            document.getElementById("restrictedLatitude").value
        );

        const longitude = Number(
            document.getElementById("restrictedLongitude").value
        );

        const radius = Number(
            document.getElementById("restrictedRadius").value
        );

        const reason = document.getElementById(
            "restrictedReason"
        ).value.trim();


        if (
            !placeName ||
            !reason ||
            !Number.isFinite(latitude) ||
            !Number.isFinite(longitude) ||
            !Number.isFinite(radius) ||
            latitude < -90 ||
            latitude > 90 ||
            longitude < -180 ||
            longitude > 180 ||
            radius < 10 ||
            radius > 5000
        ) {

            message.textContent = "Please enter valid place details.";
            return;

        }


        try {

            const response = await fetch("/admin/restricted-places", {

                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                credentials: "same-origin",

                body: JSON.stringify({

                    place_name: placeName,
                    latitude: latitude,
                    longitude: longitude,
                    radius: radius * 5,
                    reason: reason

                })

            });


            const data = await response.json();

            message.textContent = data.message;


            if (response.ok) {

                message.style.color = "green";

                restrictedForm.reset();

                document.getElementById(
                    "restrictedRadius"
                ).value = 100;

                window.loadRestrictedPlaces();

            } else {

                message.style.color = "red";

            }

        } catch (error) {

            console.error("Add Restricted Place Error:", error);

            message.textContent = "Server connection failed.";
            message.style.color = "red";

        }

    });

});


// Activate / Deactivate restricted place
async function toggleRestrictedPlace(placeId) {

    const message = document.getElementById("restrictedMessage");

    try {

        const response = await fetch(
            `/admin/restricted-places/${placeId}/toggle`,
            {
                method: "POST",
                credentials: "same-origin"
            }
        );

        const data = await response.json();

        message.textContent = data.message;

        if (response.ok) {
            message.style.color = "green";
            window.loadRestrictedPlaces();
        } else {
            message.style.color = "red";
        }

    } catch (error) {

        console.error("Toggle Restricted Place Error:", error);

        message.textContent = "Unable to update place status.";
        message.style.color = "red";

    }
}

// SEARCH RESTRICTED PLACE AUTOMATICALLY

const searchRestrictedPlaceBtn = document.getElementById("searchRestrictedPlaceBtn");

if (searchRestrictedPlaceBtn) {

    searchRestrictedPlaceBtn.addEventListener("click", async function () {

        const searchInput = document.getElementById("restrictedPlaceSearch");
        const message = document.getElementById("placeSearchMessage");

        const placeName = searchInput.value.trim();

        if (!placeName) {
            message.textContent = "Please enter a place name.";
            return;
        }

        message.textContent = "Searching place...";

        try {

            const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(placeName)}`;

            const response = await fetch(url);
            const data = await response.json();

            if (!data.length) {
                message.textContent = "Place not found. Try another name.";
                return;
            }

            document.getElementById("restrictedPlaceName").value =
                data[0].display_name;

            document.getElementById("restrictedLatitude").value =
                data[0].lat;

            document.getElementById("restrictedLongitude").value =
                data[0].lon;

            message.textContent =
                "Location found! Please verify the coordinates before adding.";

        } catch (error) {

            console.error("Place search error:", error);

            message.textContent =
                "Search failed. Check your internet connection and try again.";

        }

    });

}


// RESTRICTED AREA GPS CHECK

async function checkRestrictedArea(latitude, longitude) {
    const warningBox = document.getElementById("restrictedAreaWarning");
    const warningMessage = document.getElementById("restrictedAreaMessage");

    if (!warningBox || !warningMessage) {
        return;
    }

    try {
        const response = await fetch("/check-restricted-place", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "same-origin",
            body: JSON.stringify({
                latitude: latitude,
                longitude: longitude
            })
        });

        const data = await response.json();

        if (!response.ok) {
            console.error("Restricted area check failed:", data);
            return;
        }

        if (data.restricted && data.places && data.places.length > 0) {
            warningBox.style.display = "block";

            warningMessage.textContent = data.places.map(function (place) {
                return "You are near " + place.place_name + ". " + place.reason;
            }).join(" | ");

        } else {
            warningBox.style.display = "none";
            warningMessage.textContent = "";
        }

    } catch (error) {
        console.error("Restricted Area GPS Error:", error);
    }
}

// SAFE TOUR - THREE LEVEL SAFETY STATUS

function getSafetyLevel(dangerReports, cautionReports) {

    if (dangerReports > 0) {
        return {
            level: "HIGH DANGER",
            color: "red",
            message: "Serious verified danger reports are available."
        };
    }

    if (cautionReports > 0) {
        return {
            level: "LOW DANGER",
            color: "orange",
            message: "Verified caution reports are available."
        };
    }

    return {
        level: "SAFE",
        color: "green",
        message: "No verified safety issues reported."
    };
}

// =====================================
// LIVE LOCATION SAFETY MONITORING
// =====================================

let liveSafetyWatchId = null;
let lastLiveSafetyCheck = 0;

function calculateDistance(lat1, lon1, lat2, lon2) {

    const R = 6371000;

    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;

    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(lat1 * Math.PI / 180) *
        Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) ** 2;

    return R * 2 * Math.atan2(
        Math.sqrt(a),
        Math.sqrt(1 - a)
    );
}

async function updateLiveSafety(latitude, longitude) {

    const statusBox = document.getElementById("liveSafetyStatus");
    const message = document.getElementById("liveLocationMessage");

    if (!statusBox) return;

    statusBox.textContent = "Checking nearby safety reports...";

    // Check restricted places
    await checkRestrictedArea(latitude, longitude);

    try {

        const response = await fetch("/verified-reports", {
            credentials: "same-origin"
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error("Unable to fetch verified reports");
        }

        const reports = data.reports || [];

        console.log("VERIFIED REPORT TYPES:", reports.map(r => r.report_type));

        // Check reports within 500 metres
        const nearbyReports = reports.filter(report => {

            if (
                report.latitude == null ||
                report.longitude == null
            ) {
                return false;
            }

            const distance = calculateDistance(
                latitude,
                longitude,
                Number(report.latitude),
                Number(report.longitude)
            );

            return distance <= 500;

        });

        // No verified reports nearby
        if (nearbyReports.length === 0) {

            statusBox.textContent = "NO VERIFIED DATA";
            statusBox.style.color = "gray";

            message.textContent =
                "No verified reports found within 500 metres. Area safety cannot be confirmed.";

            return;
        }

        // Classify verified safety reports

        const dangerTypes = [
            "danger",
            "open_pit",
            "unsafe_structure"
        ];

        const cautionTypes = [
            "caution",
            "pothole",
            "poor_lighting",
            "road_blockage",
            "other"
        ];

        const dangerCount = nearbyReports.filter(
            report => dangerTypes.includes(report.report_type)
        ).length;

        const cautionCount = nearbyReports.filter(
            report => cautionTypes.includes(report.report_type)
        ).length;

        // Handle unknown report types safely
        const classifiedCount = dangerCount + cautionCount;

        if (classifiedCount === 0) {

            statusBox.textContent = "SAFETY DATA NEEDS REVIEW";
            statusBox.style.color = "gray";

            message.textContent =
                "Nearby verified reports exist, but their safety type could not be classified.";

            return;
        }

        // Calculate safety level

        const safety = getSafetyLevel(
            dangerCount,
            cautionCount
        );

        statusBox.textContent = safety.level;
        statusBox.style.color = safety.color;

        message.textContent =
            safety.message +
            " Nearby verified reports: " +
            nearbyReports.length;

    } catch (error) {

        console.error("Live Safety Error:", error);

        statusBox.textContent = "SAFETY DATA UNAVAILABLE";

        message.textContent =
            "Unable to check nearby safety reports.";

    }
}


// =====================================
// START LIVE GPS TRACKING
// =====================================

document.addEventListener("DOMContentLoaded", function () {

    const startBtn = document.getElementById("startLiveSafety");
    const stopBtn = document.getElementById("stopLiveSafety");

    if (!startBtn || !stopBtn) return;

    // Start live GPS tracking

    startBtn.addEventListener("click", function () {

        if (!navigator.geolocation) {
            alert("GPS is not supported by this browser.");
            return;
        }

        if (liveSafetyWatchId !== null) return;

        const statusBox = document.getElementById("liveSafetyStatus");
        const message = document.getElementById("liveLocationMessage");

        statusBox.textContent = "Starting live GPS tracking...";

        liveSafetyWatchId = navigator.geolocation.watchPosition(

            function (position) {

                const latitude = position.coords.latitude;
                const longitude = position.coords.longitude;

                // Update report location fields

                const latInput = document.getElementById("reportLatitude");
                const lonInput = document.getElementById("reportLongitude");
                const locationInput = document.getElementById("reportLocation");

                if (latInput) latInput.value = latitude;
                if (lonInput) lonInput.value = longitude;

                if (locationInput) {
                    locationInput.value = "Current Location";
                }

                message.textContent =
                    "Your live location is being monitored.";

                // Avoid excessive API requests

                const now = Date.now();

                if (now - lastLiveSafetyCheck >= 10000) {

                    lastLiveSafetyCheck = now;

                    updateLiveSafety(latitude, longitude);

                }

            },

            function (error) {

                statusBox.textContent =
                    "Unable to access live location.";

                message.textContent =
                    "Please allow location permission and try again.";

                console.error("GPS Error:", error);

                if (liveSafetyWatchId !== null) {

                    navigator.geolocation.clearWatch(liveSafetyWatchId);
                    liveSafetyWatchId = null;

                }

                startBtn.disabled = false;
                stopBtn.disabled = true;

            },

            {
                enableHighAccuracy: true,
                maximumAge: 5000,
                timeout: 15000
            }

        );

        startBtn.disabled = true;
        stopBtn.disabled = false;

    });


    // Stop live GPS tracking

    stopBtn.addEventListener("click", function () {

        if (liveSafetyWatchId !== null) {

            navigator.geolocation.clearWatch(liveSafetyWatchId);

            liveSafetyWatchId = null;

        }

        document.getElementById("liveSafetyStatus").textContent =
            "Live tracking stopped.";

        document.getElementById("liveLocationMessage").textContent = "";

        startBtn.disabled = false;
        stopBtn.disabled = true;

    });
});