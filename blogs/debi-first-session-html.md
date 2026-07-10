
# DEBI First Session html

بسـم اللـه الرحمـن الرحيـم الحمد لله رب العالمين، والصلاة والسلام على سيدنا محمد الصادق الوعد الأمين، اللهم لا علم لنا إلا ما علمتنا، إنك أنت العليم الحكيم، اللهم علمنا ما ينفعنا، وانفعنا بما علمتنا وزدنا علماً

موعدنا انهارده باذن الله مع اول سيشن في دوره رواد مصر الرقميه والي كانت بشكل كبير مركزه علي

HTML

ف البدايه بقي تعالي نفهم كام مفهوم كد وهو اصلا ازاي بدأ النت او اي هو النت و ازاي موقع زي جوجل بزوره وكد ف تعالي نتكلم ب التفاصيل شويه

ف البدايه لو انت فاكر ان النت هو عباره عن حاجات بتطير ف الجو وكلها اشارات يبقي محتاج تراجع كام نقطه مهمه و عشان تلاقي حد مجمع النقط الاساسيه ف مكان واحد فمفيش غير الدحيح هو الي هيحكيلك القصه

بعد اما تتفرج عليه ف انت كد فهمت كام حاجه حلوه بس تعالي برضه نكمل ونسال بعض اول سؤال وهو ازاي بنلاقي صفحه الانترنت او ازاي بنلاقي الموقع

ف تعالي نبدأ سيناريو كد انك فتحت المتصفح بتاعك كتبت

```
https://www.google.com/
```

هو هنا هيعمل اي ولا هيعرف منين انت رايح تزور اي ؟؟

تعالا نرجع خطوه بسيطه و اقلك انت ازاي بتتعرف علي النت او ازاي بنكلم النت

اي هو بقي دا وبيعمل ip بص فيه حاجه اسمها

دا يسيدي زي رقمك كد انت مش رقمك كمثال

```
+2010909*****
```

هو زيك كد بس هو رقمه بيختلف شويه

```
192.168.1.1
```

الداخلي ip دا مثال لل

يعني اي داخلي يعني انت ليك طريقتين تتكلم بيها ف الاول بتروح للرواتر بتاعك تقله اديني رقم عشان اكلمك من عليه وهكذا مع كل الي ف البيت بعد كد بقي انتوا كلكوا بتبقي ابناء الراوتر طب الراوتر بقي ipبيروح للشركه بتاعتك يقلها اديني

ودا بيبقي كمثال لل ip

```
197.36.21.75
```

  

![Article content](https://media.licdn.com/dms/image/v2/D4D12AQEjjjGrmBdk5Q/article-inline_image-shrink_1500_2232/B4DZfk_1qhGUAU-/0/1751893630254?e=1785369600&v=beta&t=vQDicX4z57vRQpP2Xgx-UCKm5hz0jgVsos0loEKEyWk)

internal vs external IP address

حلو اوي انت كد عرفت ازاي اكلم النت يبقي انا دلوقتي لو معايا راوتر ف انا ممكن اروح لراوتر تاني واكلمه عشان انا معايا رقمه

طب هل انا هقعد احفظ كل الارقام دي ؟؟

ف قالك لا احنا هنعملك حاجه يبقي فيها كل ارقامك زي جهات الاتصال كد ف موبايلك انت مهمتك تكتب اسمها وهو هيجبلك رقمها

ودا بقي الي اسمه DNS

```
DNS --> Domain Name System
```

دا يسيدي فيه منه نسختين نسخه ف الرواتر عندك ونسخه بقي علي حسب انت رايح لانهي واحد بس اشهرهم بتاع جوجل الي رقمه

```
8.8.8.8 and 8.8.4.4
```

دول بيبقوا موجودين ف الاجهزه لان دا الاكثر شهره واستخداما يعني

تعالي بقي كد نمشيها خطوه خطوه عشان نوصل لموقع

```
https://www.google.com/
```

- فتحنا المتصفح كتبنا ([google.com](http://google.com/))
- المتصفح فهم ان دا domain
- قام زود عليه https:// , www. عشان عرف انه بيستخدم دا

```
www. 
كانت بتسختدم زمان عشان يفرقوا بين الموثع والخدمات التانيه زي 
mail , ftp , ...
مش مهم تفهمهم يعني المهم تعرف انها مش شرط تتكتب
```

- الي في الرواتر DNS دور ف ال
- مكتوب عندك الي قلنا عليه بتاع جوجل dns ملقاش عندك حاجه ب الاسم دا قام رايح ل
- عرف ان رقم جوجل (**64.233.165.102**)
- يعني هاتلي الي عندك GET قام كلمه وقالي
- ف بعتله الملفات الي المتصفح هيقرأه
- الملفات جت المتصفح قرأها انت شفتها

وبكد تكون عرفت اجابه اول سؤال

  

---

GET السؤال التاني بقي وهو طب ازاي الملفات دي بتتبعت واي هي

بص يسيدي لما بتعوز حاجه من حد بتقله هات ولما بتعوز تدي لحد حاجه بتقله اتفضل

هي زيها بس فيه حاجات تانيه بقي زي

### 1. GET – هاتلي الحاجة دي

لما بتقول للموظف:

> "هاتلي قائمة الأسعار من فضلك" أو "وريني صفحة جوجل"

### 2. POST – خُد الحاجة دي

هنا أنت مش بتطلب، لأ، أنت بتبعتله **معلومة أو بيانات**.

يعني بتقوله:

> "خد الاسم والباسورد دول، وسجّلني"

### 3. PUT – حدّث الحاجة دي بالكامل

يعني بتقوله:

> "أنا عندي ملف قديم، خده وبدّله كله بالجديد ده"

### 4. PATCH – حدّث جزء من الحاجة

زي الـ PUT بس بدل ما تغير كل حاجة، بتقول:

> "غيّرلي الاسم بس وسيب الباقي زي ما هو"

### 5. DELETE – امسح الحاجة دي

واضحة جدًا…

> "شيل الصورة دي من السيرفر"

### 6. OPTIONS – إنت بتفهم إيه؟

ده سؤال بيبعت للسيرفر، كأنه بيقوله:

> "إنت بتقبل أنواع إيه من الطلبات؟ (GET, POST… إلخ)"

### 7. HEAD – زي GET بس من غير الملفات

يعني بتقول للسيرفر:

> "هاتلي المعلومات عن الصفحة، بس من غير ما تبعتلي محتواها"

الكلام دا مش مهم تحفظه خالص دا كلام لسا قداام شويه بس عشان تبقي فاهم الدنيا مش اكتر

كد خلصنا نخش علي السؤال الي بعده وهو

  

---

### إزاي اللي بنشوفه في المتصفح بيتكوّن من داتا؟

يعني إنت دلوقتي فتحت المتصفح وكتبت موقع... فجأة لقيت الموقع ظهر قدامك شكله حلو، فيه صور وزراير وكلام بيتحرّك. طب إزاي ده حصل؟ تعال أقولك واحدة واحدة

### 1. كل حاجة بتبدأ بـ ملفات

لما بتفتح موقع، المتصفح بيروح يجيب شوية ملفات من السيرفر (الكمبيوتر اللي عليه الموقع)، والملفات دي هما:

- **HTML**: بيقول المتصفح هيعرض إيه؟ (عناوين، صور، كلام…)
- **CSS**: بيجمّل الصفحة، يلونها، يزبط الخطوط، يخلي الشكل حلو.
- **JavaScript**: بيخلي الصفحة تتفاعل معاك، يفتح منيو، يغير ألوان، يحرك صور… يعني الحياة.

> تقدر تقول: **HTML = العضم /** **CSS = الجلد واللبس** / **JS = العقل والحركة**

---

### 2. المتصفح بيجمّع الكلام ده ويكوّن الصفحة

أول ما الملفات توصله، المتصفح بيشتغل كده:

- يقرأ ملف الـ HTML، ويكوّن منه حاجة اسمها **DOM** ← يعني خريطة للعناصر اللي في الصفحة.
- يطبّق عليها الـ CSS علشان يزبط الألوان والشكل.
- يشغّل كود JavaScript علشان يعمل أي حاجة ديناميكية.
- وفي الآخر يرسم الصفحة ويعرضها ليك.

> يعني اللي إنت شايفه في الآخر هو **نتيجة تجميع وترجمة شوية بيانات جت من الإنترنت**.

دا بشكل بسيط ازاي الملفات بتتقري وبتظهر ب انهي شكل

طب احنا دلوقتي لما جينا كتبنا عشان نجيب جوجل كتبنا

```
https://
```

اي هي بقي دي ؟؟

دي يسيدي بيبقي فيه منها نوعين

```
https://  &   http://
```

### يعني إيه http:// أو https://؟

الكلمة دي اختصار لـ:

> **HyperText Transfer Protocol**

ودي ببساطة اللغة أو **الطريقة اللي المتصفح بيكلم بيها السيرفر** علشان يطلب منه البيانات

يعني كأنك بتقول للمتصفح:

> "كلّم السيرفر بالطريقة دي!"

### طيب الـ S اللي في https معناها إيه؟

الـ s في https معناها:

> **Secure** يعني الاتصال **مؤمّن ومشفّر** 🔒

s طب لي اصلا احنا استخدمنا ال

بص يسيدي عشان تتخيل الحوار وتفهمه اكتر ف عايزك تتخيل انك بتكلم صحبك وفيه واحد تالت قاعد معاكم ف الشخص دا لو قرب منك هيسمع كل الكلام الي بيتقال بشكل واضح ودا طبعا مينفعش افرض انت بتقله الباسورد بتاعك او بتقله حاجه خاصه

https فعشان كد عملو بقي ال

دي مهمتها ان الكلام الي بين وبين صحبك لو حد سمعه ميفهموش غيرك انت وصاحبك سيم يعني بينك انت وهو

  

---

Http , https طب دلوقتي احنا فهمنا ال

اي الباقي دا واسمه اي

```
Uniform Resource Locators (URLs) = https://www.google.com/search
```

ودا يسيدي بيتقسم ل3 اجزاء

![Article content](https://media.licdn.com/dms/image/v2/D4D12AQGAqXSgFawiqg/article-inline_image-shrink_1000_1488/B4DZflRv7.HkAQ-/0/1751898325749?e=1785369600&v=beta&t=Mrvw4LFOBfR1xD7KnKu6n4q7_XYSBzI7gyzlyWrpcA8)

host name اول جزء ودا شرحناه خلاص نخش بقي علي الي بعده والي هو

بص دا ليه كذا تسميه وكذا شكل

  

![Article content](https://media.licdn.com/dms/image/v2/D4D12AQH38VuH4cxrtQ/article-inline_image-shrink_1500_2232/B4DZflTI6.HMAU-/0/1751898689906?e=1785369600&v=beta&t=VHOgEqOcZgW_FMD4Z_Ikr8fHRpkcNLz7Uqt3UIIgnkU)

![Article content](https://media.licdn.com/dms/image/v2/D4D12AQGTUujHo1Zw7w/article-inline_image-shrink_400_744/B4DZflTNEtHMAg-/0/1751898706860?e=1785369600&v=beta&t=WW2_4a4A4HmIOiDLyNTffbPRfZRJUJpfhfP_pL-xrp0)

مش مهم تحفظ يعني بس عشان تبقي عارف اي الحاجات دي عشان هتفيدك الاهم والي عايزك تركز عليه file path وهو ال

اي هو دا وعباره عن اي

دا بشكل اسهل وابسط عشان تفهم فتخيل معايا ان كل الي قبل المسار الكمبيوتر بتاعك ف انت هتختار ملف ال D

![Article content](https://media.licdn.com/dms/image/v2/D4D12AQHdzBlyuEM-5Q/article-inline_image-shrink_1000_1488/B4DZflUBFDGkAQ-/0/1751898919848?e=1785369600&v=beta&t=2JZoOIBCOu86_zMKC3hj6qgyDPwxa1YjPNyHBUakHMc)

![Article content](https://media.licdn.com/dms/image/v2/D4D12AQFp0m0QtuqaaA/article-inline_image-shrink_1500_2232/B4DZflUECQGgAY-/0/1751898932217?e=1785369600&v=beta&t=dhMCRTDD5-wMvfs1G_vebCEHfazU0L78LGm3s4uNPfI)

هو نفس النظام كد بيقلك انك دلوقتي فاتح الكود الي ف الملف دا ولما تتحرك جوا هيبدأ يتغير المسار

> عشان تفهم الحوار دا اكتر جربه علي الكمبيوتر والمسارات وكد

طب دلوقتي هو دخل جوا المجلد ولقي ملفات كتير اوي هيفتح انهي ؟؟

بص يسيدي السيرفرات كلها اول اما بتلاقي ملف اسمه

```
index.html
```

خلاص كد دا ب النسبالها الفايل الاساسي الي هتفتحه علي طول من غير متسألك لو غيرت الاسم دا ف هيجيبلك بقي كل الملفات و انت تختار تفتح انهي واحد

  

![Article content](https://media.licdn.com/dms/image/v2/D4D12AQHH04B_SbSOLw/article-inline_image-shrink_1000_1488/B4DZflVhW9GkAY-/0/1751899316466?e=1785369600&v=beta&t=AKK6f3Mb4zbnGvwUoM9A5iseJApb1zGTA-88RWdnS4Q)

> هنا فتح الموقع علي طول عشان لقي ملف index

لو ملقاش بيجيبلك كد

  

![Article content](https://media.licdn.com/dms/image/v2/D4D12AQEpkpd8cfV7Zg/article-inline_image-shrink_1000_1488/B4DZflV2ioHAAQ-/0/1751899403199?e=1785369600&v=beta&t=rCF6x9KgxMoxjNqCd3RGMG2lwuUqMIAzHClVuos-gJs)

هنا بيجيبلك بقي كل الملفات لانه مش عارف يفتح انهي

كد انت فهمت لي دايما بتلاقي الملف اسمه index.html

  

---

طب انت دلوقتي عايز تسمي بقي الملفات وباقي الملفات تسميها ازاي ؟؟

1. **استخدم الحروف الصغيرة (lowercase)** متكتبش Home.html (ا لصح: home.html)

> عشان في بعض السيرفرات (زي Linux) Home.html ≠ home.html

2. ممنوع الفراغات في الاسم

⛔️ about us.html

✅ about-us.html (الافضل)

✅ about_us.html

3. **تجنّب الرموز الغريبة**⛔️

مينفعش تحط علامات زي: ! @ # $ % ^ & * () = +

4. خلي الاسم واضح ومعبّر

⛔️ p 1.html, x 2.html

✅ products.html, services.html, login.html

كد يبقي انت فهمت كل حاجه وازاي نوصل للموقع وازاي بيتقرأ طب دلوقتي بقي اي هي اللغات المستخدمه ؟؟

```
HTML & CSS & JavaScript
```

تعالا نبدأ ب اول حاجه وهي

```
HTML --> Hyper-text Markup Language
```

بص يسيدي اللغه دي عباره عن انها بتضيفلك العظم بتاع الموقع يعني الكلام الي هيتكتب بقي زي العنوان والصور والكلام دا كله تعالا نبدأ ب اول حاجه فيها وهي

```
<!DOCTYPE html>
```

دا عباره عن انك بتحدد نوع الملف بتقله

> _Documentation type html_

tags بعد كد بنبدأ بقي نكتب كود الاساسي هنا لازم نكتب مبين ال

```
< open tag > any thing </ close tag >
```

بتتفتح وفيه لا tags فيه

كمثال بس انت مش مضطر تحفظ لسا او تفهم الحاجات دي

```
open and close tags 
---------
<html></html>
<h1></h1>
and alot of tags
----------------------------------
tags doesn't need to close
--------
<hr>
<img>
<br>
```

بص عشان تفتكر هل لازم تتقفل ولا لا اسأل نفسك هل انا محتاج كلام يظهر ؟؟

لو انت هتبقي محتاج كلام يظهر يبقي انت محتاج تقفله لو لا يبقي انت هتبقي عايز تضيف صوره او تعمل خط كمثال

انت كد فهمت ال Tags

attribute تعالا نخش علي الجزي الي بعده وهو ان فيه كلام بيتضاف جواه وهو ال

```
<img src="" alt="" width="">
مش مهم تعرف الحاجات دي بتعمل اي لسا هفتفهم قدام
المهم انك عرفت انا الي جوا دا اسمه اي 
دا بقي استخدامه بيبقي علي حسب كل واحد بيختلف استخدامه يعني 
attribute ليه tag وكل
```

نبدأ بقي نكتب كود

```
<!DOCTYPE html>
<html>
******
</html>
```

بيبقي فيه كل حاجه قدام هتتكتب tag دا اهم

### head tag نخش علي ال

هو الجزء الخفّي من صفحة الويب، يعني الحاجات اللي جواه مش بتظهر للمستخدم بشكل مباشر، لكن المتصفح بيستخدمها علشان:

- يفهم بيانات الصفحة

- يربط ملفات خارجية (زي CSS و JS)

- يظهر عنوان الصفحة

- يضبط اللغة والتكويد

## 🔹 الجزء الخاص بـ `<head>`

الـ `<head>` بيتعامل مع محركات البحث والسوشيال ميديا، وممكن تعتبره:

> _"عقل الصفحة وبياناتها الخلفية"_

---

## 1. `<title>`

ده عنوان الصفحة اللي بيظهر في الـ **Tab** فوق في المتصفح.

```html
<!DOCTYPE html>
<html>
  <head>
    <title>Team Shoky Helper - Your College Companion</title>
  </head>
</html>
```

---

## 2. `<meta>`

وسوم الـ **Meta** ليها استخدامات كتير جدًا، وأهمها الـ **SEO** (تحسين ظهور موقعك في نتائج البحث).

> _وظيفتها تخلي موقعك يظهر في محركات البحث بشكل أفضل._

وسوم الميتا = معلومات عن الصفحة، وفي منها أنواع كتير:

---

### 🔹 a. وصف الصفحة (SEO)

```html
<meta name="description" content="ده موقع بيشرح كل حاجة عن الويب للمبتدئين">
```

---

### 🔹 b. الكلمات المفتاحية

```html
<meta name="keywords" content="HTML, CSS, تعلم الويب, برمجة">
```

> _دي بتستخدم علشان لو حد كتب أي كلمة من دول في البحث، موقعك يظهر له._

---

### 🔹 c. اسم الكاتب

```html
<meta name="author" content="Yousef Tamer">
```

---

### 🔹 d. تحديد الترميز (مهم جدًا)

```html
<meta charset="UTF-8">
```

#### يعني إيه UTF-8؟

- UTF = Unicode Transformation Format
    
- 8 = بيستخدم 8 bits
    

ببساطة:  
هو نظام بيحوّل الحروف لرموز رقمية علشان الكمبيوتر يقرأها، ويدعم كل لغات العالم (عربي، إنجليزي، صيني، إيموجي...).

#### لو نسيت تكتبه؟

- النص العربي يطلع خرابيش 💥
    
- الموقع يعرض الكلام بشكل غلط
    
- مشاكل في قواعد البيانات
    

---

### 🔹 e. عرض الصفحة على الموبايل

```html
<meta name="viewport" content="width=device-width, initial-scale=1.0">
```

> _ده اللي بيخلي الموقع Responsive ويشتغل كويس على الموبايل._

---

### 🔹 f. Open Graph (السوشيال ميديا)

```html
<meta property="og:type" content="website"> 
<meta property="og:site_name" content="PureTone">
```

> _بتتحكم في شكل اللينك لما حد يعمل Share على فيسبوك أو غيره._

---

### 🔹 g. لون شريط المتصفح

```html
<meta name="theme-color" content="#4F46E5">
```

> _بيغير لون التاب في المتصفح._

---

## 🔸 مثال شامل على Meta Tags

```html
<meta charset="UTF-8">
<meta name="theme-color" content="#4F46E5">
<meta name="viewport" content="width=device-width, initial-scale=1.0">

<meta name="description" content="Team Shoky Helper - A modern web application for college students to access courses, lecture schedules, and university news.">

<meta name="keywords"
      content="Team Shoky Helper, college student app, university courses, lecture schedules, university news, student portal">

<meta name="author" content="Team Shoky">
<meta name="robots" content="index, follow">

<!-- Open Graph -->
<meta property="og:title" content="Team Shoky Helper - Your College Companion">
<meta property="og:description" content="Access your courses, lecture schedules, and university news with Team Shoky Helper.">
<meta property="og:image" content="https://i.ibb.co/bRCWmT9d/Team-Shoky-Helper.jpg">
<meta property="og:url" content="https://teamshoky.or-g.net/">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Team Shoky Helper">

<!-- Twitter -->
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="Team Shoky Helper - Your College Companion">
<meta name="twitter:description" content="Access your courses, lecture schedules, and university news with Team Shoky Helper.">
<meta name="twitter:image" content="https://i.ibb.co/bRCWmT9d/Team-Shoky-Helper.jpg">
<meta name="twitter:site" content="@yousefsrour13">
```

---

## 3. ربط ملفات خارجية

### 🔹 ربط CSS

```html
<link rel="stylesheet" href="style.css">
```

---

### 🔹 ربط JavaScript

```html
<script src="main.js"></script>
```

---

### 🔹 Google Fonts

```html
<link href="https://fonts.googleapis.com/css2?family=Cairo&display=swap" rel="stylesheet">
```

---

### 🔹 Favicon (أيقونة الموقع)

```html
<link rel="icon" href="favicon.ico">
```

---

## 🔸 مثال كامل لـ `<head>`

```html
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="موقع تعليمي لتعلم HTML وCSS ببساطة">
  <meta name="keywords" content="HTML, CSS, تعلم البرمجة, تصميم مواقع">
  <meta name="author" content="Yousef Tamer">

  <title>دليل تعلم HTML للمبتدئين</title>

  <link rel="stylesheet" href="style.css">
  <link rel="icon" href="favicon.ico">

  <!-- Open Graph -->
  <meta property="og:title" content="تعلم HTML من الصفر">
  <meta property="og:description" content="دليلك المبسط لتعلم HTML خطوة بخطوة">
  <meta property="og:image" content="https://yoursite.com/og-image.jpg">
  <meta property="og:url" content="https://yoursite.com">

  <script src="main.js" defer></script>
</head>
```

---

## 🔹 الجزء الخاص بـ `<body>`

الـ `<body>` مهم جدًا، لأنه بيحتوي على **كل حاجة بتظهر في الموقع**:

- نصوص
    
- صور
    
- لينكات
    
- فيديوهات
    
- فورمز
    
- كل حاجة حرفيًا
    

---

## 🔹 مصادر للمذاكرة

- [https://www.w3schools.com/html/](https://www.w3schools.com/html/)
    
- [https://developer.mozilla.org/en-US/docs/Web/HTML](https://developer.mozilla.org/en-US/docs/Web/HTML)
    

---

## 🔹 Prompt تستخدمه مع AI

```text
I want you to explain everything about HTML tags, step by step, in full detail.

Only use information from these two websites:
https://www.w3schools.com/html/
https://developer.mozilla.org/en-US/docs/Web/HTML

Explain in Arabic using the Egyptian dialect. Imagine you're teaching a complete beginner, so keep it simple and friendly.

Start with the main structure tags like <html>, <head>, and <body>, then go through every common HTML tag one by one (like headings, paragraphs, images, links, forms, semantic tags, etc.).

For each tag:
- Explain what it is
- When and why we use it
- How to write it
- Give a simple example

Don’t move to the next tag until finishing the current one. After each explanation, ask if I understood or want to try an example.

Take your time and keep everything clear.

Use only W3Schools and MDN as references.
```

---

## ✨ النهاية

✨ Not the first, Not the end, It’s an endless way! ✨

----
