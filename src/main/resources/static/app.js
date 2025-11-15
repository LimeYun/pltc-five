document.addEventListener("DOMContentLoaded", () => {
    const btnTodayPray = document.getElementById("btnTodayPray");
    const todayPrayArea = document.getElementById("todayPrayArea");

    const btnMemoryMission = document.getElementById("btnMemoryMission");
    const memoryMissionArea = document.getElementById("memoryMissionArea");

    const btnStartPrayer = document.getElementById("btnStartPrayer");
    const startPrayerArea = document.getElementById("startPrayerArea");

    const btnEndPrayer = document.getElementById("btnEndPrayer");
    const endPrayerArea = document.getElementById("endPrayerArea");

    // 공통: 간단한 에러 표시용 함수
    function showError(targetEl, message) {
        targetEl.textContent = message || "에러가 발생했습니다. 잠시 후 다시 시도해주세요.";
        targetEl.style.color = "#b91c1c"; // 진한 빨강
    }

    // 1) 오늘의 기도제목
    btnTodayPray.addEventListener("click", async () => {
        todayPrayArea.textContent = "불러오는 중...";

        try {
            const res = await fetch("/api/juan/pltc/pray/today");
            if (!res.ok) {
                throw new Error("HTTP " + res.status);
            }
            const data = await res.json();
            // data: { username, content }

            if (data.username) {
                todayPrayArea.innerHTML =
                    `<strong>${data.username}</strong><br/>` +
                    `<div style="margin-top:4px;">${data.content || "(내용 없음)"}</div>`;
            } else {
                // 주말 메시지처럼 username 없는 경우
                todayPrayArea.textContent = data.content || "오늘은 모두를 위해 기도하는 날입니다.";
            }
        } catch (e) {
            console.error(e);
            showError(todayPrayArea);
        }
    });

    // 2) 암송 미션
    btnMemoryMission.addEventListener("click", async () => {
        memoryMissionArea.textContent = "랜덤 선택 중...";

        try {
            const res = await fetch("/api/juan/pltc/event/memory-mission");
            if (!res.ok) {
                throw new Error("HTTP " + res.status);
            }
            const data = await res.json();
            // data: { id, title, verse }

            memoryMissionArea.innerHTML =
                `<strong>${data.title}</strong><br/>` +
                `<div style="margin-top:4px; white-space:pre-line;">${data.verse}</div>`;
        } catch (e) {
            console.error(e);
            showError(memoryMissionArea);
        }
    });

    // 3) 시작 기도자
    btnStartPrayer.addEventListener("click", async () => {
        startPrayerArea.textContent = "뽑는 중...";

        try {
            const res = await fetch("/api/juan/pltc/event/start-prayer");
            if (!res.ok) {
                throw new Error("HTTP " + res.status);
            }
            const data = await res.json();
            // data: { userId, nickname }

            startPrayerArea.textContent = data.nickname || "(이름 없음)";
        } catch (e) {
            console.error(e);
            showError(startPrayerArea, "시작 기도자를 뽑을 수 없습니다.");
        }
    });

    // 4) 마침 기도자
    btnEndPrayer.addEventListener("click", async () => {
        endPrayerArea.textContent = "뽑는 중...";

        try {
            const res = await fetch("/api/juan/pltc/event/end-prayer");
            if (!res.ok) {
                throw new Error("HTTP " + res.status);
            }
            const data = await res.json();

            endPrayerArea.textContent = data.nickname || "(이름 없음)";
        } catch (e) {
            console.error(e);
            showError(endPrayerArea, "마침 기도자를 뽑을 수 없습니다.");
        }
    });
});