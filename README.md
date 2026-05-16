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

## מבנה הפרויקט / Project structure

| קובץ / File | תפקיד / Purpose |
| --- | --- |
| `index.html` | מבנה הדף, מטא־דאטה, ניווט וכל ה־sections של המסכים. Page structure, metadata, navigation and all screen sections. |
| `style.css` | עיצוב מלא: ערכת צבעים כהה, טיפוגרפיה, פריסה ל־RTL, רספונסיביות. Full styling: dark palette, typography, RTL layout, responsive rules. |
| `app.js` | כל הלוגיקה: state, חישובים, רינדור, אחסון מקומי וגרפים. All app logic: state, calculations, rendering, local storage, charts. |
| `.gitignore` · `README.md` | תחזוקה / Repo housekeeping. |

האייקון מוטמע כ־SVG בתוך `<head>` (אין קובץ favicon חיצוני). Chart.js נטען מ־CDN בזמן ריצה.
The favicon is an inline SVG inside `<head>` (no external favicon file). Chart.js is loaded from a CDN at runtime.

---

## דפדפנים נתמכים / Browser support

נבדק על גרסאות עדכניות של Chrome, Firefox ו־Safari (כולל iOS 15+). דורש JavaScript מופעל ותמיכה ב־`localStorage`. אין צורך בהתקנה — מספיק לפתוח את הדף.

Tested on current Chrome, Firefox, and Safari (incl. iOS 15+). Requires JavaScript and `localStorage` support. No installation needed — just open the page.

---

## גילוי נאות / Disclaimer

המידע באפליקציה הוא לצורכי מידע והשוואה בלבד ואינו מהווה ייעוץ השקעות, ייעוץ פיננסי או המלצה אישית לקנייה/מכירה של נייר ערך. לפני החלטת השקעה יש להתייעץ עם בעל רישיון מתאים. כלי זה מיועד לחינוך פיננסי בלבד.

> This app is for informational and educational purposes only. It is **not** investment advice, financial advice, or a personal recommendation to buy or sell any security. Consult a licensed professional before making investment decisions.
