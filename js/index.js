$(document).ready(function () {
    const BASE_URL = "https://backoffice.jayubon.com/";
    // const BASE_URL = "http://127.0.0.1:8000/";
    const $display = $(".display");
    const $days = $(".days");
    const $previous = $(".left");
    const $next = $(".right");
    const $todayButton = $(".today-button");
    const $selected = $(".selected");
    const $addButton = $(".add-button");
    const $eventsList = $(".events-list");

    let date = new Date();
    let year = date.getFullYear();
    let month = date.getMonth();
    let selectedDate = null;

    function displayCalendar() {
        $days.empty();
        $selected.empty();
        $eventsList.empty();

        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const firstDayIndex = firstDay.getDay();
        const numberOfDays = lastDay.getDate();

        const formattedDate = date.toLocaleString("th-TH", {
            month: "long",
            year: "numeric",
        });

        $display.text(formattedDate);

        // Add empty divs for the first day
        for (let x = 0; x < firstDayIndex; x++) {
            const $emptyDiv = $("<div></div>");
            $days.append($emptyDiv);
        }

        // Add day numbers
        for (let i = 1; i <= numberOfDays; i++) {
            const currentDate = new Date(year, month, i);
            const formattedDate = currentDate.toLocaleDateString("th-TH", {
                day: "numeric",
                month: "long",
                year: "numeric",
            });
            const $dayDiv = $("<div></div>")
                .text(i)
                .data("date", formattedDate);

            // Disable dates 1-5
            if (i >= 1 && i <= 5) {
                $dayDiv.addClass("disabled");
            }

            // Highlight current date
            const today = new Date();
            if (
                currentDate.getFullYear() === today.getFullYear() &&
                currentDate.getMonth() === today.getMonth() &&
                currentDate.getDate() === today.getDate()
            ) {
                $dayDiv.addClass("current-date");
                // ถ้าวันที่ปัจจุบันเป็นวันที่ 1-5 จะยังคงไฮไลต์ แต่ไม่สามารถเลือกได้
            }

            $days.append($dayDiv);
        }

        // แสดงวันที่โดยอัตโนมัติ (วันนี้) ถ้าไม่ใช่วันที่ 1-5
        const $todayDiv = $days.find(".current-date");
        if ($todayDiv.length && !$todayDiv.hasClass("disabled")) {
            const selectedDateText = $todayDiv.data("date");
            selectedDate = selectedDateText;
            fetchEventsByDate(selectedDate);
            $selected.text(`วันที่ : ${selectedDateText}`);
        } else if ($todayDiv.length && $todayDiv.hasClass("disabled")) {
            // ถ้าวันที่วันนี้อยู่ในช่วง 1-5 ให้แสดงวันที่วันนี้แต่ไม่สามารถเลือกได้
            const selectedDateText = $todayDiv.data("date");
            selectedDate = selectedDateText;
            fetchEventsByDate(selectedDate);
            $selected.text(`วันที่ : ${selectedDateText}`);
        }
    }

    // Initial display
    displayCalendar();

    // Navigate to previous month
    $previous.on("click", function () {
        month--;
        if (month < 0) {
            month = 11;
            year--;
        }
        date.setFullYear(year, month);
        displayCalendar();
    });

    // Navigate to next month
    $next.on("click", function () {
        month++;
        if (month > 11) {
            month = 0;
            year++;
        }
        date.setFullYear(year, month);
        displayCalendar();
    });

    // Navigate to today
    $todayButton.on("click", function () {
        const today = new Date();
        year = today.getFullYear();
        month = today.getMonth();
        date.setFullYear(year, month);
        displayCalendar();
    });

    // Handle day selection using event delegation
    $days.on("click", "div", function () {
        const selectedDateText = $(this).data("date");
        if (selectedDateText && !$(this).hasClass("disabled")) {
            // ตรวจสอบว่าไม่ใช่วันที่ที่ไม่สามารถเลือกได้
            selectedDate = selectedDateText;
            fetchEventsByDate(selectedDate);
            $selected.text(`วันที่ : ${selectedDateText}`);
            $(".current-date").removeClass("current-date");
            $(this).addClass("current-date");
        }
    });

    // เมื่อเปิดโมดัล ให้แสดงวันที่ที่ถูกเลือก
    $("#addEventModal").on("show.bs.modal", function (event) {
        if (selectedDate) {
            fetchEventsByDate(selectedDate);
            $("#selectedDate").val(selectedDate);
        } else {
            $("#selectedDate").val("ไม่พบวันที่ที่เลือก");
        }
    });

    // จัดการการส่งฟอร์มใน Modal
    $("#addEventForm").on("submit", function (e) {
        e.preventDefault();
        const fullname = $("#fullname").val();
        const phone = $("#phone").val();
        const time = $("#time").val();
        const eventDate = $("#selectedDate").val();

        if (!fullname) {
            showError("กรุณากรอกชื่อ");
            return;
        }
        if (!phone) {
            showError("กรุณากรอกเบอร์โทร");
            return;
        }
        if (!time) {
            showError("กรุณาเลือกเวลาที่จะเข้ามา");
            return;
        }

        var formData = new FormData();
        formData.append('fullname', fullname);
        formData.append('phone', phone);
        formData.append('time', time);
        formData.append('eventDate', eventDate);

        Swal.fire({
            title: "ยืนยัน",
            text: "คุณต้องการลงทะเบียนใช่หรือไม่?",
            icon: "question",
            showCancelButton: true,
            confirmButtonText: "ใช่",
            cancelButtonText: "ไม่",
        }).then((result) => {
            if (result.isConfirmed) {
                Swal.fire({
                    title: "กำลังดำเนินการ...",
                    text: "กรุณารอสักครู่",
                    icon: "info",
                    allowOutsideClick: false,
                    showConfirmButton: false,
                    willOpen: () => {
                        Swal.showLoading();
                    }
                });
                $.ajax({
                    url: `${BASE_URL}submitCalendarConfirmation`, // ใช้ BASE_URL สำหรับ API
                    method: 'POST',
                    data: formData,
                    contentType: false,
                    processData: false,
                    success: function (response) {
                        Swal.close(); // ปิด loading เมื่อได้รับการตอบกลับ
                        if (response.api_status == 1) {
                            Swal.fire({
                                title: "สำเร็จ",
                                text: "ลงทะเบียนสำเร็จ!",
                                icon: "success",
                                showCancelButton: false,
                                confirmButtonText: "OK",
                            }).then((result) => {
                                if (result.isConfirmed) {
                                    location.reload();
                                }
                            });
                        } else {
                            Swal.fire({
                                title: "Error",
                                text: response.api_message,
                                icon: "error"
                            });
                        }
                    },
                    error: function (xhr, status, error) {
                        Swal.close(); // ปิด loading เมื่อได้รับการตอบกลับ
                        Swal.fire({
                            title: "Error",
                            text: "An error occurred while saving the form data.",
                            icon: "error",
                            showCancelButton: false,
                            confirmButtonText: "OK",
                        });
                    }
                });
            }
        });

        // ปิด Modal หลังจากบันทึก
        $("#addEventModal").modal("hide");

        // รีเซ็ตฟอร์ม
        $(this)[0].reset();
    });

    // Show error message
    function showError(message) {
        Swal.fire({
            icon: "error",
            title: "กรุณากรอกข้อมูล",
            text: message,
        });
    }

    // ฟังก์ชันสำหรับดึงข้อมูลกิจกรรมตามวันที่ที่เลือก
    function fetchEventsByDate(date) {
        if (!date) return;
        var formData = new FormData();
        formData.append('eventDate', date);
        $.ajax({
            url: `${BASE_URL}getCalendarByDate`,
            method: 'POST',
            data: formData,
            contentType: false,
            processData: false,
            success: function (response) {
                if (response.api_status === 1) {
                    displayEvents(response.data);
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: response.api_message,
                    });
                }
            },
            error: function (xhr, status, error) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'เกิดข้อผิดพลาดในการดึงข้อมูลกิจกรรม',
                });
            }
        });
    }

    // ฟังก์ชันสำหรับแสดงข้อมูลกิจกรรม
    function displayEvents(events) {
        let html = '';
        if (events.length > 0) {
            events.forEach(event => {
                html += `
                <div class="event-card">
                    <div class="event-header">
                        <h5>${event.fullname}</h5>
                        <span class="event-time">${formatTime(event.time)}</span>
                    </div>
                </div>
            `;
            });
        } else {
            html = '<p>ไม่มีข้อมูลกิจกรรมในวันนี้</p>';
        }
        $eventsList.html(html);
    }
    function formatTime(time) {
        // ตัวอย่าง: แปลงจาก "14:25" เป็น "14:25 น."
        return `${time.substring(0, 5)} น.`;
    }
});