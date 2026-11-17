<script setup>
import { computed, nextTick, ref, watch } from "vue";
import {
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogOverlay,
  AlertDialogPortal,
  AlertDialogRoot,
  AlertDialogTitle,
  DialogClose,
  DialogContent,
  DialogOverlay,
  DialogPortal,
  DialogRoot,
  DialogTitle,
  DialogTrigger,
} from "reka-ui";
import { days, weatherLinks } from "./data";

const page = ref("trip");
const openDay = ref(2);
const menuOpen = ref(false);
const expenseToDelete = ref(null);
const pendingImport = ref(null);
const importInput = ref(null);
const importStatus = ref("");
const rate = ref(Number(localStorage.getItem("trip-rate")) || 34.8);
const czkRate = ref(Number(localStorage.getItem("trip-czk-rate")) || 1.4);
const hufRate = ref(Number(localStorage.getItem("trip-huf-rate")) || 0.09);
const budget = ref(Number(localStorage.getItem("trip-budget")) || 0);
const expenses = ref(JSON.parse(localStorage.getItem("trip-expenses") || "[]"));
const checklist = ref(
  JSON.parse(localStorage.getItem("trip-checklist") || "null") ||
    [
      "護照、護照影本與簽證資料",
      "機票、保險單與旅行行程表",
      "信用卡、歐元現金",
      "保暖外套與洋蔥式穿搭",
      "防滑好走的鞋",
      "手套、圍巾、帽子與暖暖包",
      "雨傘或雨衣",
      "相機、記憶卡與充電器",
      "轉接插頭與行動電源",
      "常備藥與英文處方箋",
      "盥洗用品、牙刷與拖鞋",
      "出發前三天確認天氣與航班",
    ].map((text, i) => ({ id: i + 1, text, done: false })),
);
const newItem = ref("");
const form = ref({
  date: "2026-12-01",
  category: "餐飲",
  description: "",
  currency: "EUR",
  amount: "",
  payer: "共同",
});
const formErrors = ref({});
const nav = [
  ["home", "首頁"],
  ["itinerary", "行程"],
  ["budget", "預算"],
  ["checklist", "待辦清單"],
  ["memos", "行前備忘"],
  ["weather", "天氣"],
];

const travelMemos = [
  {
    title: "機場集合與行李",
    start: 1,
    items: [
      "機場第一航廈華航集合時會發放：導覽耳機、轉接頭、10 GB 網卡。",
      "到機場後先向領隊小龔報到。",
      "護照自行攜帶，並提早半小時交給領隊小龔。",
      "華航託運行李每人 23 kg × 2 件（兩件不能合計重量）；登機箱限重 7 kg。",
      "可帶提袋裝衣服作為託運行李。",
      "超過 100 cc 的液體須放入託運行李。",
      "電池類與 3C 產品都要隨身攜帶。",
    ],
  },
  {
    title: "衣物與住宿",
    start: 8,
    items: [
      "衣服可以帶準備淘汰的款式，方便旅途中汰換。",
      "布拉格 12/1 約 0～6°C；要帶保暖衣物，不用帶短袖，建議洋蔥式穿法。",
      "飯店備有牙膏、牙刷、拖鞋；部分飯店僅提供三合一清潔用品，可自備潤髮乳。",
      "飯店櫃台可提供飲用水；使用電器時注意當地電壓為 220V。",
      "記得帶常備藥與一轉多 USB 充電器；歐洲插座為雙圓孔。",
    ],
  },
  {
    title: "金錢、行程與其他",
    start: 13,
    items: [
      "兌換歐元，建議準備 500 歐元作為緊急預備金；捷克與匈牙利可再換當地貨幣。",
      "準備 2 張信用卡供退稅使用；JCB 不適用。",
      "第 4 天前往老城區時，準備一日份換洗衣物。飯店位於市中心，大車無法進入，會安排小車接駁。",
      "維也納可自費欣賞音樂會，票價約 70～100 歐元。",
      "約每兩天在首都更換一次行李；飯店小費可給 1 歐元。",
    ],
  },
];

watch([rate, czkRate, hufRate, budget], () => {
  localStorage.setItem("trip-rate", rate.value);
  localStorage.setItem("trip-czk-rate", czkRate.value);
  localStorage.setItem("trip-huf-rate", hufRate.value);
  localStorage.setItem("trip-budget", budget.value);
});
watch(
  expenses,
  (value) => localStorage.setItem("trip-expenses", JSON.stringify(value)),
  { deep: true },
);
watch(
  checklist,
  (value) => localStorage.setItem("trip-checklist", JSON.stringify(value)),
  { deep: true },
);
function toTwd(amount, currency) {
  const exchangeRates = {
    EUR: rate.value,
    CZK: czkRate.value,
    HUF: hufRate.value,
    TWD: 1,
  };
  return amount * (exchangeRates[currency] ?? 1);
}

const total = computed(() =>
  expenses.value.reduce((sum, e) => sum + toTwd(e.amount, e.currency), 0),
);
const left = computed(() => budget.value - total.value);
const progress = computed(() =>
  Math.min(100, Math.round((total.value / Math.max(budget.value, 1)) * 100)),
);
const checked = computed(() => checklist.value.filter((i) => i.done).length);

async function goto(name) {
  menuOpen.value = false;
  if (name === "home") {
    page.value = "trip";
    await nextTick();
    window.scrollTo({ top: 0, behavior: "smooth" });
    return;
  }
  if (name === "itinerary") {
    page.value = "trip";
    await nextTick();
    document.querySelector("#itinerary")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
    return;
  }
  page.value = name;
  window.scrollTo({ top: 0, behavior: "smooth" });
}
function addExpense() {
  const errors = {};
  if (!form.value.description.trim()) errors.description = "請輸入支出項目";
  if (form.value.amount === "" || form.value.amount === null) {
    errors.amount = "請輸入金額";
  } else if (!Number.isFinite(Number(form.value.amount)) || Number(form.value.amount) <= 0) {
    errors.amount = "金額必須大於 0";
  }
  formErrors.value = errors;
  if (Object.keys(errors).length) {
    nextTick(() => document.querySelector(".field-error input")?.focus());
    return;
  }
  expenses.value.unshift({
    ...form.value,
    id: Date.now(),
    amount: Number(form.value.amount),
  });
  form.value.description = "";
  form.value.amount = "";
  formErrors.value = {};
}

function clearFormError(field) {
  if (!formErrors.value[field]) return;
  formErrors.value = { ...formErrors.value, [field]: undefined };
}
function removeExpense(id) {
  expenses.value = expenses.value.filter((e) => e.id !== id);
  expenseToDelete.value = null;
}

function confirmRemoveExpense() {
  const id = expenseToDelete.value?.id;
  if (id === undefined || id === null) return;
  removeExpense(id);
}
function addItem() {
  if (!newItem.value.trim()) return;
  checklist.value.push({
    id: Date.now(),
    text: newItem.value.trim(),
    done: false,
  });
  newItem.value = "";
}
function money(value) {
  return new Intl.NumberFormat("zh-TW", {
    style: "currency",
    currency: "TWD",
    maximumFractionDigits: 0,
  }).format(value || 0);
}

function exportTripData() {
  const backup = {
    schemaVersion: 1,
    exportedAt: new Date().toISOString(),
    app: "Trip Note AU-CZ-HU 2026",
    data: {
      rate: rate.value,
      czkRate: czkRate.value,
      hufRate: hufRate.value,
      budget: budget.value,
      expenses: expenses.value,
      checklist: checklist.value,
    },
  };
  const blob = new Blob([JSON.stringify(backup, null, 2)], {
    type: "application/json;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `trip-note-backup-${new Date().toISOString().slice(0, 10)}.json`;
  link.click();
  URL.revokeObjectURL(url);
  importStatus.value = "備份檔已匯出，請妥善保存。";
}

async function prepareImport(event) {
  importStatus.value = "";
  const file = event.target.files?.[0];
  if (!file) return;
  try {
    const backup = JSON.parse(await file.text());
    const data = backup?.data;
    if (
      backup?.schemaVersion !== 1 ||
      !data ||
      !Number.isFinite(Number(data.rate)) ||
      !Number.isFinite(Number(data.budget)) ||
      !Array.isArray(data.expenses) ||
      !Array.isArray(data.checklist) ||
      !data.expenses.every((item) =>
        item && typeof item.description === "string" &&
        Number.isFinite(Number(item.amount)) && Number(item.amount) >= 0
      ) ||
      !data.checklist.every((item) => item && typeof item.text === "string")
    ) throw new Error("invalid-format");

    pendingImport.value = {
      rate: Number(data.rate),
      czkRate: Number(data.czkRate) || 1.4,
      hufRate: Number(data.hufRate) || 0.09,
      budget: Number(data.budget),
      expenses: data.expenses.map((item, index) => ({
        id: item.id ?? Date.now() + index,
        date: String(item.date || ""),
        category: String(item.category || "其他"),
        description: item.description,
        currency: ["EUR", "CZK", "HUF", "TWD"].includes(item.currency)
          ? item.currency
          : "TWD",
        amount: Number(item.amount),
        payer: String(item.payer || "共同"),
      })),
      checklist: data.checklist.map((item, index) => ({
        id: item.id ?? Date.now() + index,
        text: item.text,
        done: Boolean(item.done),
      })),
      filename: file.name,
    };
  } catch {
    importStatus.value = "無法匯入：這不是有效的 Trip Note 備份檔。";
  } finally {
    event.target.value = "";
  }
}

function confirmImport() {
  if (!pendingImport.value) return;
  const backup = pendingImport.value;
  rate.value = backup.rate;
  czkRate.value = backup.czkRate;
  hufRate.value = backup.hufRate;
  budget.value = backup.budget;
  expenses.value = backup.expenses;
  checklist.value = backup.checklist;
  pendingImport.value = null;
  importStatus.value = "資料已成功匯入並儲存在這台裝置。";
}
</script>

<template>
  <header class="topbar">
    <button class="brand" @click="goto('home')">
      <span>Trip．Note</span><b>AU · CZ · HU</b>
    </button>
    <nav class="desktop-nav">
      <button
        v-for="item in nav"
        :key="item[0]"
        :class="{ active: page === item[0] }"
        @click="goto(item[0])"
      >
        {{ item[1] }}
      </button>
    </nav>
    <DialogRoot v-model:open="menuOpen">
      <DialogTrigger class="mobile-menu-trigger" aria-label="開啟導覽選單">
        <span></span><span></span>
      </DialogTrigger>
      <DialogPortal>
        <DialogOverlay class="sheet-overlay" />
        <DialogContent class="nav-sheet">
          <div class="sheet-handle"></div>
          <div class="sheet-heading">
            <div><small>TRIP NAVIGATION</small><DialogTitle>要去哪裡？</DialogTitle></div>
            <DialogClose class="sheet-close" aria-label="關閉選單">×</DialogClose>
          </div>
          <div class="mobile-nav">
            <button v-for="(item, index) in nav" :key="item[0]" @click="goto(item[0])">
              <span>0{{ index + 1 }}</span><b>{{ item[1] }}</b><em>→</em>
            </button>
          </div>
        </DialogContent>
      </DialogPortal>
    </DialogRoot>
  </header>

  <main v-if="page === 'trip'">
    <section class="hero">
      <div class="hero-art">
        <div class="sun"></div>
        <div class="hill h1"></div>
        <div class="hill h2"></div>
        <div class="town">ČESKÝ<br />KRUMLOV</div>
      </div>
      <div class="hero-copy">
        <p class="eyebrow">WINTER JOURNAL · 2026</p>
        <h1>奧捷匈<br /><em>12 日</em>旅行手帳</h1>
        <p class="dates">2026.12.01 — 12.12</p>
        <p>
          從布拉格的石板路、克魯諾夫的河灣，到多瑙河夜色與維也納冬日樂章，一起收藏十二天的歐洲風景。
        </p>
      </div>
      <div class="stamp">3 國<br /><b>12 DAYS</b></div>
    </section>

    <section class="facts wrap">
      <div><small>FLIGHT</small><b>中華航空直飛</b></div>
      <div><small>CITIES</small><b>6 座住宿城市</b></div>
      <div><small>STYLE</small><b>遊覽車 · 遊船 · 步行</b></div>
      <div><small>SEASON</small><b>冬季 · 聖誕市集</b></div>
    </section>

    <section class="wrap intro">
      <p class="eyebrow">THE JOURNEY</p>
      <h2>一段從波希米亞走到多瑙河的冬日旅行</h2>
      <p>
        所有行程、餐食、住宿與車程均依旅行社PDF整理。未提供的集合時間、餐廳名稱與營業資訊保留為待確認，不以推測補齊。
      </p>
    </section>

    <section id="itinerary" class="days wrap">
      <div class="section-title">
        <div>
          <p class="eyebrow">12-DAY ITINERARY</p>
          <h2>每日行程</h2>
        </div>
        <p>點選日期展開時間軸與導航</p>
      </div>
      <div class="day-tabs">
        <button
          v-for="d in days"
          :key="d.day"
          :class="{ active: openDay === d.day }"
          @click="openDay = d.day"
        >
          <span>D{{ d.day }}</span
          ><b>{{ d.date }}</b>
        </button>
      </div>
      <article
        v-for="d in days"
        v-show="openDay === d.day"
        :key="d.day"
        class="day-card"
      >
        <div class="day-head">
          <div>
            <p>DAY {{ d.day }} · 2026/{{ d.date }}（{{ d.weekday }}）</p>
            <h3>{{ d.city }}</h3>
            <span v-if="d.drive" class="drive">車程 {{ d.drive }}</span>
          </div>
          <div class="country">{{ d.country }}</div>
        </div>
        <p class="day-intro">{{ d.intro }}</p>
        <div class="timeline">
          <div v-for="(spot, i) in d.spots" :key="spot.name" class="stop">
            <div class="dot">{{ i + 1 }}</div>
            <div>
              <small>{{ spot.time || "依領隊安排" }}</small>
              <h4>{{ spot.name }}</h4>
              <p>{{ spot.note }}</p>
              <div class="links">
                <a :href="spot.map" target="_blank" rel="noreferrer"
                  >地圖導航 ↗</a
                ><a
                  v-if="spot.route"
                  :href="spot.route"
                  target="_blank"
                  rel="noreferrer"
                  >行車路線 ↗</a
                >
              </div>
            </div>
          </div>
        </div>
        <div class="details">
          <div>
            <small>MEALS</small>
            <p v-for="m in d.meals" :key="m">{{ m }}</p>
          </div>
          <div>
            <small>STAY</small>
            <p>{{ d.stay }}</p>
          </div>
        </div>
        <p v-if="d.note" class="notice">※ {{ d.note }}</p>
      </article>
    </section>
  </main>

  <main v-else-if="page === 'budget'" class="tool-page wrap">
    <p class="eyebrow">TRAVEL WALLET</p>
    <h1>旅行預算</h1>
    <p class="lead">資料僅存在這台裝置的瀏覽器，不會上傳。</p>
    <section class="data-tools" aria-labelledby="data-tools-title">
      <div>
        <small>LOCAL BACKUP</small>
        <h2 id="data-tools-title">備份與移轉資料</h2>
        <p>匯出後可傳到另一支手機，再於此處匯入(包含預算及清單)。</p>
      </div>
      <div class="data-actions">
        <button @click="exportTripData">匯出備份</button>
        <button class="secondary" @click="importInput?.click()">匯入備份</button>
        <input ref="importInput" class="visually-hidden" type="file" accept="application/json,.json" @change="prepareImport" />
      </div>
      <p v-if="importStatus" class="import-status" :class="{ error: importStatus.startsWith('無法') }" role="status">{{ importStatus }}</p>
    </section>
    <section class="summary">
      <label>總預算（TWD）<input type="number" v-model.number="budget" /></label
      ><label
        >1 EUR = TWD<input type="number" step="0.1" v-model.number="rate"
      /></label
      ><label
        >1 CZK（捷克克朗）= TWD<input type="number" step="0.01" v-model.number="czkRate"
      /></label
      ><label
        >1 HUF（匈牙利福林）= TWD<input type="number" step="0.001" v-model.number="hufRate"
      /></label>
      <div>
        <span>已花費</span><b>{{ money(total) }}</b>
      </div>
      <div :class="{ danger: left < 0 }">
        <span>剩餘</span><b>{{ money(left) }}</b>
      </div>
      <div class="progress"><i :style="{ width: progress + '%' }"></i></div>
    </section>
    <section class="expense-form card" aria-labelledby="expense-form-title">
      <h2 id="expense-form-title">新增支出</h2>
      <label class="form-field"><span>日期</span><input type="date" v-model="form.date" /></label>
      <label class="form-field"><span>分類</span><select v-model="form.category">
        <option
          v-for="c in ['機票', '交通', '餐飲', '購物', '門票', '其他']"
          :key="c"
        >
          {{ c }}
        </option></select></label>
      <label class="form-field description-field" :class="{ 'field-error': formErrors.description }">
        <span>項目說明 <b>必填</b></span>
        <input v-model="form.description" @input="clearFormError('description')" placeholder="例如：晚餐、車票" :aria-invalid="Boolean(formErrors.description)" aria-describedby="description-error" />
        <small v-if="formErrors.description" id="description-error" role="alert">{{ formErrors.description }}</small>
      </label>
      <label class="form-field"><span>幣別</span><select v-model="form.currency">
        <option>EUR</option>
        <option>CZK</option>
        <option>HUF</option>
        <option>TWD</option></select></label>
      <label class="form-field" :class="{ 'field-error': formErrors.amount }">
        <span>金額 <b>必填</b></span>
        <input type="number" min="0" step="0.01" inputmode="decimal" v-model="form.amount" @input="clearFormError('amount')" placeholder="0" :aria-invalid="Boolean(formErrors.amount)" aria-describedby="amount-error" />
        <small v-if="formErrors.amount" id="amount-error" role="alert">{{ formErrors.amount }}</small>
      </label>
      <label class="form-field"><span>付款人</span><select v-model="form.payer">
        <option>共同</option>
        <option>旅伴 A</option>
        <option>旅伴 B</option></select></label>
      <p v-if="Object.keys(formErrors).length" class="form-alert" role="alert">請完成上方必填欄位後再新增。</p>
      <button class="submit-expense" @click="addExpense">新增支出</button>
    </section>
    <div class="expense-list">
      <div v-if="!expenses.length" class="empty">
        還沒有支出，從上方新增第一筆。
      </div>
      <div v-for="e in expenses" :key="e.id" class="expense">
        <div>
          <small>{{ e.date }} · {{ e.category }} · {{ e.payer }}</small
          ><b>{{ e.description }}</b>
        </div>
        <span
          >{{ e.currency }} {{ e.amount.toLocaleString()
          }}<small>{{
            e.currency !== "TWD" ? " ≈ " + money(toTwd(e.amount, e.currency)) : ""
          }}</small></span
        ><button @click="expenseToDelete = e" aria-label="刪除">×</button>
      </div>
    </div>
    <AlertDialogRoot :open="Boolean(expenseToDelete)" @update:open="(open) => !open && (expenseToDelete = null)">
      <AlertDialogPortal>
        <AlertDialogOverlay class="sheet-overlay" />
        <AlertDialogContent class="confirm-dialog">
          <AlertDialogTitle>刪除這筆支出？</AlertDialogTitle>
          <AlertDialogDescription>
            「{{ expenseToDelete?.description }}」刪除後無法復原。
          </AlertDialogDescription>
          <div class="confirm-actions">
            <AlertDialogCancel>保留</AlertDialogCancel>
            <AlertDialogAction class="danger-button" @click.capture="confirmRemoveExpense">刪除</AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialogPortal>
    </AlertDialogRoot>
    <AlertDialogRoot :open="Boolean(pendingImport)" @update:open="(open) => !open && (pendingImport = null)">
      <AlertDialogPortal>
        <AlertDialogOverlay class="sheet-overlay" />
        <AlertDialogContent class="confirm-dialog">
          <AlertDialogTitle>匯入並覆蓋目前資料？</AlertDialogTitle>
          <AlertDialogDescription>
            將從「{{ pendingImport?.filename }}」匯入資料。目前的預算、支出與清單會被取代，建議先匯出一份備份。
          </AlertDialogDescription>
          <div class="confirm-actions">
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction @click.capture="confirmImport">確認匯入</AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialogPortal>
    </AlertDialogRoot>
  </main>

  <main v-else-if="page === 'checklist'" class="tool-page wrap">
    <p class="eyebrow">BEFORE DEPARTURE</p>
    <h1>行李與待辦</h1>
    <p class="lead">
      已完成 {{ checked }} / {{ checklist.length }}；勾選狀態會自動保留。
    </p>
    <div class="add-row">
      <input
        v-model="newItem"
        @keyup.enter="addItem"
        placeholder="新增清單項目"
      /><button @click="addItem">加入</button>
    </div>
    <section class="check-grid">
      <label
        v-for="item in checklist"
        :key="item.id"
        :class="{ done: item.done }"
        ><input type="checkbox" v-model="item.done" /><span>{{
          item.text
        }}</span
        ><button
          @click.prevent="checklist = checklist.filter((i) => i.id !== item.id)"
        >
          ×
        </button></label
      >
    </section>
  </main>

  <main v-else-if="page === 'memos'" class="tool-page wrap">
    <p class="eyebrow">TOUR LEADER NOTES</p>
    <h1 id="travel-memo-title">行前備忘</h1>
    <p class="lead">集合、行李、住宿與付款注意事項，共 17 項。</p>
    <section class="memo-grid" aria-labelledby="travel-memo-title">
      <article v-for="group in travelMemos" :key="group.title" class="memo-card">
        <h2>{{ group.title }}</h2>
        <ol :start="group.start">
          <li v-for="item in group.items" :key="item">{{ item }}</li>
        </ol>
      </article>
    </section>
  </main>

  <main v-else class="tool-page wrap">
    <p class="eyebrow">WEATHER WATCH</p>
    <h1>冬季天氣</h1>
    <p class="lead">
      請於出發前三天查看最新氣溫、降雪、風速與警報。
    </p>
    <section class="weather-grid">
      <a
        v-for="w in weatherLinks"
        :key="w[0]"
        :href="w[1]"
        target="_blank"
        rel="noreferrer"
        ><span>即時預報</span><b>{{ w[0] }}</b
        ><em>查看 Meteoblue ↗</em></a
      >
    </section>
    <aside class="tip">
      <b>12 月旅行提醒</b>
      <p>
        山區與湖區路面可能積雪或結冰；遊船也可能因天候停航。穿防滑鞋、採洋蔥式穿搭，並依領隊當日通知調整。
      </p>
    </aside>
  </main>

  <footer>
    <span>AUSTRIA · CZECHIA · HUNGARY</span>
    <p>資料來源為旅行社PDF整理 · 最終安排以旅行社現場通知為準</p>
  </footer>
</template>

<style>
#itinerary {
  scroll-margin-top: 96px;
}

.mobile-menu-trigger {
  display: none;
}

.sheet-overlay {
  position: fixed;
  inset: 0;
  z-index: 50;
  background: rgba(42, 36, 31, 0.48);
  backdrop-filter: blur(4px);
  animation: fade-in 180ms ease-out;
}

.nav-sheet {
  position: fixed;
  z-index: 51;
  right: 0;
  bottom: 0;
  left: 0;
  max-height: 88dvh;
  padding: 10px 20px max(24px, env(safe-area-inset-bottom));
  overflow: auto;
  border-radius: 28px 28px 0 0;
  background: var(--paper);
  box-shadow: 0 -20px 60px rgba(54, 44, 35, 0.2);
  animation: sheet-up 240ms cubic-bezier(.2,.8,.2,1);
}

.sheet-handle {
  width: 42px;
  height: 4px;
  margin: 2px auto 20px;
  border-radius: 99px;
  background: var(--line);
}

.sheet-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.sheet-heading small { color: var(--brown); letter-spacing: .16em; }
.sheet-heading h2 { margin: 2px 0 0; font: 600 30px 'Noto Serif TC'; }
.sheet-close { width: 44px; height: 44px; border-radius: 50%; background: var(--cream); font-size: 24px; }
.mobile-nav { display: grid; }
.mobile-nav button { min-height: 64px; display: grid; grid-template-columns: 36px 1fr 30px; align-items: center; border-top: 1px solid var(--line); text-align: left; }
.mobile-nav span { color: var(--brown); font-size: 11px; }
.mobile-nav b { font: 600 21px 'Noto Serif TC'; }
.mobile-nav em { color: #759195; font-style: normal; font-size: 20px; }

.confirm-dialog {
  position: fixed;
  z-index: 52;
  top: 50%;
  left: 50%;
  width: min(420px, calc(100% - 36px));
  padding: 28px;
  transform: translate(-50%, -50%);
  border-radius: 22px;
  background: var(--paper);
  box-shadow: var(--shadow);
}
.confirm-dialog h2 { margin: 0 0 8px; font: 600 25px 'Noto Serif TC'; }
.confirm-dialog p { margin: 0; color: var(--brown); }
.confirm-actions { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 24px; }
.confirm-actions button { min-height: 48px; border-radius: 10px; background: var(--cream); }
.confirm-actions .danger-button { background: #704a40; color: white; }

.data-tools { display: grid; grid-template-columns: 1fr auto; gap: 16px 28px; margin-bottom: 28px; padding: 22px; border: 1px solid var(--line); border-radius: 18px; background: rgba(255, 253, 248, .72); }
.data-tools small { color: var(--brown); font-size: 10px; letter-spacing: .18em; }
.data-tools h2 { margin: 2px 0 0; font: 600 21px 'Noto Serif TC'; }
.data-tools p { margin: 3px 0 0; color: var(--brown); font-size: 13px; }
.data-actions { display: flex; align-items: center; gap: 8px; }
.data-actions button { min-height: 46px; padding: 0 16px; border-radius: 9px; background: var(--ink); color: white; }
.data-actions .secondary { border: 1px solid var(--line); background: var(--paper); color: var(--ink); }
.visually-hidden { position: absolute; width: 1px; height: 1px; margin: -1px; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; }
.data-tools .import-status { grid-column: 1 / -1; margin: 0; padding: 9px 12px; border-radius: 8px; background: #e7efeb; color: #526d65; }
.data-tools .import-status.error { background: #f7e9e4; color: #833f35; }

.expense-form > h2 {
  grid-column: 1 / -1;
  margin: 0 0 2px;
  font: 600 20px 'Noto Serif TC';
}
.form-field { display: grid; align-content: start; gap: 5px; min-width: 0; }
.form-field > span { font-size: 11px; color: var(--brown); }
.form-field > span b { color: #946154; font-weight: 500; }
.form-field input,
.form-field select { width: 100%; min-height: 46px; }
.form-field small { color: #9b493d; font-size: 12px; line-height: 1.35; }
.field-error input { border-color: #a95345; outline: 2px solid rgba(169, 83, 69, .14); }
.form-alert { grid-column: 1 / -1; margin: 0; padding: 10px 12px; border-radius: 8px; background: #f7e9e4; color: #833f35; font-size: 13px; }
.submit-expense { align-self: end; min-height: 46px; }

@keyframes fade-in { from { opacity: 0; } }
@keyframes sheet-up { from { transform: translateY(100%); } }

@media (max-width: 760px) {
  #itinerary {
    scroll-margin-top: 82px;
  }
  .desktop-nav { display: none; }
  .mobile-menu-trigger {
    display: grid;
    width: 46px;
    height: 46px;
    place-content: center;
    gap: 6px;
    border-radius: 50%;
    background: var(--paper);
  }
  .mobile-menu-trigger span { width: 20px; height: 1px; background: var(--ink); }
  .expense-form { grid-template-columns: 1fr 1fr; }
  .expense-form .description-field,
  .expense-form .submit-expense { grid-column: 1 / -1; }
  .expense-form .submit-expense { min-height: 52px; margin-top: 4px; }
  .data-tools { grid-template-columns: 1fr; padding: 18px; }
  .data-actions { display: grid; grid-template-columns: 1fr 1fr; }
  .data-actions button { min-height: 52px; }
}
</style>
