<script setup>
import { computed, nextTick, ref, watch } from "vue";
import { days, weatherLinks } from "./data";

const page = ref("trip");
const openDay = ref(2);
const menuOpen = ref(false);
const rate = ref(Number(localStorage.getItem("trip-rate")) || 34.8);
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
const nav = [
  ["home", "首頁"],
  ["itinerary", "行程"],
  ["budget", "預算"],
  ["checklist", "清單"],
  ["weather", "天氣"],
];

watch([rate, budget], () => {
  localStorage.setItem("trip-rate", rate.value);
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
const total = computed(() =>
  expenses.value.reduce(
    (sum, e) => sum + (e.currency === "EUR" ? e.amount * rate.value : e.amount),
    0,
  ),
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
  if (!form.value.description || !Number(form.value.amount)) return;
  expenses.value.unshift({
    ...form.value,
    id: Date.now(),
    amount: Number(form.value.amount),
  });
  form.value.description = "";
  form.value.amount = "";
}
function removeExpense(id) {
  expenses.value = expenses.value.filter((e) => e.id !== id);
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
</script>

<template>
  <header class="topbar">
    <button class="brand" @click="goto('home')">
      <span>Trip．Note</span><b>AU · CZ · HU</b>
    </button>
    <button class="menu" @click="menuOpen = !menuOpen" aria-label="開啟選單">
      {{ menuOpen ? "×" : "☰" }}
    </button>
    <nav :class="{ open: menuOpen }">
      <button
        v-for="item in nav"
        :key="item[0]"
        :class="{ active: page === item[0] }"
        @click="goto(item[0])"
      >
        {{ item[1] }}
      </button>
    </nav>
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
    <section class="summary">
      <label>總預算（TWD）<input type="number" v-model.number="budget" /></label
      ><label
        >1 EUR = TWD<input type="number" step="0.1" v-model.number="rate"
      /></label>
      <div>
        <span>已花費</span><b>{{ money(total) }}</b>
      </div>
      <div :class="{ danger: left < 0 }">
        <span>剩餘</span><b>{{ money(left) }}</b>
      </div>
      <div class="progress"><i :style="{ width: progress + '%' }"></i></div>
    </section>
    <section class="expense-form card">
      <input type="date" v-model="form.date" /><select v-model="form.category">
        <option
          v-for="c in ['機票', '交通', '餐飲', '購物', '門票', '其他']"
          :key="c"
        >
          {{ c }}
        </option></select
      ><input v-model="form.description" placeholder="項目說明" /><select
        v-model="form.currency"
      >
        <option>EUR</option>
        <option>TWD</option></select
      ><input type="number" v-model="form.amount" placeholder="金額" /><select
        v-model="form.payer"
      >
        <option>共同</option>
        <option>旅伴 A</option>
        <option>旅伴 B</option></select
      ><button @click="addExpense">新增支出</button>
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
            e.currency === "EUR" ? " ≈ " + money(e.amount * rate) : ""
          }}</small></span
        ><button @click="removeExpense(e.id)" aria-label="刪除">×</button>
      </div>
    </div>
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
    <aside class="tip">
      <b>搭機提醒</b>
      <p>
        經濟艙託運 23 kg × 2 件；手提行李 7 kg × 1
        件。行動電源與備用鋰電池必須隨身攜帶，航程中禁止使用與充電。
      </p>
    </aside>
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

@media (max-width: 760px) {
  #itinerary {
    scroll-margin-top: 82px;
  }
}
</style>
