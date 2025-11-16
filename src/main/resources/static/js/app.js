document.addEventListener("DOMContentLoaded", () => {
    // ===== 공통 엘리먼트 =====
    const kakaoLoginBtn = document.getElementById("kakaoLoginBtn");
    const userInfo = document.getElementById("userInfo");

    const tabButtons = document.querySelectorAll(".tab-btn");
    const views = document.querySelectorAll(".view");

    // 홈
    const todayPrayArea = document.getElementById("todayPrayArea");
    const btnWeeklyBible = document.getElementById("btnWeeklyBible");

    // 기도제목 탭
    const btnReloadPrayList = document.getElementById("btnReloadPrayList");
    const prayListArea = document.getElementById("prayListArea");

    // 기도제목 상세 뷰
    const btnBackToPrayList = document.getElementById("btnBackToPrayList");
    const btnPrayDetailBackHome = document.getElementById("btnPrayDetailBackHome");
    const prayDetailArea = document.getElementById("prayDetailArea");

    // 이벤트 탭
    const btnMemoryMission = document.getElementById("btnMemoryMission");
    const memoryMissionArea = document.getElementById("memoryMissionArea");
    const btnStartPrayer = document.getElementById("btnStartPrayer");
    const startPrayerArea = document.getElementById("startPrayerArea");
    const btnEndPrayer = document.getElementById("btnEndPrayer");
    const endPrayerArea = document.getElementById("endPrayerArea");

    // 주간 말씀 뷰
    const btnBackToHome = document.getElementById("btnBackToHome");
    const bibleListArea = document.getElementById("bibleListArea");
    const bibleDetailTitle = document.getElementById("bibleDetailTitle");
    const bibleDetailArea = document.getElementById("bibleDetailArea");
    const btnBackToBibleList = document.getElementById("btnBackToBibleList");
    const btnDetailBackHome = document.getElementById("btnDetailBackHome");

    // 랜덤 모달
    const modalOverlay = document.getElementById("modalOverlay");
    const modalTitle = document.getElementById("modalTitle");
    const modalBody = document.getElementById("modalBody");
    const modalConfirmBtn = document.getElementById("modalConfirmBtn");

    // ===== 상태 =====
    let currentUser = null;
    let modalOnConfirm = null;
    let currentPrayId = null;

    // 룰렛용 상태 (시작/마침 기도자)
    let rouletteIntervalId = null; // openRandomModal에서 쓰는 인터벌
    let rouletteTimeoutId = null;  // openRandomModal에서 쓰는 타임아웃
    let rouletteNameCandidates = [];   // 기도자 이름 후보들

    // ===== 유틸 =====
    function showError(targetEl, message) {
        if (!targetEl) return;
        targetEl.textContent = message || "에러가 발생했습니다. 잠시 후 다시 시도해주세요.";
        targetEl.style.color = "#b91c1c";
    }

    function resetTextColor(targetEl) {
        if (!targetEl) return;
        targetEl.style.color = "";
    }

    function switchView(viewName) {
        views.forEach(v => v.classList.remove("active"));
        tabButtons.forEach(b => b.classList.remove("active"));

        if (viewName === "home" || viewName === "pray" || viewName === "event") {
            const viewEl = document.getElementById(`view-${viewName}`);
            if (viewEl) viewEl.classList.add("active");
            const tabBtn = document.querySelector(`.tab-btn[data-tab="${viewName}"]`);
            if (tabBtn) tabBtn.classList.add("active");
        } else if (viewName === "bible") {
            document.getElementById("view-bible").classList.add("active");
        } else if (viewName === "bible-detail") {
            document.getElementById("view-bible-detail").classList.add("active");
        } else if (viewName === "pray-detail") {
            document.getElementById("view-pray-detail").classList.add("active");
        }

        if (viewName === "home") {
            loadTodayPray();
        }
        if (viewName === "pray") {
            loadPrayList();
        }
    }

    // ===== 모달 유틸 (시작/마침 기도자용 일반 룰렛) =====
    /**
     * title: 모달 제목
     * loaderFn: 최종 결과를 가져오는 async 함수 -> { html, onConfirm }
     * candidates: 룰렛에 돌릴 문자열 배열
     */
    function openRandomModal(title, loaderFn, candidates = []) {
        modalTitle.textContent = title;
        modalOnConfirm = null;

        // 이전 애니메이션 제거
        if (rouletteIntervalId !== null) {
            clearInterval(rouletteIntervalId);
            rouletteIntervalId = null;
        }
        if (rouletteTimeoutId !== null) {
            clearTimeout(rouletteTimeoutId);
            rouletteTimeoutId = null;
        }

        modalOverlay.classList.remove("hidden");

        // 후보가 있으면 짧은 간격으로 텍스트를 바꿔줌
        if (candidates && candidates.length > 0) {
            let idx = 0;
            modalBody.textContent = candidates[0];

            rouletteIntervalId = setInterval(() => {
                idx = (idx + 1) % candidates.length;
                modalBody.textContent = candidates[idx];
            }, 80);
        } else {
            modalBody.textContent = "랜덤 추첨 중...";
        }

        const finalPromise = loaderFn();

        rouletteTimeoutId = setTimeout(async () => {
            if (rouletteIntervalId !== null) {
                clearInterval(rouletteIntervalId);
                rouletteIntervalId = null;
            }

            try {
                const { html, onConfirm } = await finalPromise;
                modalBody.innerHTML = html;
                modalOnConfirm = onConfirm || null;
            } catch (err) {
                console.error(err);
                modalBody.textContent = "오류가 발생했습니다. 잠시 후 다시 시도해주세요.";
                modalOnConfirm = null;
            }
        }, 5000); // 5초 뒤 멈춤
    }

    modalConfirmBtn.addEventListener("click", () => {
        modalOverlay.classList.add("hidden");

        if (rouletteIntervalId !== null) {
            clearInterval(rouletteIntervalId);
            rouletteIntervalId = null;
        }
        if (rouletteTimeoutId !== null) {
            clearTimeout(rouletteTimeoutId);
            rouletteTimeoutId = null;
        }

        if (typeof modalOnConfirm === "function") {
            modalOnConfirm();
        }
    });

    // ===== 로그인 관련 =====
    async function loadMe() {
        try {
            const res = await fetch("/auth/kakao/me");
            if (!res.ok) {
                userInfo.textContent = "로그인이 필요합니다.";
                kakaoLoginBtn.style.display = "inline-flex";
                currentUser = null;
                return;
            }
            const data = await res.json();
            currentUser = data;
            userInfo.textContent = `${data.nickname}님 👋`;
            kakaoLoginBtn.style.display = "none";
        } catch (e) {
            console.error(e);
            userInfo.textContent = "로그인 상태 확인 중 오류";
            kakaoLoginBtn.style.display = "inline-flex";
        }
    }

    kakaoLoginBtn.addEventListener("click", async () => {
        try {
            const res = await fetch("/auth/kakao/login-url");
            if (!res.ok) {
                alert("로그인 준비 중 오류가 발생했습니다.");
                return;
            }
            const data = await res.json();
            window.location.href = data.url;
        } catch (e) {
            console.error(e);
            alert("로그인 중 오류가 발생했습니다.");
        }
    });

    // ===== 탭 클릭 =====
    tabButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            switchView(btn.dataset.tab);
        });
    });

    // 홈 -> 주간 말씀
    btnWeeklyBible.addEventListener("click", () => {
        switchView("bible");
        loadWeeklyBible();
    });

    btnBackToHome.addEventListener("click", () => {
        switchView("home");
    });

    // 주간 말씀 상세 -> 목록/홈
    btnBackToBibleList.addEventListener("click", () => {
        switchView("bible");
    });

    btnDetailBackHome.addEventListener("click", () => {
        switchView("home");
    });

    // 기도제목 상세 -> 리스트/홈
    btnBackToPrayList.addEventListener("click", () => {
        switchView("pray");
    });

    btnPrayDetailBackHome.addEventListener("click", () => {
        switchView("home");
    });

    // ===== 1) 오늘의 기도제목 (자동 로딩) =====
    async function loadTodayPray() {
        resetTextColor(todayPrayArea);
        todayPrayArea.textContent = "오늘의 기도제목을 불러오는 중입니다...";

        try {
            const res = await fetch("/api/juan/pltc/pray/today");
            if (res.status === 401 || res.status === 403) {
                showError(todayPrayArea, "로그인 후 이용 가능합니다.");
                return;
            }
            if (!res.ok) throw new Error("HTTP " + res.status);

            const data = await res.json();
            resetTextColor(todayPrayArea);
            if (data.username || data.nickname) {
                const name = data.username || data.nickname;
                todayPrayArea.innerHTML =
                    `<strong>${name}</strong><br/>` +
                    `<div style="margin-top:4px;">${data.content || "(내용 없음)"}</div>`;
            } else {
                todayPrayArea.textContent = data.content || "오늘은 모두를 위해 기도하는 날입니다.";
            }
        } catch (e) {
            console.error(e);
            showError(todayPrayArea);
        }
    }

    // ===== 2) 기도제목 리스트/상세/수정 =====
    async function loadPrayList() {
        resetTextColor(prayListArea);
        prayListArea.textContent = "불러오는 중...";

        try {
            const res = await fetch("/api/juan/pltc/pray");
            if (res.status === 401 || res.status === 403) {
                showError(prayListArea, "로그인 후 이용 가능합니다.");
                return;
            }
            if (!res.ok) throw new Error("HTTP " + res.status);

            const list = await res.json();
            if (!list.length) {
                prayListArea.textContent = "등록된 기도제목이 없습니다.";
                return;
            }

            // 시작/마침 기도자 룰렛용 이름 후보 세팅 (중복 제거)
            const names = list
                .map(item => item.nickname || item.username)
                .filter(Boolean);
            rouletteNameCandidates = Array.from(new Set(names));

            const frag = document.createDocumentFragment();
            list.forEach(item => {
                const div = document.createElement("div");
                div.className = "pray-list-item";
                div.dataset.id = item.id;

                const title = document.createElement("div");
                title.className = "pray-list-title";
                title.textContent = item.nickname || item.username || "(이름 없음)";

                const sub = document.createElement("div");
                sub.className = "pray-list-sub";
                sub.textContent = item.targetDate || "";

                div.appendChild(title);
                div.appendChild(sub);

                div.addEventListener("click", () => openPrayDetail(item.id));

                frag.appendChild(div);
            });

            prayListArea.innerHTML = "";
            prayListArea.appendChild(frag);
        } catch (e) {
            console.error(e);
            showError(prayListArea);
        }
    }

    function openPrayDetail(id) {
        if (!id) return;
        currentPrayId = id;
        switchView("pray-detail");
        loadPrayDetail(id);
    }

    async function loadPrayDetail(id) {
        resetTextColor(prayDetailArea);
        prayDetailArea.textContent = "불러오는 중...";

        try {
            const res = await fetch(`/api/juan/pltc/pray/${id}`);
            if (res.status === 401 || res.status === 403) {
                showError(prayDetailArea, "로그인 후 이용 가능합니다.");
                return;
            }
            if (!res.ok) throw new Error("HTTP " + res.status);

            const data = await res.json();

            const name = data.nickname || data.username || "(이름 없음)";
            const targetDateText = data.targetDate || "";
            const safeContent = (data.content || "")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;");
            let savedContent = data.content || "";

            // 상세 + 수정 UI 구성 (초기에는 조회 모드)
            prayDetailArea.innerHTML = `
                <div class="pray-detail-name">${name}</div>
                ${targetDateText ? `<div class="pray-detail-date">${targetDateText}</div>` : ""}
                
                <label class="pray-detail-label" for="prayContentInput">기도 내용</label>
                <textarea id="prayContentInput" class="pray-detail-textarea" disabled>${safeContent}</textarea>

                <div class="pray-detail-buttons">
                    <button id="btnPrayEdit" class="btn mini">수정하기</button>
                    <button id="btnPrayCancel" class="btn mini" style="display:none;">취소</button>
                    <button id="btnPraySave" class="btn mini" style="display:none;">완료</button>
                </div>
                <div id="prayDetailMessage" class="pray-detail-message"></div>
            `;

            const contentInput = document.getElementById("prayContentInput");
            const btnPrayEdit = document.getElementById("btnPrayEdit");
            const btnPrayCancel = document.getElementById("btnPrayCancel");
            const btnPraySave = document.getElementById("btnPraySave");
            const prayDetailMessage = document.getElementById("prayDetailMessage");

            function setViewMode() {
                contentInput.disabled = true;
                btnPrayEdit.style.display = "inline-block";
                btnPrayCancel.style.display = "none";
                btnPraySave.style.display = "none";
                prayDetailMessage.textContent = "";
            }

            function setEditMode() {
                contentInput.disabled = false;
                contentInput.focus();
                btnPrayEdit.style.display = "none";
                btnPrayCancel.style.display = "inline-block";
                btnPraySave.style.display = "inline-block";
                prayDetailMessage.textContent = "";
                prayDetailMessage.style.color = "#16a34a";
            }

            // 초기: 조회 모드
            setViewMode();

            // [수정하기]
            btnPrayEdit.addEventListener("click", () => {
                contentInput.value = savedContent;
                setEditMode();
            });

            // [취소]
            btnPrayCancel.addEventListener("click", () => {
                contentInput.value = savedContent;
                setViewMode();
            });

            // [완료] - UPDATE 호출
            btnPraySave.addEventListener("click", async () => {
                const newContent = contentInput.value || "";

                try {
                    const putRes = await fetch(`/api/juan/pltc/pray/${currentPrayId}`, {
                        method: "PUT",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({ content: newContent })
                    });

                    if (putRes.status === 401 || putRes.status === 403) {
                        prayDetailMessage.style.color = "#b91c1c";
                        prayDetailMessage.textContent = "로그인 후 이용 가능합니다.";
                        return;
                    }
                    if (!putRes.ok) {
                        throw new Error("HTTP " + putRes.status);
                    }

                    savedContent = newContent;
                    setViewMode();
                    prayDetailMessage.style.color = "#16a34a";
                    prayDetailMessage.textContent = "저장되었습니다.";
                } catch (e) {
                    console.error(e);
                    prayDetailMessage.style.color = "#b91c1c";
                    prayDetailMessage.textContent = "저장 중 오류가 발생했습니다.";
                }
            });

        } catch (e) {
            console.error(e);
            showError(prayDetailArea);
        }
    }

    btnReloadPrayList.addEventListener("click", () => {
        loadPrayList();
    });

    // ===== 시작/마침 기도자 룰렛용 후보 확보 =====
    async function ensureNameCandidates() {
        if (rouletteNameCandidates.length > 0) return rouletteNameCandidates;

        try {
            const res = await fetch("/api/juan/pltc/pray");
            if (!res.ok) return [];
            const list = await res.json();
            const names = list
                .map(item => item.nickname || item.username)
                .filter(Boolean);
            rouletteNameCandidates = Array.from(new Set(names));
            return rouletteNameCandidates;
        } catch (e) {
            console.error(e);
            return [];
        }
    }

    // ===== 3) 암송 미션 (repeat 구절 title 룰렛) =====
    btnMemoryMission.addEventListener("click", () => {
        // 이전 타이머 정리
        if (rouletteIntervalId !== null) {
            clearInterval(rouletteIntervalId);
            rouletteIntervalId = null;
        }
        if (rouletteTimeoutId !== null) {
            clearTimeout(rouletteTimeoutId);
            rouletteTimeoutId = null;
        }

        modalTitle.textContent = "암송 미션";
        modalOverlay.classList.remove("hidden");
        modalBody.textContent = "랜덤 추첨 중...";
        modalOnConfirm = null;

        let stopped = false;
        let lastResult = null;

        // 0.15초마다 /event/repeat 호출해서 title만 계속 바꿔줌
        async function spinOnce() {
            if (stopped) return;
            try {
                const res = await fetch("/api/juan/pltc/event/repeat");
                if (res.status === 401 || res.status === 403) {
                    // 로그인 필요 시 바로 종료
                    stopped = true;
                    modalBody.textContent = "로그인 후 이용 가능합니다.";
                    modalOnConfirm = () => {
                        showError(memoryMissionArea, "로그인 후 이용 가능합니다.");
                    };
                    return;
                }
                if (!res.ok) {
                    // 에러면 그냥 조용히 무시하고 다음 루프
                    console.error("repeat fetch error", res.status);
                } else {
                    const data = await res.json(); // { id, title, verse }
                    lastResult = data;
                    modalBody.textContent = data.title;
                }
            } catch (e) {
                console.error(e);
                // 네트워크 에러도 다음 루프에서 재시도
            }
        }

        // 처음 한 번 즉시 실행
        spinOnce();
        // 이후 주기적으로 실행
        rouletteIntervalId = setInterval(spinOnce, 150);

        // 5초 뒤에 멈추고, 마지막 결과를 최종 결과로 사용
        rouletteTimeoutId = setTimeout(() => {
            stopped = true;
            if (rouletteIntervalId !== null) {
                clearInterval(rouletteIntervalId);
                rouletteIntervalId = null;
            }

            if (!lastResult) {
                modalBody.textContent = "오류가 발생했습니다. 잠시 후 다시 시도해주세요.";
                modalOnConfirm = null;
                return;
            }

            const finalHtml =
                `<strong>${lastResult.title}</strong><br/>` +
                `<div style="margin-top:4px; white-space:pre-line;">${lastResult.verse}</div>`;
            modalBody.innerHTML = finalHtml;

            // 이벤트 탭 카드에는 title만 표시
            modalOnConfirm = () => {
                resetTextColor(memoryMissionArea);
                memoryMissionArea.innerHTML = `<strong>${lastResult.title}</strong>`;
            };
        }, 5000);
    });

    // ===== 4) 시작/마침 기도자 (모달 + 룰렛) =====
    btnStartPrayer.addEventListener("click", async () => {
        try {
            const candidates = await ensureNameCandidates();

            openRandomModal("시작 기도자", async () => {
                const res = await fetch("/api/juan/pltc/event/start");
                if (res.status === 401 || res.status === 403) {
                    return {
                        html: "로그인 후 이용 가능합니다.",
                        onConfirm: () => {
                            showError(startPrayerArea, "로그인 후 이용 가능합니다.");
                        }
                    };
                }
                if (!res.ok) throw new Error("HTTP " + res.status);

                const data = await res.json(); // { userId, nickname }
                const name = data.nickname || "(이름 없음)";
                const html = `오늘의 시작 기도자는\n\n<strong>${name}</strong> 입니다.`;

                return {
                    html,
                    onConfirm: () => {
                        resetTextColor(startPrayerArea);
                        startPrayerArea.textContent = name;
                    }
                };
            }, candidates);
        } catch (e) {
            console.error(e);
            alert("시작 기도자 추첨 중 오류가 발생했습니다.");
        }
    });

    btnEndPrayer.addEventListener("click", async () => {
        try {
            const candidates = await ensureNameCandidates();

            openRandomModal("마침 기도자", async () => {
                const res = await fetch("/api/juan/pltc/event/end");
                if (res.status === 401 || res.status === 403) {
                    return {
                        html: "로그인 후 이용 가능합니다.",
                        onConfirm: () => {
                            showError(endPrayerArea, "로그인 후 이용 가능합니다.");
                        }
                    };
                }
                if (!res.ok) throw new Error("HTTP " + res.status);

                const data = await res.json(); // { userId, nickname }
                const name = data.nickname || "(이름 없음)";
                const html = `오늘의 마침 기도자는\n\n<strong>${name}</strong> 입니다.`;

                return {
                    html,
                    onConfirm: () => {
                        resetTextColor(endPrayerArea);
                        endPrayerArea.textContent = name;
                    }
                };
            }, candidates);
        } catch (e) {
            console.error(e);
            alert("마침 기도자 추첨 중 오류가 발생했습니다.");
        }
    });

    // ===== 5) 주간 주제 말씀 =====
    async function loadWeeklyBible() {
        resetTextColor(bibleListArea);
        bibleListArea.textContent = "불러오는 중...";

        try {
            const res = await fetch("/api/juan/pltc/bible");
            if (res.status === 401 || res.status === 403) {
                showError(bibleListArea, "로그인 후 이용 가능합니다.");
                return;
            }
            if (!res.ok) throw new Error("HTTP " + res.status);

            const list = await res.json();
            if (!list.length) {
                bibleListArea.textContent = "이번 주 주제 말씀이 없습니다.";
                return;
            }

            const frag = document.createDocumentFragment();
            list.forEach(item => {
                const div = document.createElement("div");
                div.className = "bible-list-item";
                div.dataset.id = item.id;

                const title = document.createElement("div");
                title.className = "bible-list-title";
                title.textContent = item.title;

                div.appendChild(title);

                // 목록에서 클릭하면 상세 화면으로 이동
                div.addEventListener("click", () => openBibleDetail(item.id, item.title));

                frag.appendChild(div);
            });

            bibleListArea.innerHTML = "";
            bibleListArea.appendChild(frag);
        } catch (e) {
            console.error(e);
            showError(bibleListArea);
        }
    }

    function openBibleDetail(id, title) {
        if (!id) return;
        switchView("bible-detail");
        loadBibleDetail(id, title);
    }

    async function loadBibleDetail(id, title) {
        resetTextColor(bibleDetailArea);
        bibleDetailArea.textContent = "불러오는 중...";
        bibleDetailTitle.textContent = title || "말씀 내용";

        try {
            const res = await fetch(`/api/juan/pltc/bible/${id}`);
            if (res.status === 401 || res.status === 403) {
                showError(bibleDetailArea, "로그인 후 이용 가능합니다.");
                return;
            }
            if (!res.ok) throw new Error("HTTP " + res.status);

            const verses = await res.json(); // [{verseNo, content}, ...]
            if (!verses.length) {
                bibleDetailArea.textContent = "등록된 절이 없습니다.";
                return;
            }

            const frag = document.createDocumentFragment();
            verses.forEach(v => {
                const row = document.createElement("div");
                row.className = "verse-item";

                const no = document.createElement("span");
                no.className = "verse-no";
                no.textContent = `${v.verseNo}절`;

                const text = document.createElement("span");
                text.className = "verse-text";
                text.textContent = v.content;

                row.appendChild(no);
                row.appendChild(text);
                frag.appendChild(row);
            });

            resetTextColor(bibleDetailArea);
            bibleDetailArea.innerHTML = "";
            bibleDetailArea.appendChild(frag);
        } catch (e) {
            console.error(e);
            showError(bibleDetailArea);
        }
    }

    // ===== 초기 로딩 =====
    loadMe();
    switchView("home");   // home 진입 시 오늘의 기도제목 자동 로딩
});