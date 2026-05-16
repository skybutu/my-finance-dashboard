# לוח הפיננסים · my-finance-dashboard

לוח פיננסים אישי בעברית (RTL), ללא צד שרת, ללא תלות בכלי בנייה.
כל הנתונים נשמרים מקומית בדפדפן בלבד.

> Personal finance dashboard in Hebrew (RTL). Static, build-free, no server, no backend.
> All data lives in the browser's `localStorage`.

---

## מה האפליקציה עושה / What it does

- מעקב הכנסות מול הוצאות עם חישוב תזרים חודשי
- קרן חירום: יעד 3/6/12 חודשים לפי הוצאות בסיסיות, ההתקדמות והפער הנוכחי
- מנוע "חיסכון מול השקעה" עם הסבר שקוף לפי אופק השקעה וסיבולת סיכון
- ניהול קטגוריות ועסקאות (יבוא/יצוא JSON ו-CSV)
- גרפים אינטראקטיביים (Chart.js)
- השוואת ETF עם ניקוד משוקלל לפי פרופיל סיכון; מצב הדגמה כברירת מחדל, מצב חי אופציונלי מבוסס Yahoo Finance (כפוף ל-CORS)

---

## הפעלה מקומית / Run locally

```sh
python3 -m http.server 8081
# Then open http://localhost:8081
```

אין שלב build. כל הקבצים סטטיים: `index.html`, `style.css`, `app.js`.
The only external runtime dependency is the Chart.js CDN (`cdn.jsdelivr.net`).

---

## פריסה ל-GitHub Pages / GitHub Pages deployment

מאחר וכל הנתיבים יחסיים, הפרויקט נטען נכון מתחת לכל subpath.
Once GitHub Pages is enabled for this repo (Settings → Pages → "Deploy from branch"), the app is reachable at:

```
https://<username>.github.io/my-finance-dashboard/
```

לדוגמה: `https://skybutuguy.github.io/my-finance-dashboard/`.

---

## תכונות עיקריות / Highlights

- עיצוב פיננטק כהה ברוח פלטפורמת אינטליגנציה שוקית — סולם טיפוגרפי מודרני, כרטיסי סטטיסטיקה ופסי פילוח מקטעיים, RTL מלא
- ניווט: סרגל תחתון במובייל, מגירת ניווט מתקפלת בדסקטופ (Esc, גב חצי שקוף, סגירה אוטומטית)
- מצבי ריקנות, מצבי שמירה אוטומטית עם debounce, נעילת מודאל וטיפול ב-focus
- חישובי קצה מוגנים: NaN/Infinity, חלוקה באפס, ערכים שליליים, הוצאות בסיסיות מעל סך ההוצאות
- שקיפות ניקוד ETF: הצגת המשקלים לפי פרופיל הסיכון; שדות שנשמרים ידנית מסומנים בבירור

---

## גילוי נאות / Disclaimer

המידע באפליקציה הוא לצורכי מידע והשוואה בלבד ואינו מהווה ייעוץ השקעות, ייעוץ פיננסי או המלצה אישית לקנייה/מכירה של נייר ערך. לפני החלטת השקעה יש להתייעץ עם בעל רישיון מתאים. כלי זה מיועד לחינוך פיננסי בלבד.

> This app is for informational and educational purposes only. It is **not** investment advice, financial advice, or a personal recommendation to buy or sell any security. Consult a licensed professional before making investment decisions.
