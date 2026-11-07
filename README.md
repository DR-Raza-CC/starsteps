# StarSteps Learning ⭐

A Kumon-style daily practice app for Maths and English, Reception to Year 6 (UK National Curriculum).

## Files
```
index.html        – the app's page and styles
app.js            – app logic (sign-in, kids, games, tests, rewards, parent area)
content.js        – all topics, explanations and question generators, year by year
functions/api.js  – Cloudflare Pages Function: saves family data in KV
```

## Deploy (same as your other apps)
1. Make a new GitHub repo, for example `starsteps`.
2. Upload `index.html`, `app.js`, `content.js` and `README.md`.
3. Click **Add file → Create new file**, type `functions/api.js` as the name (the slash makes the folder), and paste in the contents of `api.js`.
4. Cloudflare → Workers & Pages → Create → Pages → connect the `starsteps` repo. Framework: **None**. Build command: leave it empty. Output folder: `/`.
5. Workers & Pages → **KV** → Create namespace `starsteps`.
6. Pages project → Settings → **Bindings** → Add → KV namespace. Set the variable name to **`STUDY`** and choose the `starsteps` namespace.
7. Deployments → **Retry deployment**, so the binding is picked up.
8. Open `https://<project>.pages.dev`, choose **New family**, make a family code and password, then add each child.

If storage isn't connected yet, the app still works, but it saves to that one device only and shows a yellow banner.

## Admin page (just for you)
1. Cloudflare → your starsteps Pages project → Settings → **Variables and Secrets** → Add → type **Secret**, name **`ADMIN_KEY`**, value = a long password only you know. Save.
2. Deployments → **Retry deployment**.
3. Open `https://starsteps.pages.dev/#admin` and enter your admin key. You'll see how many families and children use the app, who was active today, roughly how many of the 1,000 free daily saves have been used, and a delete button for each family.

## Security features
- **Recovery code:** shown once when a family is created. "Forgot password?" on the sign-in screen uses it to set a new password, and a fresh recovery code is issued each time. Families created before this update can make one in Parent area → ⚙️ Family.
- **Lockout:** after 5 wrong passwords, that family code is locked for 15 minutes. The recovery code still works during a lockout.
- **Delete our family:** Parent area → ⚙️ Family. It needs the password and the word DELETE.
- **Privacy note** on the sign-in screen.

## How it works
- **Family code and password** sign in any device. Kids tap their own avatar. The parent area asks for the password again.
- **Each child** has a name, a school year (Reception to Year 6) and subjects (Maths and/or English).
- **Daily flow:** a short lesson, then a 10-question practice game (the Rocket race), then a 10-question **daily test**.
- **Levelling up:** a score of 9/10 or more on the daily test masters the topic and unlocks the next one. Once the last topic of a year is done, the child moves on to the next year.
- **Tricky questions:** every wrong answer goes on a review list. Those questions come back in later tests and in "Fix my tricky questions" until the child gets each one right **twice**.
- **Weekly test:** 20 questions mixing the topics mastered so far with the review list. The best score of the week is kept.
- **Rewards:** stars, coins, a daily streak with chests at 3, 7, 14 and 30 days, mystery sticker eggs (common, rare, epic, legendary), 15 badges, and a pet that grows from an egg to a Legend.
- **Parent area:** streak, % correct, a 14-day activity chart, each subject's level, every result with the wrong answers, the tricky-question list, a "copy weekly report" button, and controls to set the starting year/topic, edit, reset or remove a child.

## Notes
- Cloudflare's free KV plan allows about 1,000 writes a day per account, shared with your other apps. StarSteps saves only at the end of each activity, roughly 5–10 writes per child per day.
- The content is original practice material that follows the UK curriculum. It is not Kumon's worksheets.
