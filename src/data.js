const q = (place) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place)}`;
const route = (from, to, mode = "driving") =>
  `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(from)}&destination=${encodeURIComponent(to)}&travelmode=${mode}`;

function prepareDay(day) {
  const stayAddress = day.stay.split("｜")[1]?.trim();
  return {
    ...day,
    stayMap: stayAddress ? q(stayAddress) : null,
    showStayDisclaimer: day.stay.includes("同級") || day.stay.includes("｜"),
    spots: day.spots.map((spot, index) => {
      const previousPlace = index ? day.spots[index - 1].place : null;
      return {
        ...spot,
        map: q(spot.place),
        route: previousPlace ? route(previousPlace, spot.place) : null,
        walkingRoute: previousPlace
          ? route(previousPlace, spot.place, "walking")
          : null,
      };
    }),
  };
}

export const days = [
  {
    day: 1,
    date: "12/01",
    weekday: "二",
    country: "CZ",
    city: "台北 → 布拉格",
    stay: "機上",
    meals: ["早餐：敬請自理", "午餐：敬請自理", "晚餐：機上套餐"],
    intro:
      "20:45 於桃園機場第一航廈中華航空團體櫃檯集合，23:45 搭乘 CI-067 直飛布拉格。",
    spots: [
      {
        time: "20:45",
        name: "桃園國際機場第一航廈",
        note: "中華航空團體櫃檯集合；航班 CI-067。",
        place: "Taiwan Taoyuan International Airport Terminal 1",
      },
    ],
    note: "隔日 07:25 抵達，飛行約 14 小時 40 分。團體票需團進團出。",
  },
  {
    day: 2,
    date: "12/02",
    weekday: "三",
    country: "CZ",
    city: "布拉格",
    stay: "HOTEL JALTA ★★★★★｜Václavské náměstí 45/818, Praha 1",
    meals: ["早餐：機上", "午餐：伏爾塔瓦河遊船午宴", "晚餐：義式風味料理"],
    intro: "抵達後走訪布拉格老城，搭乘伏爾塔瓦河遊船，傍晚感受聖誕市集。",
    spots: [
      {
        name: "布拉格老城廣場",
        note: "下車參觀老城廣場、火藥塔。",
        place: "Old Town Square Prague",
      },
      {
        name: "伏爾塔瓦河遊船",
        note: "含入場，船上午宴。",
        place: "Vltava River Prague",
      },
      {
        name: "布拉格聖誕市集",
        note: "市集日期與營業時間請出發前確認。",
        place: "Prague Christmas Market Old Town Square",
      },
    ],
  },
  {
    day: 3,
    date: "12/03",
    weekday: "四",
    country: "CZ",
    city: "布拉格",
    stay: "同前一晚或同級",
    meals: [
      "早餐：飯店內",
      "午餐：米其林推薦餐廳＋飲料一杯",
      "晚餐：方便遊玩，敬請自理",
    ],
    intro: "上午遊覽布拉格城堡區，午後半日自由活動。",
    spots: [
      {
        name: "布拉格城堡區",
        note: "聖維特大教堂、舊皇宮、黃金小徑；含入場。",
        place: "Prague Castle",
      },
      {
        name: "查理大橋",
        note: "下車參觀；連結舊城與城堡區。",
        place: "Charles Bridge Prague",
      },
      {
        name: "布拉格自由活動",
        note: "可利用電車、地鐵或步行探索。",
        place: "Prague Czechia",
      },
    ],
    note: "PDF 未指定米其林餐廳名稱，待旅行社確認。",
  },
  {
    day: 4,
    date: "12/04",
    weekday: "五",
    country: "CZ",
    city: "布拉格 → 克魯諾夫",
    stay: "HOTEL GRAND CESKY KRUMLOV｜Náměstí Svornosti 3, Český Krumlov",
    meals: ["早餐：飯店內", "午餐：捷式烤鴨料理", "晚餐：地窖牛排餐"],
    intro: "前往伏爾塔瓦河畔的世界遺產小鎮克魯諾夫（Český Krumlov）。",
    drive: "約 176 km／2.5 小時",
    spots: [
      {
        name: "克魯諾夫城堡",
        note: "下車參觀城堡與舊城區。",
        place: "Cesky Krumlov Castle",
      },
      {
        name: "克魯諾夫舊城",
        note: "漫步中世紀街區與河灣。",
        place: "Historic Center of Cesky Krumlov",
      },
    ],
  },
  {
    day: 5,
    date: "12/05",
    weekday: "六",
    country: "AT",
    city: "克魯諾夫 → 薩爾茲堡",
    stay: "RADISSON BLU HOTEL & CONFERENCE CENTRE｜Fanny-von-Lehnert-Straße 7, Salzburg",
    meals: [
      "早餐：飯店內",
      "午餐：德式豬腳料理佐啤酒一杯",
      "晚餐：中式料理七菜一湯",
    ],
    intro: "探訪古老鹽礦，午後走入音樂之都薩爾茲堡。",
    spots: [
      {
        name: "鹽礦探秘之旅",
        note: "含入場；需穿工作服、搭運輸車及木滑梯。",
        place: "Salzwelten Salzburg",
      },
      {
        name: "薩爾茲堡舊城",
        note: "莫札特故居、米拉貝爾花園。",
        place: "Salzburg Old Town",
      },
      {
        name: "米拉貝爾花園",
        note: "下車參觀。",
        place: "Mirabell Gardens Salzburg",
      },
    ],
  },
  {
    day: 6,
    date: "12/06",
    weekday: "日",
    country: "AT",
    city: "薩爾茲堡 → 哈斯達特 → 格拉茲",
    stay: "INTERCITYHOTEL GRAZ｜Finkengasse 2, Graz",
    meals: [
      "早餐：飯店內",
      "午餐：湖區鱒魚料理",
      "晚餐：飯店主廚推薦或自助式晚餐",
    ],
    intro: "遊船聖沃夫岡湖，造訪世界遺產哈斯達特，再前往格拉茲。",
    spots: [
      {
        name: "聖沃夫岡湖遊船",
        note: "特別安排；若不開放，改 Hallstatt 交通船或退費 10 歐。",
        place: "Wolfgangsee Austria",
      },
      { name: "哈斯達特", note: "湖畔小鎮漫步。", place: "Hallstatt Austria" },
      { name: "格拉茲", note: "當日晚間入住。", place: "Graz Austria" },
    ],
    note: "冬季遊船與降雪路況可能影響動線。",
  },
  {
    day: 7,
    date: "12/07",
    weekday: "一",
    country: "HU",
    city: "格拉茲 → 布達佩斯",
    stay: "DANUBIUS HOTEL HELIA｜Kárpát utca 62-64, Budapest",
    meals: ["早餐：飯店內", "午餐：黃金炸豬排", "晚餐：中式料理七菜一湯"],
    intro: "上午認識格拉茲歷史城區，午後跨境前往布達佩斯。",
    spots: [
      {
        name: "格拉茲舊城",
        note: "莫爾河之島、現代美術館、舊城區、皇家麵包店。",
        place: "Graz Old Town",
      },
      {
        name: "城堡纜車",
        note: "含上、下纜車。",
        place: "Schlossbergbahn Graz",
      },
      { name: "布達佩斯", note: "抵達後入住。", place: "Budapest Hungary" },
    ],
  },
  {
    day: 8,
    date: "12/08",
    weekday: "二",
    country: "HU",
    city: "布達佩斯",
    stay: "同前一晚或同級",
    meals: ["早餐：飯店內", "午餐：匈牙利燉牛肉", "晚餐：多瑙河遊船晚宴"],
    intro: "完整探索布達與佩斯兩岸，夜晚於多瑙河上用餐賞景。",
    spots: [
      {
        name: "布達皇宮區",
        note: "漁夫堡、馬提亞斯教堂。",
        place: "Buda Castle Budapest",
      },
      {
        name: "英雄廣場",
        note: "布達佩斯代表性廣場。",
        place: "Heroes Square Budapest",
      },
      {
        name: "中央市場",
        note: "參觀市場建築與在地商品。",
        place: "Central Market Hall Budapest",
      },
      {
        name: "多瑙河遊船晚宴",
        note: "特別安排。",
        place: "Danube River Budapest",
      },
    ],
  },
  {
    day: 9,
    date: "12/09",
    weekday: "三",
    country: "AT",
    city: "布達佩斯 → 潘朵芙 → 維也納",
    stay: "NH VIENNA AIRPORT CONFERENCE CENTER｜Einfahrtsstraße 1-3, Flughafen Wien",
    meals: [
      "早餐：飯店內",
      "午餐：中式料理七菜一湯",
      "晚餐：方便逛街，敬請自理",
    ],
    intro: "上午參觀布達佩斯地標，午後於潘朵芙購物村停留，再前往維也納。",
    spots: [
      {
        name: "英雄廣場",
        note: "行程表列參觀。",
        place: "Heroes Square Budapest",
      },
      {
        name: "塞切尼鏈橋",
        note: "布達佩斯地標。",
        place: "Szechenyi Chain Bridge Budapest",
      },
      {
        name: "潘朵芙購物村",
        note: "Outlet 購物；品牌與營業資訊以官網為準。",
        place: "Designer Outlet Parndorf",
      },
      { name: "維也納", note: "當日晚間入住。", place: "Vienna Austria" },
    ],
  },
  {
    day: 10,
    date: "12/10",
    weekday: "四",
    country: "AT",
    city: "維也納",
    stay: "同前一晚或同級",
    meals: ["早餐：飯店內", "午餐：烤雞料理", "晚餐：奧式肋排料理"],
    intro: "走訪哈布斯堡王朝與維也納歷史中心的重要地標。",
    spots: [
      {
        name: "瑪麗亞特蕾莎廣場",
        note: "下車參觀。",
        place: "Maria-Theresien-Platz Vienna",
      },
      { name: "霍夫堡宮", note: "下車參觀。", place: "Hofburg Vienna" },
      {
        name: "黑死病紀念柱",
        note: "舊城步行區地標。",
        place: "Plague Column Vienna",
      },
      {
        name: "聖史蒂芬大教堂",
        note: "含入場。",
        place: "St. Stephen Cathedral Vienna",
      },
    ],
  },
  {
    day: 11,
    date: "12/11",
    weekday: "五",
    country: "AT",
    city: "維也納 → 台北",
    stay: "機上",
    meals: ["早餐：飯店內", "午餐：機上", "晚餐：機上"],
    intro: "11:00 搭乘中華航空 CI-064 直飛台北，夜宿機上。",
    spots: [
      {
        time: "11:00",
        name: "維也納國際機場",
        note: "航班 CI-064；抵達為隔日 05:35。",
        place: "Vienna International Airport",
      },
    ],
  },
  {
    day: 12,
    date: "12/12",
    weekday: "六",
    country: "TW",
    city: "台北",
    stay: "溫暖的家",
    meals: ["早餐：機上", "午餐：—", "晚餐：—"],
    intro: "05:35 抵達桃園國際機場，旅程平安落幕。",
    spots: [
      {
        time: "05:35",
        name: "桃園國際機場",
        note: "辦理入境與領取行李。",
        place: "Taiwan Taoyuan International Airport",
      },
    ],
  },
].map(prepareDay);

export const weatherLinks = [
  [
    "布拉格",
    "https://www.meteoblue.com/en/weather/week/prague_czechia_3067696",
  ],
  [
    "克魯諾夫",
    "https://www.meteoblue.com/en/weather/week/%c4%8cesk%c3%bd-krumlov_czechia_3077889",
  ],
  [
    "薩爾茲堡",
    "https://www.meteoblue.com/en/weather/week/salzburg_austria_2766824",
  ],
  [
    "哈斯達特",
    "https://www.meteoblue.com/en/weather/week/hallstatt_austria_2776951",
  ],
  ["格拉茲", "https://www.meteoblue.com/en/weather/week/graz_austria_2778067"],
  [
    "布達佩斯",
    "https://www.meteoblue.com/en/weather/week/budapest_hungary_3054643",
  ],
  [
    "維也納",
    "https://www.meteoblue.com/en/weather/week/vienna_austria_2761369",
  ],
];
