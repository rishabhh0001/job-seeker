// Custom Scripts
document.addEventListener('DOMContentLoaded', function () {

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
